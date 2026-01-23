/**
 * Real Brazilian Researchers Test
 *
 * Tests the parser with actual names of Brazilian researchers, scientists,
 * and academics. These names represent edge cases and complex patterns
 * found in real academic citations.
 *
 * Sources:
 * - IBGE Census 2022
 * - CNPq Lattes Platform
 * - SciELO articles
 * - Brazilian scientific institutions (Fiocruz, Butantan, CBPF, etc.)
 * - Wikipedia biographies of Brazilian scientists
 */

import { describe, it, expect } from 'vitest';
import {
  parseNameToCsl,
  extractFamilyName,
  extractGivenName,
  formatAuthorABNT2023,
  postProcessABNT2023,
} from '../src';

// ============================================================================
// HISTORICAL BRAZILIAN SCIENTISTS
// Names of famous Brazilian scientists throughout history
// ============================================================================
const HISTORICAL_SCIENTISTS = [
  // Medicine & Public Health
  { name: 'Carlos Ribeiro Justiniano das Chagas', family: 'das Chagas', given: 'Carlos Ribeiro Justiniano' },
  { name: 'Carlos Chagas Filho', family: 'Chagas Filho', given: 'Carlos' },
  { name: 'Oswaldo Gonçalves Cruz', family: 'Cruz', given: 'Oswaldo Gonçalves' },
  { name: 'Vital Brazil Mineiro da Campanha', family: 'da Campanha', given: 'Vital Brazil Mineiro' },
  { name: 'Adolfo Lutz', family: 'Lutz', given: 'Adolfo' },
  { name: 'Juliano Moreira', family: 'Moreira', given: 'Juliano' },
  { name: 'Emílio Ribas', family: 'Ribas', given: 'Emílio' },
  { name: 'Nise da Silveira', family: 'da Silveira', given: 'Nise' },

  // Physics
  { name: 'César Lattes', family: 'Lattes', given: 'César' },
  { name: 'Cesare Mansueto Giulio Lattes', family: 'Lattes', given: 'Cesare Mansueto Giulio' },
  { name: 'José Leite Lopes', family: 'Lopes', given: 'José Leite' },
  { name: 'Mário Schenberg', family: 'Schenberg', given: 'Mário' },
  { name: 'Jayme Tiomno', family: 'Tiomno', given: 'Jayme' },
  // Note: Parser treats "de Souza" as part of given name since "Santos" is the final surname
  { name: 'Marcelo Damy de Souza Santos', family: 'Santos', given: 'Marcelo Damy de Souza' },

  // Biology & Botany
  { name: 'Bertha Maria Júlia Lutz', family: 'Lutz', given: 'Bertha Maria Júlia' },
  { name: 'Graziela Maciel Barroso', family: 'Barroso', given: 'Graziela Maciel' },
  { name: 'Johanna Döbereiner', family: 'Döbereiner', given: 'Johanna' },
  { name: 'Warwick Estevam Kerr', family: 'Kerr', given: 'Warwick Estevam' },

  // Mathematics
  { name: 'Leopoldo Nachbin', family: 'Nachbin', given: 'Leopoldo' },
  { name: 'Maurício Matos Peixoto', family: 'Peixoto', given: 'Maurício Matos' },

  // Engineering & Invention
  { name: 'Alberto Santos Dumont', family: 'Dumont', given: 'Alberto Santos' },
  { name: 'Henrique Maximiano Coelho Neto', family: 'Coelho Neto', given: 'Henrique Maximiano' },
];

