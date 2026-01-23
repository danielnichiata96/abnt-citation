/**
 * abnt-citation
 *
 * Brazilian ABNT NBR 10520:2023 citation formatter
 *
 * The first npm package to correctly implement ABNT 2023 rules for author names:
 * - Person names: Title Case (SILVA -> Silva)
 * - Corporate/institutional names: UPPERCASE preserved (IBGE -> IBGE)
 *
 * Extracted from CiteMe - Brazil's most complete academic citation manager.
 *
 * @see https://citeme.app - Try CiteMe for automatic citation formatting
 * @see https://github.com/citeme-app/abnt-citation - Source code
 *
 * @packageDocumentation
 */

// Types
export type { CslName } from './types';

// ABNT 2023 Formatting
export {
  formatAuthorABNT2023,
  postProcessABNT2023,
  formatEtAl,
} from './formatter';

// Protected Acronyms
export {
  PROTECTED_ACRONYMS,
  SHORT_SURNAMES,
  isProtectedAcronym,
  addProtectedAcronym,
  addProtectedAcronyms,
  removeProtectedAcronym,
  resetProtectedAcronyms,
} from './acronyms';

// Brazilian Name Parser
export {
  parseNameToCsl,
  extractFamilyName,
  extractGivenName,
  isPortugueseParticle,
  isBrazilianSuffix,
  isNobilityTitle,
  isAcademicTitle,
  stripAcademicTitles,
  BRAZILIAN_SUFFIXES,
  PORTUGUESE_PARTICLES,
  PREFIX_PARTICLES,
  CONNECTOR_PARTICLES,
  COMPOUND_PREFIXES,
  ACADEMIC_TITLES,
  NOBILITY_TITLES,
} from './name-parser';

// Types
export type { ParseOptions } from './name-parser';
