# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **`formatTitleEntryABNT(title)`** - formats the title used as the entry of a reference without author: first word in uppercase, plus the next word when the first is an article or a monosyllabic function word ("OS GRANDES clássicos", "EM BUSCA de um sonho", "DOIS estudos"). CSL cannot express this rule.

### Fixed

- **Sine loco / sine nomine** - `postProcessABNT2023(text, false)` normalizes `[S.l.]`, `[s.n.]` and `[S.l.: S.n.]` to `[S. l.]`, `[s. n.]` and `[S. l.: s. n.]` with the abbreviations in italic, and unwraps the italic that citeproc (`<i>`) and the Wasm engine (`<span>`) put around the whole bracket.
- **URL angle brackets** - `postProcessABNT2023(text, false)` removes the `< >` around addresses after "Disponível em:" (plain, HTML-escaped, or around a link anchor). NBR 6023 dropped them in 2018, but the community ABNT CSL style still emits them.
- **README** - the NBR 6023:2025 summary now lists changes confirmed by university library guides (ECA-USP, UFU) instead of an unsourced list.

Rules checked against the 2025 guides of Bibliotecas UFU, Biblioteca IEL-Unicamp and Biblioteca IE-Unicamp.

## [1.4.0] - 2026-07-25

### Added

- **Institutional author detection** - `isInstitutionalName(name)` and `INSTITUTIONAL_PATTERNS` are now part of the public API. Covers organization keywords in Portuguese, Spanish and English plus known Brazilian and international acronyms.
- **`parseNameToCsl(name, { type: 'auto' })`** - detects corporate authors and keeps them whole, while parsing person names as usual. Academic APIs (OpenAlex, Google Books, BDTD, Open Library) return corporate and person authors in the same field; without this, `"Ministério da Saúde"` was inverted into `{ family: "da Saúde", given: "Ministério" }` and rendered as `DA SAÚDE, Ministério` in ABNT.
- **105 institutional acronyms** (275 → 379). The `looksLikeAcronym` heuristic only covers 2-3 character tokens, so every 4+ char acronym must be listed explicitly — until now `UFRPE` formatted as `Ufrpe`, `IFCE` as `Ifce`. Added: 20 federal universities (UFRPE, UFERSA, UFCG, UNILA, UNIVASF, UNIFESSPA…), 19 Institutos Federais (IFRS, IFMG, IFCE, IFBA…), 13 state universities (UNEMAT, UNIMONTES, UEPB, UEMG…), 15 private/community universities (UNISINOS, UNIVALI, FEEVALE, UNIFOR…), 10 state research foundations (FUNCAP, FAPEG, FAPEMAT…), 20 agencies and research institutes (ICMBIO, INPI, IPEN, ESALQ, COPPE, FIOCRUZ/ENSP, CONFEA, COFFITO…) and 8 international bodies (USDA, CNRS, CSIC, NOAA, USGS, PAHO, UNODC, JAXA).
- Invariant tests: no entry may collide with `SHORT_SURNAMES`, every entry is uppercase and whitespace-free, and every new addition is 4+ chars.

### Fixed

- **`ABE` shadowed a person surname** - it was in both `PROTECTED_ACRONYMS` and `SHORT_SURNAMES`, and the acronym list is checked first, so the Japanese surname Abe stayed uppercase (`ABE` instead of `Abe`). Removed from the acronym list; the surname now wins. Found by the new collision invariant test.

### Changed

- Documentation: replaced the `< 10KB` size claim with the measured `~5KB` (minified + gzip), and corrected the CiteMe product descriptions (style count, database list, and shipped surfaces).

### Notes

- `type: 'auto'` is strictly opt-in. Default `parseNameToCsl(name)` behaviour is unchanged, so existing consumers are unaffected.
- Known limitation carried over with `isInstitutionalName`: a single ALL-CAPS token of 2-7 letters is classified as institutional (`SILVA` → `true`). Normalize the case before calling. `isProtectedAcronym` remains the stricter check that excludes known short surnames.

---

## [1.3.0] - 2026-03-03

### Fixed

- **Acronym false positives** - Reduced heuristic detection from 2-4 to 2-3 characters. 4-letter surnames like MORA, LAGE were incorrectly treated as acronyms. Added NASA, FIFA, and other common 4-char acronyms to the explicit list.
- **Mixed-case name destruction** - `formatAuthorABNT2023('McDonald')` no longer returns `'Mcdonald'`. Names with existing mixed-case capitalization are now preserved as-is.
- **README documentation** - Fixed `formatEtAl()`/`formatCirca()` docs to show HTML output (`<i>`) instead of markdown (`*`).

