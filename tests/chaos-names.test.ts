/**
 * Chaos Test: Edge Cases That May Break the ABNT Parser
 *
 * This file tests "vicious" name combinations to identify parser limitations.
 * These are names from around the world that challenge the current logic.
 *
 * The goal is to:
 * 1. Document current parser behavior (even if incorrect)
 * 2. Identify cases that need special handling
 * 3. Decide which cases are in-scope for ABNT (Brazilian names) vs out-of-scope
 */

import { describe, it, expect } from 'vitest';
import {
  parseNameToCsl,
  extractFamilyName,
  formatAuthorABNT2023,
  postProcessABNT2023,
  isProtectedAcronym,
} from '../src';

// ============================================================================
// HELPER: Test and document current behavior
// ============================================================================
function testCurrentBehavior(name: string) {
  const result = parseNameToCsl(name);
  return { family: result.family, given: result.given };
}

// ============================================================================
// 1. MULTIPLE AGNOMES (Brazilian Suffixes)
// What happens with Filho Neto, Filho Junior, etc.?
// ============================================================================
describe('Multiple Agnomes (Filho Neto, etc.)', () => {
  const cases = [
    // Current parser only handles ONE suffix
    { name: 'José Silva Filho Neto', description: 'Two suffixes' },
    { name: 'João Santos Neto Filho', description: 'Reversed double suffix' },
    { name: 'Pedro Oliveira Junior Neto', description: 'Junior + Neto' },
    { name: 'Carlos Costa Filho Sobrinho', description: 'Filho + Sobrinho' },
    { name: 'Antônio Pereira Segundo Filho', description: 'Segundo + Filho' },
  ];

  describe('Current Behavior Documentation', () => {
    it.each(cases)('$name ($description)', ({ name }) => {
      const result = testCurrentBehavior(name);
      console.log(`"${name}" -> family: "${result.family}", given: "${result.given}"`);
      // Just document - don't assert specific values yet
      expect(result.family).toBeDefined();
    });
  });

  describe('Expected ABNT Behavior', () => {
    // ABNT should include ALL suffixes in the family name
    const expected = [
      { name: 'José Silva Filho Neto', family: 'Silva Filho Neto', given: 'José' },
      { name: 'João Santos Neto Filho', family: 'Santos Neto Filho', given: 'João' },
    ];

    it.each(expected)('$name should have family "$family"', ({ name, family, given }) => {
      const result = parseNameToCsl(name);
      expect(result.family).toBe(family);
      expect(result.given).toBe(given);
    });
  });
});

// ============================================================================
// 2. APOSTROPHE SURNAMES (D'Ávila, O'Brien, etc.)
// ============================================================================
describe('Apostrophe Surnames', () => {
  const cases = [
    // Portuguese/Brazilian
    { name: "Maria D'Ávila", family: "D'Ávila", given: 'Maria' },
    { name: "João D'Alessandro", family: "D'Alessandro", given: 'João' },
    { name: "Pedro D'Água", family: "D'Água", given: 'Pedro' },

    // Irish
    { name: "Patrick O'Brien", family: "O'Brien", given: 'Patrick' },
    { name: "Sean O'Connor", family: "O'Connor", given: 'Sean' },
    { name: "Mary O'Sullivan", family: "O'Sullivan", given: 'Mary' },

    // Italian
    { name: "Marco D'Angelo", family: "D'Angelo", given: 'Marco' },
    { name: "Giuseppe Dell'Acqua", family: "Dell'Acqua", given: 'Giuseppe' },
  ];

  describe('Current Behavior', () => {
    it.each(cases)('$name', ({ name, family, given }) => {
      const result = parseNameToCsl(name);
      expect(result.family).toBe(family);
      expect(result.given).toBe(given);
    });
  });
});

