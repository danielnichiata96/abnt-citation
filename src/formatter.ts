/**
 * ABNT Citation Formatting
 *
 * Implements formatting rules from:
 * - ABNT NBR 10520:2023 - Information and documentation - Citations
 * - ABNT NBR 6023:2025 - Information and documentation - References
 *
 * Key formatting rules:
 * - Person names: Title Case (SILVA -> Silva)
 * - Corporate/institutional names: UPPERCASE preserved (IBGE -> IBGE)
 * - "et al." in italics
 * - "ca." (circa) in italics when year is unknown (NBR 6023:2025)
 *
 * @see https://citeme.app - CiteMe: Brazil's most complete academic citation manager
 */

import { isProtectedAcronym } from './acronyms';
import { PORTUGUESE_PARTICLES } from './name-parser';

/**
 * Converts a string to Title Case with Portuguese naming conventions:
 * - Preserves apostrophes (O'Brien -> O'Brien)
 * - Handles hyphens (SMITH-JONES -> Smith-Jones)
 * - Portuguese particles (da, de, do) stay lowercase except at start
 *
 * @example
 * toTitleCasePortuguese("DA SILVA")      // "Da Silva"
 * toTitleCasePortuguese("SOUZA")         // "Souza"
 * toTitleCasePortuguese("MARIA DA LUZ")  // "Maria da Luz"
 */
