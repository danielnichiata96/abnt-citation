# abnt-citation

[![npm version](https://badge.fury.io/js/abnt-citation.svg)](https://www.npmjs.com/package/abnt-citation)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made by CiteMe](https://img.shields.io/badge/Made%20by-CiteMe-0d9488)](https://citeme.app)

> O primeiro parser brasileiro de citacoes academicas que segue corretamente a ABNT NBR 10520:2023.

**Este pacote foi extraido do [CiteMe](https://citeme.app)** - o gerenciador de citacoes academicas mais completo do Brasil.

[English version](./README.en.md)

---

## Quer formatacao automatica sem codigo?

**[CiteMe](https://citeme.app)** formata suas referencias automaticamente em 14+ estilos (ABNT, APA, Vancouver, etc.) - sem precisar instalar nada:

- Busca automatica por DOI, ISBN ou titulo
- Importacao de curriculo Lattes
- Exportacao para Word, BibTeX, RIS
- 100% gratuito para estudantes

[Experimente o CiteMe gratuitamente](https://citeme.app)

---

## Por que este pacote existe?

A atualizacao de 2023 da ABNT mudou como nomes de autores aparecem em citacoes parenteticas:

| Tipo de autor | Antes (2002) | Depois (2023) |
|--------------|--------------|---------------|
| Pessoa | (SILVA, 2023) | (Silva, 2023) |
| Instituicao | (IBGE, 2023) | (IBGE, 2023) |

**Nenhum parser existente** (Zotero, Mendeley, citation-js) implementa essa regra corretamente porque:

1. CSL (Citation Style Language) nao suporta pos-processamento condicional
2. Requer uma lista de acronimos protegidos (IBGE, USP, UNESCO, etc.)
3. Requer heuristicas para detectar acronimos desconhecidos

Este pacote resolve esse problema com **zero dependencias** e **< 10KB**.

## Instalacao

```bash
npm install abnt-citation
```

## Quick Start

```typescript
import { formatAuthorABNT2023, postProcessABNT2023 } from 'abnt-citation';

// Formata nomes de autores individuais
formatAuthorABNT2023('SILVA');    // -> "Silva"
formatAuthorABNT2023('IBGE');     // -> "IBGE"
formatAuthorABNT2023('DA SILVA'); // -> "Da Silva" (particula maiuscula no inicio)

// Pos-processa citacoes completas
postProcessABNT2023('(SILVA, 2023)', true);           // -> "(Silva, 2023)"
postProcessABNT2023('(SILVA; IBGE, 2023)', true);     // -> "(Silva; IBGE, 2023)"
postProcessABNT2023('(SILVA et al., 2023)', true);    // -> "(Silva *et al.*, 2023)"
postProcessABNT2023('(SILVA apud SANTOS, 2023)', true); // -> "(Silva apud Santos, 2023)"
```

## API Completa

### Formatacao ABNT 2023

#### `formatAuthorABNT2023(author: string): string`

Formata um nome de autor conforme ABNT 2023:
- **Pessoas**: Converte para Title Case (`SILVA` -> `Silva`)
- **Instituicoes/Acronimos**: Mantem em MAIUSCULAS (`IBGE` -> `IBGE`)
- **Particulas portuguesas**: Minusculas exceto no inicio (`MARIA DA SILVA` -> `Maria da Silva`, `DA SILVA` -> `Da Silva`)

```typescript
formatAuthorABNT2023('SILVA');            // "Silva"
formatAuthorABNT2023('IBGE');             // "IBGE"
formatAuthorABNT2023('DA SILVA');         // "Da Silva" (particula no inicio)
formatAuthorABNT2023('MARIA DA SILVA');   // "Maria da Silva"
formatAuthorABNT2023("O'BRIEN");          // "O'Brien"
formatAuthorABNT2023('SMITH-JONES');      // "Smith-Jones"
formatAuthorABNT2023('OLIVEIRA E SILVA'); // "Oliveira e Silva"
```

#### `postProcessABNT2023(citation: string, isInText: boolean): string`

Pos-processa citacoes formatadas pelo CSL:

```typescript
// Citacoes parenteticas (isInText = true)
postProcessABNT2023('(SILVA, 2023)', true);
// -> "(Silva, 2023)"

postProcessABNT2023('(SILVA; SANTOS, 2023)', true);
// -> "(Silva; Santos, 2023)"

postProcessABNT2023('(SILVA, 2023, p. 45)', true);
// -> "(Silva, 2023, p. 45)"

postProcessABNT2023('(SILVA apud SANTOS, 2023)', true);
// -> "(Silva apud Santos, 2023)"

// Bibliografia (isInText = false) - apenas formata et al.
postProcessABNT2023('SILVA, J. et al. Titulo. 2023.', false);
// -> "SILVA, J. *et al.* Titulo. 2023."
```

#### `formatEtAl(): string`

Retorna "et al." formatado em italico (markdown):

```typescript
formatEtAl(); // -> "*et al.*"
```

### Deteccao de Acronimos

#### `isProtectedAcronym(author: string): boolean`

Verifica se um nome e um acronimo protegido:

```typescript
isProtectedAcronym('IBGE');    // true
isProtectedAcronym('USP');     // true
isProtectedAcronym('UNESCO');  // true
isProtectedAcronym('NASA');    // true (heuristica)
isProtectedAcronym('SILVA');   // false
isProtectedAcronym('LEE');     // false (sobrenome curto conhecido)
```

#### `addProtectedAcronym(acronym: string): void`

Adiciona um acronimo customizado a lista:

```typescript
addProtectedAcronym('ACME');
isProtectedAcronym('ACME'); // true
```

#### `addProtectedAcronyms(acronyms: string[]): void`

Adiciona multiplos acronimos:

```typescript
addProtectedAcronyms(['ACME', 'CORP', 'INC']);
```

### Parser de Nomes Brasileiros

#### `parseNameToCsl(name: string): CslName`

Converte nome para formato CSL com suporte a convencoes brasileiras:

```typescript
parseNameToCsl('Joao Silva Filho');
// -> { family: "Silva Filho", given: "Joao" }

parseNameToCsl('Maria da Costa e Silva');
// -> { family: "da Costa e Silva", given: "Maria" }

parseNameToCsl('SANTOS, Jose Carlos');
// -> { family: "SANTOS", given: "Jose Carlos" }
```

#### `extractFamilyName(displayName: string): string`

Extrai apenas o sobrenome:

```typescript
extractFamilyName('Joao Silva Filho'); // -> "Silva Filho"
extractFamilyName('Maria da Costa');   // -> "da Costa"
```

#### `extractGivenName(displayName: string): string`

Extrai apenas o prenome:

```typescript
extractGivenName('Joao Silva Filho'); // -> "Joao"
extractGivenName('Maria da Costa');   // -> "Maria"
```

#### `isPortugueseParticle(word: string): boolean`

Verifica se e uma particula portuguesa:

```typescript
isPortugueseParticle('da');  // true
isPortugueseParticle('de');  // true
isPortugueseParticle('e');   // true
isPortugueseParticle('Silva'); // false
```

#### `isBrazilianSuffix(word: string): boolean`

Verifica se e um agnome brasileiro:

```typescript
isBrazilianSuffix('Filho');   // true
isBrazilianSuffix('Neto');    // true
isBrazilianSuffix('Junior');  // true
isBrazilianSuffix('Silva');   // false
```

### Constantes Exportadas

```typescript
import {
  PROTECTED_ACRONYMS,   // Set<string> - 150+ siglas brasileiras
  SHORT_SURNAMES,       // Set<string> - Sobrenomes curtos (LEE, WU, LIMA, etc.)
  BRAZILIAN_SUFFIXES,   // Set<string> - Agnomes (FILHO, NETO, JUNIOR, etc.)
  PORTUGUESE_PARTICLES, // Set<string> - Particulas (da, de, do, das, dos, e)
  PREFIX_PARTICLES,     // Set<string> - Particulas de prefixo (da, de, do, das, dos)
  CONNECTOR_PARTICLES,  // Set<string> - Particula conectora (e)
} from 'abnt-citation';
```

## Integracao com citation-js

```typescript
import Cite from 'citation-js';
import { postProcessABNT2023 } from 'abnt-citation';

const cite = new Cite(references);

// Gera citacao no estilo ABNT
const citation = cite.format('citation', {
  format: 'text',
  template: 'abnt',
  lang: 'pt-BR',
});

// Aplica regras ABNT 2023
const formatted = postProcessABNT2023(citation, true);
```

## Usado em Producao

Este pacote e o motor de formatacao ABNT 2023 do **[CiteMe](https://citeme.app)**, usado por milhares de estudantes brasileiros.

## Contribuindo

Contribuicoes sao bem-vindas! Por favor, abra uma issue ou pull request no [GitHub](https://github.com/citeme-app/abnt-citation).

## Licenca

MIT - Desenvolvido com carinho pelo time [CiteMe](https://citeme.app)
