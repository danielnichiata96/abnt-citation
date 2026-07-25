import { describe, it, expect } from 'vitest';
import {
  PROTECTED_ACRONYMS,
  SHORT_SURNAMES,
  isProtectedAcronym,
} from '../src/acronyms';
import { formatAuthorABNT2023 } from '../src/formatter';

/**
 * The `looksLikeAcronym` heuristic only covers 2-3 character tokens, so any
 * institution with a 4+ character acronym MUST be in the explicit list —
 * otherwise ABNT in-text formatting lowercases it ("UFRPE" -> "Ufrpe").
 *
 * These are the institutions added in 1.4.0 after auditing the list against
 * the Brazilian federal/state university network, the Institutos Federais,
 * the state research foundations (FAPs) and the agencies that publish as
 * corporate authors.
 */
const ADDED_IN_1_4_0 = [
  // Universidades federais
  'UFRPE', 'UFERSA', 'UFCG', 'UFCA', 'UFOPA', 'UFRB', 'UFGD', 'UFFS',
  'UNIFAP', 'UFCSPA', 'UNIVASF', 'UNILA', 'UNILAB', 'UNIFESSPA', 'UFOB',
  'UFSB', 'UFCAT', 'UFAPE', 'UFNT', 'UFDPAR',
  // Institutos Federais
  'IFRS', 'IFMG', 'IFPB', 'IFCE', 'IFBA', 'IFPE', 'IFPI', 'IFMA', 'IFAM',
  'IFPA', 'IFTO', 'IFES', 'IFMT', 'IFMS', 'IFRO', 'IFAL', 'IFSC', 'IFPR',
  'IFSUL',
  // Universidades estaduais
  'UNEMAT', 'UNIMONTES', 'UEPB', 'UERN', 'UESPI', 'UNICENTRO', 'UEMA',
  'UEPA', 'UNITINS', 'UEMG', 'UNESPAR', 'UENP', 'UERGS',
  // Privadas e comunitarias
  'UNISINOS', 'UNIVALI', 'UNIVATES', 'FEEVALE', 'UCPEL', 'UNICEUB',
  'UNIFOR', 'UNIFACS', 'UNIMEP', 'UMESP', 'UCDB', 'UNISANTA', 'UNIFRAN',
  'UNOESTE', 'UNIARARAS',
  // Fundacoes estaduais de amparo a pesquisa
  'FUNCAP', 'FAPEG', 'FAPEMAT', 'FAPEAL', 'FAPESQ', 'FAPITEC', 'FAPEPI',
  'FAPEMA', 'FAPERO', 'FAPEAP',
  // Agencias, institutos e conselhos
  'ICMBIO', 'INPI', 'IPEN', 'ENAP', 'CONAMA', 'CONANDA', 'INPA', 'MPEG',
  'LNCC', 'LNLS', 'CNPEM', 'ESALQ', 'COPPE', 'FUNASA', 'ENSP', 'HCPA',
  'CONFEA', 'COFFITO', 'ANPAD', 'FIESP',
  // Internacionais
  'USDA', 'CNRS', 'CSIC', 'JAXA', 'NOAA', 'USGS', 'PAHO', 'UNODC',
];

describe('acronym list coverage (1.4.0 additions)', () => {
  it.each(ADDED_IN_1_4_0)('%s is protected', (acronym) => {
    expect(isProtectedAcronym(acronym)).toBe(true);
  });

  it.each(ADDED_IN_1_4_0)('%s survives ABNT author formatting', (acronym) => {
    expect(formatAuthorABNT2023(acronym)).toBe(acronym);
  });

  it('every addition is 4+ chars (2-3 char tokens are covered by the heuristic)', () => {
    const tooShort = ADDED_IN_1_4_0.filter((a) => a.length < 4);
    expect(tooShort).toEqual([]);
  });
});

describe('acronym list invariants', () => {
  it('no acronym collides with a known short surname', () => {
    const collisions = [...PROTECTED_ACRONYMS].filter((a) => SHORT_SURNAMES.has(a));
    expect(collisions).toEqual([]);
  });

  it('every entry is uppercase and free of whitespace', () => {
    const malformed = [...PROTECTED_ACRONYMS].filter(
      (a) => a !== a.toUpperCase() || /\s/.test(a)
    );
    expect(malformed).toEqual([]);
  });
});
