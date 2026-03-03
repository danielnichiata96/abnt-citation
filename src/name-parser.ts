/**
 * Centralized Name Parser for Brazilian Academic Citations
 *
 * Handles Brazilian naming conventions according to ABNT NBR 6023:2018:
 * - Brazilian suffixes (agnomes): Filho, Neto, Junior, Sobrinho
 * - Portuguese particles: da, de, do, das, dos, e
 *
 * The key insight is that ABNT treats suffixes differently from American style:
 * - American: "John Smith Jr." -> { family: "Smith", suffix: "Jr." }
 * - Brazilian ABNT: "Joao Silva Filho" -> { family: "Silva Filho", given: "Joao" }
 *
 * @see https://guiadamonografia.com.br/como-citar-agnome/
 */

import type { CslName } from './types';

/**
 * Options for parsing names.
 */
export interface ParseOptions {
  /**
   * Remove academic titles (Prof., Dr., Me., etc.) from the name.
   * @default false
   */
  stripTitles?: boolean;

  /**
   * Type of author entry.
   * - 'person': Normal person name (default) - will be inverted
   * - 'institution': Institutional author - will NOT be inverted, comma preserved
   * - 'historical': Historical/religious name - will NOT be inverted (Dom Pedro II, Papa Francisco)
   * @default 'person'
   */
  type?: 'person' | 'institution' | 'historical';
}

/**
 * Academic and professional titles that should be stripped from names.
 * Only used when { stripTitles: true } is passed.
 */
export const ACADEMIC_TITLES = new Set([
  // Portuguese academic titles
  'prof', 'professor', 'professora',
  'dr', 'dra', 'doutor', 'doutora',
  'me', 'mestre', 'mestra',
  'esp', 'especialista',
  'phd',
  // Professional titles
  'eng', 'engenheiro', 'engenheira',
  'arq', 'arquiteto', 'arquiteta',
  'adv', 'advogado', 'advogada',
  // Military titles
  'gen', 'general',
  'cel', 'coronel',
  'maj', 'major',
  'cap', 'capitão', 'capitao',
  'ten', 'tenente',
  'sgt', 'sargento',
  'cb', 'cabo',
  'sd', 'soldado',
  // Police titles
  'del', 'delegado', 'delegada',
  'com', 'comissário', 'comissario',
]);

/**
 * Nobility and religious titles that indicate the name should NOT be inverted.
 * When a name starts with one of these AND has <= 4 words, treat as unit.
 */
export const NOBILITY_TITLES = new Set([
  // Religious
  'dom', 'dona',
  'frei', 'freira',
  'irmã', 'irma', 'irmão', 'irmao',
  'madre', 'padre', 'pe',
  'papa',
  'bispo', 'arcebispo',
  'cardeal',
  'pastor', 'pastora',
  'rabino', 'rabina',
  // Nobility
  'barão', 'barao', 'baronesa',
  'visconde', 'viscondessa',
  'conde', 'condessa',
  'marquês', 'marques', 'marquesa',
  'duque', 'duquesa',
  'príncipe', 'principe', 'princesa',
  'rei', 'rainha',
  'imperador', 'imperatriz',
  // Historical figures
  'santo', 'santa', 'são', 'sao',
]);

/**
 * Brazilian name suffixes that indicate the last word is NOT the family name.
 * When these appear as the last word, the family name is the previous word + suffix.
 *
 * Examples:
 * - "Joao Silva Filho" -> family: "Silva Filho", given: "Joao"
 * - "Maria Santos Neto" -> family: "Santos Neto", given: "Maria"
 */
export const BRAZILIAN_SUFFIXES = new Set([
  'FILHO', 'FILHA',
  'NETO', 'NETA', 'NETTO', 'NETTA', // Include Italian spelling variants
  'SOBRINHO', 'SOBRINHA',
  'JÚNIOR', 'JUNIOR', 'JR', 'JR.',
  'SEGUNDO', 'TERCEIRO',
  // Roman numeral suffixes (common in translations from English)
  'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  // English suffixes
  'SR', 'SR.',
]);

