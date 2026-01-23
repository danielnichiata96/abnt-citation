/**
 * Stress Test: 1000+ Brazilian Names
 *
 * Tests the parser with real Brazilian names based on IBGE Census 2022 data.
 * Sources:
 * - https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/44929
 * - https://pt.wikipedia.org/wiki/Lista_de_sobrenomes_mais_comuns_no_Brasil
 */

import { describe, it, expect } from 'vitest';
import {
  parseNameToCsl,
  extractFamilyName,
  extractGivenName,
  formatAuthorABNT2023,
  postProcessABNT2023,
  isProtectedAcronym,
} from '../src';

// ============================================================================
// IBGE Census 2022 - Most Common Surnames (Top 100)
// ============================================================================
const TOP_SURNAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Ferreira', 'Lima', 'Alves',
  'Rodrigues', 'Ribeiro', 'Costa', 'Carvalho', 'Gomes', 'Martins', 'Araújo',
  'Nascimento', 'Melo', 'Barbosa', 'Rocha', 'Cardoso', 'Correia', 'Dias', 'Nunes',
  'Moreira', 'Vieira', 'Soares', 'Mendes', 'Freitas', 'Andrade', 'Lopes', 'Fernandes',
  'Monteiro', 'Moura', 'Batista', 'Reis', 'Machado', 'Teixeira', 'Marques', 'Castro',
  'Pinto', 'Bezerra', 'Garcia', 'Medeiros', 'Azevedo', 'Ramos', 'Miranda', 'Campos',
  'Leite', 'Duarte', 'Cruz', 'Cunha', 'Borges', 'Barros', 'Farias', 'Tavares',
  'Cavalcante', 'Fonseca', 'Guimarães', 'Pires', 'Brito', 'Viana', 'Leal', 'Sales',
  'Carneiro', 'Santana', 'Braga', 'Mota', 'Cordeiro', 'Nogueira', 'Peixoto', 'Sampaio',
  'Aguiar', 'Dantas', 'Siqueira', 'Coelho', 'Xavier', 'Moraes', 'Macedo', 'Assis',
  'Queiroz', 'Rezende', 'Alencar', 'Figueiredo', 'Araujo', 'Amaral', 'Abreu', 'Franco',
  'Paiva', 'Matos', 'Magalhães', 'Vasconcelos', 'Camargo', 'Paula', 'Lacerda', 'Prado',
  'Bastos', 'Rangel', 'Sena', 'Toledo',
];

// ============================================================================
// Most Common First Names (IBGE)
// ============================================================================
const MALE_NAMES = [
  'José', 'João', 'Antonio', 'Francisco', 'Carlos', 'Paulo', 'Pedro', 'Lucas',
  'Luiz', 'Marcos', 'Luis', 'Gabriel', 'Rafael', 'Daniel', 'Marcelo', 'Bruno',
  'Eduardo', 'Felipe', 'Raimundo', 'Rodrigo', 'Manoel', 'Sebastião', 'Fernando',
  'Ricardo', 'Jorge', 'Fábio', 'André', 'Geraldo', 'Roberto', 'Márcio',
  'Antônio', 'Leonardo', 'Diego', 'Mateus', 'Gustavo', 'Miguel', 'Enzo', 'Arthur',
  'Davi', 'Bernardo', 'Heitor', 'Theo', 'Lorenzo', 'Samuel', 'Benjamin', 'Nicolas',
  'Guilherme', 'Henrique', 'Vitor', 'Caio',
];

const FEMALE_NAMES = [
  'Maria', 'Ana', 'Francisca', 'Antonia', 'Adriana', 'Juliana', 'Márcia', 'Fernanda',
  'Patricia', 'Aline', 'Sandra', 'Camila', 'Amanda', 'Bruna', 'Jéssica', 'Letícia',
  'Julia', 'Luciana', 'Vanessa', 'Mariana', 'Gabriela', 'Rafaela', 'Isabela', 'Alice',
  'Sophia', 'Helena', 'Valentina', 'Laura', 'Isabella', 'Manuela', 'Heloísa', 'Luísa',
  'Clara', 'Cecília', 'Eloá', 'Lara', 'Beatriz', 'Giovanna', 'Marina', 'Lorena',
  'Lívia', 'Isadora', 'Bianca', 'Carolina', 'Renata', 'Cristina', 'Eliane', 'Simone',
  'Cláudia', 'Rosana',
];

