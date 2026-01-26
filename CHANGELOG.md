# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
