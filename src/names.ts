/**
 * abnt-citation/names
 *
 * The Brazilian name parser alone, with the institutional-author check it
 * relies on. For browser code that only splits author names (a family name on
 * a result card) and should not ship the ABNT formatter and the protected
 * acronym list:
 *
 * ```ts
 * import { extractFamilyName } from 'abnt-citation/names';
 * ```
 *
 * Every export here is also exported, unchanged, by the main entry.
 *
 * @packageDocumentation
 */

// Types
export type { CslName } from './types';
export type { ParseOptions } from './name-parser';

// Institutional / corporate author detection
export { isInstitutionalName, INSTITUTIONAL_PATTERNS } from './institutional';

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