// ============================================================================
// CONTEMPORARY BRAZILIAN SCIENTISTS
// Currently active researchers and professors
// ============================================================================
const CONTEMPORARY_SCIENTISTS = [
  // Neuroscience
  { name: 'Miguel Angelo Laporta Nicolelis', family: 'Nicolelis', given: 'Miguel Angelo Laporta' },
  { name: 'Suzana Herculano-Houzel', family: 'Herculano-Houzel', given: 'Suzana' },

  // Genetics & Biology
  { name: 'Mayana Zatz', family: 'Zatz', given: 'Mayana' },
  // Note: "da Veiga" is not immediately before final surname, so treated as part of given name
  { name: 'Lygia da Veiga Pereira', family: 'Pereira', given: 'Lygia da Veiga' },

  // Physics
  { name: 'Sônia Guimarães', family: 'Guimarães', given: 'Sônia' },
  { name: 'Márcia Cristina Bernardes Barbosa', family: 'Barbosa', given: 'Márcia Cristina Bernardes' },

  // Medicine
  { name: 'Margareth Maria Pretti Dalcolmo', family: 'Dalcolmo', given: 'Margareth Maria Pretti' },
  { name: 'Natalia Bezerra Mota', family: 'Mota', given: 'Natalia Bezerra' },

  // Astronomy
  { name: 'Duilia Fernandes de Mello', family: 'de Mello', given: 'Duilia Fernandes' },

  // Chemistry
  { name: 'Jairton Dupont', family: 'Dupont', given: 'Jairton' },
  { name: 'Nelson Eduardo Durán Caballero', family: 'Caballero', given: 'Nelson Eduardo Durán' },

  // Epidemiology
  { name: 'Maria Inês Schmidt', family: 'Schmidt', given: 'Maria Inês' },
  { name: 'Deborah Carvalho Malta', family: 'Malta', given: 'Deborah Carvalho' },

  // Immunology
  // Note: "de Queiroz" is not immediately before final surname
  { name: 'Fernando de Queiroz Cunha', family: 'Cunha', given: 'Fernando de Queiroz' },

  // Mathematics & Climate
  { name: 'Thelma Krug', family: 'Krug', given: 'Thelma' },

  // Bioethics
  { name: 'Débora Diniz Rodrigues', family: 'Rodrigues', given: 'Débora Diniz' },
];

// ============================================================================
// SOCIAL SCIENTISTS AND HUMANISTS
// Sociologists, Anthropologists, Philosophers, Educators
// ============================================================================
const SOCIAL_SCIENTISTS = [
  // Sociology
  { name: 'Gilberto de Mello Freyre', family: 'Freyre', given: 'Gilberto de Mello' },
  { name: 'Florestan Fernandes', family: 'Fernandes', given: 'Florestan' },
  { name: 'Fernando Henrique Cardoso', family: 'Cardoso', given: 'Fernando Henrique' },
  { name: 'Octavio Ianni', family: 'Ianni', given: 'Octavio' },

  // Anthropology
  { name: 'Darcy Ribeiro', family: 'Ribeiro', given: 'Darcy' },
  { name: 'Roberto Augusto DaMatta', family: 'DaMatta', given: 'Roberto Augusto' },
  { name: 'Eduardo Batalha Viveiros de Castro', family: 'de Castro', given: 'Eduardo Batalha Viveiros' },

  // Philosophy
  { name: 'Marilena de Souza Chaui', family: 'Chaui', given: 'Marilena de Souza' },

  // Education
  { name: 'Paulo Reglus Neves Freire', family: 'Freire', given: 'Paulo Reglus Neves' },
  { name: 'Anísio Spínola Teixeira', family: 'Teixeira', given: 'Anísio Spínola' },

  // Geography
  { name: 'Milton Almeida dos Santos', family: 'dos Santos', given: 'Milton Almeida' },

  // Law & Political Science
  { name: 'Celso Lafer', family: 'Lafer', given: 'Celso' },
  { name: 'Raymundo Faoro', family: 'Faoro', given: 'Raymundo' },

  // History
  { name: 'Sérgio Buarque de Holanda', family: 'de Holanda', given: 'Sérgio Buarque' },
  { name: 'Caio Prado Júnior', family: 'Prado Júnior', given: 'Caio' },

  // Economics
  { name: 'Celso Monteiro Furtado', family: 'Furtado', given: 'Celso Monteiro' },
  { name: 'Maria da Conceição Tavares', family: 'Tavares', given: 'Maria da Conceição' },
];

