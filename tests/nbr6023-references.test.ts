import { describe, it, expect } from 'vitest';
import { formatTitleEntryABNT, postProcessABNT2023 } from '../src/formatter';

/**
 * NBR 6023 reference rules that CSL cannot express, checked against the
 * examples in university library guides for NBR 6023:2025:
 * - Bibliotecas UFU, "Elaboração de referências" (2025)
 * - Biblioteca IEL-Unicamp, "Orientações para elaboração de referências" (2025)
 * - Biblioteca IE-Unicamp, "NBR 6023/2025" (2025)
 */
describe('postProcessABNT2023 — NBR 6023 reference rules', () => {
  describe('sine loco / sine nomine', () => {
    it('normalizes "[S.l.: S.n.]" to "[S. l.: s. n.]" with italic abbreviations', () => {
      const input = 'OS GRANDES clássicos das poesias líricas. [S.l.: S.n.], 1981.';
      expect(postProcessABNT2023(input, false)).toBe(
        'OS GRANDES clássicos das poesias líricas. [<i>S. l.</i>: <i>s. n.</i>], 1981.'
      );
    });

    it('normalizes sine loco alone and keeps its initial case', () => {
      expect(postProcessABNT2023('12. ed. [S.l.]: Brasiliense, 2008.', false)).toBe(
        '12. ed. [<i>S. l.</i>]: Brasiliense, 2008.'
      );
      expect(postProcessABNT2023('Revista X, [s.l.], v. 3, 2020.', false)).toBe(
        'Revista X, [<i>s. l.</i>], v. 3, 2020.'
      );
    });

    it('normalizes sine nomine alone to lowercase', () => {
      expect(postProcessABNT2023('São Paulo: [S.n.], 2008.', false)).toBe(
        'São Paulo: [<i>s. n.</i>], 2008.'
      );
    });

    it('unwraps the italic that citeproc puts around the whole bracket', () => {
      expect(postProcessABNT2023('<b>Livro</b>. <i>[S.l.]</i>: Atlas, 2010.', false)).toBe(
        '<b>Livro</b>. [<i>S. l.</i>]: Atlas, 2010.'
      );
      expect(postProcessABNT2023('<b>Título</b>. <i>[S.l.: S.n.]</i>, 1981.', false)).toBe(
        '<b>Título</b>. [<i>S. l.</i>: <i>s. n.</i>], 1981.'
      );
    });

    it('unwraps the italic span the Wasm engine emits, including a trailing colon', () => {
      expect(
        postProcessABNT2023('<span style="font-style: italic;">[S.l.]: </span>Atlas, 2010.', false)
      ).toBe('[<i>S. l.</i>]: Atlas, 2010.');
      expect(
        postProcessABNT2023('<span style="font-style: italic;">[S.l.: S.n.]</span>, 1981.', false)
      ).toBe('[<i>S. l.</i>: <i>s. n.</i>], 1981.');
    });

    it('is idempotent', () => {
      const once = postProcessABNT2023('Título. [S.l.: S.n.], 1981.', false);
      expect(postProcessABNT2023(once, false)).toBe(once);
    });
  });

  describe('URL without angle brackets (NBR 6023:2018 onwards)', () => {
    it('removes plain angle brackets after "Disponível em:"', () => {
      expect(
        postProcessABNT2023('Disponível em: <https://a.br/x?y=1>. Acesso em: 1 jan. 2025.', false)
      ).toBe('Disponível em: https://a.br/x?y=1. Acesso em: 1 jan. 2025.');
    });

    it('removes HTML-escaped angle brackets (citeproc)', () => {
      expect(
        postProcessABNT2023('Disponível em: &#60;https://a.br/x&#62;. Acesso em: 1 jan. 2025.', false)
      ).toBe('Disponível em: https://a.br/x. Acesso em: 1 jan. 2025.');
      expect(
        postProcessABNT2023('Disponível em: &lt;https://a.br/x&gt;. Acesso em: 1 jan. 2025.', false)
      ).toBe('Disponível em: https://a.br/x. Acesso em: 1 jan. 2025.');
    });

    it('removes literal angle brackets around a link anchor (Wasm)', () => {
      expect(
        postProcessABNT2023(
          'Disponível em: <<a href="https://a.br/x">https://a.br/x</a>>. Acesso em: 1 jan. 2025.',
          false
        )
      ).toBe('Disponível em: <a href="https://a.br/x">https://a.br/x</a>. Acesso em: 1 jan. 2025.');
    });

    it('leaves other markup untouched', () => {
      const input = 'IBGE. <b>Censo 2022</b>. Disponível em: https://ibge.gov.br. Acesso em: 1 jan. 2025.';
      expect(postProcessABNT2023(input, false)).toBe(input);
    });
  });
});

describe('formatTitleEntryABNT', () => {
  it('uppercases the first word of a title entry', () => {
    expect(formatTitleEntryABNT('Noites gregas')).toBe('NOITES gregas');
    expect(formatTitleEntryABNT('Diagnóstico do setor editorial brasileiro')).toBe(
      'DIAGNÓSTICO do setor editorial brasileiro'
    );
  });

  it('also uppercases the next word after an initial article', () => {
    expect(formatTitleEntryABNT('Os grandes clássicos das poesias líricas')).toBe(
      'OS GRANDES clássicos das poesias líricas'
    );
    expect(formatTitleEntryABNT('Um guia do conhecimento em gerenciamento de projetos')).toBe(
      'UM GUIA do conhecimento em gerenciamento de projetos'
    );
  });

  it('also uppercases the next word after an initial monosyllabic function word', () => {
    expect(formatTitleEntryABNT('Em busca de um sonho: da engenharia à ficção')).toBe(
      'EM BUSCA de um sonho: da engenharia à ficção'
    );
  });

  it('treats a numeral as the first word on its own', () => {
    expect(formatTitleEntryABNT('Dois estudos sobre linguagem')).toBe('DOIS estudos sobre linguagem');
  });

  it('handles single words, empty input and already formatted titles', () => {
    expect(formatTitleEntryABNT('Podcast')).toBe('PODCAST');
    expect(formatTitleEntryABNT('')).toBe('');
    expect(formatTitleEntryABNT('OS GRANDES clássicos')).toBe('OS GRANDES clássicos');
  });
});
