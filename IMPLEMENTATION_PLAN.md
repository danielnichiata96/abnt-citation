# Plano de Implementação - Limitações do Parser ABNT

## Filosofia de Abordagem

**Princípio:** O parser não pode adivinhar contexto. Soluções devem ser:
1. **Opt-in via opções** - Usuário indica o tipo de entrada
2. **Heurísticas conservadoras** - Na dúvida, não alterar
3. **Listas extensíveis** - Permitir customização

---

## 🔴 ALTA PRIORIDADE (Nomes Brasileiros)

### 1. Títulos Acadêmicos (Prof., Dr.)

**Problema:** `Prof. Dr. João Silva` → `SILVA, Prof. Dr. João` (errado)

**Solução: Lista de títulos + regex**

```typescript
const ACADEMIC_TITLES = new Set([
  'prof', 'professor', 'professora',
  'dr', 'dra', 'doutor', 'doutora',
  'me', 'mestre', 'mestra',
  'phd', 'esp', 'especialista',
  'eng', 'engenheiro', 'engenheira',
  'arq', 'arquiteto', 'arquiteta',
]);

// Opção 1: Flag para remover títulos
parseNameToCsl(name, { stripTitles: true })

// Opção 2: Sempre remover (breaking change)
// Títulos são identificados por terminarem em "." ou estarem na lista
```

**Regex proposto:**
```typescript
const TITLE_PATTERN = /^(prof\.?|dr\.?|dra\.?|me\.?|phd\.?|eng\.?)\s+/gi;
name = name.replace(TITLE_PATTERN, '');
```

**Complexidade:** 🟢 Baixa
**Risco:** 🟢 Baixo (não afeta nomes normais)

---

### 2. Títulos de Nobreza/Religiosos (Dom, Frei, Barão)

**Problema:** `Dom Pedro II` → `II, Dom Pedro` (errado)

**Solução: Lista de títulos que NÃO invertem**

```typescript
const NOBILITY_TITLES = new Set([
  'dom', 'dona',
  'frei', 'freira', 'irmã', 'irmão',
  'madre', 'padre', 'papa',
  'barão', 'baronesa', 'visconde', 'viscondessa',
  'conde', 'condessa', 'duque', 'duquesa',
  'príncipe', 'princesa', 'rei', 'rainha',
  'imperador', 'imperatriz',
]);

function parseNameToCsl(name: string): CslName {
  const firstWord = name.split(/\s+/)[0].toLowerCase();

  // Se começa com título de nobreza, retorna como unidade
  if (NOBILITY_TITLES.has(firstWord)) {
    return { family: name }; // Sem inversão
  }
  // ... resto da lógica
}
```

**Complexidade:** 🟢 Baixa
**Risco:** 🟡 Médio (pode afetar nomes como "Dona Maria da Silva")

**Mitigação:** Só aplicar se o nome tiver <= 3 palavras

---

### 3. Autores Institucionais (vírgula como armadilha)

**Problema:** `USP, Faculdade de Medicina` → tratado como pessoa

**Solução A: Flag explícita**
```typescript
parseNameToCsl(name, { type: 'institution' })
// Retorna: { family: "USP, Faculdade de Medicina" }
```

**Solução B: Heurística de detecção**
```typescript
const INSTITUTION_MARKERS = [
  'universidade', 'faculdade', 'instituto', 'fundação',
  'ministério', 'secretaria', 'departamento',
  'organização', 'associação', 'conselho',
  'brasil', 'estado', 'município',
];

function looksLikeInstitution(name: string): boolean {
  const lower = name.toLowerCase();
  return INSTITUTION_MARKERS.some(marker => lower.includes(marker));
}
```

**Solução C: Escape de vírgula**
```typescript
// Usuário escapa a vírgula que não deve dividir
"USP\\, Faculdade de Medicina"
// ou
"USP{{ Faculdade de Medicina" // placeholder
```

**Recomendação:** Solução A (flag explícita) é mais segura.

**Complexidade:** 🟢 Baixa
**Risco:** 🟢 Baixo (opt-in)

---

## 🟡 MÉDIA PRIORIDADE (Internacionalização)

### 4. Nomes Espanhóis (García Márquez)

**Problema:** Parser usa só o último sobrenome, ABNT quer os dois.

**Solução: Flag de locale**
```typescript
parseNameToCsl(name, { locale: 'es' })

// Lógica para espanhol:
// - Pega as 2 últimas palavras como sobrenome
// - Exceto se última for partícula
```

**Heurística alternativa (arriscada):**
```typescript
// Detectar padrões espanhóis comuns
const SPANISH_PATTERNS = [
  /García|López|Rodríguez|Martínez|González/i, // Sobrenomes comuns
  /á|é|í|ó|ú|ñ/i, // Acentos espanhóis
];
```

**Recomendação:** Flag explícita `{ locale: 'es' }`

**Complexidade:** 🟡 Média
**Risco:** 🟡 Médio

---

### 5. Sufixos Numerais (III, IV, V)

**Problema:** `John Smith III` → `III, John Smith` (errado)