/**
 * Connector particle - "e" (meaning "and") connects two surnames.
 * When found, it forces inclusion of the word before it (the connected surname).
 *
 * Example: "Costa e Silva" -> both "Costa" and "Silva" are part of the family name
 */
export const CONNECTOR_PARTICLES = new Set(['e']);

/**
 * Compound surname prefixes - words that form compound surnames with the following word.
 * When found as the second-to-last word (before the final surname), they should be
 * included as part of the family name.
 *
 * Examples:
 * - "João Espírito Santo" -> family: "Espírito Santo", given: "João"
 * - "Maria Castelo Branco" -> family: "Castelo Branco", given: "Maria"
 * - "Pedro Santa Cruz" -> family: "Santa Cruz", given: "Pedro"
 *
 * Common Brazilian compound surnames:
 * - Espírito Santo (Holy Spirit - from the state)
 * - Castelo Branco (White Castle - historical)
 * - Santa/Santo + place names (Santa Cruz, Santo Antônio)
 * - Monte/Villa + place names (Monte Alegre, Villa Lobos)
 * - Belo (Belo Horizonte origin)
 */
export const COMPOUND_PREFIXES = new Set([
  // Religious/historical
  'ESPÍRITO', 'ESPIRITO',  // Espírito Santo
  'CASTELO',               // Castelo Branco
  'SANTA', 'SANTO', 'SÃO', 'SAO',  // Santa Cruz, Santo Antônio, São Paulo

  // Geographic
  'MONTE',    // Monte Alegre, Monte Negro
  'VILLA', 'VILA',  // Villa Lobos, Vila Nova
  'BELO',     // Belo Horizonte (as surname)
  'PORTO',    // Porto Alegre (as surname)
  'CAMPO',    // Campo Grande (as surname)
  'RIO',      // Rio Branco (as surname)
  'BOA', 'BOM',  // Boa Vista, Bom Jesus

  // Other compound patterns
  'CRUZ',     // When followed by another word (Cruz Alta)
  'TERRA',    // Terra Nova
  'COSTA',    // Costa Rica (as surname, rare)
]);

/**
 * Prefix particles - "da", "de", "do", etc. (meaning "of", "from")
 * They prefix a surname but don't force inclusion of the previous word.
 *
 * Example: "da Silva" -> "da" prefixes "Silva", doesn't pull in previous word
 */
export const PREFIX_PARTICLES = new Set(['da', 'de', 'do', 'das', 'dos']);

/**
 * All Portuguese name particles combined.
 * Used for proper Brazilian name formatting.
 *
 * Examples:
 * - "Maria da Silva" -> family: "da Silva"
 * - "Jose dos Santos" -> family: "dos Santos"
 * - "Joao da Costa e Silva" -> family: "da Costa e Silva" (chain-link)
 */
export const PORTUGUESE_PARTICLES = new Set([
  ...CONNECTOR_PARTICLES,
  ...PREFIX_PARTICLES,
]);