// ============================================================================
// Portuguese Particles
// ============================================================================
const PARTICLES = ['da', 'de', 'do', 'das', 'dos'];

// ============================================================================
// Brazilian Suffixes (Agnomes)
// ============================================================================
const SUFFIXES = ['Filho', 'Neto', 'Junior', 'Sobrinho', 'Segundo', 'Terceiro'];

// ============================================================================
// Protected Acronyms (Institutions)
// ============================================================================
const INSTITUTIONS = [
  'IBGE', 'USP', 'UNICAMP', 'UFRJ', 'UFMG', 'UFRGS', 'UNESCO', 'ONU', 'OMS',
  'CAPES', 'CNPQ', 'FAPESP', 'INEP', 'IPEA', 'IBAMA', 'ANVISA', 'EMBRAPA',
  'FIOCRUZ', 'BNDES', 'PETROBRAS', 'STF', 'STJ', 'TCU', 'MPF', 'OAB',
  'PUC', 'FGV', 'SENAC', 'SENAI', 'SEBRAE', 'ABNT', 'ISO', 'IEEE',
];

// ============================================================================
// Helper Functions
// ============================================================================
function generateNames(): string[] {
  const names: string[] = [];
  const allFirstNames = [...MALE_NAMES, ...FEMALE_NAMES];

  // 1. Simple names: "FirstName Surname" (200 combinations)
  for (let i = 0; i < 200; i++) {
    const firstName = allFirstNames[i % allFirstNames.length];
    const surname = TOP_SURNAMES[i % TOP_SURNAMES.length];
    names.push(`${firstName} ${surname}`);
  }

  // 2. Names with particles: "FirstName da Surname" (200 combinations)
  for (let i = 0; i < 200; i++) {
    const firstName = allFirstNames[i % allFirstNames.length];
    const particle = PARTICLES[i % PARTICLES.length];
    const surname = TOP_SURNAMES[i % TOP_SURNAMES.length];
    names.push(`${firstName} ${particle} ${surname}`);
  }

  // 3. Names with suffixes: "FirstName Surname Filho" (150 combinations)
  for (let i = 0; i < 150; i++) {
    const firstName = allFirstNames[i % allFirstNames.length];
    const surname = TOP_SURNAMES[i % TOP_SURNAMES.length];
    const suffix = SUFFIXES[i % SUFFIXES.length];
    names.push(`${firstName} ${surname} ${suffix}`);
  }

  // 4. Names with particles and suffixes: "FirstName da Surname Filho" (150 combinations)
  for (let i = 0; i < 150; i++) {
    const firstName = allFirstNames[i % allFirstNames.length];
    const particle = PARTICLES[i % PARTICLES.length];
    const surname = TOP_SURNAMES[i % TOP_SURNAMES.length];
    const suffix = SUFFIXES[i % SUFFIXES.length];
    names.push(`${firstName} ${particle} ${surname} ${suffix}`);
  }

  // 5. Compound surnames with "e": "FirstName Costa e Silva" (100 combinations)
  for (let i = 0; i < 100; i++) {
    const firstName = allFirstNames[i % allFirstNames.length];
    const surname1 = TOP_SURNAMES[i % TOP_SURNAMES.length];
    const surname2 = TOP_SURNAMES[(i + 1) % TOP_SURNAMES.length];
    names.push(`${firstName} ${surname1} e ${surname2}`);
  }

  // 6. Complex: "FirstName da Surname1 e Surname2" (100 combinations)
  for (let i = 0; i < 100; i++) {
    const firstName = allFirstNames[i % allFirstNames.length];
    const particle = PARTICLES[i % PARTICLES.length];
    const surname1 = TOP_SURNAMES[i % TOP_SURNAMES.length];
    const surname2 = TOP_SURNAMES[(i + 1) % TOP_SURNAMES.length];
    names.push(`${firstName} ${particle} ${surname1} e ${surname2}`);
  }

  // 7. Multiple first names: "FirstName MiddleName Surname" (100 combinations)
  for (let i = 0; i < 100; i++) {
    const firstName = allFirstNames[i % allFirstNames.length];
    const middleName = allFirstNames[(i + 1) % allFirstNames.length];
    const surname = TOP_SURNAMES[i % TOP_SURNAMES.length];
    names.push(`${firstName} ${middleName} ${surname}`);
  }

  return names;
}

