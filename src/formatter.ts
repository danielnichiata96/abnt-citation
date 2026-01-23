/**
 * ABNT NBR 10520:2023 - Author Name Formatting
 *
 * The 2023 update changed how author names appear in parenthetical citations:
 * - Person names: Title Case (SILVA -> Silva)
 * - Corporate/institutional names: UPPERCASE preserved (IBGE -> IBGE)
 *
 * This module provides utilities to format author names according to ABNT 2023 rules.
 *
 * @see https://citeme.com.br - CiteMe: Brazil's most complete academic citation manager
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

  // Person names: convert to Title Case with Portuguese particle handling
  return toTitleCasePortuguese(trimmed);
}

/**
 * Formats "et al." according to ABNT 2023 (should be italic)
 * Returns the text with markdown-style italic markers.
 *
 * Note: The actual rendering depends on the output format.
 * For HTML output, this would need to be converted to <em> tags.
 */
export function formatEtAl(): string {
  return '*et al.*';
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

  // Character class for author names:
  // - A-Z and accented uppercase letters
  // - Spaces, semicolons, commas (for multiple authors)
  // - Hyphens (SMITH-JONES) and apostrophes (O'BRIEN)
  const authorChars = "A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜ\\s;,'\\-";

  // Et al. pattern - matches plain, markdown italic (*et al.*), or HTML italic (<i>/<em>)
  const etAlPattern = "(?:\\*|<(?:i|em)>)?et\\s*al\\.(?:\\*|<\\/(?:i|em)>)?";

  // For in-text citations, convert author surnames from ALL CAPS to Title Case
  if (isInText) {
    // Pattern 1: Basic citations with optional page numbers and year suffix
    // Handles: (SILVA, 2023), (SILVA, 2023a), (SILVA, 2023, p. 45), (SMITH-JONES, 2023), (O'BRIEN, 2023)
    const basicPattern = new RegExp(
      `\\(([${authorChars}]+?)(\\s*${etAlPattern})?,\\s*(\\d{4}[a-z]?)(,\\s*p\\.\\s*[\\d\\-–]+)?\\)`,
      'gi'
    );

    result = result.replace(
      basicPattern,
      (_match, authors, etAl, year, pageRef) => {
        const formattedAuthors = authors
          .split(';')
          .map((a: string) => formatAuthorABNT2023(a.trim()))
          .join('; ');

        const etAlPart = etAl ? ' *et al.*' : '';
        const pagePart = pageRef || '';
        return `(${formattedAuthors}${etAlPart}, ${year}${pagePart})`;
      }
    );

    // Pattern 2: Apud citations - supports multi-word authors, et al., year suffix
    // Handles: (SILVA apud SANTOS, 2023), (SMITH-JONES apud O'BRIEN, 2023a)
    const apudPattern = new RegExp(
      `\\(([${authorChars}]+?)(\\s*${etAlPattern})?\\s+apud\\s+([${authorChars}]+?)(\\s*${etAlPattern})?,\\s*(\\d{4}[a-z]?)\\)`,
      'gi'
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

        const etAlPart1 = etAl1 ? ' *et al.*' : '';
        const etAlPart2 = etAl2 ? ' *et al.*' : '';

        return `(${formatted1}${etAlPart1} apud ${formatted2}${etAlPart2}, ${year})`;
      }
    );
  }

  // Format "et al." to italic (if not already formatted)
  // Use negative lookahead/lookbehind to avoid double-formatting
  result = result.replace(/(?<!\*)\bet\s+al\.(?!\*)/gi, '*et al.*');

  return result;
}