/**
 * Parse a full name into CSL family/given parts.
 *
 * Handles multiple input formats:
 * 1. Citation format: "SILVA, Joao Carlos" -> { family: "SILVA", given: "Joao Carlos" }
 * 2. Natural format: "Joao Carlos da Silva Filho" -> { family: "da Silva Filho", given: "Joao Carlos" }
 * 3. Compound names: "Joao da Costa e Silva" -> { family: "da Costa e Silva", given: "Joao" }
 * 4. Single name: "Madonna" -> { family: "Madonna" }
 *
 * Brazilian ABNT rules applied:
 * - Suffixes (Filho, Neto, etc.) stay with the family name
 * - Prefix particles (da, de, do) prefix the family name
 * - Connector particle "e" (and) connects two surnames (chain-link logic)
 *
 * Chain-Link Algorithm:
 * The particle "e" acts as a connector between surnames. When found, it
 * forces inclusion of the word before it. Prefix particles (da, de, do)
 * only prefix but don't force inclusion of the previous word.
 *
 * @param name - Full name in any supported format
 * @returns CSL name object with family and optional given
 *
 * @example
 * parseNameToCsl("Joao Silva Filho")
 * // -> { family: "Silva Filho", given: "Joao" }
 *
 * @example
 * parseNameToCsl("Joao da Costa e Silva")
 * // -> { family: "da Costa e Silva", given: "Joao" }
 *
 * @example
 * parseNameToCsl("SANTOS, Jose Carlos")
 * // -> { family: "SANTOS", given: "Jose Carlos" }
 *
 * @example
 * parseNameToCsl("Prof. Dr. João Silva", { stripTitles: true })
 * // -> { family: "Silva", given: "João" }
 *
 * @example
 * parseNameToCsl("USP, Faculdade de Medicina", { type: 'institution' })
 * // -> { family: "USP, Faculdade de Medicina" }
 *
 * @example
 * parseNameToCsl("Dom Pedro II", { type: 'historical' })
 * // -> { family: "Dom Pedro II" }
 */
export function parseNameToCsl(name: string, options: ParseOptions = {}): CslName {
  let trimmed = name.trim();

  if (!trimmed) {
    return { family: '' };
  }

  // Handle institutional authors - don't parse, return as-is
  if (options.type === 'institution') {
    return { family: trimmed };
  }

  // Handle historical/religious names - don't invert
  if (options.type === 'historical') {
    return { family: trimmed };
  }

  // Strip academic titles if requested
  if (options.stripTitles) {
    trimmed = stripAcademicTitles(trimmed);
  }

  // Check if name starts with nobility/religious title (auto-detect historical)
  const firstWord = trimmed.split(/\s+/)[0].toLowerCase().replace(/\.$/, '');
  const wordCount = trimmed.split(/\s+/).length;
  if (NOBILITY_TITLES.has(firstWord) && wordCount <= 4) {
    return { family: trimmed };
  }

  // Format 1: Citation format "Family, Given"
  if (trimmed.includes(',')) {
    const [family, ...givenParts] = trimmed.split(',').map((p) => p.trim());
    const given = givenParts.join(' ').trim();
    return given ? { family, given } : { family };
  }

  // Format 2, 3 & 4: Natural format "Given Family" or single name
  const nameParts = trimmed.split(/\s+/);

  if (nameParts.length === 1) {
    return { family: nameParts[0] };
  }

  // Special case: particle-only names (e.g., "da Silva", "dos Santos")
  // When name starts with a particle and has no clear given name, treat entire name as family
  if (nameParts.length >= 2 && PREFIX_PARTICLES.has(nameParts[0].toLowerCase())) {
    // Check if this is a particle-only name by verifying there's no given name before the particle
    // If the first word IS the particle, then everything is the family name
    return { family: trimmed };
  }

  const familyParts: string[] = [];
  let i = nameParts.length - 1;

  // Step 1: Handle suffixes (Filho, Neto, etc.) - supports multiple consecutive suffixes
  // Example: "José Silva Filho Neto" -> family: "Silva Filho Neto", given: "José"
  // We need at least 2 words remaining after collecting suffixes (1 for surname base, 1 for given name)
  while (
    BRAZILIAN_SUFFIXES.has(nameParts[i].toUpperCase()) &&
    i >= 2 // Ensures we have at least: given + surname base + suffix(es)
  ) {
    familyParts.unshift(nameParts[i]); // Add suffix
    i--;
  }

  // Now add the surname base (the word before the suffix chain)
  // If we collected any suffixes, this is the actual surname
  // If no suffixes, this is just the last word (the surname)
  familyParts.unshift(nameParts[i]);
  i--;

  // Step 1.5: Handle compound surnames (Espírito Santo, Castelo Branco, etc.)
  // If the word before the family name is a compound prefix, include it
  if (i >= 1 && COMPOUND_PREFIXES.has(nameParts[i].toUpperCase())) {
    familyParts.unshift(nameParts[i]);
    i--;
  }

  // Step 2: Chain-link particle logic (Greedy Retroactive Collector)
  // - Connector particles ("e") force inclusion of the previous word
  // - Prefix particles ("da", "de", "do") only prefix, don't force inclusion
  // - Keep at least one word for given name (i >= 1)
  while (i >= 1) {
    const word = nameParts[i];
    const wordLower = word.toLowerCase();

    if (PORTUGUESE_PARTICLES.has(wordLower)) {
      familyParts.unshift(word);

      // Connector particle "e" forces inclusion of the connected surname
      // but only if we'd still have a given name left (i > 1)
      if (CONNECTOR_PARTICLES.has(wordLower) && i > 1) {
        i--;
        familyParts.unshift(nameParts[i]);
      }
      i--;
    } else {
      break;
    }
  }

  const given = nameParts.slice(0, i + 1).join(' ');

  return {
    family: familyParts.join(' '),
    given: given || undefined,
  };
}