// ============================================================================
// NAMES WITH COMPLEX PARTICLES AND CONNECTORS
// Testing edge cases with "da", "de", "do", "das", "dos", "e"
// ============================================================================
const COMPLEX_PARTICLE_NAMES = [
  // Multiple particles
  { name: 'João Pedro da Silva dos Santos', family: 'dos Santos', given: 'João Pedro da Silva' },
  { name: 'Maria Helena de Souza e Silva', family: 'de Souza e Silva', given: 'Maria Helena' },

  // Particle + Suffix combinations
  { name: 'José Carlos da Costa Filho', family: 'da Costa Filho', given: 'José Carlos' },
  { name: 'Antonio Marcos dos Santos Neto', family: 'dos Santos Neto', given: 'Antonio Marcos' },
  { name: 'Paulo Roberto de Oliveira Junior', family: 'de Oliveira Junior', given: 'Paulo Roberto' },

  // "e" connector
  { name: 'Artur da Costa e Silva', family: 'da Costa e Silva', given: 'Artur' },
  { name: 'Francisco Pereira e Souza', family: 'Pereira e Souza', given: 'Francisco' },

  // Real researchers with particles
  { name: 'Sidney Emanuel Batista dos Santos', family: 'dos Santos', given: 'Sidney Emanuel Batista' },
  { name: 'Ândrea Kely Campos Ribeiro dos Santos', family: 'dos Santos', given: 'Ândrea Kely Campos Ribeiro' },
  // Note: "dos Santos" is not immediately before final surname
  { name: 'José Antonio dos Santos Borges', family: 'Borges', given: 'José Antonio dos Santos' },
  { name: 'Edson Antonio Alves da Silva', family: 'da Silva', given: 'Edson Antonio Alves' },
  { name: 'Eduardo Godoy de Souza', family: 'de Souza', given: 'Eduardo Godoy' },
  { name: 'Miriam da Silva Pereira', family: 'Pereira', given: 'Miriam da Silva' },
  { name: 'Otoniel Nogueira da Silva', family: 'da Silva', given: 'Otoniel Nogueira' },
  { name: 'Manassés Xavier de Souza', family: 'de Souza', given: 'Manassés Xavier' },
  { name: 'Joedson Silva dos Santos', family: 'dos Santos', given: 'Joedson Silva' },
];

// ============================================================================
// COMPOUND SURNAMES
// Testing Espírito Santo, Castelo Branco, Santa Cruz, etc.
// ============================================================================
const COMPOUND_SURNAME_NAMES = [
  // Note: "do" is a particle that prefixes the compound surname "Espírito Santo"
  { name: 'João do Espírito Santo', family: 'do Espírito Santo', given: 'João' },
  { name: 'Maria Castelo Branco', family: 'Castelo Branco', given: 'Maria' },
  { name: 'Humberto de Alencar Castelo Branco', family: 'Castelo Branco', given: 'Humberto de Alencar' },
  { name: 'Pedro Santa Cruz', family: 'Santa Cruz', given: 'Pedro' },
  { name: 'Ana Santo Antônio', family: 'Santo Antônio', given: 'Ana' },
  { name: 'Heitor Villa-Lobos', family: 'Villa-Lobos', given: 'Heitor' },
  { name: 'José Monte Alegre', family: 'Monte Alegre', given: 'José' },
];

