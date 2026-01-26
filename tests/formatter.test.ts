import { describe, it, expect } from 'vitest';
import {
  formatAuthorABNT2023,
  formatEtAl,
  formatCirca,
  postProcessABNT2023,
} from '../src/formatter';

describe('ABNT 2023 Formatter', () => {
  describe('formatAuthorABNT2023', () => {
    describe('protected acronyms (keep uppercase)', () => {
      it('keeps known acronyms uppercase', () => {
        expect(formatAuthorABNT2023('IBGE')).toBe('IBGE');
        expect(formatAuthorABNT2023('USP')).toBe('USP');
        expect(formatAuthorABNT2023('UNESCO')).toBe('UNESCO');
        expect(formatAuthorABNT2023('ABNT')).toBe('ABNT');
      });

      it('converts lowercase acronyms to uppercase', () => {
        expect(formatAuthorABNT2023('ibge')).toBe('IBGE');
        expect(formatAuthorABNT2023('usp')).toBe('USP');
      });

      it('normalizes mixed case acronyms to uppercase', () => {
        expect(formatAuthorABNT2023('Ibge')).toBe('IBGE');
        expect(formatAuthorABNT2023('Unesco')).toBe('UNESCO');
      });
    });

    describe('person names (convert to title case)', () => {
      it('converts uppercase surnames to title case', () => {
        expect(formatAuthorABNT2023('SILVA')).toBe('Silva');
        expect(formatAuthorABNT2023('SANTOS')).toBe('Santos');
        expect(formatAuthorABNT2023('OLIVEIRA')).toBe('Oliveira');
        expect(formatAuthorABNT2023('LECUN')).toBe('Lecun');
      });

      it('converts lowercase surnames to title case', () => {
        expect(formatAuthorABNT2023('silva')).toBe('Silva');
        expect(formatAuthorABNT2023('santos')).toBe('Santos');
      });

      it('handles hyphenated surnames', () => {
        expect(formatAuthorABNT2023('SMITH-JONES')).toBe('Smith-Jones');
        expect(formatAuthorABNT2023('OLIVEIRA-SILVA')).toBe('Oliveira-Silva');
      });

      it('handles apostrophes', () => {
        expect(formatAuthorABNT2023("O'BRIEN")).toBe("O'Brien");
        expect(formatAuthorABNT2023("D'ANGELO")).toBe("D'Angelo");
      });

      it('handles accented characters', () => {
        expect(formatAuthorABNT2023('MULLER')).toBe('Muller');
        expect(formatAuthorABNT2023('GARCIA')).toBe('Garcia');
      });

      it('handles short surnames correctly', () => {
        expect(formatAuthorABNT2023('LEE')).toBe('Lee');
        expect(formatAuthorABNT2023('WU')).toBe('Wu');
        expect(formatAuthorABNT2023('LI')).toBe('Li');
      });

      it('handles common short Brazilian surnames in Title Case', () => {
        expect(formatAuthorABNT2023('LIMA')).toBe('Lima');
        expect(formatAuthorABNT2023('MELO')).toBe('Melo');
        expect(formatAuthorABNT2023('REIS')).toBe('Reis');
        expect(formatAuthorABNT2023('DIAS')).toBe('Dias');
      });
    });

    describe('Portuguese particles (da, de, do)', () => {
      it('keeps particles lowercase when not at start', () => {
        expect(formatAuthorABNT2023('SILVA DA COSTA')).toBe('Silva da Costa');
        expect(formatAuthorABNT2023('MARIA DE SOUZA')).toBe('Maria de Souza');
        expect(formatAuthorABNT2023('JOAO DO CARMO')).toBe('Joao do Carmo');
      });

      it('capitalizes particles at the start', () => {
        expect(formatAuthorABNT2023('DA SILVA')).toBe('Da Silva');
        expect(formatAuthorABNT2023('DE SOUZA')).toBe('De Souza');
        expect(formatAuthorABNT2023('DOS SANTOS')).toBe('Dos Santos');
      });

      it('handles multiple particles', () => {
        expect(formatAuthorABNT2023('MARIA DAS GRACAS')).toBe('Maria das Gracas');
        expect(formatAuthorABNT2023('JOSE DOS REIS')).toBe('Jose dos Reis');
      });

      it('handles particle "e" (and)', () => {
        expect(formatAuthorABNT2023('OLIVEIRA E SILVA')).toBe('Oliveira e Silva');
      });
    });

    describe('edge cases', () => {
      it('handles empty string', () => {
        expect(formatAuthorABNT2023('')).toBe('');
        expect(formatAuthorABNT2023('  ')).toBe('');
      });

      it('handles single character', () => {
        expect(formatAuthorABNT2023('A')).toBe('A');
      });

      it('preserves already correct formatting', () => {
        expect(formatAuthorABNT2023('Silva')).toBe('Silva');
      });
    });
  });

  describe('formatEtAl', () => {
    it('returns italic-formatted et al.', () => {
      expect(formatEtAl()).toBe('*et al.*');
    });
  });

  describe('formatCirca (NBR 6023:2025)', () => {
    it('returns italic-formatted ca.', () => {
      expect(formatCirca()).toBe('*ca.*');
    });
  });

  describe('postProcessABNT2023', () => {
    describe('in-text citations', () => {
      it('converts single author from uppercase to title case', () => {
        const input = '(SILVA, 2023)';
        const expected = '(Silva, 2023)';
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });

      it('converts multiple authors', () => {
        const input = '(SILVA; SANTOS, 2023)';
        const expected = '(Silva; Santos, 2023)';
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });

      it('preserves protected acronyms', () => {
        const input = '(IBGE, 2023)';
        const expected = '(IBGE, 2023)';
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });

      it('handles mixed person and acronym', () => {
        const input = '(SILVA; IBGE, 2023)';
        const expected = '(Silva; IBGE, 2023)';
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });

      it('formats et al. to italic', () => {
        const input = '(SILVA et al., 2023)';
        const result = postProcessABNT2023(input, true);
        expect(result).toContain('*et al.*');
        expect(result).toContain('Silva');
      });

      it('handles three or more authors with et al.', () => {
        const input = '(LECUN; BENGIO; HINTON et al., 2015)';
        const result = postProcessABNT2023(input, true);
        expect(result).toContain('Lecun');
        expect(result).toContain('*et al.*');
      });
    });

    describe('citations with page numbers', () => {
      it('handles single page reference', () => {
        const input = '(SILVA, 2023, p. 45)';
        const expected = '(Silva, 2023, p. 45)';
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });

      it('handles page range', () => {
        const input = '(SILVA, 2023, p. 45-50)';
        const expected = '(Silva, 2023, p. 45-50)';
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });

      it('handles multiple authors with page reference', () => {
        const input = '(SILVA; SANTOS, 2023, p. 123)';
        const expected = '(Silva; Santos, 2023, p. 123)';
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });
    });

    describe('apud citations', () => {
      it('handles basic apud citation', () => {
        const input = '(SILVA apud SANTOS, 2023)';
        const expected = '(Silva apud Santos, 2023)';
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });

      it('preserves acronyms in apud citations', () => {
        const input = '(SILVA apud IBGE, 2023)';
        const expected = '(Silva apud IBGE, 2023)';
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });

      it('handles apud with both acronyms', () => {
        const input = '(UNESCO apud IBGE, 2023)';
        const expected = '(UNESCO apud IBGE, 2023)';
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });

      it('handles complex Apud citations', () => {
        const citation = '(SANTOS; SILVA apud PEREIRA, 2023)';
        const processed = postProcessABNT2023(citation, true);
        expect(processed).toBe('(Santos; Silva apud Pereira, 2023)');
      });

      it('handles Apud with et al.', () => {
        const citation = '(SANTOS et al. apud SILVA, 2023)';
        const processed = postProcessABNT2023(citation, true);
        expect(processed).toBe('(Santos *et al.* apud Silva, 2023)');
      });

      it('handles multi-word names in Apud', () => {
        const citation = '(MARIA DA SILVA apud JOAO DOS SANTOS, 2023)';
        const processed = postProcessABNT2023(citation, true);
        expect(processed).toBe('(Maria da Silva apud Joao dos Santos, 2023)');
      });
    });

    describe('multi-cite in same parenthesis', () => {
      it('handles two citations in same parenthesis', () => {
        const input = '(SILVA, 2020; SANTOS, 2021)';
        const expected = '(Silva, 2020; Santos, 2021)';
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });

      it('handles three citations in same parenthesis', () => {
        const input = '(SILVA, 2019; SANTOS, 2020; OLIVEIRA, 2021)';
        const expected = '(Silva, 2019; Santos, 2020; Oliveira, 2021)';
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });

      it('handles multi-cite with year suffixes', () => {
        const input = '(SILVA, 2020a; SILVA, 2020b)';
        const expected = '(Silva, 2020a; Silva, 2020b)';
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });

      it('handles multi-cite with acronyms', () => {
        const input = '(SILVA, 2020; IBGE, 2021)';
        const expected = '(Silva, 2020; IBGE, 2021)';
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });

      it('handles multi-cite with et al.', () => {
        const input = '(SILVA et al., 2020; SANTOS, 2021)';
        const expected = '(Silva *et al.*, 2020; Santos, 2021)';
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });

      it('handles multi-cite with page numbers', () => {
        const input = '(SILVA, 2020, p. 45; SANTOS, 2021, p. 78)';
        const expected = '(Silva, 2020, p. 45; Santos, 2021, p. 78)';
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });

      it('handles multi-cite with particles', () => {
        const input = '(DA SILVA, 2020; DOS SANTOS, 2021)';
        const expected = '(Da Silva, 2020; Dos Santos, 2021)';
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });

      it('handles multi-cite with hyphenated names', () => {
        const input = '(SMITH-JONES, 2020; VILLAS-BÔAS, 2021)';
        const expected = '(Smith-Jones, 2020; Villas-Bôas, 2021)';
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });
    });

    describe('bibliography entries', () => {
      it('formats et al. to italic in bibliography', () => {
        const input = 'SILVA, J. et al. Title of work. 2023.';
        const result = postProcessABNT2023(input, false);
        expect(result).toContain('*et al.*');
      });

      it('does not modify author names in bibliography (CSL handles this)', () => {
        const input = 'SILVA, J.; SANTOS, M. Title. 2023.';
        const result = postProcessABNT2023(input, false);
        expect(result).toBe('SILVA, J.; SANTOS, M. Title. 2023.');
      });
    });

    describe('et al. double-formatting prevention', () => {
      it('avoids double-formatting already italicized et al.', () => {
        const input = '(SILVA *et al.*, 2023)';
        const result = postProcessABNT2023(input, true);
        expect(result).not.toContain('**et al.**');
        expect(result).not.toContain('***');
      });

      it('handles multiple et al. in same text', () => {
        const input = 'SILVA et al. and SANTOS et al.';
        const result = postProcessABNT2023(input, false);
        const matches = result.match(/\*et al\.\*/g);
        expect(matches).toHaveLength(2);
      });
    });

    describe('edge cases', () => {
      it('handles empty string', () => {
        expect(postProcessABNT2023('', true)).toBe('');
        expect(postProcessABNT2023('', false)).toBe('');
      });

      it('handles citation without year', () => {
        const input = '(SILVA)';
        expect(postProcessABNT2023(input, true)).toBe('(SILVA)');
      });
    });

    describe('accented characters in citations', () => {
      it('handles Portuguese accents', () => {
        const input = '(JOSÉ, 2023)';
        const result = postProcessABNT2023(input, true);
        expect(result).toContain('José');
      });

      it('handles multiple accented authors', () => {
        const input = '(MÜLLER; GARCÍA, 2023)';
        const result = postProcessABNT2023(input, true);
        expect(result).toContain('Müller');
        expect(result).toContain('García');
      });

      it('handles Turkish characters', () => {
        const input = '(ÖZTÜRK; YILDIRIM, 2023)';
        const result = postProcessABNT2023(input, true);
        expect(result).toContain('Öztürk');
        expect(result).toContain('Yildirim');
      });

      it('handles Polish characters', () => {
        const input = '(KOWALCZYK; WÓJCIK, 2023)';
        const result = postProcessABNT2023(input, true);
        expect(result).toContain('Kowalczyk');
        expect(result).toContain('Wójcik');
      });

      it('handles Czech characters', () => {
        const input = '(NOVÁK; DVOŘÁK, 2023)';
        const result = postProcessABNT2023(input, true);
        expect(result).toContain('Novák');
        expect(result).toContain('Dvořák');
      });

      it('handles Romanian characters', () => {
        const input = '(POPESCU; IONESCU, 2023)';
        const result = postProcessABNT2023(input, true);
        expect(result).toContain('Popescu');
        expect(result).toContain('Ionescu');
      });
    });

    describe('hyphenated and apostrophe surnames', () => {
      it('handles hyphenated surnames', () => {
        const input = '(SMITH-JONES, 2023)';
        const expected = '(Smith-Jones, 2023)';
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });

      it('handles apostrophe surnames', () => {
        const input = "(O'BRIEN, 2023)";
        const expected = "(O'Brien, 2023)";
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });

      it('handles multiple hyphenated authors', () => {
        const input = '(SMITH-JONES; VILLAS-BÔAS, 2023)';
        const expected = '(Smith-Jones; Villas-Bôas, 2023)';
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });

      it('handles hyphenated in apud citations', () => {
        const input = '(SMITH-JONES apud VILLAS-BÔAS, 2023)';
        const expected = '(Smith-Jones apud Villas-Bôas, 2023)';
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });
    });

    describe('year suffixes (2023a, 2023b)', () => {
      it('handles single letter suffix', () => {
        const input = '(SILVA, 2023a)';
        const expected = '(Silva, 2023a)';
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });

      it('handles multiple citations with year suffixes', () => {
        expect(postProcessABNT2023('(SILVA, 2023a)', true)).toBe('(Silva, 2023a)');
        expect(postProcessABNT2023('(SILVA, 2023b)', true)).toBe('(Silva, 2023b)');
        expect(postProcessABNT2023('(SANTOS, 2022c)', true)).toBe('(Santos, 2022c)');
      });

      it('handles year suffix with multiple authors', () => {
        const input = '(SILVA; SANTOS, 2023a)';
        const expected = '(Silva; Santos, 2023a)';
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });

      it('handles year suffix in apud citations', () => {
        const input = '(SILVA apud SANTOS, 2023b)';
        const expected = '(Silva apud Santos, 2023b)';
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });

      it('handles year suffix with et al.', () => {
        const input = '(SILVA et al., 2023a)';
        const result = postProcessABNT2023(input, true);
        expect(result).toBe('(Silva *et al.*, 2023a)');
      });
    });

    describe('pre-formatted et al. (idempotent)', () => {
      it('handles already markdown-formatted et al.', () => {
        const input = '(SILVA *et al.*, 2023)';
        const expected = '(Silva *et al.*, 2023)';
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });

      it('handles HTML italic et al. with <i>', () => {
        const input = '(SILVA <i>et al.</i>, 2023)';
        const expected = '(Silva *et al.*, 2023)';
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });

      it('handles HTML italic et al. with <em>', () => {
        const input = '(SILVA <em>et al.</em>, 2023)';
        const expected = '(Silva *et al.*, 2023)';
        expect(postProcessABNT2023(input, true)).toBe(expected);
      });

      it('is idempotent - running twice gives same result', () => {
        const input = '(SILVA et al., 2023)';
        const first = postProcessABNT2023(input, true);
        const second = postProcessABNT2023(first, true);
        expect(second).toBe(first);
      });
    });

    describe('circa (ca.) formatting - NBR 6023:2025', () => {
      it('formats ca. to italic in references', () => {
        const input = 'SILVA, J. Título. [ca. 2020].';
        const result = postProcessABNT2023(input, false);
        expect(result).toBe('SILVA, J. Título. [*ca.* 2020].');
      });

      it('formats ca. to italic in citations', () => {
        const input = '(SILVA, ca. 2020)';
        const result = postProcessABNT2023(input, true);
        expect(result).toContain('*ca.*');
      });

      it('avoids double-formatting already italicized ca.', () => {
        const input = 'SILVA, J. Título. [*ca.* 2020].';
        const result = postProcessABNT2023(input, false);
        expect(result).not.toContain('**ca.**');
        expect(result).not.toContain('***');
      });

      it('handles ca. with different year formats', () => {
        expect(postProcessABNT2023('[ca. 1990]', false)).toBe('[*ca.* 1990]');
        expect(postProcessABNT2023('ca. 2000', false)).toBe('*ca.* 2000');
      });

      it('is idempotent for ca. formatting', () => {
        const input = '[ca. 2020]';
        const first = postProcessABNT2023(input, false);
        const second = postProcessABNT2023(first, false);
        expect(second).toBe(first);
      });
    });
  });
});
