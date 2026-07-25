import { describe, it, expect } from 'vitest';
import { isInstitutionalName } from '../src/institutional';
import { parseNameToCsl } from '../src/name-parser';

describe('isInstitutionalName', () => {
  describe('Portuguese organization keywords', () => {
    it.each([
      'Instituto Brasileiro de Geografia e Estatística',
      'Ministério da Saúde',
      'Universidade de São Paulo',
      'Fundação Oswaldo Cruz',
      'Conselho Nacional de Justiça',
      'Associação Brasileira de Normas Técnicas',
      'Sociedade Brasileira de Cardiologia',
      'Secretaria de Educação',
    ])('detects %s', (name) => {
      expect(isInstitutionalName(name)).toBe(true);
    });
  });

  describe('Spanish organization keywords', () => {
    it.each([
      'Organización Mundial de la Salud',
      'Universidad Nacional Autónoma de México',
      'Ministerio de Sanidad',
      'Consejo Superior de Investigaciones',
      'Federación Española de Medicina',
    ])('detects %s', (name) => {
      expect(isInstitutionalName(name)).toBe(true);
    });
  });

  describe('English organization keywords', () => {
    it.each([
      'World Health Organization',
      'National Institutes of Health',
      'Department of Agriculture',
      'International Monetary Fund',
      'Royal Society of Chemistry',
    ])('detects %s', (name) => {
      expect(isInstitutionalName(name)).toBe(true);
    });
  });

  describe('known acronyms', () => {
    it.each(['IBGE', 'UNESCO', 'WHO', 'CAPES', 'CNPq', 'FIOCRUZ', 'NASA'])(
      'detects %s',
      (name) => {
        expect(isInstitutionalName(name)).toBe(true);
      }
    );
  });

  describe('person names are not institutional', () => {
    it.each([
      'João Silva Filho',
      'Maria da Costa',
      'Machado de Assis',
      'Ana Paula dos Santos',
      "O'Brien, Patrick",
      'Smith, John',
      'Marie Curie',
      'von Neumann, John',
    ])('rejects %s', (name) => {
      expect(isInstitutionalName(name)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles empty string', () => {
      expect(isInstitutionalName('')).toBe(false);
    });

    it('does not treat apostrophe names as acronyms', () => {
      expect(isInstitutionalName("O'BRIEN")).toBe(false);
      expect(isInstitutionalName("D'ANGELO")).toBe(false);
    });

    it('treats a bare ALL-CAPS single token as institutional (documented limitation)', () => {
      // The 2-7 char ALL-CAPS branch cannot distinguish "IBGE" from "SILVA".
      // Callers that may receive ALL-CAPS person surnames should normalize the
      // case before calling. Kept as-is to preserve historical behaviour.
      expect(isInstitutionalName('SILVA')).toBe(true);
      expect(isInstitutionalName('Silva')).toBe(false);
    });
  });
});

describe('parseNameToCsl with { type: "auto" }', () => {
  describe('institutional authors are kept whole', () => {
    it.each([
      'Instituto Brasileiro de Geografia e Estatística',
      'Ministério da Saúde',
      'World Health Organization',
      'Universidade de São Paulo',
      'Organización Mundial de la Salud',
    ])('keeps %s as a single family name', (name) => {
      expect(parseNameToCsl(name, { type: 'auto' })).toEqual({ family: name });
    });
  });

  describe('person names still parse normally', () => {
    it('parses Brazilian suffixes', () => {
      expect(parseNameToCsl('João Silva Filho', { type: 'auto' })).toEqual({
        family: 'Silva Filho',
        given: 'João',
      });
    });

    it('parses particles', () => {
      expect(parseNameToCsl('Maria da Costa', { type: 'auto' })).toEqual({
        family: 'da Costa',
        given: 'Maria',
      });
    });

    it('parses citation format', () => {
      expect(parseNameToCsl('SANTOS, José Carlos', { type: 'auto' })).toEqual({
        family: 'SANTOS',
        given: 'José Carlos',
      });
    });

    it('parses chain-linked surnames', () => {
      expect(parseNameToCsl('João da Costa e Silva', { type: 'auto' })).toEqual({
        family: 'da Costa e Silva',
        given: 'João',
      });
    });
  });

  describe('auto composes with stripTitles', () => {
    it('strips titles from person names', () => {
      expect(
        parseNameToCsl('Prof. Dr. João Silva Filho', {
          type: 'auto',
          stripTitles: true,
        })
      ).toEqual({ family: 'Silva Filho', given: 'João' });
    });

    it('leaves institutional names untouched', () => {
      expect(
        parseNameToCsl('Ministério da Saúde', {
          type: 'auto',
          stripTitles: true,
        })
      ).toEqual({ family: 'Ministério da Saúde' });
    });
  });

  describe('backward compatibility', () => {
    it('default (no options) still inverts institutional names', () => {
      // Existing consumers rely on this; `auto` is strictly opt-in.
      expect(parseNameToCsl('Ministério da Saúde')).toEqual({
        family: 'da Saúde',
        given: 'Ministério',
      });
    });

    it('explicit institution type still wins over detection', () => {
      expect(parseNameToCsl('João Silva Filho', { type: 'institution' })).toEqual({
        family: 'João Silva Filho',
      });
    });
  });
});