function generateCitations(): string[] {
  const citations: string[] = [];
  const years = [2020, 2021, 2022, 2023, 2024, 2025];

  // Person citations
  for (const surname of TOP_SURNAMES.slice(0, 50)) {
    const year = years[Math.floor(Math.random() * years.length)];
    citations.push(`(${surname.toUpperCase()}, ${year})`);
  }

  // Multiple authors
  for (let i = 0; i < 50; i++) {
    const s1 = TOP_SURNAMES[i % TOP_SURNAMES.length].toUpperCase();
    const s2 = TOP_SURNAMES[(i + 1) % TOP_SURNAMES.length].toUpperCase();
    const year = years[i % years.length];
    citations.push(`(${s1}; ${s2}, ${year})`);
  }

  // With et al.
  for (let i = 0; i < 30; i++) {
    const s = TOP_SURNAMES[i % TOP_SURNAMES.length].toUpperCase();
    const year = years[i % years.length];
    citations.push(`(${s} et al., ${year})`);
  }

  // With page numbers
  for (let i = 0; i < 30; i++) {
    const s = TOP_SURNAMES[i % TOP_SURNAMES.length].toUpperCase();
    const year = years[i % years.length];
    const page = 10 + i;
    citations.push(`(${s}, ${year}, p. ${page})`);
  }

  // Apud citations
  for (let i = 0; i < 20; i++) {
    const s1 = TOP_SURNAMES[i % TOP_SURNAMES.length].toUpperCase();
    const s2 = TOP_SURNAMES[(i + 1) % TOP_SURNAMES.length].toUpperCase();
    const year = years[i % years.length];
    citations.push(`(${s1} apud ${s2}, ${year})`);
  }

  // Institution citations
  for (const inst of INSTITUTIONS.slice(0, 20)) {
    const year = years[Math.floor(Math.random() * years.length)];
    citations.push(`(${inst}, ${year})`);
  }

  return citations;
}

// ============================================================================
// TEST SUITES
// ============================================================================

