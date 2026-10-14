# Limitações do Parser de Nomes ABNT

Este documento lista todas as limitações conhecidas do parser de nomes para citações e referências ABNT (NBR 10520:2023 e NBR 6023:2025).

## Status de Conformidade

| # | Caso | Status | Descrição |
|---|------|--------|-----------|
| 1 | Múltiplos Agnomes | ✅ OK | `José Silva Filho Neto` → `SILVA FILHO NETO, José` |
| 2 | Nomes Espanhóis | ❌ FALHA | Não reconhece sobrenome duplo espanhol |
| 3 | Nomes Hifenizados | ✅ OK | `Maria Silva-Santos` → `SILVA-SANTOS, Maria` |
| 4 | Partículas van/von | ✅ OK* | Funciona por acidente (partícula fica no given) |
| 5 | Títulos Acadêmicos | ❌ FALHA | `Prof. Dr.` não são removidos |
| 6 | Nomes Históricos | ⚠️ PARCIAL | Monônimos OK, compostos invertem errado |
| 7 | Títulos de Nobreza | ❌ FALHA | `Dom Pedro II` é invertido incorretamente |
| 8 | Instituições | ⚠️ PARCIAL | Sem vírgula OK, com vírgula quebra |
| 9 | Espaços Múltiplos | ✅ OK | Resiliência a OCR sujo |
| 10 | Agnome como Sobrenome | ✅ OK | `Carla Neto` → `NETO, Carla` |
| 11 | Hífens em Prenomes | ✅ OK | `Jean-Pierre Silva` → `SILVA, Jean-Pierre` |
| 12 | Sufixos Numerais | ❌ FALHA | `III`, `IV` não são reconhecidos |
| 13 | Case Bizarro/OCR | ⚠️ PARCIAL | Normaliza maiúsculas, mas não corrige `SOUZa` |
| 14 | Partículas Árabes | ❌ FALHA | `bin`, `al-` não reconhecidos |

---

## Casos Detalhados

### ✅ 1. Múltiplos Agnomes (IMPLEMENTADO)

**Regra ABNT:** Todos os agnomes (Filho, Neto, Junior, etc.) devem fazer parte do sobrenome.

```
José Silva Filho Neto    → SILVA FILHO NETO, José     ✅
João Santos Neto Filho   → SANTOS NETO FILHO, João   ✅
Pedro Costa Junior Neto  → COSTA JUNIOR NETO, Pedro  ✅
```

**Implementação:** Loop que coleta múltiplos sufixos consecutivos.

---

### ❌ 2. Nomes Espanhóis (NÃO IMPLEMENTADO)

**Regra ABNT:** Para nomes hispânicos, usar ambos os sobrenomes (paterno + materno).

```
Gabriel García Márquez   → ATUAL:  MÁRQUEZ, Gabriel García
                        → ABNT:   GARCÍA MÁRQUEZ, Gabriel  ❌

Mario Vargas Llosa       → ATUAL:  LLOSA, Mario Vargas
                        → ABNT:   VARGAS LLOSA, Mario      ❌
```

**Problema:** Parser não tem como distinguir nomes espanhóis de brasileiros.

**Solução futura:** Flag opcional `{ locale: 'es' }` ou detecção heurística.

---

### ✅ 3. Nomes Hifenizados (IMPLEMENTADO)

**Regra ABNT:** Sobrenomes hifenizados são tratados como unidade.

```
Maria Silva-Santos       → SILVA-SANTOS, Maria        ✅
Suzana Herculano-Houzel  → HERCULANO-HOUZEL, Suzana   ✅
```

---

### ✅ 4. Partículas Estrangeiras van/von (FUNCIONA POR ACIDENTE)

**Regra ABNT:** Partículas minúsculas vão após o nome.

```
Ludwig van Beethoven     → BEETHOVEN, Ludwig van     ✅
Vincent van Gogh         → GOGH, Vincent van         ✅
Johann Wolfgang von Goethe → GOETHE, Johann Wolfgang von ✅
```

