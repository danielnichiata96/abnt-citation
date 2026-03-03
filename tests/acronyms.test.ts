import { describe, it, expect, afterEach } from 'vitest';
import {
  PROTECTED_ACRONYMS,
  SHORT_SURNAMES,
  isProtectedAcronym,
  addProtectedAcronym,
  addProtectedAcronyms,
  removeProtectedAcronym,
  resetProtectedAcronyms,
} from '../src/acronyms';

describe('ABNT 2023 Protected Acronyms', () => {
  // Reset acronyms after each test to prevent pollution
  afterEach(() => {
    resetProtectedAcronyms();
  });

  describe('PROTECTED_ACRONYMS set', () => {
    it('contains major government agencies', () => {
      expect(PROTECTED_ACRONYMS.has('IBGE')).toBe(true);
      expect(PROTECTED_ACRONYMS.has('INEP')).toBe(true);
      expect(PROTECTED_ACRONYMS.has('IPEA')).toBe(true);
      expect(PROTECTED_ACRONYMS.has('CAPES')).toBe(true);
      expect(PROTECTED_ACRONYMS.has('CNPQ')).toBe(true);
    });

    it('contains federal universities', () => {
      expect(PROTECTED_ACRONYMS.has('UFRJ')).toBe(true);
      expect(PROTECTED_ACRONYMS.has('UFMG')).toBe(true);
      expect(PROTECTED_ACRONYMS.has('UFRGS')).toBe(true);
      expect(PROTECTED_ACRONYMS.has('UFSC')).toBe(true);
    });

    it('contains state universities', () => {
      expect(PROTECTED_ACRONYMS.has('USP')).toBe(true);
      expect(PROTECTED_ACRONYMS.has('UNICAMP')).toBe(true);
      expect(PROTECTED_ACRONYMS.has('UNESP')).toBe(true);
      expect(PROTECTED_ACRONYMS.has('UERJ')).toBe(true);
    });

    it('contains international organizations', () => {
      expect(PROTECTED_ACRONYMS.has('ONU')).toBe(true);
      expect(PROTECTED_ACRONYMS.has('UNESCO')).toBe(true);
      expect(PROTECTED_ACRONYMS.has('OMS')).toBe(true);
      expect(PROTECTED_ACRONYMS.has('FMI')).toBe(true);
      expect(PROTECTED_ACRONYMS.has('WHO')).toBe(true);
    });

    it('contains standards organizations', () => {
      expect(PROTECTED_ACRONYMS.has('ABNT')).toBe(true);
      expect(PROTECTED_ACRONYMS.has('ISO')).toBe(true);
      expect(PROTECTED_ACRONYMS.has('IEEE')).toBe(true);
    });

    it('contains judiciary organs', () => {
      expect(PROTECTED_ACRONYMS.has('STF')).toBe(true);
      expect(PROTECTED_ACRONYMS.has('STJ')).toBe(true);
      expect(PROTECTED_ACRONYMS.has('TCU')).toBe(true);
      expect(PROTECTED_ACRONYMS.has('MPF')).toBe(true);
    });

    it('contains health organizations', () => {
      expect(PROTECTED_ACRONYMS.has('SUS')).toBe(true);
      expect(PROTECTED_ACRONYMS.has('DATASUS')).toBe(true);
      expect(PROTECTED_ACRONYMS.has('OPAS')).toBe(true);
    });

    it('contains security and transit organizations', () => {
      expect(PROTECTED_ACRONYMS.has('DETRAN')).toBe(true);
      expect(PROTECTED_ACRONYMS.has('PROCON')).toBe(true);
      expect(PROTECTED_ACRONYMS.has('IML')).toBe(true);
    });
  });

  describe('SHORT_SURNAMES set', () => {
    it('contains common Asian surnames', () => {
      expect(SHORT_SURNAMES.has('LEE')).toBe(true);
      expect(SHORT_SURNAMES.has('WU')).toBe(true);
      expect(SHORT_SURNAMES.has('LI')).toBe(true);
      expect(SHORT_SURNAMES.has('KIM')).toBe(true);
    });

    it('contains common Brazilian short surnames', () => {
      expect(SHORT_SURNAMES.has('LIMA')).toBe(true);
      expect(SHORT_SURNAMES.has('DIAS')).toBe(true);
      expect(SHORT_SURNAMES.has('REIS')).toBe(true);
      expect(SHORT_SURNAMES.has('MELO')).toBe(true);
    });
  });

  describe('addProtectedAcronym', () => {
    it('adds a single acronym to the list', () => {
      expect(PROTECTED_ACRONYMS.has('ACME')).toBe(false);
      addProtectedAcronym('ACME');
      expect(PROTECTED_ACRONYMS.has('ACME')).toBe(true);
    });

    it('normalizes to uppercase', () => {
      addProtectedAcronym('testcorp');
      expect(PROTECTED_ACRONYMS.has('TESTCORP')).toBe(true);
    });

    it('trims whitespace', () => {
      addProtectedAcronym('  NEWORG  ');
      expect(PROTECTED_ACRONYMS.has('NEWORG')).toBe(true);
    });
  });

  describe('addProtectedAcronyms', () => {
    it('adds multiple acronyms at once', () => {
      addProtectedAcronyms(['CORP1', 'CORP2', 'CORP3']);
      expect(PROTECTED_ACRONYMS.has('CORP1')).toBe(true);
      expect(PROTECTED_ACRONYMS.has('CORP2')).toBe(true);
      expect(PROTECTED_ACRONYMS.has('CORP3')).toBe(true);
    });
  });

  describe('removeProtectedAcronym', () => {
    it('removes an acronym from the list', () => {
      addProtectedAcronym('TOREMOVE');
      expect(PROTECTED_ACRONYMS.has('TOREMOVE')).toBe(true);
      const result = removeProtectedAcronym('TOREMOVE');
      expect(result).toBe(true);
      expect(PROTECTED_ACRONYMS.has('TOREMOVE')).toBe(false);
    });

    it('returns false for non-existent acronym', () => {
      const result = removeProtectedAcronym('NOTEXIST');
      expect(result).toBe(false);
    });

    it('normalizes to uppercase', () => {
      addProtectedAcronym('TESTREM');
      const result = removeProtectedAcronym('testrem');
      expect(result).toBe(true);
      expect(PROTECTED_ACRONYMS.has('TESTREM')).toBe(false);
    });

    it('can remove default acronyms', () => {
      expect(PROTECTED_ACRONYMS.has('IBGE')).toBe(true);
      removeProtectedAcronym('IBGE');
      expect(PROTECTED_ACRONYMS.has('IBGE')).toBe(false);
    });
  });

  describe('resetProtectedAcronyms', () => {
    it('restores default acronyms after adding custom ones', () => {
      addProtectedAcronym('CUSTOM1');
      addProtectedAcronym('CUSTOM2');
      expect(PROTECTED_ACRONYMS.has('CUSTOM1')).toBe(true);

      resetProtectedAcronyms();

      expect(PROTECTED_ACRONYMS.has('CUSTOM1')).toBe(false);
      expect(PROTECTED_ACRONYMS.has('CUSTOM2')).toBe(false);
      expect(PROTECTED_ACRONYMS.has('IBGE')).toBe(true);
      expect(PROTECTED_ACRONYMS.has('USP')).toBe(true);
    });

    it('restores removed default acronyms', () => {
      removeProtectedAcronym('IBGE');
      expect(PROTECTED_ACRONYMS.has('IBGE')).toBe(false);

      resetProtectedAcronyms();

      expect(PROTECTED_ACRONYMS.has('IBGE')).toBe(true);
    });
  });

  describe('isProtectedAcronym', () => {
    describe('known acronyms', () => {
      it('identifies government agencies', () => {
        expect(isProtectedAcronym('IBGE')).toBe(true);
        expect(isProtectedAcronym('INEP')).toBe(true);
        expect(isProtectedAcronym('ANVISA')).toBe(true);
      });

      it('identifies universities', () => {
        expect(isProtectedAcronym('USP')).toBe(true);
        expect(isProtectedAcronym('UNICAMP')).toBe(true);
        expect(isProtectedAcronym('PUC')).toBe(true);
        expect(isProtectedAcronym('FGV')).toBe(true);
      });

      it('is case-insensitive for known acronyms', () => {
        expect(isProtectedAcronym('ibge')).toBe(true);
        expect(isProtectedAcronym('Ibge')).toBe(true);
        expect(isProtectedAcronym('IBGE')).toBe(true);
        expect(isProtectedAcronym('usp')).toBe(true);
      });

      it('handles whitespace', () => {
        expect(isProtectedAcronym('  IBGE  ')).toBe(true);
        expect(isProtectedAcronym('\tUSP\n')).toBe(true);
      });
    });

    describe('heuristic detection (unknown acronyms)', () => {
      it('detects 2-3 char all-caps strings as acronyms via heuristic', () => {
        expect(isProtectedAcronym('CIA')).toBe(true);
        expect(isProtectedAcronym('FBI')).toBe(true);
      });

      it('detects 4-char acronyms via explicit list (not heuristic)', () => {
        expect(isProtectedAcronym('NASA')).toBe(true);
        expect(isProtectedAcronym('FIFA')).toBe(true);
        expect(isProtectedAcronym('IBGE')).toBe(true);
      });

      it('detects acronyms with numbers', () => {
        expect(isProtectedAcronym('G20')).toBe(true);
        expect(isProtectedAcronym('G7')).toBe(true);
      });
    });

    describe('short surname exclusions', () => {
      it('rejects common Asian surnames (LEE, WU, LI)', () => {
        expect(isProtectedAcronym('LEE')).toBe(false);
        expect(isProtectedAcronym('WU')).toBe(false);
        expect(isProtectedAcronym('LI')).toBe(false);
        expect(isProtectedAcronym('KIM')).toBe(false);
        expect(isProtectedAcronym('LIN')).toBe(false);
      });

      it('rejects short Western surnames', () => {
        expect(isProtectedAcronym('RAY')).toBe(false);
        expect(isProtectedAcronym('ROY')).toBe(false);
        expect(isProtectedAcronym('FOX')).toBe(false);
        expect(isProtectedAcronym('COX')).toBe(false);
      });

      it('rejects short Portuguese/Spanish surnames', () => {
        expect(isProtectedAcronym('PAZ')).toBe(false);
        expect(isProtectedAcronym('GIL')).toBe(false);
        expect(isProtectedAcronym('RUI')).toBe(false);
      });
    });

    describe('person names (should NOT be protected)', () => {
      it('rejects common Brazilian surnames', () => {
        expect(isProtectedAcronym('SILVA')).toBe(false);
        expect(isProtectedAcronym('SANTOS')).toBe(false);
        expect(isProtectedAcronym('OLIVEIRA')).toBe(false);
        expect(isProtectedAcronym('SOUZA')).toBe(false);
        expect(isProtectedAcronym('PEREIRA')).toBe(false);
      });

      it('rejects international surnames', () => {
        expect(isProtectedAcronym('SMITH')).toBe(false);
        expect(isProtectedAcronym('JOHNSON')).toBe(false);
        expect(isProtectedAcronym('WILLIAMS')).toBe(false);
        expect(isProtectedAcronym('LECUN')).toBe(false);
        expect(isProtectedAcronym('BENGIO')).toBe(false);
      });

      it('rejects mixed case names (clearly person names)', () => {
        expect(isProtectedAcronym('Silva')).toBe(false);
        expect(isProtectedAcronym('LeCun')).toBe(false);
        expect(isProtectedAcronym('McDonald')).toBe(false);
      });

      it('rejects lowercase names', () => {
        expect(isProtectedAcronym('silva')).toBe(false);
        expect(isProtectedAcronym('santos')).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('handles empty string', () => {
        expect(isProtectedAcronym('')).toBe(false);
        expect(isProtectedAcronym('  ')).toBe(false);
      });

      it('handles single characters', () => {
        expect(isProtectedAcronym('A')).toBe(false);
        expect(isProtectedAcronym('X')).toBe(false);
      });

      it('handles very long strings', () => {
        expect(isProtectedAcronym('ABCDEFGHIJKLMNOP')).toBe(false);
      });
    });
  });
});