function toTitleCasePortuguese(text: string): string {
  const parts = text.toLowerCase().split(/(\s+|-)/);
  let isFirst = true;

  return parts
    .map((part) => {
      // Preserve whitespace and hyphens
      if (part.match(/^\s+$/) || part === '-') return part;

      // Check if it's a Portuguese particle
      if (PORTUGUESE_PARTICLES.has(part)) {
        // Particles are uppercase only at the start
        if (isFirst) {
          isFirst = false;
          return part.charAt(0).toUpperCase() + part.slice(1);
        }
        return part; // Keep lowercase
      }

      isFirst = false;

      // Handle apostrophes (O'Brien, D'Angelo)
      if (part.includes("'")) {
        const [before = '', ...after] = part.split("'");
        const formattedBefore = before ? before.charAt(0).toUpperCase() + before.slice(1) : '';
        const formattedAfter = after
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join("'");
        return formattedBefore + "'" + formattedAfter;
      }

      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('');
}

/**
 * Formats an author name according to ABNT NBR 10520:2023 rules:
 * - Protected acronyms (IBGE, USP, etc.): Keep UPPERCASE
 * - Person names (SILVA, SANTOS, etc.): Convert to Title Case
 * - Portuguese particles (da, de, do): Lowercase except at start
 *
 * @param author - Author surname in any case
 * @returns Properly formatted author name for ABNT 2023 in-text citations
 *
 * @example
 * formatAuthorABNT2023("SILVA")       // "Silva"
 * formatAuthorABNT2023("SANTOS")      // "Santos"
 * formatAuthorABNT2023("IBGE")        // "IBGE"
 * formatAuthorABNT2023("ibge")        // "IBGE"
 * formatAuthorABNT2023("DA SILVA")    // "Da Silva" (particle capitalized at start)
 * formatAuthorABNT2023("O'BRIEN")     // "O'Brien"
 * formatAuthorABNT2023("SMITH-JONES") // "Smith-Jones"
 */
export function formatAuthorABNT2023(author: string): string {
  const trimmed = author.trim();

  if (!trimmed) return '';

  // Protected acronyms stay uppercase
  if (isProtectedAcronym(trimmed)) {
    return trimmed.toUpperCase();
  }

  // If input is mixed case (not all-upper, not all-lower), it's already
  // properly capitalized — preserve it. This avoids destroying names like
  // McDonald, LeCun, McBride, DeSouza, etc.
  const isAllUpper = trimmed === trimmed.toUpperCase();
  const isAllLower = trimmed === trimmed.toLowerCase();
  if (!isAllUpper && !isAllLower) {
    return trimmed;
  }

  // Person names: convert to Title Case with Portuguese particle handling
  return toTitleCasePortuguese(trimmed);
}

/**
 * Formats "et al." according to ABNT (should be italic)
 * Returns HTML italic tags for proper rendering in web/document contexts.
 *
 * Uses <i> tag (presentational italic) rather than <em> (semantic emphasis)
 * because "et al." is a typographic convention, not emphasis.
 */
export function formatEtAl(): string {
  return '<i>et al.</i>';
}

/**
 * Formats "ca." (circa) according to ABNT NBR 6023:2025 (should be italic)
 * Used when the exact publication year is unknown.
 *
 * Example: [<i>ca.</i> 2020] or (<i>ca.</i> 2020)
 *
 * @returns The abbreviation "ca." formatted in HTML italic
 */
export function formatCirca(): string {
  return '<i>ca.</i>';
}

/**
 * Words that, at the start of a title entry, are uppercased together with the
 * following word: definite and indefinite articles, and monosyllabic function
 * words (prepositions, contractions, conjunctions). NBR 6023 asks for "a
 * primeira palavra do título com letras maiúsculas, incluindo artigo e palavra
 * monossilábica" (Bibliotecas UFU, 2025). Numerals and content words count as
 * the first word on their own: "DOIS estudos sobre linguagem" (IEL-Unicamp, 2025).
 */
const TITLE_ENTRY_LEADING_WORDS = new Set([
  // Portuguese articles
  'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas',
  // Portuguese monosyllabic prepositions, contractions and conjunctions
  'em', 'no', 'na', 'nos', 'nas', 'de', 'do', 'da', 'dos', 'das', 'ao', 'aos', 'à', 'às',
  'num', 'numa', 'por', 'com', 'sem', 'sob', 'e', 'ou', 'se', 'que',
  // Articles of other languages common in Brazilian bibliographies
  'the', 'an', 'el', 'la', 'los', 'las', 'un', 'una', 'le', 'les', 'il', 'lo', 'gli',
  'der', 'die', 'ein', 'eine',
]);

/**
 * Formats the title used as the entry element of a reference without author,
 * per ABNT NBR 6023: the first word in uppercase and, when it is an article
 * or a monosyllabic function word, the next word as well. CSL cannot express
 * this, so call it on the title before formatting an item that has no author.
 *
 * @example
 * formatTitleEntryABNT("Os grandes clássicos das poesias líricas")
 * // "OS GRANDES clássicos das poesias líricas"
 * formatTitleEntryABNT("Em busca de um sonho") // "EM BUSCA de um sonho"
 * formatTitleEntryABNT("Dois estudos sobre linguagem") // "DOIS estudos sobre linguagem"
 */
export function formatTitleEntryABNT(title: string): string {
  const parts = title.split(/(\s+)/);
  const wordIndexes = parts.flatMap((part, index) => (part.trim() ? [index] : []));
  if (wordIndexes.length === 0) return title;

  const [first, second] = wordIndexes;
  parts[first] = parts[first].toUpperCase();

  const bareFirst = parts[first].toLowerCase().replace(/[^\p{L}]/gu, '');
  if (second !== undefined && TITLE_ENTRY_LEADING_WORDS.has(bareFirst)) {
    parts[second] = parts[second].toUpperCase();
  }

  return parts.join('');
}

const ITALIC_OPEN = '(?:<i>|<em>|<span style="font-style: ?italic;?">)';
const ITALIC_CLOSE = '(?:<\\/i>|<\\/em>|<\\/span>)';
const SINE_BRACKET = '\\[\\s*[Ss]\\.\\s*[ln]\\.(?:\\s*:\\s*[Ss]\\.\\s*n\\.)?\\s*\\]';

/**
 * Normalizes sine loco / sine nomine to "[S. l.]", "[s. n.]" and
 * "[S. l.: s. n.]", with the abbreviations in italic (NBR 6023; Bibliotecas
 * UFU, 2025). The case of the "S" in sine loco is kept, because it depends on
 * its position in the reference. Idempotent.
 */
function normalizeSineLocoNomine(text: string): string {
  return text
    // Unwrap italic markup around the whole bracket, as citeproc (<i>) and the
    // Wasm engine (<span>, sometimes including the trailing colon) emit it.
    .replace(new RegExp(`${ITALIC_OPEN}(${SINE_BRACKET}(?:\\s*:\\s*)?)${ITALIC_CLOSE}`, 'g'), '$1')
    .replace(/\[\s*([Ss])\.\s*l\.\s*:\s*[Ss]\.\s*n\.\s*\]/g, (_match, s) => `[<i>${s}. l.</i>: <i>s. n.</i>]`)
    .replace(/\[\s*([Ss])\.\s*l\.\s*\]/g, (_match, s) => `[<i>${s}. l.</i>]`)
    .replace(/\[\s*[Ss]\.\s*n\.\s*\]/g, '[<i>s. n.</i>]');
}

const AVAILABLE_AT = 'Dispon[ií]vel em:\\s*';

/**
 * Removes the angle brackets around online addresses after "Disponível em:".
 * NBR 6023:2018 dropped them, but the community ABNT CSL style still emits them.
 */
function removeUrlAngleBrackets(text: string): string {
  return text
    // Wasm engine: literal brackets around a link anchor
    .replace(new RegExp(`(${AVAILABLE_AT})<(<a\\s[^>]*>[\\s\\S]*?<\\/a>)>`, 'g'), '$1$2')
    // citeproc: escaped brackets
    .replace(new RegExp(`(${AVAILABLE_AT})(?:&lt;|&#60;)([\\s\\S]*?)(?:&gt;|&#62;)`, 'g'), '$1$2')
    // Plain text
    .replace(new RegExp(`(${AVAILABLE_AT})<((?:https?|ftp):\\/\\/[^\\s>]+)>`, 'g'), '$1$2');
}

/**
 * Post-processes a formatted ABNT citation to apply 2023 rules.
 * This is designed to be called after citation-js formats the citation.
 *
 * Handles various citation patterns:
 * - Basic: (SILVA, 2023) or (SILVA, 2023a)
 * - Multiple authors: (SILVA; SANTOS, 2023)
 * - With et al.: (SILVA et al., 2023) or (SILVA *et al.*, 2023)
 * - With page numbers: (SILVA, 2023, p. 45)
 * - With apud: (SILVA apud SANTOS, 2023)
 * - Hyphenated names: (SMITH-JONES, 2023)
 * - Apostrophe names: (O'BRIEN, 2023)
 *
 * @param citation - The formatted citation string from CSL
 * @param isInText - Whether this is an in-text citation (true) or bibliography (false)
 * @returns Citation with ABNT 2023 formatting applied
 */
export function postProcessABNT2023(citation: string, isInText: boolean): string {
  if (!citation) return citation;

  let result = citation;

  // Character class for author names using Unicode letter property:
  // - \p{L} matches any Unicode letter (covers all alphabets and diacritics)
  // - Also includes spaces, semicolons, commas (for multiple authors)
  // - Hyphens (SMITH-JONES) and apostrophes (O'BRIEN)
  const authorChars = "\\p{L}\\s;,'\\-";

  // Et al. pattern - matches plain, markdown italic (*et al.*), or HTML italic (<i>/<em>)
  const etAlPattern = "(?:\\*|<(?:i|em)>)?et\\s*al\\.(?:\\*|<\\/(?:i|em)>)?";

  // For in-text citations, convert author surnames from ALL CAPS to Title Case
  if (isInText) {
    // Pattern 1: Multi-cite and basic citations with optional page numbers and year suffix
    // Handles: (SILVA, 2020; SANTOS, 2021), (SILVA, 2023), (SILVA, 2023a), (SILVA, 2023, p. 45)
    // Each citation segment: AUTHOR [et al.], YEAR[suffix][, p. XX]
    const citationSegment = `[${authorChars}]+?(?:\\s*${etAlPattern})?,\\s*\\d{4}[a-z]?(?:,\\s*p\\.\\s*[\\d\\-–]+)?`;
    const multiCitePattern = new RegExp(
      `\\((${citationSegment}(?:;\\s*${citationSegment})*)\\)`,
      'giu' // 'u' flag enables Unicode mode for \p{L}
    );

    result = result.replace(multiCitePattern, (_match, innerContent) => {
      // Split citations by looking for the pattern: YEAR[suffix][page]; AUTHOR
      // This distinguishes between:
      // - Author separator: "SILVA; SANTOS, 2023" (one citation, two authors) - NO split
      // - Citation separator: "SILVA, 2020; SANTOS, 2021" (two citations) - split after year
      // The key: citation boundary has YEAR immediately before "; "

      // Use capturing split to keep the year with its citation
      const parts = innerContent.split(/(\d{4}[a-z]?(?:,\s*p\.\s*[\d\-–]+)?)\s*;\s*/);

      // Rebuild citations: parts alternate between [authors+comma, year, authors+comma, year, ...]
      // Or for single citation: [authors+comma+year] (no split occurred)
      const citations: string[] = [];
      let current = '';
      for (let j = 0; j < parts.length; j++) {
        if (j % 2 === 0) {
          // Authors part (or whole citation if no split)
          current = parts[j];
        } else {
          // Year part - append to current and push as complete citation
          current += parts[j];
          citations.push(current);
          current = '';
        }
      }
      // Handle any remaining content (shouldn't happen with valid input, but be safe)
      if (current.trim()) {
        citations.push(current);
      }

      const formattedCitations = citations.map((segment: string) => {
        // Match: AUTHORS [et al.], YEAR[suffix][, p. XX]
        const segmentMatch = segment.match(
          new RegExp(`^([${authorChars}]+?)(\\s*${etAlPattern})?,\\s*(\\d{4}[a-z]?)(,\\s*p\\.\\s*[\\d\\-–]+)?$`, 'iu')
        );

        if (segmentMatch) {
          const [, authors, etAl, year, pageRef] = segmentMatch;
          const formattedAuthors = authors
            .split(';')
            .map((a: string) => formatAuthorABNT2023(a.trim()))
            .join('; ');
          const etAlPart = etAl ? ' <i>et al.</i>' : '';
          const pagePart = pageRef || '';
          return `${formattedAuthors}${etAlPart}, ${year}${pagePart}`;
        }
        return segment; // Return unchanged if no match
      });

      return `(${formattedCitations.join('; ')})`;
    });

    // Pattern 2: Apud citations - supports multi-word authors, et al., year suffix
    // Handles: (SILVA apud SANTOS, 2023), (SMITH-JONES apud O'BRIEN, 2023a)
    const apudPattern = new RegExp(
      `\\(([${authorChars}]+?)(\\s*${etAlPattern})?\\s+apud\\s+([${authorChars}]+?)(\\s*${etAlPattern})?,\\s*(\\d{4}[a-z]?)\\)`,
      'giu'
    );

    result = result.replace(
      apudPattern,
      (_match, author1, etAl1, author2, etAl2, year) => {
        // Format each author (may be semicolon-separated)
        const formatted1 = author1
          .trim()
          .split(';')
          .map((a: string) => formatAuthorABNT2023(a.trim()))
          .join('; ');
        const formatted2 = author2
          .trim()
          .split(';')
          .map((a: string) => formatAuthorABNT2023(a.trim()))
          .join('; ');

        const etAlPart1 = etAl1 ? ' <i>et al.</i>' : '';
        const etAlPart2 = etAl2 ? ' <i>et al.</i>' : '';

        return `(${formatted1}${etAlPart1} apud ${formatted2}${etAlPart2}, ${year})`;
      }
    );
  }

  // Reference-list rules from NBR 6023 that the CSL style does not apply
  if (!isInText) {
    result = normalizeSineLocoNomine(result);
    result = removeUrlAngleBrackets(result);
  }

  // Format "et al." to italic (if not already formatted with HTML or markdown)
  // Negative lookbehind: not preceded by * or <i> or <em>
  // Negative lookahead: not followed by * or </i> or </em>
  result = result.replace(
    /(?<![*<]|<i>|<em>)\bet\s+al\.(?![*<]|<\/i>|<\/em>)/gi,
    '<i>et al.</i>'
  );

  // Format "ca." (circa) to italic per ABNT NBR 6023:2025
  // Matches: ca. followed by a year (e.g., "ca. 2020", "[ca. 2020]")
  result = result.replace(
    /(?<![*<]|<i>|<em>)\bca\.(?![*<]|<\/i>|<\/em>)/gi,
    '<i>ca.</i>'
  );

  return result;
}
