import { describe, it, expect } from 'vitest';
import {
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
} from '../src/name-parser';

describe('Brazilian Name Parser', () => {
  describe('Constants', () => {
    describe('BRAZILIAN_SUFFIXES', () => {
      it('contains standard agnomes', () => {
        expect(BRAZILIAN_SUFFIXES.has('FILHO')).toBe(true);
        expect(BRAZILIAN_SUFFIXES.has('FILHA')).toBe(true);
        expect(BRAZILIAN_SUFFIXES.has('NETO')).toBe(true);
        expect(BRAZILIAN_SUFFIXES.has('NETA')).toBe(true);
        expect(BRAZILIAN_SUFFIXES.has('JUNIOR')).toBe(true);
        expect(BRAZILIAN_SUFFIXES.has('SOBRINHO')).toBe(true);
      });

      it('contains spelling variants', () => {
        expect(BRAZILIAN_SUFFIXES.has('NETTO')).toBe(true);
        expect(BRAZILIAN_SUFFIXES.has('JR')).toBe(true);
      });
    });

    describe('PORTUGUESE_PARTICLES', () => {
      it('contains all particles', () => {
        expect(PORTUGUESE_PARTICLES.has('da')).toBe(true);
        expect(PORTUGUESE_PARTICLES.has('de')).toBe(true);
        expect(PORTUGUESE_PARTICLES.has('do')).toBe(true);
        expect(PORTUGUESE_PARTICLES.has('das')).toBe(true);
        expect(PORTUGUESE_PARTICLES.has('dos')).toBe(true);
        expect(PORTUGUESE_PARTICLES.has('e')).toBe(true);
      });
    });

    describe('PREFIX_PARTICLES', () => {
      it('contains prefix particles', () => {
        expect(PREFIX_PARTICLES.has('da')).toBe(true);
        expect(PREFIX_PARTICLES.has('de')).toBe(true);
        expect(PREFIX_PARTICLES.has('do')).toBe(true);
        expect(PREFIX_PARTICLES.has('das')).toBe(true);
        expect(PREFIX_PARTICLES.has('dos')).toBe(true);
      });

      it('does not contain connector particle', () => {
        expect(PREFIX_PARTICLES.has('e')).toBe(false);
      });
    });

    describe('CONNECTOR_PARTICLES', () => {
      it('contains only "e"', () => {
        expect(CONNECTOR_PARTICLES.has('e')).toBe(true);
        expect(CONNECTOR_PARTICLES.size).toBe(1);
      });
    });

    describe('COMPOUND_PREFIXES', () => {
      it('contains religious/historical prefixes', () => {
        expect(COMPOUND_PREFIXES.has('ESPÍRITO')).toBe(true);
        expect(COMPOUND_PREFIXES.has('ESPIRITO')).toBe(true);
        expect(COMPOUND_PREFIXES.has('CASTELO')).toBe(true);
        expect(COMPOUND_PREFIXES.has('SANTA')).toBe(true);
        expect(COMPOUND_PREFIXES.has('SANTO')).toBe(true);
        expect(COMPOUND_PREFIXES.has('SÃO')).toBe(true);
        expect(COMPOUND_PREFIXES.has('SAO')).toBe(true);
      });

      it('contains geographic prefixes', () => {
        expect(COMPOUND_PREFIXES.has('MONTE')).toBe(true);
        expect(COMPOUND_PREFIXES.has('VILLA')).toBe(true);
        expect(COMPOUND_PREFIXES.has('VILA')).toBe(true);
        expect(COMPOUND_PREFIXES.has('BELO')).toBe(true);
        expect(COMPOUND_PREFIXES.has('PORTO')).toBe(true);
        expect(COMPOUND_PREFIXES.has('CAMPO')).toBe(true);
        expect(COMPOUND_PREFIXES.has('RIO')).toBe(true);
      });
    });
  });

  describe('parseNameToCsl', () => {
    describe('citation format (Family, Given)', () => {
      it('parses basic citation format', () => {
        expect(parseNameToCsl('SILVA, Joao')).toEqual({
          family: 'SILVA',
          given: 'Joao',
        });
      });

      it('parses citation format with multiple given names', () => {
        expect(parseNameToCsl('SANTOS, Jose Carlos')).toEqual({
          family: 'SANTOS',
          given: 'Jose Carlos',
        });
      });

      it('parses citation format without given name', () => {
        expect(parseNameToCsl('IBGE,')).toEqual({
          family: 'IBGE',
        });
      });
    });

    describe('natural format (Given Family)', () => {
      it('parses simple two-word name', () => {
        expect(parseNameToCsl('Joao Silva')).toEqual({
          family: 'Silva',
          given: 'Joao',
        });
      });

      it('parses name with multiple given names', () => {
        expect(parseNameToCsl('Jose Carlos Santos')).toEqual({
          family: 'Santos',
          given: 'Jose Carlos',
        });
      });
    });

    describe('Brazilian suffixes (agnomes)', () => {
      it('parses name with Filho', () => {
        expect(parseNameToCsl('Joao Silva Filho')).toEqual({
          family: 'Silva Filho',
          given: 'Joao',
        });
      });

      it('parses name with Neto', () => {
        expect(parseNameToCsl('Maria Santos Neto')).toEqual({
          family: 'Santos Neto',
          given: 'Maria',
        });
      });

      it('parses name with Junior', () => {
        expect(parseNameToCsl('Carlos Oliveira Junior')).toEqual({
          family: 'Oliveira Junior',
          given: 'Carlos',
        });
      });

      it('handles lowercase suffixes', () => {
        expect(parseNameToCsl('Joao Silva filho')).toEqual({
          family: 'Silva filho',
          given: 'Joao',
        });
      });

      it('requires at least 3 words for suffix parsing', () => {
        // Only 2 words: "Filho" is treated as family name
        expect(parseNameToCsl('Silva Filho')).toEqual({
          family: 'Filho',
          given: 'Silva',
        });
      });
    });

    describe('Portuguese particles', () => {
      it('parses name with "da"', () => {
        expect(parseNameToCsl('Maria da Silva')).toEqual({
          family: 'da Silva',
          given: 'Maria',
        });
      });

      it('parses name with "de"', () => {
        expect(parseNameToCsl('Jose de Souza')).toEqual({
          family: 'de Souza',
          given: 'Jose',
        });
      });

      it('parses name with "do"', () => {
        expect(parseNameToCsl('Carlos do Carmo')).toEqual({
          family: 'do Carmo',
          given: 'Carlos',
        });
      });

      it('parses name with "dos"', () => {
        expect(parseNameToCsl('Ana dos Santos')).toEqual({
          family: 'dos Santos',
          given: 'Ana',
        });
      });

      it('parses name with "das"', () => {
        expect(parseNameToCsl('Maria das Gracas Oliveira')).toEqual({
          family: 'Oliveira',
          given: 'Maria das Gracas',
        });
      });

      it('handles particles combined with suffixes', () => {
        expect(parseNameToCsl('Joao da Silva Filho')).toEqual({
          family: 'da Silva Filho',
          given: 'Joao',
        });
      });
    });

    describe('connector particle "e" (chain-link)', () => {
      it('parses compound surname with "e"', () => {
        expect(parseNameToCsl('Joao Costa e Silva')).toEqual({
          family: 'Costa e Silva',
          given: 'Joao',
        });
      });

      it('parses complex name with particles and connector', () => {
        expect(parseNameToCsl('Joao da Costa e Silva')).toEqual({
          family: 'da Costa e Silva',
          given: 'Joao',
        });
      });

      it('handles multiple given names with compound surname', () => {
        expect(parseNameToCsl('Jose Carlos Costa e Silva')).toEqual({
          family: 'Costa e Silva',
          given: 'Jose Carlos',
        });
      });
    });

    describe('compound surnames', () => {
      it('parses Espírito Santo', () => {
        expect(parseNameToCsl('João Espírito Santo')).toEqual({
          family: 'Espírito Santo',
          given: 'João',
        });
      });

      it('parses Espirito Santo (without accent)', () => {
        expect(parseNameToCsl('João Espirito Santo')).toEqual({
          family: 'Espirito Santo',
          given: 'João',
        });
      });

      it('parses Castelo Branco', () => {
        expect(parseNameToCsl('Maria Castelo Branco')).toEqual({
          family: 'Castelo Branco',
          given: 'Maria',
        });
      });

      it('parses Santa Cruz', () => {
        expect(parseNameToCsl('Pedro Santa Cruz')).toEqual({
          family: 'Santa Cruz',
          given: 'Pedro',
        });
      });

      it('parses Santo Antônio', () => {
        expect(parseNameToCsl('Carlos Santo Antônio')).toEqual({
          family: 'Santo Antônio',
          given: 'Carlos',
        });
      });

      it('parses Monte Alegre', () => {
        expect(parseNameToCsl('Ana Monte Alegre')).toEqual({
          family: 'Monte Alegre',
          given: 'Ana',
        });
      });

      it('parses Villa Lobos', () => {
        expect(parseNameToCsl('José Villa Lobos')).toEqual({
          family: 'Villa Lobos',
          given: 'José',
        });
      });

      it('parses Vila Nova', () => {
        expect(parseNameToCsl('Marcos Vila Nova')).toEqual({
          family: 'Vila Nova',
          given: 'Marcos',
        });
      });

      it('parses Porto Alegre', () => {
        expect(parseNameToCsl('Fernanda Porto Alegre')).toEqual({
          family: 'Porto Alegre',
          given: 'Fernanda',
        });
      });

      it('parses Rio Branco', () => {
        expect(parseNameToCsl('Lucas Rio Branco')).toEqual({
          family: 'Rio Branco',
          given: 'Lucas',
        });
      });

      it('handles compound surnames with multiple given names', () => {
        expect(parseNameToCsl('José Carlos Espírito Santo')).toEqual({
          family: 'Espírito Santo',
          given: 'José Carlos',
        });
      });

      it('handles compound surnames with particles', () => {
        expect(parseNameToCsl('Maria do Espírito Santo')).toEqual({
          family: 'do Espírito Santo',
          given: 'Maria',
        });
      });
    });

    describe('hyphenated surnames', () => {
      it('preserves hyphenated surnames', () => {
        expect(parseNameToCsl('Carlos Villas-Bôas')).toEqual({
          family: 'Villas-Bôas',
          given: 'Carlos',
        });
      });

      it('handles international hyphenated names', () => {
        expect(parseNameToCsl('Maria Smith-Jones')).toEqual({
          family: 'Smith-Jones',
          given: 'Maria',
        });
      });

      it('handles hyphenated names with particles', () => {
        expect(parseNameToCsl('João da Silva-Pereira')).toEqual({
          family: 'da Silva-Pereira',
          given: 'João',
        });
      });
    });

    describe('single name (mononym)', () => {
      it('parses single name', () => {
        expect(parseNameToCsl('Madonna')).toEqual({
          family: 'Madonna',
        });
      });

      it('parses institutional name', () => {
        expect(parseNameToCsl('IBGE')).toEqual({
          family: 'IBGE',
        });
      });
    });

    describe('edge cases', () => {
      it('handles empty string', () => {
        expect(parseNameToCsl('')).toEqual({
          family: 'Unknown',
        });
      });

      it('handles whitespace only', () => {
        expect(parseNameToCsl('   ')).toEqual({
          family: 'Unknown',
        });
      });

      it('handles extra whitespace', () => {
        expect(parseNameToCsl('  Joao   Silva  ')).toEqual({
          family: 'Silva',
          given: 'Joao',
        });
      });
    });
  });

  describe('extractFamilyName', () => {
    it('extracts family name from full name', () => {
      expect(extractFamilyName('Joao Silva Filho')).toBe('Silva Filho');
      expect(extractFamilyName('Maria da Costa')).toBe('da Costa');
      expect(extractFamilyName('SILVA, Joao')).toBe('SILVA');
    });

    it('returns Unknown for empty string', () => {
      expect(extractFamilyName('')).toBe('Unknown');
    });
  });

  describe('extractGivenName', () => {
    it('extracts given name from full name', () => {
      expect(extractGivenName('Joao Silva Filho')).toBe('Joao');
      expect(extractGivenName('Maria da Costa')).toBe('Maria');
      expect(extractGivenName('Jose Carlos Santos')).toBe('Jose Carlos');
    });

    it('returns empty string for single name', () => {
      expect(extractGivenName('Madonna')).toBe('');
    });

    it('returns empty string for empty input', () => {
      expect(extractGivenName('')).toBe('');
    });
  });

  describe('isPortugueseParticle', () => {
    it('identifies Portuguese particles', () => {
      expect(isPortugueseParticle('da')).toBe(true);
      expect(isPortugueseParticle('de')).toBe(true);
      expect(isPortugueseParticle('do')).toBe(true);
      expect(isPortugueseParticle('das')).toBe(true);
      expect(isPortugueseParticle('dos')).toBe(true);
      expect(isPortugueseParticle('e')).toBe(true);
    });

    it('is case-insensitive', () => {
      expect(isPortugueseParticle('DA')).toBe(true);
      expect(isPortugueseParticle('De')).toBe(true);
    });

    it('rejects non-particles', () => {
      expect(isPortugueseParticle('Silva')).toBe(false);
      expect(isPortugueseParticle('Joao')).toBe(false);
      expect(isPortugueseParticle('Filho')).toBe(false);
    });
  });

  describe('isBrazilianSuffix', () => {
    it('identifies Brazilian suffixes', () => {
      expect(isBrazilianSuffix('Filho')).toBe(true);
      expect(isBrazilianSuffix('Neto')).toBe(true);
      expect(isBrazilianSuffix('Junior')).toBe(true);
      expect(isBrazilianSuffix('Sobrinho')).toBe(true);
    });

    it('is case-insensitive', () => {
      expect(isBrazilianSuffix('FILHO')).toBe(true);
      expect(isBrazilianSuffix('filho')).toBe(true);
      expect(isBrazilianSuffix('Filho')).toBe(true);
    });

    it('rejects non-suffixes', () => {
      expect(isBrazilianSuffix('Silva')).toBe(false);
      expect(isBrazilianSuffix('da')).toBe(false);
    });

    it('identifies Roman numeral suffixes', () => {
      expect(isBrazilianSuffix('II')).toBe(true);
      expect(isBrazilianSuffix('III')).toBe(true);
      expect(isBrazilianSuffix('IV')).toBe(true);
      expect(isBrazilianSuffix('V')).toBe(true);
      expect(isBrazilianSuffix('X')).toBe(true);
    });
  });

  describe('isNobilityTitle', () => {
    it('identifies religious titles', () => {
      expect(isNobilityTitle('Dom')).toBe(true);
      expect(isNobilityTitle('Dona')).toBe(true);
      expect(isNobilityTitle('Frei')).toBe(true);
      expect(isNobilityTitle('Madre')).toBe(true);
      expect(isNobilityTitle('Padre')).toBe(true);
      expect(isNobilityTitle('Papa')).toBe(true);
      expect(isNobilityTitle('Irmã')).toBe(true);
      expect(isNobilityTitle('Irmão')).toBe(true);
    });

    it('identifies nobility titles', () => {
      expect(isNobilityTitle('Barão')).toBe(true);
      expect(isNobilityTitle('Visconde')).toBe(true);
      expect(isNobilityTitle('Conde')).toBe(true);
      expect(isNobilityTitle('Duque')).toBe(true);
      expect(isNobilityTitle('Príncipe')).toBe(true);
      expect(isNobilityTitle('Rei')).toBe(true);
      expect(isNobilityTitle('Imperador')).toBe(true);
    });

    it('identifies saint titles', () => {
      expect(isNobilityTitle('Santo')).toBe(true);
      expect(isNobilityTitle('Santa')).toBe(true);
      expect(isNobilityTitle('São')).toBe(true);
    });

    it('is case-insensitive', () => {
      expect(isNobilityTitle('DOM')).toBe(true);
      expect(isNobilityTitle('dom')).toBe(true);
      expect(isNobilityTitle('Dom')).toBe(true);
    });

    it('handles trailing periods', () => {
      expect(isNobilityTitle('Dom.')).toBe(true);
      expect(isNobilityTitle('Frei.')).toBe(true);
    });

    it('rejects non-nobility titles', () => {
      expect(isNobilityTitle('Silva')).toBe(false);
      expect(isNobilityTitle('João')).toBe(false);
      expect(isNobilityTitle('Prof')).toBe(false);
      expect(isNobilityTitle('Dr')).toBe(false);
    });
  });

  describe('isAcademicTitle', () => {
    it('identifies Portuguese academic titles', () => {
      expect(isAcademicTitle('Prof')).toBe(true);
      expect(isAcademicTitle('Professor')).toBe(true);
      expect(isAcademicTitle('Professora')).toBe(true);
      expect(isAcademicTitle('Dr')).toBe(true);
      expect(isAcademicTitle('Dra')).toBe(true);
      expect(isAcademicTitle('Doutor')).toBe(true);
      expect(isAcademicTitle('Doutora')).toBe(true);
      expect(isAcademicTitle('Me')).toBe(true);
      expect(isAcademicTitle('Mestre')).toBe(true);
      expect(isAcademicTitle('PhD')).toBe(true);
    });

    it('identifies professional titles', () => {
      expect(isAcademicTitle('Eng')).toBe(true);
      expect(isAcademicTitle('Engenheiro')).toBe(true);
      expect(isAcademicTitle('Arq')).toBe(true);
      expect(isAcademicTitle('Arquiteto')).toBe(true);
      expect(isAcademicTitle('Adv')).toBe(true);
    });

    it('identifies military titles', () => {
      expect(isAcademicTitle('Gen')).toBe(true);
      expect(isAcademicTitle('General')).toBe(true);
      expect(isAcademicTitle('Cel')).toBe(true);
      expect(isAcademicTitle('Coronel')).toBe(true);
      expect(isAcademicTitle('Cap')).toBe(true);
      expect(isAcademicTitle('Ten')).toBe(true);
    });

    it('is case-insensitive', () => {
      expect(isAcademicTitle('PROF')).toBe(true);
      expect(isAcademicTitle('prof')).toBe(true);
      expect(isAcademicTitle('Prof')).toBe(true);
    });

    it('handles trailing periods', () => {
      expect(isAcademicTitle('Prof.')).toBe(true);
      expect(isAcademicTitle('Dr.')).toBe(true);
      expect(isAcademicTitle('PhD.')).toBe(true);
    });

    it('rejects non-academic titles', () => {
      expect(isAcademicTitle('Silva')).toBe(false);
      expect(isAcademicTitle('João')).toBe(false);
      expect(isAcademicTitle('Dom')).toBe(false);
      expect(isAcademicTitle('Frei')).toBe(false);
    });
  });

  describe('stripAcademicTitles', () => {
    it('removes single academic title', () => {
      expect(stripAcademicTitles('Prof. João Silva')).toBe('João Silva');
      expect(stripAcademicTitles('Dr. Maria Santos')).toBe('Maria Santos');
      expect(stripAcademicTitles('Dra. Ana Costa')).toBe('Ana Costa');
    });

    it('removes multiple consecutive titles', () => {
      expect(stripAcademicTitles('Prof. Dr. João Silva')).toBe('João Silva');
      expect(stripAcademicTitles('Prof. Dr. Me. Carlos')).toBe('Carlos');
    });

    it('preserves at least one word', () => {
      // Single word that is a title - preserved as it's the only word
      expect(stripAcademicTitles('Prof.')).toBe('Prof.');
      expect(stripAcademicTitles('Dr.')).toBe('Dr.');
    });

    it('does not strip nobility titles', () => {
      expect(stripAcademicTitles('Dom Pedro')).toBe('Dom Pedro');
      expect(stripAcademicTitles('Frei Betto')).toBe('Frei Betto');
    });

    it('handles names without titles', () => {
      expect(stripAcademicTitles('João Silva')).toBe('João Silva');
      expect(stripAcademicTitles('Maria da Costa')).toBe('Maria da Costa');
    });

    it('handles extra whitespace', () => {
      expect(stripAcademicTitles('Prof.  Dr.  João  Silva')).toBe('João Silva');
    });
  });

  describe('ACADEMIC_TITLES constant', () => {
    it('contains academic titles', () => {
      expect(ACADEMIC_TITLES.has('prof')).toBe(true);
      expect(ACADEMIC_TITLES.has('dr')).toBe(true);
      expect(ACADEMIC_TITLES.has('dra')).toBe(true);
      expect(ACADEMIC_TITLES.has('phd')).toBe(true);
      expect(ACADEMIC_TITLES.has('me')).toBe(true);
      expect(ACADEMIC_TITLES.has('mestre')).toBe(true);
    });

    it('contains military titles', () => {
      expect(ACADEMIC_TITLES.has('gen')).toBe(true);
      expect(ACADEMIC_TITLES.has('cel')).toBe(true);
      expect(ACADEMIC_TITLES.has('maj')).toBe(true);
      expect(ACADEMIC_TITLES.has('cap')).toBe(true);
    });
  });

  describe('NOBILITY_TITLES constant', () => {
    it('contains religious titles', () => {
      expect(NOBILITY_TITLES.has('dom')).toBe(true);
      expect(NOBILITY_TITLES.has('frei')).toBe(true);
      expect(NOBILITY_TITLES.has('madre')).toBe(true);
      expect(NOBILITY_TITLES.has('padre')).toBe(true);
      expect(NOBILITY_TITLES.has('papa')).toBe(true);
    });

    it('contains nobility titles', () => {
      expect(NOBILITY_TITLES.has('barão')).toBe(true);
      expect(NOBILITY_TITLES.has('visconde')).toBe(true);
      expect(NOBILITY_TITLES.has('conde')).toBe(true);
      expect(NOBILITY_TITLES.has('duque')).toBe(true);
    });

    it('contains saint titles', () => {
      expect(NOBILITY_TITLES.has('santo')).toBe(true);
      expect(NOBILITY_TITLES.has('santa')).toBe(true);
      expect(NOBILITY_TITLES.has('são')).toBe(true);
    });
  });

  describe('parseNameToCsl with options', () => {
    describe('{ stripTitles: true }', () => {
      it('removes academic titles from name', () => {
        expect(parseNameToCsl('Prof. João Silva', { stripTitles: true })).toEqual({
          family: 'Silva',
          given: 'João',
        });
      });

      it('removes multiple titles', () => {
        expect(parseNameToCsl('Prof. Dr. Maria Santos', { stripTitles: true })).toEqual({
          family: 'Santos',
          given: 'Maria',
        });
      });

      it('preserves name when no titles present', () => {
        expect(parseNameToCsl('João Silva', { stripTitles: true })).toEqual({
          family: 'Silva',
          given: 'João',
        });
      });
    });

    describe('{ type: "institution" }', () => {
      it('treats name as single entity', () => {
        expect(parseNameToCsl('Universidade de São Paulo', { type: 'institution' })).toEqual({
          family: 'Universidade de São Paulo',
        });
      });

      it('preserves commas in institutional names', () => {
        expect(parseNameToCsl('USP, Faculdade de Medicina', { type: 'institution' })).toEqual({
          family: 'USP, Faculdade de Medicina',
        });
      });

      it('preserves acronyms', () => {
        expect(parseNameToCsl('IBGE', { type: 'institution' })).toEqual({
          family: 'IBGE',
        });
      });
    });

    describe('{ type: "historical" }', () => {
      it('prevents name inversion', () => {
        expect(parseNameToCsl('Jesus Cristo', { type: 'historical' })).toEqual({
          family: 'Jesus Cristo',
        });
      });

      it('handles multi-word historical names', () => {
        expect(parseNameToCsl('Mahatma Gandhi', { type: 'historical' })).toEqual({
          family: 'Mahatma Gandhi',
        });
      });

      it('handles long historical names', () => {
        expect(parseNameToCsl('Dom Pedro de Alcântara Francisco', { type: 'historical' })).toEqual({
          family: 'Dom Pedro de Alcântara Francisco',
        });
      });
    });

    describe('auto-detection of nobility titles', () => {
      it('auto-detects names starting with nobility title (≤4 words)', () => {
        expect(parseNameToCsl('Dom Pedro II')).toEqual({
          family: 'Dom Pedro II',
        });
        expect(parseNameToCsl('Frei Betto')).toEqual({
          family: 'Frei Betto',
        });
        expect(parseNameToCsl('Barão de Mauá')).toEqual({
          family: 'Barão de Mauá',
        });
        expect(parseNameToCsl('Papa Francisco')).toEqual({
          family: 'Papa Francisco',
        });
      });

      it('does NOT auto-detect names with > 4 words (inverts normally)', () => {
        // 5 words: should be inverted (auto-detection threshold exceeded)
        const result = parseNameToCsl('Dom Pedro de Alcântara Francisco');
        expect(result.family).toBe('Francisco');
        expect(result.given).toBe('Dom Pedro de Alcântara');
      });

      it('long nobility names work with explicit type flag', () => {
        expect(parseNameToCsl('Dom Pedro de Alcântara Francisco Antonio', { type: 'historical' })).toEqual({
          family: 'Dom Pedro de Alcântara Francisco Antonio',
        });
      });
    });

    describe('Roman numeral suffixes', () => {
      it('treats Roman numerals as suffixes', () => {
        expect(parseNameToCsl('John Smith III')).toEqual({
          family: 'Smith III',
          given: 'John',
        });
      });

      it('handles various Roman numerals', () => {
        expect(parseNameToCsl('Henry Tudor VIII')).toEqual({
          family: 'Tudor VIII',
          given: 'Henry',
        });
        expect(parseNameToCsl('Louis Bourbon IV')).toEqual({
          family: 'Bourbon IV',
          given: 'Louis',
        });
      });

      it('combines Roman numerals with Brazilian suffixes', () => {
        expect(parseNameToCsl('João Silva Filho III')).toEqual({
          family: 'Silva Filho III',
          given: 'João',
        });
      });
    });
  });
});
