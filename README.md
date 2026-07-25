# abnt-citation

[![npm version](https://badge.fury.io/js/abnt-citation.svg)](https://www.npmjs.com/package/abnt-citation)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made by CiteMe](https://img.shields.io/badge/Made%20by-CiteMe-0d9488)](https://citeme.app)

> O primeiro parser brasileiro de citacoes academicas conforme ABNT NBR 10520:2023 e NBR 6023:2025.

**Este pacote foi extraido do [CiteMe](https://citeme.app?utm_source=npm&utm_medium=readme&utm_campaign=abnt-citation)** - o gerenciador de citacoes academicas mais completo do Brasil.

[English version](./README.en.md)

---

## Quer formatacao automatica sem codigo?

**[CiteMe](https://citeme.app?utm_source=npm&utm_medium=readme&utm_campaign=abnt-citation)** formata suas referencias automaticamente em **60 estilos curados** (ABNT, APA, Vancouver, Chicago, IEEE, MLA e mais - 10.000+ via CSL remoto) - sem precisar instalar nada:

- Busca em **10+ bases academicas** (OpenAlex, PubMed, Europe PMC, arXiv, Semantic Scholar, BDTD e mais - 200M+ artigos)
- Fontes verificadas de bases reais - **zero risco de alucinacao de IA**
- Extensao para **Chrome, Firefox e Safari**
- Importacao/exportacao em BibTeX e RIS
- Plano gratuito disponivel - sem cartao de credito

[Experimente o CiteMe](https://citeme.app?utm_source=npm&utm_medium=readme&utm_campaign=abnt-citation)

---

## Por que este pacote existe?

A ABNT atualizou as normas de citacoes e referencias:

- **NBR 10520:2023** - Mudou como nomes de autores aparecem em citacoes
- **NBR 6023:2025** - Atualizou regras para referencias (ISSN opcional, "ca." em italico, etc.)

| Tipo de autor | Antes (2002) | Depois (2023/2025) |
|--------------|--------------|---------------------|
| Pessoa | (SILVA, 2023) | (Silva, 2023) |
| Instituicao | (IBGE, 2023) | (IBGE, 2023) |

**Nenhum parser existente** (Zotero, Mendeley, citation-js) implementa essas regras corretamente porque:

1. CSL (Citation Style Language) nao suporta pos-processamento condicional
2. Requer uma lista de acronimos protegidos (IBGE, USP, UNESCO, etc.)
3. Requer heuristicas para detectar acronimos desconhecidos

Este pacote resolve esse problema com **zero dependencias** e **~5KB** (minificado + gzip).

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
postProcessABNT2023('(SILVA et al., 2023)', true);    // -> "(Silva <i>et al.</i>, 2023)"
postProcessABNT2023('(SILVA apud SANTOS, 2023)', true); // -> "(Silva apud Santos, 2023)"
```

## API Completa

### Formatacao ABNT (NBR 10520:2023 + NBR 6023:2025)

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
// -> "SILVA, J. <i>et al.</i> Titulo. 2023."
```

#### `formatEtAl(): string`

Retorna "et al." formatado em italico (HTML):

```typescript
formatEtAl(); // -> "<i>et al.</i>"
```

#### `formatCirca(): string`

Retorna "ca." (circa) formatado em italico conforme NBR 6023:2025:

```typescript
formatCirca(); // -> "<i>ca.</i>"

// Usado quando o ano exato e desconhecido:
// [<i>ca.</i> 2020] ou (<i>ca.</i> 2020)
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

### Deteccao de Instituicoes

#### `isInstitutionalName(name: string): boolean`

Detecta autores corporativos (orgaos, universidades, ONGs) misturados com pessoas
no mesmo campo de autor - o caso normal em APIs academicas:

```typescript
isInstitutionalName('Ministerio da Saude');        // true
isInstitutionalName('World Health Organization');  // true
isInstitutionalName('IBGE');                       // true
isInstitutionalName('Joao Silva Filho');           // false
```

Cobre palavras-chave em portugues, espanhol e ingles + siglas conhecidas.

> **Limitacao conhecida**: um token unico em CAIXA ALTA de 2-7 letras e classificado
> como instituicao - a heuristica nao distingue `IBGE` de `SILVA`. Normalize a
> caixa antes de chamar (`Silva` e corretamente classificado como pessoa).

#### `parseNameToCsl(name, { type: 'auto' })`

Combina os dois: instituicao fica inteira, pessoa e invertida normalmente.

```typescript
parseNameToCsl('Ministerio da Saude', { type: 'auto' });
// -> { family: "Ministerio da Saude" }   (sem 'auto': { family: "da Saude", given: "Ministerio" })

parseNameToCsl('Joao Silva Filho', { type: 'auto' });
// -> { family: "Silva Filho", given: "Joao" }
```

Use `type: 'auto'` sempre que o nome vier de uma API que mistura autores
corporativos e pessoais no mesmo array (OpenAlex, Google Books, BDTD, Open Library).

### Parser de Nomes Brasileiros

#### `parseNameToCsl(name: string, options?: ParseOptions): CslName`

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
  PROTECTED_ACRONYMS,   // Set<string> - 379 siglas (BR + internacionais)
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

Este pacote e o motor de formatacao ABNT 2023 do **[CiteMe](https://citeme.app?utm_source=npm&utm_medium=readme&utm_campaign=abnt-citation)**, usado por milhares de estudantes brasileiros para gerar referencias academicas corretas.

## Ecossistema CiteMe

O CiteMe oferece ferramentas para todo o fluxo de trabalho academico:

| Produto | Descricao |
|---------|-----------|
| [Web App](https://citeme.app?utm_source=npm&utm_medium=readme&utm_campaign=abnt-citation) | Gerador de referencias com busca em 10+ bases academicas |
| Extensao Chrome/Firefox/Safari | Cite qualquer pagina ou artigo com um clique |
| [Verificador de referencias](https://citeme.app/tools/reference-checker?utm_source=npm&utm_medium=readme&utm_campaign=abnt-citation) | Cole sua lista e veja quais referencias existem de verdade |
| `abnt-citation` (este pacote) | Motor open-source de formatacao ABNT 2023 |

## Contribuindo

Contribuicoes sao bem-vindas! Por favor, abra uma issue ou pull request no [GitHub](https://github.com/danielnichiata96/abnt-citation).

## Licenca

MIT - Desenvolvido pelo time [CiteMe](https://citeme.app?utm_source=npm&utm_medium=readme&utm_campaign=abnt-citation)