**Solução: Adicionar à lista de sufixos**
```typescript
const BRAZILIAN_SUFFIXES = new Set([
  // Existentes
  'FILHO', 'NETO', 'JUNIOR', ...

  // Novos - numerais romanos
  'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',

  // Alternativas com ponto
  'JR', 'JR.', 'SR', 'SR.',
]);
```

**Complexidade:** 🟢 Baixa
**Risco:** 🟢 Baixo

---

### 6. Partículas Árabes/Africanas

**Problema:** `bin`, `ibn`, `al-` não reconhecidos

**Solução: Expandir lista de partículas**
```typescript
// Criar categorias de partículas
const PORTUGUESE_PARTICLES = new Set(['da', 'de', 'do', 'das', 'dos', 'e']);
const DUTCH_PARTICLES = new Set(['van', 'van de', 'van der', 'van den']);
const GERMAN_PARTICLES = new Set(['von', 'von der', 'von und zu']);
const ARABIC_PARTICLES = new Set(['al', 'el', 'bin', 'ibn', 'bint', 'abu']);

// Ou flag de locale
parseNameToCsl(name, { locale: 'ar' })
```

**Desafio:** `al-` com hífen já funciona! O problema é `bin` e `ibn` sem hífen.

**Complexidade:** 🟡 Média
**Risco:** 🟡 Médio (pode afetar sobrenomes como "Almeida")

---

## 🟢 BAIXA PRIORIDADE (Edge Cases)

### 7. Nomes Históricos Compostos

**Problema:** `Jesus Cristo`, `Papa Francisco` são invertidos

**Solução: Lista de nomes históricos conhecidos**
```typescript
const HISTORICAL_NAMES = new Set([
  'jesus cristo', 'papa francisco', 'madre teresa',
  'dalai lama', 'mahatma gandhi',
]);

function parseNameToCsl(name: string): CslName {
  if (HISTORICAL_NAMES.has(name.toLowerCase())) {
    return { family: name }; // Sem inversão
  }
  // ...
}
```

**Alternativa:** Tratar como instituição
```typescript
parseNameToCsl("Papa Francisco", { type: 'historical' })
```

**Complexidade:** 🟢 Baixa
**Risco:** 🟢 Baixo (lista opt-in)

---

### 8. Case Bizarro / OCR Sujo

**Problema:** `SOUZa`, `mARIA` não são normalizados

**Solução: Normalização agressiva (opt-in)**
```typescript
function normalizeCase(name: string): string {
  // Se tem mistura de case no mesmo word, normalizar
  return name.split(/\s+/).map(word => {
    const hasWeirdCase = /[a-z][A-Z]|[A-Z][a-z][A-Z]/.test(word);
    if (hasWeirdCase) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    return word;
  }).join(' ');
}

parseNameToCsl(name, { normalizeCase: true })
```

**Complexidade:** 🟢 Baixa
**Risco:** 🟡 Médio (pode afetar nomes como "McDonald")

---

## Proposta de API

### Opções do Parser

```typescript
interface ParseOptions {
  // Tipo de autor
  type?: 'person' | 'institution' | 'historical';

  // Locale para regras específicas
  locale?: 'pt' | 'es' | 'en' | 'ar' | 'de' | 'nl';

  // Processamento
  stripTitles?: boolean;      // Remove Prof., Dr., etc.
  normalizeCase?: boolean;    // Corrige SOUZa -> Souza

  // Customização
  extraSuffixes?: string[];   // Sufixos adicionais
  extraParticles?: string[];  // Partículas adicionais
}

// Uso
parseNameToCsl("Prof. Dr. João Silva", { stripTitles: true })
parseNameToCsl("Gabriel García Márquez", { locale: 'es' })
parseNameToCsl("USP, Faculdade de Medicina", { type: 'institution' })
parseNameToCsl("Dom Pedro II", { type: 'historical' })
```

---

## Ordem de Implementação Sugerida

### Fase 1 - Quick Wins (1-2 dias)
1. ✅ Sufixos Numerais (II, III, IV) - só adicionar à lista
2. ✅ Títulos de Nobreza - lista simples
3. ✅ Normalização de case - função helper

### Fase 2 - Flags Básicas (2-3 dias)
4. 🔧 `{ stripTitles: true }` - remover títulos acadêmicos
5. 🔧 `{ type: 'institution' }` - não dividir em vírgula
6. 🔧 `{ type: 'historical' }` - não inverter

### Fase 3 - Internacionalização (3-5 dias)
7. 🔧 `{ locale: 'es' }` - sobrenomes espanhóis
8. 🔧 Expandir partículas (van, von, bin, al-)
9. 🔧 Lista de nomes históricos conhecidos

---

## Decisões a Tomar

1. **Breaking changes?**
   - Títulos acadêmicos devem ser removidos por padrão ou opt-in?

2. **Heurísticas automáticas?**
   - Detectar instituições automaticamente ou exigir flag?

3. **Escopo do pacote?**
   - Foco em ABNT (brasileiro) ou internacionalização completa?

---

## Testes Necessários

Cada feature deve ter:
1. Testes positivos (funciona como esperado)
2. Testes negativos (não quebra casos existentes)
3. Testes de edge case (casos limítrofes)

```bash
# Rodar todos os testes após cada mudança
npm test
```