describe('Brazilian Names Stress Test (1000+ names)', () => {
  const testNames = generateNames();

  describe(`parseNameToCsl - ${testNames.length} names`, () => {
    it('should parse all names without throwing errors', () => {
      for (const name of testNames) {
        expect(() => parseNameToCsl(name)).not.toThrow();
      }
    });

    it('should always return a family name', () => {
      for (const name of testNames) {
        const result = parseNameToCsl(name);
        expect(result.family).toBeDefined();
        expect(result.family!.length).toBeGreaterThan(0);
      }
    });

    it('should extract given name for multi-word names', () => {
      for (const name of testNames) {
        const parts = name.split(/\s+/);
        if (parts.length > 1) {
          const result = parseNameToCsl(name);
          expect(result.given).toBeDefined();
        }
      }
    });
  });

  describe('Simple names (FirstName Surname)', () => {
    const simpleNames = [
      { input: 'João Silva', family: 'Silva', given: 'João' },
      { input: 'Maria Santos', family: 'Santos', given: 'Maria' },
      { input: 'Pedro Oliveira', family: 'Oliveira', given: 'Pedro' },
      { input: 'Ana Souza', family: 'Souza', given: 'Ana' },
      { input: 'Lucas Pereira', family: 'Pereira', given: 'Lucas' },
      { input: 'Gabriela Ferreira', family: 'Ferreira', given: 'Gabriela' },
      { input: 'Rafael Lima', family: 'Lima', given: 'Rafael' },
      { input: 'Juliana Alves', family: 'Alves', given: 'Juliana' },
      { input: 'Bruno Rodrigues', family: 'Rodrigues', given: 'Bruno' },
      { input: 'Camila Ribeiro', family: 'Ribeiro', given: 'Camila' },
    ];

    it.each(simpleNames)('parses "$input" correctly', ({ input, family, given }) => {
      const result = parseNameToCsl(input);
      expect(result.family).toBe(family);
      expect(result.given).toBe(given);
    });
  });

  describe('Names with particles (da, de, do, das, dos)', () => {
    const particleNames = [
      { input: 'João da Silva', family: 'da Silva', given: 'João' },
      { input: 'Maria de Souza', family: 'de Souza', given: 'Maria' },
      { input: 'Pedro do Carmo', family: 'do Carmo', given: 'Pedro' },
      { input: 'Ana das Graças', family: 'das Graças', given: 'Ana' },
      { input: 'Lucas dos Santos', family: 'dos Santos', given: 'Lucas' },
      { input: 'Gabriela da Costa', family: 'da Costa', given: 'Gabriela' },
      { input: 'Rafael de Oliveira', family: 'de Oliveira', given: 'Rafael' },
      { input: 'Juliana do Nascimento', family: 'do Nascimento', given: 'Juliana' },
      { input: 'Bruno das Neves', family: 'das Neves', given: 'Bruno' },
      { input: 'Camila dos Reis', family: 'dos Reis', given: 'Camila' },
    ];

    it.each(particleNames)('parses "$input" correctly', ({ input, family, given }) => {
      const result = parseNameToCsl(input);
      expect(result.family).toBe(family);
      expect(result.given).toBe(given);
    });
  });

  describe('Names with suffixes (Filho, Neto, Junior)', () => {
    const suffixNames = [
      { input: 'João Silva Filho', family: 'Silva Filho', given: 'João' },
      { input: 'Maria Santos Neto', family: 'Santos Neto', given: 'Maria' },
      { input: 'Pedro Oliveira Junior', family: 'Oliveira Junior', given: 'Pedro' },
      { input: 'Ana Souza Sobrinho', family: 'Souza Sobrinho', given: 'Ana' },
      { input: 'Lucas Pereira Segundo', family: 'Pereira Segundo', given: 'Lucas' },
      { input: 'Gabriela Ferreira Terceiro', family: 'Ferreira Terceiro', given: 'Gabriela' },
      { input: 'José Carlos Silva Filho', family: 'Silva Filho', given: 'José Carlos' },
      { input: 'Maria Helena Santos Neto', family: 'Santos Neto', given: 'Maria Helena' },
    ];

    it.each(suffixNames)('parses "$input" correctly', ({ input, family, given }) => {
      const result = parseNameToCsl(input);
      expect(result.family).toBe(family);
      expect(result.given).toBe(given);
    });
  });

  describe('Names with particles AND suffixes', () => {
    const complexNames = [
      { input: 'João da Silva Filho', family: 'da Silva Filho', given: 'João' },
      { input: 'Maria de Souza Neto', family: 'de Souza Neto', given: 'Maria' },
      { input: 'Pedro dos Santos Junior', family: 'dos Santos Junior', given: 'Pedro' },
      { input: 'Ana do Carmo Sobrinho', family: 'do Carmo Sobrinho', given: 'Ana' },
      { input: 'José Carlos da Costa Filho', family: 'da Costa Filho', given: 'José Carlos' },
    ];

    it.each(complexNames)('parses "$input" correctly', ({ input, family, given }) => {
      const result = parseNameToCsl(input);
      expect(result.family).toBe(family);
      expect(result.given).toBe(given);
    });
  });

  describe('Compound surnames with "e" connector', () => {
    const compoundNames = [
      { input: 'João Costa e Silva', family: 'Costa e Silva', given: 'João' },
      { input: 'Maria Souza e Oliveira', family: 'Souza e Oliveira', given: 'Maria' },
      { input: 'Pedro da Costa e Silva', family: 'da Costa e Silva', given: 'Pedro' },
      { input: 'Ana Moreira e Santos', family: 'Moreira e Santos', given: 'Ana' },
      { input: 'José Carlos Pinto e Castro', family: 'Pinto e Castro', given: 'José Carlos' },
    ];

    it.each(compoundNames)('parses "$input" correctly', ({ input, family, given }) => {
      const result = parseNameToCsl(input);
      expect(result.family).toBe(family);
      expect(result.given).toBe(given);
    });
  });

  describe('Citation format (Surname, Given)', () => {
    const citationFormat = [
      { input: 'SILVA, João', family: 'SILVA', given: 'João' },
      { input: 'SANTOS, Maria Helena', family: 'SANTOS', given: 'Maria Helena' },
      { input: 'OLIVEIRA, Pedro Lucas', family: 'OLIVEIRA', given: 'Pedro Lucas' },
      { input: 'DA SILVA, José Carlos', family: 'DA SILVA', given: 'José Carlos' },
      { input: 'SILVA FILHO, João', family: 'SILVA FILHO', given: 'João' },
    ];

    it.each(citationFormat)('parses "$input" correctly', ({ input, family, given }) => {
      const result = parseNameToCsl(input);
      expect(result.family).toBe(family);
      expect(result.given).toBe(given);
    });
  });
});