### Changed

- **BREAKING**: `parseNameToCsl('')` now returns `{ family: '' }` instead of `{ family: 'Unknown' }`. `extractFamilyName('')` returns `''` instead of `'Unknown'`. This prevents fabricating data from empty input.

---

## [1.2.0] - 2026-01-26

### Added

- **ABNT NBR 6023:2025 Compliance**
  - Package now conforms to the latest Brazilian standard for bibliographic references
  - `formatCirca()` - Format "ca." (circa) in italic per NBR 6023:2025
  - `postProcessABNT2023()` now automatically formats "ca." to italic

### Changed

- Updated documentation to reference both NBR 10520:2023 (citations) and NBR 6023:2025 (references)
- Package description now mentions NBR 6023:2025

---

## [1.1.0] - 2026-01-23

### Added

- **Compound Surnames Support**
  - `COMPOUND_PREFIXES` - Set with Brazilian compound surname prefixes
  - Automatic detection of compound surnames like:
    - Espírito Santo, Castelo Branco, Santa Cruz
    - Monte Alegre, Villa Lobos, Porto Alegre
    - Rio Branco, Campo Grande, Vila Nova
  - Works with particles: "Maria do Espírito Santo"
  - Works with multiple given names: "José Carlos Castelo Branco"

- **Year Suffix Support**
  - Citations now support year suffixes: `(Silva, 2023a)`, `(Silva, 2023b)`

- **Hyphenated and Apostrophe Surnames**
  - `postProcessABNT2023` now handles: `(SMITH-JONES, 2023)` → `(Smith-Jones, 2023)`
  - `postProcessABNT2023` now handles: `(O'BRIEN, 2023)` → `(O'Brien, 2023)`

- **Pre-formatted et al. Support**
  - Function is now idempotent - handles already formatted `*et al.*` and `<i>et al.</i>`

### Fixed

- Name parser now correctly handles compound Brazilian surnames
  - Before: "João Espírito Santo" → family: "Santo" ❌
  - After: "João Espírito Santo" → family: "Espírito Santo" ✅

- Fixed documentation: `DA SILVA` → `Da Silva` (particle capitalized at start)
  - `MARIA DA SILVA` → `Maria da Silva` (particle lowercase in middle)

---

## [1.0.0] - 2025-01-23

### Added

- Initial release extracted from [CiteMe](https://citeme.app)
- **ABNT 2023 Formatting**
  - `formatAuthorABNT2023()` - Format author names according to ABNT NBR 10520:2023
  - `postProcessABNT2023()` - Post-process citations from CSL formatters
  - `formatEtAl()` - Format "et al." in italic
- **Protected Acronyms**
  - `PROTECTED_ACRONYMS` - Set with 150+ Brazilian institutional acronyms
  - `SHORT_SURNAMES` - Set with short surnames excluded from heuristic detection
  - `isProtectedAcronym()` - Check if a name is a protected acronym
  - `addProtectedAcronym()` - Add a custom acronym
  - `addProtectedAcronyms()` - Add multiple custom acronyms
  - `removeProtectedAcronym()` - Remove an acronym from the list
  - `resetProtectedAcronyms()` - Reset to default acronyms
- **Brazilian Name Parser**
  - `parseNameToCsl()` - Parse names to CSL format with Brazilian conventions
  - `extractFamilyName()` - Extract family name from full name
  - `extractGivenName()` - Extract given name from full name
  - `isPortugueseParticle()` - Check if word is a Portuguese particle (da, de, do)
  - `isBrazilianSuffix()` - Check if word is a Brazilian suffix (Filho, Neto)
  - `BRAZILIAN_SUFFIXES` - Set with Brazilian name suffixes
  - `PORTUGUESE_PARTICLES` - Set with Portuguese name particles
  - `PREFIX_PARTICLES` - Set with prefix particles (da, de, do)
  - `CONNECTOR_PARTICLES` - Set with connector particle (e)
- TypeScript support with full type definitions
- ESM and CommonJS dual package support
- Zero runtime dependencies
- 120+ tests with high coverage

### Technical Details

- Bundle size: ~5KB minified
- Node.js 18+ required
- Supports citation patterns:
  - Basic: `(SILVA, 2023)` -> `(Silva, 2023)`
  - Multiple authors: `(SILVA; SANTOS, 2023)`
  - With et al.: `(SILVA et al., 2023)`
  - With page numbers: `(SILVA, 2023, p. 45)`
  - Apud citations: `(SILVA apud SANTOS, 2023)`

---

Made with love by [CiteMe](https://citeme.app) - Brazil's most complete academic citation manager.
