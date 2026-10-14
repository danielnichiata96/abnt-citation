import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import * as names from '../src/names';
import * as main from '../src/index';

/**
 * `abnt-citation/names` is the name parser alone, for browser code that only
 * splits author names. It must behave like the main entry and must not bring
 * the formatter or the protected-acronym list with it.
 */

const read = (file: string) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const importsOf = (file: string) => [
  ...new Set([...read(file).matchAll(/^(?:import|export)\s[^;]*?from\s+'([^']+)'/gm)].map((m) => m[1])),
];

describe('abnt-citation/names entry', () => {
  it('parses names exactly like the main entry', () => {
    const samples = [
      'Joao Silva Filho',
      'Maria da Costa e Silva',
      'SANTOS, Jose Carlos',
      'Prof. Dr. Carlos Drummond de Andrade',
      'Instituto Brasileiro de Geografia e Estatistica',
      'Universidade de Sao Paulo',
      'Dom Pedro II',
      '',
    ];
    for (const name of samples) {
      expect(names.parseNameToCsl(name)).toEqual(main.parseNameToCsl(name));
      expect(names.extractFamilyName(name)).toBe(main.extractFamilyName(name));
      expect(names.extractGivenName(name)).toBe(main.extractGivenName(name));
      expect(names.isInstitutionalName(name)).toBe(main.isInstitutionalName(name));
    }
    expect(names.extractFamilyName('Maria da Costa e Silva')).toBe('da Costa e Silva');
  });

  it('exports only name-parser and institution helpers, all also on the main entry', () => {
    const exported = Object.keys(names);
    for (const key of exported) expect(main).toHaveProperty(key);
    expect(exported).toEqual(expect.arrayContaining(['parseNameToCsl', 'extractFamilyName', 'isInstitutionalName']));
    for (const key of ['postProcessABNT2023', 'formatAuthorABNT2023', 'formatTitleEntryABNT', 'isProtectedAcronym', 'PROTECTED_ACRONYMS']) {
      expect(exported).not.toContain(key);
    }
  });

  it('keeps the formatter and the acronym list out of its import graph', () => {
    expect(importsOf('src/names.ts').sort()).toEqual(['./institutional', './name-parser', './types']);
    for (const file of ['src/name-parser.ts', 'src/institutional.ts']) {
      for (const spec of importsOf(file)) expect(['./types', './institutional']).toContain(spec);
    }
  });

  it('is published as a subpath for npm, JSR and TypeScript', () => {
    const pkg = JSON.parse(read('package.json'));
    expect(pkg.exports['./names']).toEqual({
      import: { types: './dist/names.d.ts', default: './dist/names.js' },
      require: { types: './dist/names.d.cts', default: './dist/names.cjs' },
    });
    expect(pkg.typesVersions['*'].names).toEqual(['./dist/names.d.ts']);
    expect(JSON.parse(read('jsr.json')).exports['./names']).toBe('./src/names.ts');
    expect(read('tsup.config.ts')).toContain("'src/names.ts'");
  });
});