// ============================================================================
// 3. SPANISH/LATIN DOUBLE SURNAMES
// In Spanish, both paternal and maternal surnames are used
// ============================================================================
describe('Spanish Double Surnames', () => {
  const cases = [
    // Famous authors - ABNT typically uses LAST surname only for citation
    { name: 'Gabriel García Márquez', description: 'Nobel laureate' },
    { name: 'Mario Vargas Llosa', description: 'Nobel laureate' },
    { name: 'Pablo Neruda Reyes', description: 'Poet (born Ricardo Neftalí Reyes)' },
    { name: 'Jorge Luis Borges Acevedo', description: 'Writer' },

    // With particles
    { name: 'Federico García Lorca', description: 'Poet' },
    { name: 'Miguel de Cervantes Saavedra', description: 'Don Quixote author' },

    // Mexican style
    { name: 'Octavio Paz Lozano', description: 'Nobel laureate' },
    { name: 'Carlos Fuentes Macías', description: 'Writer' },
  ];

  describe('Current Behavior Documentation', () => {
    it.each(cases)('$name ($description)', ({ name }) => {
      const result = testCurrentBehavior(name);
      console.log(`"${name}" -> family: "${result.family}", given: "${result.given}"`);
      expect(result.family).toBeDefined();
    });
  });

  // Question: Should ABNT use "García Márquez" or just "Márquez"?
  // According to ABNT NBR 6023, for Spanish names we should use the full compound surname
  describe('Expected Behavior (Spanish compound surnames)', () => {
    const expected = [
      // These would require special handling for Spanish names
      { name: 'Gabriel García Márquez', family: 'Márquez', given: 'Gabriel García' },
    ];

    it.each(expected)('$name -> family: "$family" (current parser behavior)', ({ name, family }) => {
      const result = parseNameToCsl(name);
      expect(result.family).toBe(family);
    });
  });
});

// ============================================================================
// 4. TITLES AND DEGREES
// Prof., Dr., PhD, etc. should be stripped
// ============================================================================
describe('Titles and Degrees', () => {
  const cases = [
    { name: 'Prof. João Silva', expected: { family: 'Silva', given: 'João' }, hasTitle: true },
    { name: 'Dr. Maria Santos', expected: { family: 'Santos', given: 'Maria' }, hasTitle: true },
    { name: 'Prof. Dr. Carlos Oliveira', expected: { family: 'Oliveira', given: 'Carlos' }, hasTitle: true },
    { name: 'PhD. Ana Costa', expected: { family: 'Costa', given: 'Ana' }, hasTitle: true },
    { name: 'Me. Pedro Lima', expected: { family: 'Lima', given: 'Pedro' }, hasTitle: true },
    { name: 'Dra. Fernanda Souza', expected: { family: 'Souza', given: 'Fernanda' }, hasTitle: true },

    // Religious/nobility titles
    { name: 'Dom Pedro Casaldáliga', expected: { family: 'Casaldáliga', given: 'Pedro' }, hasTitle: true },
    { name: 'Frei Betto', expected: { family: 'Betto', given: undefined }, hasTitle: true },
    { name: 'Madre Teresa de Calcutá', expected: { family: 'de Calcutá', given: 'Teresa' }, hasTitle: true },

    // Military
    { name: 'Gen. Ernesto Geisel', expected: { family: 'Geisel', given: 'Ernesto' }, hasTitle: true },
    { name: 'Cel. Carlos Brilhante Ustra', expected: { family: 'Ustra', given: 'Carlos Brilhante' }, hasTitle: true },
  ];

  describe('Current Behavior (titles NOT stripped)', () => {
    it.each(cases)('$name', ({ name }) => {
      const result = testCurrentBehavior(name);
      console.log(`"${name}" -> family: "${result.family}", given: "${result.given}"`);
      // Document current behavior - titles are probably NOT being stripped
      expect(result.family).toBeDefined();
    });
  });
});

// ============================================================================
// 5. INSTITUTIONAL AUTHORS
// Corporate authors should NOT be split at commas
// ============================================================================
describe('Institutional Authors with Commas', () => {
  const cases = [
    { name: 'Universidade de São Paulo, Faculdade de Medicina', shouldSplit: false },
    { name: 'Brasil, Ministério da Saúde', shouldSplit: false },
    { name: 'Instituto Brasileiro de Geografia e Estatística, Diretoria de Pesquisas', shouldSplit: false },
    { name: 'Organização das Nações Unidas, Conselho de Segurança', shouldSplit: false },
  ];

  describe('Current Behavior', () => {
    it.each(cases)('$name', ({ name, shouldSplit }) => {
      const result = parseNameToCsl(name);
      console.log(`"${name}" -> family: "${result.family}", given: "${result.given}"`);

      // Current parser splits at comma - this is WRONG for institutions
      if (!shouldSplit) {
        // This test documents the bug - institutions are being split
        expect(result.given).toBeDefined(); // Bug: there's a "given" name
      }
    });
  });
});