// ============================================================================
// FOREIGN ORIGIN SURNAMES
// Brazilian researchers with foreign surnames
// ============================================================================
const FOREIGN_SURNAMES = [
  // German
  { name: 'Johanna Döbereiner', family: 'Döbereiner', given: 'Johanna' },
  { name: 'Fritz Müller', family: 'Müller', given: 'Fritz' },
  { name: 'Emílio Goeldi', family: 'Goeldi', given: 'Emílio' },

  // Italian
  { name: 'Cesare Mansueto Giulio Lattes', family: 'Lattes', given: 'Cesare Mansueto Giulio' },
  { name: 'Tullio Levi-Civita', family: 'Levi-Civita', given: 'Tullio' },

  // Japanese
  { name: 'Seiji Miyaoka', family: 'Miyaoka', given: 'Seiji' },
  { name: 'Hideyo Noguchi', family: 'Noguchi', given: 'Hideyo' },

  // Polish/Slavic
  { name: 'Leopoldo Nachbin', family: 'Nachbin', given: 'Leopoldo' },
  { name: 'Samuel Benchimol', family: 'Benchimol', given: 'Samuel' },

  // Spanish
  { name: 'Nelson Eduardo Durán Caballero', family: 'Caballero', given: 'Nelson Eduardo Durán' },

  // English/American origin
  { name: 'Warwick Estevam Kerr', family: 'Kerr', given: 'Warwick Estevam' },
];

// ============================================================================
// SPECIAL CASES - HYPHENATED AND MULTI-PART SURNAMES
// ============================================================================
const HYPHENATED_NAMES = [
  { name: 'Suzana Herculano-Houzel', family: 'Herculano-Houzel', given: 'Suzana' },
  { name: 'Heitor Villa-Lobos', family: 'Villa-Lobos', given: 'Heitor' },
  { name: 'José Murilo de Carvalho', family: 'de Carvalho', given: 'José Murilo' },
];

// ============================================================================
// EDGE CASES - NAMES THAT MIGHT CONFUSE THE PARSER
// ============================================================================
const EDGE_CASES = [
  // Very long names
  { name: 'Pedro Álvares Cabral de Gouveia da Silveira', family: 'da Silveira', given: 'Pedro Álvares Cabral de Gouveia' },

  // Single name authors (mononymous)
  { name: 'Pelé', family: 'Pelé', given: undefined },

  // Names with accents
  { name: 'José Américo de Almeida', family: 'de Almeida', given: 'José Américo' },
  { name: 'Cândido Portinari', family: 'Portinari', given: 'Cândido' },
  { name: 'Hélio Oiticica', family: 'Oiticica', given: 'Hélio' },

  // Names where middle part looks like particle but isn't
  { name: 'Marco Antonio Raupp', family: 'Raupp', given: 'Marco Antonio' },

  // Short surnames
  { name: 'Chico Buarque de Holanda', family: 'de Holanda', given: 'Chico Buarque' },

  // Citation format
  { name: 'SILVA FILHO, João Carlos', family: 'SILVA FILHO', given: 'João Carlos' },
  { name: 'DA SILVA, Maria Helena', family: 'DA SILVA', given: 'Maria Helena' },
  { name: 'COSTA E SILVA, Pedro', family: 'COSTA E SILVA', given: 'Pedro' },
];

// ============================================================================
// TEST SUITES
// ============================================================================

describe('Real Brazilian Researchers - Historical Scientists', () => {
  describe('parseNameToCsl', () => {
    it.each(HISTORICAL_SCIENTISTS)(
      'parses "$name" -> family: "$family", given: "$given"',
      ({ name, family, given }) => {
        const result = parseNameToCsl(name);
        expect(result.family).toBe(family);
        expect(result.given).toBe(given);
      }
    );
  });

  describe('extractFamilyName', () => {
    it.each(HISTORICAL_SCIENTISTS)(
      'extracts "$family" from "$name"',
      ({ name, family }) => {
        expect(extractFamilyName(name)).toBe(family);
      }
    );
  });
});

describe('Real Brazilian Researchers - Contemporary Scientists', () => {
  describe('parseNameToCsl', () => {
    it.each(CONTEMPORARY_SCIENTISTS)(
      'parses "$name" -> family: "$family", given: "$given"',
      ({ name, family, given }) => {
        const result = parseNameToCsl(name);
        expect(result.family).toBe(family);
        expect(result.given).toBe(given);
      }
    );
  });
});

describe('Real Brazilian Researchers - Social Scientists', () => {
  describe('parseNameToCsl', () => {
    it.each(SOCIAL_SCIENTISTS)(
      'parses "$name" -> family: "$family", given: "$given"',
      ({ name, family, given }) => {
        const result = parseNameToCsl(name);
        expect(result.family).toBe(family);
        expect(result.given).toBe(given);
      }
    );
  });
});

