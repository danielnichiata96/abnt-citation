/**
 * Institutional / corporate author detection.
 *
 * Academic APIs return corporate authors in the same field as person names
 * ("Ministério da Saúde" sits next to "João Silva Filho" in the author array).
 * Inverting a corporate name the way you invert a person name produces
 * nonsense in ABNT: "DA SAÚDE, Ministério" instead of "MINISTÉRIO DA SAÚDE".
 *
 * This module detects the corporate case so `parseNameToCsl(name, { type: 'auto' })`
 * can keep the name whole.
 *
 * Coverage is English + Portuguese + Spanish keywords plus the Brazilian and
 * international acronyms that show up most in academic metadata.
 */

/**
 * Institutional author patterns (case-insensitive).
 *
 * PT keywords: Ministério, Sociedade, Associação, Universidade, Instituto,
 * Fundação, Federação, Agência, Sindicato, Conselho, Departamento, Faculdade,
 * Diretoria. ES: Ministerio, Asociación, Universidad, Sociedad, Federación,
 * Agencia, Consejo, Departamento, Facultad, Dirección, Secretaría.
 */
export const INSTITUTIONAL_PATTERNS: readonly RegExp[] = [
  /\b(The|National|International|Ministry|Ministério|Ministerio|Department|Departamento|Agency|Agência|Agencia|Organización|Organização|Instituto|Universidade|Universidad|University|College|Faculdade|Facultad|School|Escola|Escuela|Laboratório|Laboratorio|Laboratory|Centro|Center|Council|Conselho|Consejo|Commission|Comissão|Comisión|Association|Associação|Asociación|Asociacion|Federation|Federação|Federación|Fund|Fundo|Fondo|World|Health|Saúde|Salud|Global|Group|Grupo|Inc|Ltd|Company|Corp|Foundation|Fundação|Fundación|Bank|Banco|Society|Sociedade|Sociedad|Organization|Organisation|Committee|Comitê|Comité|Bureau|Sindicato|Diretoria|Dirección|Secretaría|Secretaria)\b/i,
  /\b(UNESCO|WHO|OMS|UNICEF|ONU|UNIBANCO|IBGE|IPEA|MEC|CAPES|CNPq|USP|UFRJ|UFMG|UNESP|UFSC|INPE|FIOCRUZ|EMBRAPA|NASA|NIST|NIH|IEEE|ACM|OECD)\b/i,
];

/**
 * Check if a name appears to be an institutional/corporate author.
 *
 * Two strategies:
 * 1. Organization keywords (English / Portuguese / Spanish) and known acronyms.
 * 2. A shape heuristic: a single ALL-CAPS token of 2-7 letters, no spaces,
 *    no apostrophe.
 *
 * **Known limitation of strategy 2**: it cannot tell `IBGE` from `SILVA`, so an
 * ALL-CAPS person surname is reported as institutional. Callers that may receive
 * ALL-CAPS person names should normalize the case first (`Silva` is correctly
 * reported as non-institutional). This behaviour is deliberate and preserved for
 * backward compatibility — see `isProtectedAcronym` for a stricter check that
 * excludes known short surnames.
 *
 * @param name - Author name to classify
 * @returns true if the name looks like an organization rather than a person
 *
 * @example
 * isInstitutionalName('Ministério da Saúde')  // true
 * isInstitutionalName('World Health Organization') // true
 * isInstitutionalName('IBGE')                 // true
 * isInstitutionalName('João Silva Filho')     // false
 * isInstitutionalName("O'BRIEN")              // false (apostrophe → person)
 */
export function isInstitutionalName(name: string): boolean {
  if (!name) return false;

  // High confidence: contains organization keywords
  for (const pattern of INSTITUTIONAL_PATTERNS) {
    if (pattern.test(name)) return true;
  }

  // Acronyms (ALL CAPS, no spaces/punctuation, 2-7 chars)
  // Exclude names with apostrophes (O'BRIEN, D'ANGELO are person names, not acronyms)
  const clean = name.replace(/[^a-zA-Z]/g, '');
  if (
    clean.length >= 2 &&
    clean.length <= 7 &&
    clean === clean.toUpperCase() &&
    !name.includes(' ') &&
    !name.includes("'")
  ) {
    return true;
  }

  return false;
}
