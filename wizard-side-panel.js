// wizard-side-panel.js — Painel lateral sticky com síntese do projeto.
//
// Mostra 4 grupos de métricas atualizando em tempo real conforme o
// usuário faz escolhas no wizard:
//   1. Custo total (R$)
//   2. Stats geométricos (diâmetro, altura, área, linear)
//   3. Peso + cargas (estrutura, vento, neve, total)
//   4. Breakdown de custo (composição em %)
//
// Não duplica lógica de cálculo: importa `computeBudget` de
// `./synthesis.js` (pura, sem DOM). DOM rendering com `el()` padrão.

import { el, FMT } from './dom-helpers.js';
import { computeBudget, computeWeight, computeLoads } from './synthesis.js';

/**
 * Cria o aside e o retorna. Chame UMA vez no boot.
 * Re-render do conteúdo via refreshSidePanel(api).
 */
export function mountSidePanel() {
  const aside = el('aside', {
    class: 'side-panel',
    id: 'side-panel',
    role: 'complementary',
    'aria-label': 'Síntese do projeto: custo, geometria, peso e cargas',
  });

  // Toggle p/ mobile (FAB no canto inferior esquerdo).
  const fab = el('button', {
    class: 'side-panel-fab',
    type: 'button',
    'aria-label': 'Abrir/fechar painel de síntese',
    'aria-controls': 'side-panel',
    'aria-expanded': 'false',
    onclick: () => {
      const open = aside.classList.toggle('is-open-mobile');
      fab.setAttribute('aria-expanded', open ? 'true' : 'false');
    },
  }, 'Σ');
  document.body.appendChild(fab);
  document.body.appendChild(aside);
  return aside;
}

/**
 * Atualiza o conteúdo do painel a partir do estado atual do app.
 * Chame esta função após cada `render()` (e do tweak/handler que muda
 * algo relevante).
 */
export function refreshSidePanel(api) {
  const aside = document.getElementById('side-panel');
  const fab   = document.querySelector('.side-panel-fab');
  if (!aside) return;

  // ── Visibility · esconde o painel até o usuário ter interagido ──
  // welcomeSeen=false → ainda na tela de abertura, panel some.
  // touched=false → "começou do zero", ainda não escolheu nada.
  // funilAtivo=true → usuário está no recomendador, painel não atrapalha.
  const shouldShow = api.state.v3.welcomeSeen
    && api.state.v3.touched
    && !api.state.v3.funilAtivo;
  document.body.classList.toggle('is-pre-journey', !shouldShow);
  if (!shouldShow) {
    // Limpa o conteúdo só pra não acumular DOM atrás.
    aside.innerHTML = '';
    return;
  }

  const dome = api.getDome();
  if (!dome) {
    aside.innerHTML = '';
    aside.appendChild(el('div', { class: 'sp-empty' }, 'preparando síntese…'));
    return;
  }

  const { state, data } = api;
  const budget  = computeBudget(dome, state, data, api.helpers);
  const weight  = computeWeight(dome, state, data);
  const loads   = computeLoads(dome, state, data);

  aside.innerHTML = '';

  // ── Barra de comparação A/B (se ativa) ───────────────────────────
  const other = api.peekOtherVariant ? api.peekOtherVariant() : null;
  aside.appendChild(buildCompareBar(state, api, dome, budget, other));

  // ── Cabeçalho ────────────────────────────────────────────────────
  aside.appendChild(el('div', { class: 'sp-head' }, [
    el('div', { class: 'sp-eyebrow' }, state.variantes
      ? `síntese · variante ${state.activeVariante}`
      : 'síntese ao vivo'),
    el('div', { class: 'sp-title' }, [
      el('em', {}, 'Ø ' + FMT.m(dome.diameter)),
      el('span', { class: 'sp-sub' }, ' · ' + state.forma.freq + 'v'),
    ]),
  ]));

  // ── Grupo 1 · Custo total ────────────────────────────────────────
  aside.appendChild(metricGroup('custo total estimado', [
    bigStat(FMT.brl(budget.total), 'R$'),
    smallStat(FMT.brl(budget.total / dome.totalArea) + '/m²', 'casca'),
    smallStat(FMT.brl(budget.total / (Math.PI * (dome.diameter / 2) ** 2)) + '/m²', 'piso'),
  ]));

  // ── Grupo 2 · Geometria ──────────────────────────────────────────
  aside.appendChild(metricGroup('geometria', [
    pairStat('diâmetro',  FMT.m(dome.diameter)),
    pairStat('altura',    FMT.m(dome.height)),
    pairStat('área casca', FMT.m2(dome.totalArea)),
    pairStat('área piso',  FMT.m2(Math.PI * (dome.diameter / 2) ** 2)),
    pairStat('linear barras', FMT.m(dome.totalLinear)),
    pairStat('tipos de barra', String(dome.struts.length) + ' (' + dome.struts.map((s) => s.label).join('') + ')'),
    pairStat('total de barras', String(dome.edges.length)),
    pairStat('hubs',          String(dome.hubs.length)),
  ]));

  // ── Grupo 3 · Peso + cargas ──────────────────────────────────────
  aside.appendChild(metricGroup('peso + cargas', [
    pairStat('peso estrutura', FMT.kg(weight.estrutura)),
    pairStat('peso cobertura', FMT.kg(weight.cobertura)),
    pairStat('peso total',     FMT.kg(weight.total)),
    pairStat('vento (' + loads.regiao + ')', FMT.N(loads.vento)),
    loads.neve > 0 ? pairStat('neve',        FMT.N(loads.neve)) : null,
    pairStat('por hub na base', FMT.N(loads.porHub)),
  ].filter(Boolean)));

  // ── Grupo 4 · Breakdown de custo ─────────────────────────────────
  const totalForPct = budget.total || 1;
  const breakdown = budget.breakdown.filter((b) => b.val > 0);
  aside.appendChild(metricGroup('breakdown do orçamento', [
    el('div', { class: 'sp-bar' }, breakdown.map((b) => el('span', {
      class: 'sp-bar-seg',
      style: {
        width: ((b.val / totalForPct) * 100).toFixed(2) + '%',
        background: b.color || 'var(--ink)',
      },
      title: b.cat + ' · ' + FMT.brl(b.val),
      'aria-label': b.cat + ' representa ' + ((b.val / totalForPct) * 100).toFixed(0) + ' por cento, ' + FMT.brl(b.val),
    }))),
    el('div', { class: 'sp-legend' }, breakdown.map((b) => el('div', { class: 'sp-leg-row' }, [
      el('span', { class: 'sp-leg-swatch', style: { background: b.color || 'var(--ink)' } }),
      el('span', { class: 'sp-leg-cat' }, b.cat),
      el('span', { class: 'sp-leg-pct' }, ((b.val / totalForPct) * 100).toFixed(0) + '%'),
      el('span', { class: 'sp-leg-val' }, FMT.brl(b.val)),
    ]))),
  ]));

  // ── Rodapé ───────────────────────────────────────────────────────
  aside.appendChild(el('div', { class: 'sp-foot' },
    'Atualiza conforme você escolhe. Sem mão-de-obra terceirizada. Fontes na etapa 5.'));
}