**Nota:** Funciona porque o parser não reconhece `van`/`von` como partículas, então elas ficam naturalmente no `given`. Resultado correto, mas por acaso.

---

### ❌ 5. Títulos Acadêmicos (NÃO IMPLEMENTADO)

**Regra ABNT:** Títulos acadêmicos devem ser REMOVIDOS da citação.

```
Prof. João Silva         → ATUAL:  SILVA, Prof. João
                        → ABNT:   SILVA, João           ❌

Prof. Dr. Carlos Oliveira → ATUAL:  OLIVEIRA, Prof. Dr. Carlos
                         → ABNT:   OLIVEIRA, Carlos      ❌

Dra. Maria Santos        → ATUAL:  SANTOS, Dra. Maria
                        → ABNT:   SANTOS, Maria         ❌
```

**Títulos a remover:**
- `Prof.`, `Professor`, `Professora`
- `Dr.`, `Dra.`, `Doutor`, `Doutora`
- `Me.`, `Mestre`, `Mestra`
- `PhD.`, `PhD`
- `Eng.`, `Engenheiro`
- `Cel.`, `Gen.`, `Cap.` (militares)

---

### ⚠️ 6. Nomes Históricos/Religiosos (PARCIAL)

**Regra ABNT:** Nomes conhecidos por uma única forma não devem ser invertidos.

**Monônimos (funciona):**
```
Aristóteles              → ARISTÓTELES               ✅
Platão                   → PLATÃO                    ✅
Pelé                     → PELÉ                      ✅
```

**Nomes compostos históricos (falha):**
```
Jesus Cristo             → ATUAL:  CRISTO, Jesus
                        → ABNT:   JESUS CRISTO         ❌

Papa Francisco           → ATUAL:  FRANCISCO, Papa
                        → ABNT:   PAPA FRANCISCO       ❌
```

---

### ❌ 7. Títulos de Nobreza/Religiosos (NÃO IMPLEMENTADO)

**Regra ABNT:** Títulos integrados ao nome não devem ser separados.

```
Dom Pedro II             → ATUAL:  II, Dom Pedro
                        → ABNT:   DOM PEDRO II         ❌

Frei Betto               → ATUAL:  BETTO, Frei
                        → ABNT:   FREI BETTO           ❌

Barão de Mauá            → ATUAL:  DE MAUÁ, Barão
                        → ABNT:   BARÃO DE MAUÁ        ❌

Irmã Dulce               → ATUAL:  DULCE, Irmã
                        → ABNT:   IRMÃ DULCE           ❌
```

**Títulos que integram:**
- `Dom`, `Dona`
- `Frei`, `Freira`
- `Irmã`, `Irmão`
- `Madre`, `Padre`
- `Papa`
- `Barão`, `Visconde`, `Conde`, `Duque`, `Príncipe`, `Princesa`

---

### ⚠️ 8. Autores Institucionais (PARCIAL)

**Regra ABNT:** Instituições não devem ser tratadas como pessoas.

**Sem vírgula (funciona):**
```
IBGE                     → IBGE                      ✅
UNESCO                   → UNESCO                    ✅
```

**Com vírgula (falha - "Matador de Instituições"):**
```
Universidade de São Paulo, Faculdade de Medicina
  → ATUAL:  family="Universidade de São Paulo", given="Faculdade de Medicina"
  → ABNT:   Entidade única, não deve ser dividida  ❌

Brasil, Ministério da Saúde
  → ATUAL:  family="Brasil", given="Ministério da Saúde"
  → ABNT:   Entidade única                         ❌
```

**Problema:** Parser usa vírgula como delimitador `Família, Prenome`.

**Solução futura:** Flag `{ type: 'institution' }` ou detecção heurística.

---

### ✅ 9. Resiliência a Espaços (IMPLEMENTADO)

**Problema:** OCR pode gerar espaços múltiplos ou formatação suja.