/**
 * Extract only the family name from a display name.
 * Convenience wrapper around parseNameToCsl.
 *
 * @param displayName - Full name
 * @returns Family name portion
 *
 * @example
 * extractFamilyName("Joao Silva Filho") // -> "Silva Filho"
 * extractFamilyName("Maria da Costa") // -> "da Costa"
 */
export function extractFamilyName(displayName: string): string {
  return parseNameToCsl(displayName).family ?? '';
}

/**
 * Extract only the given name from a display name.
 * Convenience wrapper around parseNameToCsl.
 *
 * @param displayName - Full name
 * @returns Given name portion or empty string
 *
 * @example
 * extractGivenName("Joao Silva Filho") // -> "Joao"
 * extractGivenName("Maria da Costa") // -> "Maria"
 */
export function extractGivenName(displayName: string): string {
  return parseNameToCsl(displayName).given || '';
}

/**
 * Check if a word is a Portuguese particle.
 *
 * @param word - Word to check
 * @returns True if it's a particle (da, de, do, das, dos, e)
 */
export function isPortugueseParticle(word: string): boolean {
  return PORTUGUESE_PARTICLES.has(word.toLowerCase());
}

/**
 * Check if a word is a Brazilian suffix (agnome).
 *
 * @param word - Word to check
 * @returns True if it's a suffix (Filho, Neto, Junior, etc.)
 */
export function isBrazilianSuffix(word: string): boolean {
  return BRAZILIAN_SUFFIXES.has(word.toUpperCase());
}

/**
 * Check if a word is a nobility or religious title.
 *
 * @param word - Word to check
 * @returns True if it's a nobility/religious title
 */
export function isNobilityTitle(word: string): boolean {
  return NOBILITY_TITLES.has(word.toLowerCase().replace(/\.$/, ''));
}

/**
 * Check if a word is an academic title.
 *
 * @param word - Word to check
 * @returns True if it's an academic title
 */
export function isAcademicTitle(word: string): boolean {
  return ACADEMIC_TITLES.has(word.toLowerCase().replace(/\.$/, ''));
}

/**
 * Strip academic titles from the beginning of a name.
 *
 * @param name - Full name possibly starting with titles
 * @returns Name with academic titles removed
 *
 * @example
 * stripAcademicTitles("Prof. Dr. João Silva") // -> "João Silva"
 * stripAcademicTitles("Dra. Maria Santos") // -> "Maria Santos"
 */
export function stripAcademicTitles(name: string): string {
  const parts = name.split(/\s+/);
  let startIndex = 0;

  // Skip leading academic titles
  while (startIndex < parts.length - 1) {
    const word = parts[startIndex].toLowerCase().replace(/\.$/, '');
    if (ACADEMIC_TITLES.has(word)) {
      startIndex++;
    } else {
      break;
    }
  }

  return parts.slice(startIndex).join(' ');
}