// ─── Helpers de DOM ────────────────────────────────────────────────────

function metricGroup(label, children) {
  return el('section', { class: 'sp-group' }, [
    el('div', { class: 'sp-group-label' }, label),
    el('div', { class: 'sp-group-body' }, children),
  ]);
}

function bigStat(value, suffix) {
  return el('div', { class: 'sp-stat sp-stat--big' }, [
    el('span', { class: 'sp-stat-val' }, value),
    suffix ? el('span', { class: 'sp-stat-suf' }, suffix) : null,
  ]);
}

function smallStat(value, label) {
  return el('div', { class: 'sp-stat sp-stat--sm' }, [
    el('span', { class: 'sp-stat-val' }, value),
    el('span', { class: 'sp-stat-lab' }, label),
  ]);
}

function pairStat(label, value) {
  return el('div', { class: 'sp-pair' }, [
    el('span', { class: 'sp-pair-lab' }, label),
    el('span', { class: 'sp-pair-val' }, value),
  ]);
}

/**
 * Barra de comparação A/B no topo do painel.
 * - Sem compare ativo: mostra link discreto "+ comparar variante B".
 * - Com compare ativo: tabs [A | B] (clique alterna) + ✕ remover compare.
 */
function buildCompareBar(state, api, dome, budget, other) {
  if (!state.variantes) {
    return el('div', { class: 'sp-compare sp-compare--off' }, [
      el('button', {
        class: 'sp-compare-add',
        type: 'button',
        'aria-label': 'Habilitar comparação A/B',
        onclick: () => { api.enableCompare(); api.render(); },
      }, '+ comparar com variante B'),
    ]);
  }

  const otherBudget = other ? computeBudget(other.dome, other.state, api.data, api.helpers) : null;

  return el('div', { class: 'sp-compare sp-compare--on' }, [
    el('div', { class: 'sp-compare-tabs', role: 'tablist' }, ['A', 'B'].map((id) => el('button', {
      class: 'sp-tab' + (state.activeVariante === id ? ' is-active' : ''),
      type: 'button',
      role: 'tab',
      'aria-selected': state.activeVariante === id ? 'true' : 'false',
      'aria-label': 'Editar variante ' + id,
      onclick: () => { if (state.activeVariante !== id) api.switchVariante(id); },
    }, id))),
    el('button', {
      class: 'sp-compare-close',
      type: 'button',
      'aria-label': 'Remover comparação (manter variante ativa)',
      onclick: () => { api.disableCompare(); api.render(); },
    }, '×'),
    other ? el('div', { class: 'sp-compare-diff' }, [
      el('div', { class: 'sp-diff-row' }, [
        el('span', { class: 'sp-diff-lab' }, 'A'),
        el('span', { class: 'sp-diff-val' },
          state.activeVariante === 'A' ? FMT.brl(budget.total) : FMT.brl(otherBudget.total)),
        el('span', { class: 'sp-diff-meta' },
          'Ø ' + (state.activeVariante === 'A' ? FMT.m(dome.diameter) : FMT.m(other.dome.diameter))),
      ]),
      el('div', { class: 'sp-diff-row' }, [
        el('span', { class: 'sp-diff-lab' }, 'B'),
        el('span', { class: 'sp-diff-val' },
          state.activeVariante === 'B' ? FMT.brl(budget.total) : FMT.brl(otherBudget.total)),
        el('span', { class: 'sp-diff-meta' },
          'Ø ' + (state.activeVariante === 'B' ? FMT.m(dome.diameter) : FMT.m(other.dome.diameter))),
      ]),
      (() => {
        const a = state.activeVariante === 'A' ? budget.total : otherBudget.total;
        const b = state.activeVariante === 'B' ? budget.total : otherBudget.total;
        if (!a || !b) return null;
        const delta = ((b - a) / a) * 100;
        const sign = delta >= 0 ? '+' : '';
        return el('div', { class: 'sp-diff-delta' }, [
          el('span', {}, 'B vs A:'),
          el('strong', {}, sign + delta.toFixed(0) + '%'),
        ]);
      })(),
    ]) : null,
  ]);
}