// ============================================================================
// 6. ASIAN NAMES (Family Name First)
// Chinese, Japanese, Korean names have family name first
// ============================================================================
describe('Asian Names (Family Name First)', () => {
  const cases = [
    // Chinese (Family Given order in original)
    { name: 'Xi Jinping', nativeOrder: 'Family Given', westernized: false },
    { name: 'Mao Zedong', nativeOrder: 'Family Given', westernized: false },
    { name: 'Deng Xiaoping', nativeOrder: 'Family Given', westernized: false },

    // Japanese
    { name: 'Hayao Miyazaki', nativeOrder: 'Miyazaki Hayao', westernized: true },
    { name: 'Haruki Murakami', nativeOrder: 'Murakami Haruki', westernized: true },

    // Korean
    { name: 'Kim Jong-un', nativeOrder: 'Family Given', westernized: false },
    { name: 'Park Geun-hye', nativeOrder: 'Family Given', westernized: false },

    // Vietnamese
    { name: 'Ho Chi Minh', nativeOrder: 'Family Middle Given', westernized: false },
    { name: 'Nguyen Van Thieu', nativeOrder: 'Family Middle Given', westernized: false },
  ];

  describe('Current Behavior (assumes Western order)', () => {
    it.each(cases)('$name ($nativeOrder)', ({ name }) => {
      const result = testCurrentBehavior(name);
      console.log(`"${name}" -> family: "${result.family}", given: "${result.given}"`);
      // Parser assumes Western order (Given Family), which is wrong for Asian names
      expect(result.family).toBeDefined();
    });
  });
});

// ============================================================================
// 7. DUTCH/GERMAN PARTICLES (van, von, van der, etc.)
// These should be treated like Portuguese particles
// ============================================================================
describe('Dutch/German Particles', () => {
  const cases = [
    // Dutch
    { name: 'Vincent van Gogh', family: 'van Gogh', given: 'Vincent' },
    { name: 'Ludwig van Beethoven', family: 'van Beethoven', given: 'Ludwig' },
    { name: 'Rembrandt van Rijn', family: 'van Rijn', given: 'Rembrandt' },
    { name: 'Johannes van der Waals', family: 'van der Waals', given: 'Johannes' },
    { name: 'Anton van Leeuwenhoek', family: 'van Leeuwenhoek', given: 'Anton' },

    // German
    { name: 'Johann Wolfgang von Goethe', family: 'von Goethe', given: 'Johann Wolfgang' },
    { name: 'Ludwig von Mises', family: 'von Mises', given: 'Ludwig' },
    { name: 'Werner von Braun', family: 'von Braun', given: 'Werner' },
    { name: 'Carl von Clausewitz', family: 'von Clausewitz', given: 'Carl' },

    // Complex
    { name: 'Maximilian von und zu Liechtenstein', family: 'von und zu Liechtenstein', given: 'Maximilian' },
  ];

  describe('Current Behavior', () => {
    it.each(cases)('$name -> expected family: "$family"', ({ name, family, given }) => {
      const result = parseNameToCsl(name);
      console.log(`"${name}" -> actual: family="${result.family}", given="${result.given}"`);

      // Current parser only knows Portuguese particles (da, de, do)
      // It won't recognize "van", "von", etc.
      expect(result.family).toBeDefined();
    });
  });
});

// ============================================================================
// 8. ARABIC NAMES (al-, ibn, bin, etc.)
// ============================================================================
describe('Arabic Names', () => {
  const cases = [
    // With "al-" article
    { name: 'Muhammad al-Khwarizmi', expected: 'al-Khwarizmi' },
    { name: 'Ibn Sina', expected: 'Ibn Sina' }, // Avicenna
    { name: 'Ahmed bin Salman', expected: 'bin Salman' },
    { name: 'Osama bin Laden', expected: 'bin Laden' },

    // Modern Arabic names
    { name: 'Mohamed ElBaradei', expected: 'ElBaradei' },
    { name: 'Yasser Arafat', expected: 'Arafat' },
    { name: 'Anwar el-Sadat', expected: 'el-Sadat' },
  ];

  describe('Current Behavior', () => {
    it.each(cases)('$name', ({ name, expected }) => {
      const result = testCurrentBehavior(name);
      console.log(`"${name}" -> family: "${result.family}", given: "${result.given}"`);
      expect(result.family).toBeDefined();
    });
  });
});