describe('formatAuthorABNT2023 - Stress Test', () => {
  describe('Person surnames (should be Title Case)', () => {
    it('formats all top 100 surnames correctly', () => {
      for (const surname of TOP_SURNAMES) {
        const upper = surname.toUpperCase();
        const result = formatAuthorABNT2023(upper);
        // Should be Title Case (first letter uppercase, rest lowercase)
        expect(result).toBe(surname);
      }
    });

    it('handles lowercase input', () => {
      for (const surname of TOP_SURNAMES.slice(0, 50)) {
        const lower = surname.toLowerCase();
        const result = formatAuthorABNT2023(lower);
        expect(result).toBe(surname);
      }
    });
  });

  describe('Institutional acronyms (should stay UPPERCASE)', () => {
    it('preserves all institution acronyms', () => {
      for (const inst of INSTITUTIONS) {
        const result = formatAuthorABNT2023(inst);
        expect(result).toBe(inst.toUpperCase());
      }
    });

    it('normalizes lowercase acronyms to uppercase', () => {
      for (const inst of INSTITUTIONS.slice(0, 20)) {
        const lower = inst.toLowerCase();
        const result = formatAuthorABNT2023(lower);
        expect(result).toBe(inst.toUpperCase());
      }
    });
  });

  describe('Names with particles', () => {
    const particleNames = [
      { input: 'DA SILVA', expected: 'Da Silva' },
      { input: 'DE SOUZA', expected: 'De Souza' },
      { input: 'DO CARMO', expected: 'Do Carmo' },
      { input: 'DAS GRAÇAS', expected: 'Das Graças' },
      { input: 'DOS SANTOS', expected: 'Dos Santos' },
      { input: 'SILVA DA COSTA', expected: 'Silva da Costa' },
      { input: 'MARIA DE SOUZA', expected: 'Maria de Souza' },
      { input: 'OLIVEIRA E SILVA', expected: 'Oliveira e Silva' },
    ];

    it.each(particleNames)('formats "$input" as "$expected"', ({ input, expected }) => {
      expect(formatAuthorABNT2023(input)).toBe(expected);
    });
  });
});

describe('postProcessABNT2023 - Citation Stress Test', () => {
  const citations = generateCitations();

  describe(`Processing ${citations.length} citations`, () => {
    it('should process all citations without errors', () => {
      for (const citation of citations) {
        expect(() => postProcessABNT2023(citation, true)).not.toThrow();
      }
    });

    it('should maintain parentheses structure', () => {
      for (const citation of citations) {
        const result = postProcessABNT2023(citation, true);
        if (citation.startsWith('(')) {
          expect(result.startsWith('(')).toBe(true);
          expect(result.endsWith(')')).toBe(true);
        }
      }
    });

    it('should preserve year in all citations', () => {
      for (const citation of citations) {
        const result = postProcessABNT2023(citation, true);
        // Extract year from original
        const yearMatch = citation.match(/\d{4}/);
        if (yearMatch) {
          expect(result).toContain(yearMatch[0]);
        }
      }
    });
  });

  describe('Person name citations (should be Title Case)', () => {
    const personCitations = [
      { input: '(SILVA, 2023)', expected: '(Silva, 2023)' },
      { input: '(SANTOS, 2023)', expected: '(Santos, 2023)' },
      { input: '(OLIVEIRA, 2023)', expected: '(Oliveira, 2023)' },
      { input: '(SILVA; SANTOS, 2023)', expected: '(Silva; Santos, 2023)' },
      { input: '(SILVA; SANTOS; OLIVEIRA, 2023)', expected: '(Silva; Santos; Oliveira, 2023)' },
      { input: '(SILVA, 2023, p. 45)', expected: '(Silva, 2023, p. 45)' },
      { input: '(SILVA, 2023, p. 45-50)', expected: '(Silva, 2023, p. 45-50)' },
    ];

    it.each(personCitations)('formats "$input" as "$expected"', ({ input, expected }) => {
      expect(postProcessABNT2023(input, true)).toBe(expected);
    });
  });

  describe('Institution citations (should stay UPPERCASE)', () => {
    const instCitations = [
      { input: '(IBGE, 2023)', expected: '(IBGE, 2023)' },
      { input: '(USP, 2023)', expected: '(USP, 2023)' },
      { input: '(UNESCO, 2023)', expected: '(UNESCO, 2023)' },
      { input: '(SILVA; IBGE, 2023)', expected: '(Silva; IBGE, 2023)' },
      { input: '(IBGE; UNESCO, 2023)', expected: '(IBGE; UNESCO, 2023)' },
    ];

    it.each(instCitations)('formats "$input" as "$expected"', ({ input, expected }) => {
      expect(postProcessABNT2023(input, true)).toBe(expected);
    });
  });

  describe('Et al. citations', () => {
    it('should format et al. in italic', () => {
      const input = '(SILVA et al., 2023)';
      const result = postProcessABNT2023(input, true);
      expect(result).toContain('*et al.*');
      expect(result).toContain('Silva');
    });

    it('should handle multiple authors with et al.', () => {
      const input = '(SILVA; SANTOS et al., 2023)';
      const result = postProcessABNT2023(input, true);
      expect(result).toContain('*et al.*');
      expect(result).toContain('Silva');
      expect(result).toContain('Santos');
    });
  });

  describe('Apud citations', () => {
    const apudCitations = [
      { input: '(SILVA apud SANTOS, 2023)', expected: '(Silva apud Santos, 2023)' },
      { input: '(SILVA apud IBGE, 2023)', expected: '(Silva apud IBGE, 2023)' },
      { input: '(IBGE apud UNESCO, 2023)', expected: '(IBGE apud UNESCO, 2023)' },
    ];

    it.each(apudCitations)('formats "$input" as "$expected"', ({ input, expected }) => {
      expect(postProcessABNT2023(input, true)).toBe(expected);
    });
  });
});