describe('Complex Particle Names', () => {
  describe('parseNameToCsl', () => {
    it.each(COMPLEX_PARTICLE_NAMES)(
      'parses "$name" -> family: "$family", given: "$given"',
      ({ name, family, given }) => {
        const result = parseNameToCsl(name);
        expect(result.family).toBe(family);
        expect(result.given).toBe(given);
      }
    );
  });
});

describe('Compound Surnames', () => {
  describe('parseNameToCsl', () => {
    it.each(COMPOUND_SURNAME_NAMES)(
      'parses "$name" -> family: "$family", given: "$given"',
      ({ name, family, given }) => {
        const result = parseNameToCsl(name);
        expect(result.family).toBe(family);
        expect(result.given).toBe(given);
      }
    );
  });
});

describe('Foreign Origin Surnames', () => {
  describe('parseNameToCsl', () => {
    it.each(FOREIGN_SURNAMES)(
      'parses "$name" -> family: "$family", given: "$given"',
      ({ name, family, given }) => {
        const result = parseNameToCsl(name);
        expect(result.family).toBe(family);
        expect(result.given).toBe(given);
      }
    );
  });
});

describe('Hyphenated Names', () => {
  describe('parseNameToCsl', () => {
    it.each(HYPHENATED_NAMES)(
      'parses "$name" -> family: "$family", given: "$given"',
      ({ name, family, given }) => {
        const result = parseNameToCsl(name);
        expect(result.family).toBe(family);
        expect(result.given).toBe(given);
      }
    );
  });
});

describe('Edge Cases', () => {
  describe('parseNameToCsl', () => {
    it.each(EDGE_CASES)(
      'parses "$name" -> family: "$family", given: "$given"',
      ({ name, family, given }) => {
        const result = parseNameToCsl(name);
        expect(result.family).toBe(family);
        if (given === undefined) {
          expect(result.given).toBeUndefined();
        } else {
          expect(result.given).toBe(given);
        }
      }
    );
  });
});

// ============================================================================
// ABNT FORMATTING TESTS
// ============================================================================

describe('Real Researcher Names - ABNT Formatting', () => {
  describe('formatAuthorABNT2023 - Person names to Title Case', () => {
    const testCases = [
      { input: 'CHAGAS', expected: 'Chagas' },
      { input: 'FREYRE', expected: 'Freyre' },
      { input: 'NICOLELIS', expected: 'Nicolelis' },
      { input: 'HERCULANO-HOUZEL', expected: 'Herculano-Houzel' },
      { input: 'DAMATTA', expected: 'Damatta' },
      { input: 'DA SILVA', expected: 'Da Silva' },
      { input: 'DOS SANTOS', expected: 'Dos Santos' },
      { input: 'COSTA E SILVA', expected: 'Costa e Silva' },
      { input: 'VILLA-LOBOS', expected: 'Villa-Lobos' },
      { input: 'DÖBEREINER', expected: 'Döbereiner' },
    ];

    it.each(testCases)('formats "$input" as "$expected"', ({ input, expected }) => {
      expect(formatAuthorABNT2023(input)).toBe(expected);
    });
  });
});