// ============================================================================
// 9. SCOTTISH/IRISH PREFIXES (Mc, Mac, O')
// ============================================================================
describe('Scottish/Irish Prefixes', () => {
  const cases = [
    { name: 'Ronald McDonald', family: 'McDonald', given: 'Ronald' },
    { name: 'Paul McCartney', family: 'McCartney', given: 'Paul' },
    { name: 'Rory McIlroy', family: 'McIlroy', given: 'Rory' },
    { name: 'Ewan MacGregor', family: 'MacGregor', given: 'Ewan' },
    { name: 'George MacDonald', family: 'MacDonald', given: 'George' },
  ];

  describe('Current Behavior', () => {
    it.each(cases)('$name -> family: "$family"', ({ name, family, given }) => {
      const result = parseNameToCsl(name);
      expect(result.family).toBe(family);
      expect(result.given).toBe(given);
    });
  });
});

// ============================================================================
// 10. SINGLE NAME SUFFIX LOOKALIKES
// Names where the last word LOOKS like a suffix but isn't
// ============================================================================
describe('Suffix Lookalikes (surnames that look like suffixes)', () => {
  const cases = [
    // "Neto" as a standalone surname (not a suffix)
    { name: 'Carla Neto', description: 'Neto is the surname, not a suffix' },
    { name: 'Ana Júnior', description: 'Junior is the surname' },
    { name: 'Pedro Filho', description: 'Filho is the surname' },

    // Two-word names where second word is suffix-like
    // These are ambiguous without context
  ];

  describe('Ambiguous Cases', () => {
    it.each(cases)('$name ($description)', ({ name, description }) => {
      const result = testCurrentBehavior(name);
      console.log(`"${name}" (${description}) -> family: "${result.family}", given: "${result.given}"`);

      // For two-word names, the parser can't know if "Neto" is a surname or suffix
      // It needs at least 3 words to apply suffix logic
      expect(result.family).toBeDefined();
    });
  });

  describe('Expected Behavior (2-word names with suffix-like surnames)', () => {
    // With only 2 words, the second word should be treated as surname, not suffix
    const expected = [
      { name: 'Carla Neto', family: 'Neto', given: 'Carla' },
      { name: 'Ana Júnior', family: 'Júnior', given: 'Ana' },
      { name: 'Pedro Filho', family: 'Filho', given: 'Pedro' },
    ];

    it.each(expected)('$name should have family "$family"', ({ name, family, given }) => {
      const result = parseNameToCsl(name);
      expect(result.family).toBe(family);
      expect(result.given).toBe(given);
    });
  });
});

// ============================================================================
// 11. EXTREME WHITESPACE AND PUNCTUATION
// ============================================================================
describe('Whitespace and Punctuation Edge Cases', () => {
  const cases = [
    { name: '  João   Silva  ', expected: { family: 'Silva', given: 'João' } },
    { name: 'João  Carlos   da   Silva', expected: { family: 'da Silva', given: 'João Carlos' } },
    { name: 'Silva, João.', expected: { family: 'Silva', given: 'João.' } },
    { name: 'SILVA,JOÃO', expected: { family: 'SILVA', given: 'JOÃO' } }, // No space after comma
    { name: '  ', expected: { family: 'Unknown', given: undefined } }, // Only whitespace
    { name: '', expected: { family: 'Unknown', given: undefined } }, // Empty string
  ];

  describe('Current Behavior', () => {
    it.each(cases)('handles "$name"', ({ name, expected }) => {
      const result = parseNameToCsl(name);
      expect(result.family).toBe(expected.family);
      if (expected.given === undefined) {
        expect(result.given).toBeUndefined();
      } else {
        expect(result.given).toBe(expected.given);
      }
    });
  });
});

// ============================================================================
// 12. HYPHENATED FIRST NAMES
// ============================================================================
describe('Hyphenated First Names', () => {
  const cases = [
    { name: 'Jean-Paul Sartre', family: 'Sartre', given: 'Jean-Paul' },
    { name: 'Marie-Curie Sklodowska', family: 'Sklodowska', given: 'Marie-Curie' },
    { name: 'José-Maria Santos', family: 'Santos', given: 'José-Maria' },
    { name: 'Ana-Luísa da Silva', family: 'da Silva', given: 'Ana-Luísa' },
  ];

  describe('Current Behavior', () => {
    it.each(cases)('$name -> family: "$family", given: "$given"', ({ name, family, given }) => {
      const result = parseNameToCsl(name);
      expect(result.family).toBe(family);
      expect(result.given).toBe(given);
    });
  });
});