```
João  Silva              → SILVA, João               ✅
João   da    Silva       → DA SILVA, João            ✅
  Maria   Santos         → SANTOS, Maria             ✅
```

**Implementação:** `split(/\s+/)` normaliza espaços múltiplos.

---

### ✅ 10. Agnome como Sobrenome - Falso Positivo (IMPLEMENTADO)

**Problema:** `Neto`, `Filho`, `Junior` podem ser sobrenomes reais, não sufixos.

```
Carla Neto               → NETO, Carla               ✅
Ana Filho                → FILHO, Ana                ✅
Pedro Júnior             → JÚNIOR, Pedro             ✅
```

**Implementação:** Lógica de sufixo só aplica com >= 3 palavras.

---

### ✅ 11. Hífens em Prenomes (IMPLEMENTADO)

**Problema:** Prenomes compostos com hífen não devem ser quebrados.

```
Jean-Pierre Silva        → SILVA, Jean-Pierre        ✅
Ana-Maria da Costa       → DA COSTA, Ana-Maria       ✅
José-Carlos Santos Filho → SANTOS FILHO, José-Carlos ✅
```

---

### ❌ 12. Sufixos Numerais (NÃO IMPLEMENTADO)

**Problema:** Numerais romanos como sufixos (comum em traduções do inglês).

```
John Smith III           → ATUAL:  III, John Smith
                        → ABNT:   SMITH III, John     ❌

Henry Ford II            → ATUAL:  II, Henry Ford
                        → ABNT:   FORD II, Henry      ❌
```

**Sufixos numerais a adicionar:** `II`, `III`, `IV`, `V`, etc.

---

### ⚠️ 13. Case Bizarro/OCR Sujo (PARCIAL)

**Problema:** OCR pode gerar case incorreto.

**Funciona:**
```
SILVA                    → Silva (Title Case)        ✅
silva                    → Silva (Title Case)        ✅
```

**Não funciona:**
```
SOUZa                    → SOUZa (mantém original)   ❌ Deveria ser Souza
mARIA                    → mARIA (mantém original)   ❌ Deveria ser Maria
```

**Solução:** Normalização mais agressiva de case.

---

### ❌ 14. Partículas Árabes/Africanas (NÃO IMPLEMENTADO)

**Problema:** Partículas de outras línguas não são reconhecidas.

```
Osama bin Laden          → ATUAL:  LADEN, Osama bin
                        → Esperado: BIN LADEN, Osama  ❌

Muhammad al-Khwarizmi    → ATUAL:  AL-KHWARIZMI, Muhammad ✅ (hífen ajuda)

Ibn Sina                 → ATUAL:  SINA, Ibn
                        → Esperado: IBN SINA          ❌
```

**Partículas a adicionar:**
- Árabe: `al-`, `el-`, `bin`, `ibn`, `bint`, `abu`
- Africano: `da`, `de` (já funciona para português)
- Holandês: `van`, `van de`, `van der`, `van den`
- Alemão: `von`, `von der`, `von und zu`

---

## Resumo de Prioridades

### Alta Prioridade (Nomes Brasileiros)
1. ❌ Títulos Acadêmicos - Muito comum em citações brasileiras
2. ❌ Títulos de Nobreza - Citações históricas brasileiras
3. ⚠️ Instituições com vírgula - Muito comum (IBGE, ministérios)

### Média Prioridade (Internacionalização)
4. ❌ Nomes Espanhóis - América Latina
5. ❌ Sufixos Numerais - Traduções
6. ❌ Partículas Árabes - Citações internacionais

### Baixa Prioridade (Edge Cases)
7. ⚠️ Nomes Históricos compostos
8. ⚠️ Case Bizarro/OCR

---

## Testes de Cobertura

Todos estes casos estão documentados e testados em:
- `tests/chaos-names.test.ts` - Casos extremos
- `tests/abnt-compliance.test.ts` - Conformidade ABNT
- `tests/real-researchers.test.ts` - Pesquisadores reais

```bash
npm test
# 595+ testes passando
```