describe('Real Researcher Citations - postProcessABNT2023', () => {
  describe('Single author citations', () => {
    const testCases = [
      { input: '(CHAGAS, 1909)', expected: '(Chagas, 1909)' },
      { input: '(FREYRE, 1933)', expected: '(Freyre, 1933)' },
      { input: '(FREIRE, 1968)', expected: '(Freire, 1968)' },
      { input: '(RIBEIRO, 1995)', expected: '(Ribeiro, 1995)' },
      { input: '(LATTES, 1947)', expected: '(Lattes, 1947)' },
      { input: '(NICOLELIS, 2014)', expected: '(Nicolelis, 2014)' },
      { input: '(CARDOSO, 1970)', expected: '(Cardoso, 1970)' },
    ];

    it.each(testCases)('formats "$input" as "$expected"', ({ input, expected }) => {
      expect(postProcessABNT2023(input, true)).toBe(expected);
    });
  });

  describe('Multiple author citations', () => {
    const testCases = [
      { input: '(FREYRE; RIBEIRO, 1970)', expected: '(Freyre; Ribeiro, 1970)' },
      { input: '(CHAGAS; CRUZ, 1910)', expected: '(Chagas; Cruz, 1910)' },
      { input: '(NICOLELIS; ZATZ, 2015)', expected: '(Nicolelis; Zatz, 2015)' },
    ];

    it.each(testCases)('formats "$input" as "$expected"', ({ input, expected }) => {
      expect(postProcessABNT2023(input, true)).toBe(expected);
    });
  });

  describe('With page numbers', () => {
    const testCases = [
      { input: '(FREIRE, 1968, p. 45)', expected: '(Freire, 1968, p. 45)' },
      { input: '(FREYRE, 1933, p. 100-150)', expected: '(Freyre, 1933, p. 100-150)' },
    ];

    it.each(testCases)('formats "$input" as "$expected"', ({ input, expected }) => {
      expect(postProcessABNT2023(input, true)).toBe(expected);
    });
  });

  describe('Et al. citations', () => {
    it('formats single author with et al.', () => {
      const result = postProcessABNT2023('(NICOLELIS et al., 2014)', true);
      expect(result).toContain('Nicolelis');
      expect(result).toContain('*et al.*');
    });
  });

  describe('Apud citations', () => {
    const testCases = [
      { input: '(FREIRE apud RIBEIRO, 1995)', expected: '(Freire apud Ribeiro, 1995)' },
    ];

    it.each(testCases)('formats "$input" as "$expected"', ({ input, expected }) => {
      expect(postProcessABNT2023(input, true)).toBe(expected);
    });
  });
});

// ============================================================================
// COMPREHENSIVE STATISTICS
// ============================================================================

describe('Test Coverage Statistics', () => {
  const allNames = [
    ...HISTORICAL_SCIENTISTS,
    ...CONTEMPORARY_SCIENTISTS,
    ...SOCIAL_SCIENTISTS,
    ...COMPLEX_PARTICLE_NAMES,
    ...COMPOUND_SURNAME_NAMES,
    ...FOREIGN_SURNAMES,
    ...HYPHENATED_NAMES,
    ...EDGE_CASES,
  ];

  it(`tests ${allNames.length} real researcher names`, () => {
    expect(allNames.length).toBeGreaterThan(80);
  });

  it('all names parse without errors', () => {
    for (const { name } of allNames) {
      expect(() => parseNameToCsl(name)).not.toThrow();
    }
  });

  it('all names return valid family name', () => {
    for (const { name } of allNames) {
      const result = parseNameToCsl(name);
      expect(result.family).toBeDefined();
      expect(result.family!.length).toBeGreaterThan(0);
    }
  });

  describe('Category breakdown', () => {
    it(`Historical Scientists: ${HISTORICAL_SCIENTISTS.length} names`, () => {
      expect(HISTORICAL_SCIENTISTS.length).toBeGreaterThan(15);
    });

    it(`Contemporary Scientists: ${CONTEMPORARY_SCIENTISTS.length} names`, () => {
      expect(CONTEMPORARY_SCIENTISTS.length).toBeGreaterThan(10);
    });

    it(`Social Scientists: ${SOCIAL_SCIENTISTS.length} names`, () => {
      expect(SOCIAL_SCIENTISTS.length).toBeGreaterThan(10);
    });

    it(`Complex Particle Names: ${COMPLEX_PARTICLE_NAMES.length} names`, () => {
      expect(COMPLEX_PARTICLE_NAMES.length).toBeGreaterThan(10);
    });

    it(`Foreign Surnames: ${FOREIGN_SURNAMES.length} names`, () => {
      expect(FOREIGN_SURNAMES.length).toBeGreaterThan(5);
    });
  });
});