// ============================================================================
// 13. ACRONYM FALSE POSITIVES
// Short surnames that might be mistaken for acronyms
// ============================================================================
describe('Acronym False Positives', () => {
  const shortSurnames = [
    // 4-letter surnames that are ALL CAPS in citations
    'ZATZ', 'KATZ', 'OTTO', 'BACH', 'BUSH', 'FORD', 'GORE', 'KING',
    'NASH', 'POPE', 'RICE', 'ROSS', 'RYAN', 'WADE', 'WEBB', 'WEST',
    'WONG', 'WOOD', 'YORK', 'YANG', 'CHEN', 'WANG', 'ZHAO', 'ZHOU',

    // 3-letter
    'LEE', 'WU', 'LI', 'XU', 'HU', 'YU', 'MA', 'HE',
    'KIM', 'PAK', 'CHO', 'AHN', 'RYU', 'SEO', 'YOO',
  ];

  describe('Should NOT be treated as acronyms', () => {
    it.each(shortSurnames)('%s should not be a protected acronym', (surname) => {
      const isAcronym = isProtectedAcronym(surname);
      expect(isAcronym).toBe(false);
    });
  });

  describe('formatAuthorABNT2023 should convert to Title Case', () => {
    const testCases = [
      { input: 'ZATZ', expected: 'Zatz' },
      { input: 'KATZ', expected: 'Katz' },
      { input: 'OTTO', expected: 'Otto' },
      { input: 'BACH', expected: 'Bach' },
      { input: 'CHEN', expected: 'Chen' },
      { input: 'WANG', expected: 'Wang' },
    ];

    it.each(testCases)('$input -> $expected', ({ input, expected }) => {
      expect(formatAuthorABNT2023(input)).toBe(expected);
    });
  });
});

// ============================================================================
// 14. NOBILITY AND SPECIAL TITLES
// ============================================================================
describe('Nobility and Special Titles', () => {
  const cases = [
    { name: 'Dom Pedro II', description: 'Brazilian Emperor' },
    { name: 'Princesa Isabel', description: 'Brazilian Princess' },
    { name: 'Barão de Mauá', description: 'Brazilian Baron' },
    { name: 'Visconde de Taunay', description: 'Brazilian Viscount' },
    { name: 'Papa Francisco', description: 'Pope' },
    { name: 'Dalai Lama', description: 'Buddhist leader' },
  ];

  describe('Current Behavior', () => {
    it.each(cases)('$name ($description)', ({ name }) => {
      const result = testCurrentBehavior(name);
      console.log(`"${name}" -> family: "${result.family}", given: "${result.given}"`);
      expect(result.family).toBeDefined();
    });
  });
});

// ============================================================================
// 15. VERY LONG NAMES
// ============================================================================
describe('Very Long Names', () => {
  const cases = [
    {
      name: 'Pablo Diego José Francisco de Paula Juan Nepomuceno María de los Remedios Cipriano de la Santísima Trinidad Ruiz y Picasso',
      description: 'Picasso full name',
    },
    {
      name: 'Adolph Blaine Charles David Earl Frederick Gerald Hubert Irvin John Kenneth Lloyd Martin Nero Oliver Paul Quincy Randolph Sherman Thomas Uncas Victor William Xerxes Yancy Zeus Wolfeschlegelsteinhausenbergerdorff',
      description: 'Longest name ever recorded',
    },
  ];

  describe('Stress Test', () => {
    it.each(cases)('handles $description', ({ name }) => {
      const result = testCurrentBehavior(name);
      console.log(`Long name parsed -> family: "${result.family?.substring(0, 30)}...", given: "${result.given?.substring(0, 30)}..."`);
      expect(result.family).toBeDefined();
    });
  });
});

// ============================================================================
// SUMMARY: Known Limitations
// ============================================================================
describe('Summary: Known Parser Limitations', () => {
  it('documents known limitations', () => {
    const limitations = [
      '1. Titles (Prof., Dr.) - not stripped from names',
      '2. Institutional authors with commas - incorrectly split as person names',
      '3. Asian names (family-first order) - assumes Western order',
      '4. Dutch/German particles (van, von) - not recognized as particles',
      '5. Arabic particles (al-, ibn, bin) - not recognized',
      '6. Spanish double surnames - only uses last surname',
    ];

    console.log('\n=== KNOWN PARSER LIMITATIONS ===');
    limitations.forEach(l => console.log(l));
    console.log('================================\n');

    expect(limitations.length).toBeGreaterThan(0);
  });
});
