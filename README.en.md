# abnt-citation

[![npm version](https://badge.fury.io/js/abnt-citation.svg)](https://www.npmjs.com/package/abnt-citation)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made by CiteMe](https://img.shields.io/badge/Made%20by-CiteMe-0d9488)](https://citeme.app)

> The first Brazilian academic citation parser compliant with ABNT NBR 10520:2023 and NBR 6023:2025.

**This package was extracted from [CiteMe](https://citeme.app?utm_source=npm&utm_medium=readme&utm_campaign=abnt-citation)** - Brazil's most complete academic citation manager.

[Versao em Portugues](./README.md)

---

## Want automatic formatting without code?

**[CiteMe](https://citeme.app?utm_source=npm&utm_medium=readme&utm_campaign=abnt-citation)** formats your references automatically in **40+ styles** (ABNT, APA, Vancouver, Chicago, IEEE, MLA and more) - no installation needed:

- Search across **8+ academic databases** (OpenAlex, PubMed, SciELO, Semantic Scholar and more - 200M+ papers)
- Sources verified from real databases - **zero risk of AI hallucinations**
- **Chrome/Firefox** extension, **Word** add-in and **Google Docs** add-on
- Import/export in BibTeX and RIS
- Free plan available - no credit card required

[Try CiteMe](https://citeme.app?utm_source=npm&utm_medium=readme&utm_campaign=abnt-citation)

---

## Why does this package exist?

ABNT (Brazilian Association of Technical Standards) updated citation and reference standards:

- **NBR 10520:2023** - Changed how author names appear in citations
- **NBR 6023:2025** - Updated reference rules (ISSN optional, "ca." in italics, etc.)

| Author Type | Before (2002) | After (2023/2025) |
|------------|---------------|-------------------|
| Person | (SILVA, 2023) | (Silva, 2023) |
| Institution | (IBGE, 2023) | (IBGE, 2023) |

**No existing parser** (Zotero, Mendeley, citation-js) implements these rules correctly because:

1. CSL (Citation Style Language) doesn't support conditional post-processing
2. It requires a list of protected acronyms (IBGE, USP, UNESCO, etc.)
3. It requires heuristics to detect unknown acronyms

This package solves this problem with **zero dependencies** and **< 10KB**.

## Installation

```bash
npm install abnt-citation
```

## Quick Start

```typescript
import { formatAuthorABNT2023, postProcessABNT2023 } from 'abnt-citation';

// Format individual author names
formatAuthorABNT2023('SILVA');    // -> "Silva"
formatAuthorABNT2023('IBGE');     // -> "IBGE"
formatAuthorABNT2023('DA SILVA'); // -> "Da Silva" (particle capitalized at start)

// Post-process complete citations
postProcessABNT2023('(SILVA, 2023)', true);           // -> "(Silva, 2023)"
postProcessABNT2023('(SILVA; IBGE, 2023)', true);     // -> "(Silva; IBGE, 2023)"
postProcessABNT2023('(SILVA et al., 2023)', true);    // -> "(Silva *et al.*, 2023)"
postProcessABNT2023('(SILVA apud SANTOS, 2023)', true); // -> "(Silva apud Santos, 2023)"
```

## Complete API

### ABNT Formatting (NBR 10520:2023 + NBR 6023:2025)

#### `formatAuthorABNT2023(author: string): string`

Formats an author name according to ABNT 2023:
- **Person names**: Convert to Title Case (`SILVA` -> `Silva`)
- **Institutions/Acronyms**: Keep UPPERCASE (`IBGE` -> `IBGE`)
- **Portuguese particles**: Lowercase except at start (`MARIA DA SILVA` -> `Maria da Silva`, `DA SILVA` -> `Da Silva`)

```typescript
formatAuthorABNT2023('SILVA');            // "Silva"
formatAuthorABNT2023('IBGE');             // "IBGE"
formatAuthorABNT2023('DA SILVA');         // "Da Silva" (particle at start)
formatAuthorABNT2023('MARIA DA SILVA');   // "Maria da Silva"
formatAuthorABNT2023("O'BRIEN");          // "O'Brien"
formatAuthorABNT2023('SMITH-JONES');      // "Smith-Jones"
formatAuthorABNT2023('OLIVEIRA E SILVA'); // "Oliveira e Silva"
```

#### `postProcessABNT2023(citation: string, isInText: boolean): string`

Post-processes citations formatted by CSL:

```typescript
// Parenthetical citations (isInText = true)
postProcessABNT2023('(SILVA, 2023)', true);
// -> "(Silva, 2023)"

postProcessABNT2023('(SILVA; SANTOS, 2023)', true);
// -> "(Silva; Santos, 2023)"

postProcessABNT2023('(SILVA, 2023, p. 45)', true);
// -> "(Silva, 2023, p. 45)"

postProcessABNT2023('(SILVA apud SANTOS, 2023)', true);
// -> "(Silva apud Santos, 2023)"

// Bibliography (isInText = false) - only formats et al.
postProcessABNT2023('SILVA, J. et al. Title. 2023.', false);
// -> "SILVA, J. *et al.* Title. 2023."
```

#### `formatEtAl(): string`

Returns "et al." formatted in italic (markdown):

```typescript
formatEtAl(); // -> "*et al.*"
```

#### `formatCirca(): string`

Returns "ca." (circa) formatted in italic per NBR 6023:2025:

```typescript
formatCirca(); // -> "*ca.*"

// Used when exact year is unknown:
// [*ca.* 2020] or (*ca.* 2020)
```

### Acronym Detection

#### `isProtectedAcronym(author: string): boolean`

Checks if a name is a protected acronym:

```typescript
isProtectedAcronym('IBGE');    // true
isProtectedAcronym('USP');     // true
isProtectedAcronym('UNESCO');  // true
isProtectedAcronym('NASA');    // true (heuristic)
isProtectedAcronym('SILVA');   // false
isProtectedAcronym('LEE');     // false (known short surname)
```

#### `addProtectedAcronym(acronym: string): void`

Adds a custom acronym to the list:

```typescript
addProtectedAcronym('ACME');
isProtectedAcronym('ACME'); // true
```

#### `addProtectedAcronyms(acronyms: string[]): void`

Adds multiple acronyms:

```typescript
addProtectedAcronyms(['ACME', 'CORP', 'INC']);
```

### Brazilian Name Parser

#### `parseNameToCsl(name: string): CslName`

Converts a name to CSL format with support for Brazilian naming conventions:

```typescript
parseNameToCsl('Joao Silva Filho');
// -> { family: "Silva Filho", given: "Joao" }

parseNameToCsl('Maria da Costa e Silva');
// -> { family: "da Costa e Silva", given: "Maria" }

parseNameToCsl('SANTOS, Jose Carlos');
// -> { family: "SANTOS", given: "Jose Carlos" }
```

#### `extractFamilyName(displayName: string): string`

Extracts only the family name:

```typescript
extractFamilyName('Joao Silva Filho'); // -> "Silva Filho"
extractFamilyName('Maria da Costa');   // -> "da Costa"
```

#### `extractGivenName(displayName: string): string`

Extracts only the given name:

```typescript
extractGivenName('Joao Silva Filho'); // -> "Joao"
extractGivenName('Maria da Costa');   // -> "Maria"
```

#### `isPortugueseParticle(word: string): boolean`

Checks if a word is a Portuguese particle:

```typescript
isPortugueseParticle('da');  // true
isPortugueseParticle('de');  // true
isPortugueseParticle('e');   // true
isPortugueseParticle('Silva'); // false
```

#### `isBrazilianSuffix(word: string): boolean`

Checks if a word is a Brazilian suffix (agnome):

```typescript
isBrazilianSuffix('Filho');   // true
isBrazilianSuffix('Neto');    // true
isBrazilianSuffix('Junior');  // true
isBrazilianSuffix('Silva');   // false
```

### Exported Constants

```typescript
import {
  PROTECTED_ACRONYMS,   // Set<string> - 150+ Brazilian acronyms
  SHORT_SURNAMES,       // Set<string> - Short surnames (LEE, WU, LIMA, etc.)
  BRAZILIAN_SUFFIXES,   // Set<string> - Suffixes (FILHO, NETO, JUNIOR, etc.)
  PORTUGUESE_PARTICLES, // Set<string> - Particles (da, de, do, das, dos, e)
  PREFIX_PARTICLES,     // Set<string> - Prefix particles (da, de, do, das, dos)
  CONNECTOR_PARTICLES,  // Set<string> - Connector particle (e)
} from 'abnt-citation';
```

## Integration with citation-js

```typescript
import Cite from 'citation-js';
import { postProcessABNT2023 } from 'abnt-citation';

const cite = new Cite(references);

// Generate citation in ABNT style
const citation = cite.format('citation', {
  format: 'text',
  template: 'abnt',
  lang: 'pt-BR',
});

// Apply ABNT 2023 rules
const formatted = postProcessABNT2023(citation, true);
```

## Used in Production

This package powers the ABNT 2023 formatting engine of **[CiteMe](https://citeme.app?utm_source=npm&utm_medium=readme&utm_campaign=abnt-citation)**, used by thousands of Brazilian students to generate correct academic references.

## CiteMe Ecosystem

CiteMe offers tools for the entire academic workflow:

| Product | Description |
|---------|-------------|
| [Web App](https://citeme.app?utm_source=npm&utm_medium=readme&utm_campaign=abnt-citation) | Reference generator with search across 8+ academic databases |
| Chrome/Firefox Extension | Cite any page or article with one click |
| Word Add-in | Insert citations directly in Microsoft Word |
| Google Docs Add-on | Integrate references in Google Docs |
| `abnt-citation` (this package) | Open-source ABNT 2023 formatting engine |

## Contributing

Contributions are welcome! Please open an issue or pull request on [GitHub](https://github.com/danielnichiata96/abnt-citation).

## License

MIT - Built by the [CiteMe](https://citeme.app?utm_source=npm&utm_medium=readme&utm_campaign=abnt-citation) team