describe('isProtectedAcronym - Edge Cases', () => {
  describe('Short surnames that look like acronyms', () => {
    const shortSurnames = [
      'LEE', 'WU', 'LI', 'KIM', 'LIN', 'SUN', 'LIU', 'GAO', 'ZHU', 'CHO',
      'PAZ', 'GIL', 'RUI', 'REI', 'RAY', 'ROY', 'DAY', 'MAY', 'LAW', 'LOW',
      'FOX', 'COX', 'RAO', 'DAS', 'SEN', 'ROE', 'POE', 'LEA', 'FAY', 'JAY',
      'LIMA', 'DIAS', 'ROSA', 'MELO', 'REIS', 'CRUZ', 'VALE', 'LEAL', 'LAGO',
    ];

    it('should NOT treat short surnames as acronyms', () => {
      for (const name of shortSurnames) {
        expect(isProtectedAcronym(name)).toBe(false);
      }
    });
  });

  describe('Long surnames that are NOT acronyms', () => {
    const longSurnames = TOP_SURNAMES.filter(s => s.length >= 5);

    it('should NOT treat long surnames as acronyms', () => {
      for (const surname of longSurnames) {
        expect(isProtectedAcronym(surname.toUpperCase())).toBe(false);
      }
    });
  });

  describe('Real acronyms', () => {
    it('should identify all institutions as acronyms', () => {
      for (const inst of INSTITUTIONS) {
        expect(isProtectedAcronym(inst)).toBe(true);
      }
    });
  });
});

describe('extractFamilyName and extractGivenName - Batch Test', () => {
  const testCases = [
    { name: 'João Silva', family: 'Silva', given: 'João' },
    { name: 'Maria da Costa', family: 'da Costa', given: 'Maria' },
    { name: 'José Silva Filho', family: 'Silva Filho', given: 'José' },
    { name: 'Ana Costa e Silva', family: 'Costa e Silva', given: 'Ana' },
    { name: 'Pedro da Costa e Silva', family: 'da Costa e Silva', given: 'Pedro' },
    { name: 'José Carlos da Silva Filho', family: 'da Silva Filho', given: 'José Carlos' },
    { name: 'Maria Helena dos Santos Neto', family: 'dos Santos Neto', given: 'Maria Helena' },
  ];

  describe('extractFamilyName', () => {
    it.each(testCases)('extracts "$family" from "$name"', ({ name, family }) => {
      expect(extractFamilyName(name)).toBe(family);
    });
  });

  describe('extractGivenName', () => {
    it.each(testCases)('extracts "$given" from "$name"', ({ name, given }) => {
      expect(extractGivenName(name)).toBe(given);
    });
  });
});

describe('Summary Statistics', () => {
  const testNames = generateNames();
  const testCitations = generateCitations();

  it(`total test names generated: ${testNames.length}`, () => {
    expect(testNames.length).toBeGreaterThanOrEqual(1000);
  });

  it(`total test citations generated: ${testCitations.length}`, () => {
    expect(testCitations.length).toBeGreaterThanOrEqual(200);
  });
});
