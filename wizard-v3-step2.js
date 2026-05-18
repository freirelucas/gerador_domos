// wizard-v3-step2.js — Etapa 2 turbinada: canvas com toolbar (vistas, explodido, sol, montagem)

import { term } from './glossario.js';
import { el, FMT as fmt } from './dom-helpers.js';

export function renderStep2V3(wrap, api) {
  const { state } = api;
  const dome = api.getDome();

  // Cabeçalho
  wrap.appendChild(el('div', { class: 'step-head' }, [
    el('div', { class: 'step-eyebrow' }, 'etapa 02 · forma'),
    el('h1', { class: 'step-title', html: 'A <em>geometria</em> do domo' }),
    el('div', { class: 'step-subtitle', html:
      `Diâmetro, ${term('frequência V', 'frequência v')}, ${term('truncamento', 'truncamento')}. ` +
      `Use a toolbar do canvas para alternar vistas, ver as peças explodidas, simular a hora do sol ou ` +
      `assistir à montagem peça-por-peça.`,
    }),
  ]));

  const split = el('div', { class: 'split' });

  // Canvas com toolbar
  const canvasCol = el('div');
  const canvasWrap = el('div', { class: 'canvas-wrap has-toolbar' });
  const canvasInner = el('div', { style: { position: 'absolute', inset: '0', zIndex: '1' } });
  canvasWrap.appendChild(canvasInner);

  // ─── Toolbar do canvas ──────────────────────────────────────────────────
  canvasWrap.appendChild(buildCanvasToolbar(api));

  // Indicador de sol (readout abaixo)
  canvasWrap.appendChild(buildSunReadout(state));

  // HUDs canto inferior
  canvasWrap.appendChild(el('div', { class: 'canvas-hud bl' }, 'arraste · roda zoom'));
  canvasWrap.appendChild(el('div', { class: 'canvas-hud br' }, `h ${dome.height.toFixed(2)} m · A ${dome.totalArea.toFixed(1)} m²`));
  canvasWrap.appendChild(el('div', { class: 'canvas-hud tl', style: { top: '64px' } }, `Ø ${state.forma.diametro.toFixed(1)} m`));
  canvasWrap.appendChild(el('div', { class: 'canvas-hud tr', style: { top: '64px' } }, `${state.forma.freq}v · ${truncLabel(state.forma.truncamento)}`));

  canvasCol.appendChild(canvasWrap);

  // Stats abaixo
  const statsRow = el('div', { class: 'control-block', style: { marginTop: '12px' } }, [
    el('h4', {}, 'sistema'),
    statRow('barras estruturais', dome.edges.length + ' un.'),
    statRow('hubs (nós)', [...dome.used].length + ' un.'),
    statRow('tipos de barra', dome.struts.length + ' tipos (A…' + (dome.struts[dome.struts.length-1]?.label || 'A') + ')'),
    statRow('metros lineares', dome.totalLinear.toFixed(2) + ' m'),
    statRow('triângulos da casca', dome.faces.length + ' un.'),
    statRow('área da casca', fmt.m2(dome.totalArea)),
  ]);
  statsRow.appendChild(el('div', {
    class: 'hint', style: { marginTop: '10px' },
    html: `Cada barra é uma <strong>${term('chord (corda)', 'chord')}</strong>; o <strong>${term('chord factor', 'chord factor')}</strong> é o comprimento em unidades de R.`,
  }));
  canvasCol.appendChild(statsRow);
  split.appendChild(canvasCol);

  // ─── Coluna de controles ────────────────────────────────────────────────
  const controls = el('div', { class: 'controls' });

  const sugDiam = api.helpers.suggestDiameter(state.programa.modulos);
  if (Math.abs(sugDiam - state.forma.diametro) > 0.5) {
    controls.appendChild(el('div', { class: 'suggestion' }, [
      el('strong', {}, `Sugestão: Ø ${sugDiam} m`),
      ` para acomodar os módulos do programa.`,
      el('br'),
      el('button', { class: 'suggestion-action',
        onclick: () => { state.forma.diametro = sugDiam; api.render(); },
      }, 'aplicar sugestão →'),
    ]));
  }

  controls.appendChild(controlBlock('dimensões', [
    sliderRow('diâmetro', state.forma.diametro, 2, 12, 0.5, 'm', (v) => {
      state.forma.diametro = v; api.render();
    }),
    el('div', { class: 'hint' }, [
      'Em ', el('strong', {}, fmt.m(state.forma.diametro)),
      `, área útil ≈ ${(Math.PI * (state.forma.diametro/2)**2).toFixed(1)} m² (piso).`,
    ]),
  ]));

  controls.appendChild(controlBlock('frequência v', [
    segRow([
      { id: 1, label: '1v' }, { id: 2, label: '2v' }, { id: 3, label: '3v' }, { id: 4, label: '4v' },
    ], state.forma.freq, (v) => { state.forma.freq = v; api.render(); }),
    el('div', { class: 'hint' }, explainFreq(state.forma.freq)),
    renderEsfericidade(state.forma.freq),
  ]));

  // ── Equação Maron (banner didático) ────────────────────────────────
  controls.appendChild(renderMaronEquation(state.forma.freq, dome));

  // ── Explainer visual: por que sempre A, B, C... ─────────────────────────
  controls.appendChild(renderChordExplainer(state.forma.freq, dome));

  controls.appendChild(controlBlock('truncamento', [
    segRow([
      { id: 0.5, label: '½' }, { id: 0.625, label: '⅝' },
      { id: 0.75, label: '¾' }, { id: 1.0, label: 'esfera' },
    ], state.forma.truncamento, (v) => { state.forma.truncamento = v; api.render(); }),
    el('div', { class: 'hint' }, explainTrunc(state.forma.truncamento)),
    state.forma.truncamento === 1.0 ? renderEsferaWarning() : null,
  ].filter(Boolean)));

  split.appendChild(controls);
  wrap.appendChild(split);

  api.attachCanvas(canvasInner);
}

// ─── Toolbar ──────────────────────────────────────────────────────────────
function buildCanvasToolbar(api) {
  const { state } = api;
  const bar = el('div', { class: 'canvas-toolbar' });

  // Vistas
  const views = [
    { id: 'perspective', label: 'perspect.', icon: viewIcon('perspective') },
    { id: 'planta',      label: 'planta',    icon: viewIcon('planta') },
    { id: 'elevacao',    label: 'elevação',  icon: viewIcon('elevacao') },
    { id: 'axo',         label: 'axonom.',   icon: viewIcon('axo') },
  ];
  for (const v of views) {
    const b = el('button', {
      class: 'ct-btn' + (state.v3.viewMode === v.id ? ' is-active' : ''),
      title: 'vista ' + v.label,
      'aria-label': 'Mudar para vista ' + v.label,
      'aria-pressed': state.v3.viewMode === v.id ? 'true' : 'false',
      onclick: () => {
        state.v3.viewMode = v.id;
        api.saveState();
        api.applyViewMode(v.id);
        bar.querySelectorAll('.ct-btn[data-view]').forEach((x) => {
          x.classList.remove('is-active');
          x.setAttribute('aria-pressed', 'false');
        });
        b.classList.add('is-active');
        b.setAttribute('aria-pressed', 'true');
      },
    }, [el('span', { class: 'ct-icon', 'aria-hidden': 'true', html: v.icon }), v.label]);
    b.setAttribute('data-view', v.id);
    bar.appendChild(b);
  }

  // Divider
  bar.appendChild(el('div', { class: 'ct-divider' }));

  // Explodido
  bar.appendChild(el('div', { class: 'canvas-slider-wrap' }, [
    el('span', { class: 'csl-label' }, 'explodir'),
    sliderInput(state.v3.explodido, 0, 1, 0.05, (v) => {
      state.v3.explodido = v;
      api.saveState();
      api.rebuildScene();
      document.getElementById('csl-explodido-val').textContent = (v*100).toFixed(0) + '%';
    }, 'csl-explodido'),
    el('span', { class: 'csl-value', id: 'csl-explodido-val' }, (state.v3.explodido*100).toFixed(0) + '%'),
  ]));

  // Sol
  bar.appendChild(el('div', { class: 'canvas-slider-wrap' }, [
    el('span', { class: 'csl-label' }, 'sol'),
    sliderInput(state.v3.sol, 6, 18, 0.5, (v) => {
      state.v3.sol = v;
      api.saveState();
      api.applySunHour(v);
      document.getElementById('csl-sol-val').textContent = formatHour(v);
      document.getElementById('sun-readout-val').textContent = formatHour(v);
    }, 'csl-sol'),
    el('span', { class: 'csl-value', id: 'csl-sol-val' }, formatHour(state.v3.sol)),
  ]));

  // Montagem (com play)
  bar.appendChild(el('div', { class: 'canvas-slider-wrap' }, [
    el('span', { class: 'csl-label' }, 'montar'),
    el('button', {
      class: 'ct-play', id: 'ct-play', title: 'play / pause animação de montagem',
      onclick: () => {
        if (state.v3.montagem >= 1) state.v3.montagem = 0;
        state.v3.montagemPlaying = !state.v3.montagemPlaying;
        document.getElementById('ct-play').innerHTML = playIconSvg(state.v3.montagemPlaying ? 'pause' : 'play');
        api.saveState();
      },
      html: playIconSvg(state.v3.montagemPlaying ? 'pause' : 'play'),
    }),
    sliderInput(state.v3.montagem, 0, 1, 0.01, (v) => {
      state.v3.montagem = v;
      state.v3.montagemPlaying = false;
      document.getElementById('ct-play').innerHTML = playIconSvg('play');
      api.saveState();
      api.rebuildScene();
      document.getElementById('csl-montagem-val').textContent = (v*100).toFixed(0) + '%';
    }, 'csl-montagem'),
    el('span', { class: 'csl-value', id: 'csl-montagem-val' }, (state.v3.montagem*100).toFixed(0) + '%'),
  ]));

  return bar;
}

function buildSunReadout(state) {
  return el('div', { class: 'canvas-sun-readout' }, [
    el('span', { class: 'sun-disk' }),
    'sol às ',
    el('strong', { id: 'sun-readout-val' }, formatHour(state.v3.sol)),
    ' · ',
    sunPhase(state.v3.sol),
  ]);
}

function sliderInput(value, min, max, step, oninput, id) {
  return el('input', {
    type: 'range', min, max, step, value, id,
    oninput: (e) => oninput(parseFloat(e.target.value)),
  });
}

function formatHour(h) {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return String(hh).padStart(2, '0') + 'h' + String(mm).padStart(2, '0');
}
function sunPhase(h) {
  if (h < 8) return 'amanhecer · luz quente';
  if (h < 11) return 'manhã · ângulo baixo NE';
  if (h < 13.5) return 'zênite · luz dura';
  if (h < 16) return 'tarde · sombras longas';
  if (h < 17.5) return 'fim de tarde · luz dourada';
  return 'crepúsculo · luz fraca';
}

function viewIcon(id) {
  if (id === 'perspective') return '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="0.9"><path d="M2 11 L7 2 L12 11 Z"/><line x1="2" y1="11" x2="12" y2="11"/><line x1="7" y1="2" x2="7" y2="11" stroke-dasharray="1 1"/></svg>';
  if (id === 'planta') return '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="0.9"><circle cx="7" cy="7" r="4.5"/><line x1="7" y1="2" x2="7" y2="12"/><line x1="2" y1="7" x2="12" y2="7"/></svg>';
  if (id === 'elevacao') return '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="0.9"><path d="M2 12 Q2 4 7 4 Q12 4 12 12 Z"/><line x1="2" y1="12" x2="12" y2="12"/></svg>';
  if (id === 'axo') return '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="0.9"><polygon points="7,2 12,5 12,11 7,8 2,11 2,5"/><line x1="7" y1="2" x2="7" y2="8"/><line x1="2" y1="5" x2="7" y2="8"/><line x1="12" y1="5" x2="7" y2="8"/></svg>';
  return '';
}
function playIconSvg(mode) {
  if (mode === 'play') return '<svg viewBox="0 0 12 12"><polygon points="2,1 11,6 2,11" fill="currentColor"/></svg>';
  return '<svg viewBox="0 0 12 12"><rect x="2" y="1" width="3" height="10" fill="currentColor"/><rect x="7" y="1" width="3" height="10" fill="currentColor"/></svg>';
}

// ─── Helpers reaproveitados ───────────────────────────────────────────────
function controlBlock(title, children) {
  return el('div', { class: 'control-block' }, [
    el('h4', {}, title), ...[].concat(children),
  ]);
}
function sliderRow(label, value, min, max, step, unit, onchange) {
  const valSpan = el('span', { class: 'v' }, valueFmt(value, unit));
  const input = el('input', {
    type: 'range', class: 'slider', min, max, step, value,
    oninput: (e) => {
      const v = step >= 1 ? parseInt(e.target.value, 10) : parseFloat(e.target.value);
      valSpan.textContent = valueFmt(v, unit);
      onchange(v);
    },
  });
  return el('div', { class: 'control-row' }, [
    el('div', { class: 'control-label' }, [el('span', {}, label), valSpan]),
    input,
  ]);
}
function valueFmt(v, unit) {
  if (typeof v !== 'number') return v + ' ' + unit;
  if (unit === 'm') return v.toFixed(2) + ' m';
  return v + ' ' + unit;
}
function segRow(options, value, onchange) {
  const w = el('div', { class: 'seg' });
  for (const o of options) {
    w.appendChild(el('button', {
      class: 'seg-btn' + (o.id === value ? ' is-active' : ''),
      onclick: () => onchange(o.id),
    }, o.label));
  }
  return el('div', { class: 'control-row' }, w);
}
function statRow(k, v) {
  return el('div', { class: 'summary-row' }, [
    el('span', { class: 'k' }, k),
    el('span', { class: 'v' }, v),
  ]);
}
function explainFreq(v) {
  const map = {
    1: 'Icosaedro puro — 30 arestas. Visual angular, montagem simples. (1v = sem subdivisão)',
    2: '~65 barras em ⅝ · 2 tipos · DIY mais comum. Tolerâncias confortáveis. (2v)',
    3: '~165 barras em ⅝ · 3 tipos · Visual mais esférico. Class I. (3v)',
    4: '~250+ barras · 6 tipos · Para domos > 8 m. Exige gabarito preciso. (4v)',
  };
  return map[v] || '';
}
function explainTrunc(v) {
  const map = {
    0.5: 'Meia esfera. Pé-direito máx = R. Estufas e quiosques abertos.',
    0.625: '⅝ domo. Pé-direito > R. Glamping padrão; janelas verticais.',
    0.75: '¾ domo. Imponente, mais material, entrada/saída difícil.',
    1.0: 'Esfera completa. Esculturas e maquetes. Sem piso.',
  };
  return map[v] || '';
}
function truncLabel(v) {
  if (v === 0.5) return '½ esfera';
  if (v === 0.625) return '⅝ domo';
  if (v === 0.75) return '¾ domo';
  return 'esfera';
}

// ─── Explainer: por que sempre A, B, C... ────────────────────────────────
// Mostra: face do icosaedro → subdivisão NxN → projeção na esfera → N tipos
const TYPE_COLORS_EXP = ['#b4742a', '#4a5d3a', '#2a4d70', '#8a2f1a', '#6b4a8c', '#3a3a3a'];

// Chord factors reais para Class I alternate (icosaedro)
// Cada V tem N tipos distintos. Aqui retornamos qual edge pertence a qual tipo
// dado seu papel na subdivisão. Mapas hardcoded da literatura geodésica.
function buildFaceEdges(N) {
  // Gera vértices (i,j) onde k = N-i-j; verts em coords baricêntricas
  const verts = [];
  const idx = {};
  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N - i; j++) {
      idx[`${i},${j}`] = verts.length;
      verts.push({ i, j, k: N - i - j });
    }
  }
  // Edges: conexões entre vizinhos da grade triangular
  const edges = [];
  function addEdge(a, b) {
    if (a !== undefined && b !== undefined) edges.push([a, b]);
  }
  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N - i; j++) {
      const a = idx[`${i},${j}`];
      // direita (mesmo i, j+1)
      if (j < N - i) addEdge(a, idx[`${i},${j+1}`]);
      // superior-direita (i+1, j)
      if (i < N - j) addEdge(a, idx[`${i+1},${j}`]);
      // superior-esquerda (i+1, j-1)
      if (j > 0 && i < N) addEdge(a, idx[`${i+1},${j-1}`]);
    }
  }
  return { verts, edges, idx };
}

// Para uma face do icosaedro em 3D, projeta vértice (i,j) na esfera
// e devolve o comprimento da aresta. Usa os 3 vértices canônicos da face.
function projectedEdgeLength(N, vA, vB) {
  // 3 vértices do triângulo do icosaedro (face padrão)
  // posicionados em uma esfera de raio 1
  const phi = (1 + Math.sqrt(5)) / 2;
  const norm = Math.sqrt(1 + phi*phi);
  const V0 = [0, 1/norm, phi/norm];
  const V1 = [1/norm, phi/norm, 0];
  const V2 = [phi/norm, 0, 1/norm];
  function bary(v) {
    // baricentricos i/N, j/N, k/N
    const a = v.i / N, b = v.j / N, c = v.k / N;
    return [
      V0[0]*c + V1[0]*a + V2[0]*b,
      V0[1]*c + V1[1]*a + V2[1]*b,
      V0[2]*c + V1[2]*a + V2[2]*b,
    ];
  }
  function proj(p) {
    const len = Math.sqrt(p[0]**2 + p[1]**2 + p[2]**2);
    return [p[0]/len, p[1]/len, p[2]/len];
  }
  const pA = proj(bary(vA));
  const pB = proj(bary(vB));
  return Math.sqrt((pA[0]-pB[0])**2 + (pA[1]-pB[1])**2 + (pA[2]-pB[2])**2);
}

// Agrupa edges por comprimento (tolerância 1e-4) e devolve {letter, length, edgeIndices}
function classifyEdges(N) {
  const { verts, edges } = buildFaceEdges(N);
  const lengths = edges.map(([a, b]) => projectedEdgeLength(N, verts[a], verts[b]));
  const groups = [];
  const edgeType = new Array(edges.length).fill(0);
  for (let i = 0; i < edges.length; i++) {
    let g = groups.findIndex((gr) => Math.abs(gr.length - lengths[i]) < 1e-4);
    if (g === -1) {
      g = groups.length;
      groups.push({ length: lengths[i], edges: [] });
    }
    groups[g].edges.push(i);
    edgeType[i] = g;
  }
  // Ordena grupos por comprimento (menor → maior)
  const sortIdx = groups.map((_, i) => i).sort((a, b) => groups[a].length - groups[b].length);
  const remap = new Array(groups.length);
  sortIdx.forEach((oldIdx, newIdx) => { remap[oldIdx] = newIdx; });
  const sortedGroups = sortIdx.map((i, ni) => ({
    letter: String.fromCharCode(65 + ni),
    length: groups[i].length,
    count: groups[i].edges.length,
  }));
  return { verts, edges, edgeType: edgeType.map((g) => remap[g]), groups: sortedGroups };
}

function renderChordExplainer(N, dome) {
  const cls = classifyEdges(N);
  // SVG: triângulo subdividido, edges coloridos por tipo
  const NS = 'http://www.w3.org/2000/svg';
  const W = 320, H = 220;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', 'auto');
  svg.style.display = 'block';

  // Posições 2D dos vértices (triângulo equilátero apontando pra cima)
  const cx = W / 2, top = 20, bottom = H - 30;
  const triH = bottom - top;
  const triW = triH * (2 / Math.sqrt(3));
  function posOf(v) {
    // baricentrica (i, j, k=N-i-j) → cartesiano
    const a = v.i / N, b = v.j / N, c = v.k / N;
    // V0 = topo, V1 = inferior-direita, V2 = inferior-esquerda
    const V0 = [cx, top];
    const V1 = [cx + triW/2, bottom];
    const V2 = [cx - triW/2, bottom];
    return [
      V0[0]*c + V1[0]*a + V2[0]*b,
      V0[1]*c + V1[1]*a + V2[1]*b,
    ];
  }
  const pos = cls.verts.map(posOf);

  // Edges (coloridos por tipo)
  for (let i = 0; i < cls.edges.length; i++) {
    const [a, b] = cls.edges[i];
    const t = cls.edgeType[i];
    const color = TYPE_COLORS_EXP[t] || '#666';
    const ln = document.createElementNS(NS, 'line');
    ln.setAttribute('x1', pos[a][0]); ln.setAttribute('y1', pos[a][1]);
    ln.setAttribute('x2', pos[b][0]); ln.setAttribute('y2', pos[b][1]);
    ln.setAttribute('stroke', color);
    ln.setAttribute('stroke-width', '2.4');
    ln.setAttribute('stroke-linecap', 'round');
    svg.appendChild(ln);
  }
  // Vértices
  for (const [x, y] of pos) {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', x); c.setAttribute('cy', y);
    c.setAttribute('r', '2.5');
    c.setAttribute('fill', 'var(--ink, #1c1209)');
    svg.appendChild(c);
  }
  // Rótulos dos 3 vértices originais do icosaedro
  const corners = [{ i: 0, j: 0, k: N, label: '⬢' }, { i: N, j: 0, k: 0, label: '⬢' }, { i: 0, j: N, k: 0, label: '⬢' }];
  // Anel destacando vértices originais (não-projetados, "5-edge hubs")
  for (const c of corners) {
    const [x, y] = posOf(c);
    const ring = document.createElementNS(NS, 'circle');
    ring.setAttribute('cx', x); ring.setAttribute('cy', y);
    ring.setAttribute('r', '6');
    ring.setAttribute('fill', 'none');
    ring.setAttribute('stroke', '#8a2f1a');
    ring.setAttribute('stroke-width', '1.5');
    svg.appendChild(ring);
  }

  // Card UI
  const card = document.createElement('div');
  card.className = 'control-block';
  card.style.background = 'var(--paper-soft)';

  const head = document.createElement('h4');
  head.textContent = 'por que existem ' + cls.groups.length + ' tipo' + (cls.groups.length > 1 ? 's' : '') + ' de barra?';
  card.appendChild(head);

  // SVG
  card.appendChild(svg);

  // Legenda dos tipos
  const legend = document.createElement('div');
  legend.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit, minmax(80px, 1fr));gap:4px;margin-top:8px;font-family:IBM Plex Mono, monospace;font-size:10.5px;';
  for (let i = 0; i < cls.groups.length; i++) {
    const g = cls.groups[i];
    const item = document.createElement('div');
    item.style.cssText = 'display:flex;align-items:center;gap:6px;padding:4px 6px;border:1px solid var(--ink-faint);background:var(--paper);';
    const swatch = document.createElement('span');
    swatch.style.cssText = `width:14px;height:3px;background:${TYPE_COLORS_EXP[i]};display:inline-block;`;
    item.appendChild(swatch);
    item.appendChild(document.createTextNode(g.letter + ' · ' + g.length.toFixed(3) + 'R'));
    legend.appendChild(item);
  }
  card.appendChild(legend);

  // Explicação textual
  const explain = document.createElement('div');
  explain.className = 'hint';
  explain.style.cssText = 'margin-top:10px;line-height:1.6;';
  explain.innerHTML = chordExplainText(N, cls.groups.length, dome);
  card.appendChild(explain);

  return card;
}

function chordExplainText(N, types, dome) {
  const intro = N === 1
    ? `<strong>1V</strong> não é subdivisão — é o icosaedro puro. Tem só <strong>1 tipo de aresta (A)</strong>: ${dome.struts[0]?.length.toFixed(3) || '—'} m. Todas iguais.`
    : `<strong>${N}V</strong>: cada face do icosaedro é subdividida em ${N}×${N} = ${N*N} triângulos pequenos.`;
  const projecao = N === 1 ? '' : `
    No <strong>plano</strong>, esses sub-triângulos seriam todos iguais. Mas para virar uma esfera,
    cada vértice da grade é <em>projetado radialmente</em> sobre a esfera de raio R.
    Como o icosaedro <em>não é</em> uma esfera, a projeção alonga uns trechos e encurta outros —
    e as arestas se separam em <strong>${types} grupos de comprimento</strong>: A, ${typesLetters(types)}.`;
  const corolario = `
    <br><br>Os ${types > 5 ? '6+' : types} tipos viram <em>famílias de corte</em>: você corta todas as ${dome.struts[0]?.count || '?'} barras tipo A no mesmo comprimento,
    todas as B em outro, e por aí. <strong>Mais V → mais tipos → mais esférico → mais trabalho de corte.</strong>
    <br>Os <span style="color:#8a2f1a">⬢ círculos vermelhos</span> são os <em>vértices do icosaedro original</em> — viram hubs de 5 arestas no domo. O resto é vértice novo, vira hub de 6 arestas.`;
  return intro + projecao + corolario;
}

function typesLetters(n) {
  if (n <= 1) return '';
  return Array.from({ length: n - 1 }, (_, i) => String.fromCharCode(66 + i)).join(', ');
}

// ─── Equação Maron (banner didático) ──────────────────────────────────────
function renderMaronEquation(freq, dome) {
  // Os termos da equação Maron 2018 p.43:
  // V↑ = barras↑ = conexões↑ = resistência↑ = esfericidade↑ = trabalho↑ = $↑
  // Cada termo "preenche" conforme V aumenta (escala 1..4 → 0..1)
  const t = (freq - 1) / 3; // 0..1 entre 1v..4v

  const block = document.createElement('div');
  block.style.cssText = `
    border: 1px solid var(--ocre);
    background: linear-gradient(90deg, rgba(180,116,42,0.05) 0%, rgba(180,116,42,0.12) ${(t*100).toFixed(0)}%, rgba(180,116,42,0.04) 100%);
    padding: 14px 16px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    line-height: 1.7;
  `;

  const label = document.createElement('div');
  label.style.cssText = 'font-size:9.5px;letter-spacing:0.22em;text-transform:uppercase;color:var(--ocre);margin-bottom:8px;';
  label.textContent = '↳ equação maron · trade-off da frequência';
  block.appendChild(label);

  const flow = document.createElement('div');
  flow.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px 8px;align-items:baseline;color:var(--ink-soft);';

  const terms = [
    { glyph: 'v', n: freq, label: 'freq.' },
    { glyph: '═', n: dome.edges.length, label: 'barras' },
    { glyph: '═', n: [...dome.used].length, label: 'hubs' },
    { glyph: '═', n: dome.struts.length, label: 'tipos' },
    { glyph: '═', icon: '◐', label: 'resistência' },
    { glyph: '═', icon: '○', label: 'esfericidade' },
    { glyph: '═', icon: '⌬', label: 'trabalho' },
    { glyph: '═', icon: '$', label: 'custo' },
  ];

  terms.forEach((term, i) => {
    if (i > 0) {
      const sep = document.createElement('span');
      sep.style.cssText = 'color:var(--ocre);font-weight:500;opacity:0.55;';
      sep.textContent = '=';
      flow.appendChild(sep);
    }
    const item = document.createElement('span');
    item.style.cssText = `display:inline-flex;align-items:baseline;gap:4px;padding:3px 8px;border:1px solid var(--ink-faint);background:var(--paper-soft);`;
    const valStr = term.n !== undefined ? String(term.n) : (term.icon || '');
    item.innerHTML = `
      <strong style="color:var(--ocre);font-weight:500;font-size:13px;">${valStr}</strong>
      <span style="font-size:10px;color:var(--ink-soft);text-transform:uppercase;letter-spacing:0.08em;">${term.label}</span>
    `;
    if (term.icon && !term.n) {
      // Icon-only terms: indicate intensity via repetition
      const intensity = Math.ceil(freq);
      item.querySelector('strong').textContent = term.icon.repeat(intensity);
    }
    flow.appendChild(item);
    if (i < terms.length - 1) {
      const arrow = document.createElement('span');
      arrow.style.cssText = 'color:var(--ocre);font-size:11px;';
      arrow.textContent = '↑';
      flow.appendChild(arrow);
    }
  });

  block.appendChild(flow);

  const caption = document.createElement('div');
  caption.style.cssText = 'font-size:9.5px;color:var(--ink-soft);margin-top:8px;font-style:italic;line-height:1.5;';
  caption.innerHTML = '"quanto maior a frequência = maior o nº de barras = maior o nº de conexões = mais resistente = mais arredondada = mais trabalho = mais $" <span style="color:var(--ocre)">— Maron, 2018, p. 43</span>';
  block.appendChild(caption);

  return block;
}

// ─── Métrica de esfericidade ──────────────────────────────────────────────
// Aproximações para domos Class I alternate sobre icosaedro
const ESFERICIDADE_MAP = { 1: 0.23, 2: 0.60, 3: 0.78, 4: 0.89, 5: 0.93, 6: 0.95 };

function renderEsfericidade(freq) {
  const v = ESFERICIDADE_MAP[freq] ?? 1.0;
  const pct = Math.round(v * 100);
  const wrap = document.createElement('div');
  wrap.style.cssText = `
    display:flex;align-items:center;gap:12px;margin-top:10px;
    padding:8px 12px;background:var(--paper);border:1px solid var(--ink-faint);
  `;
  wrap.innerHTML = `
    <div style="font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:var(--ink-soft);">
      <span class="term-link" data-term="esfericidade">esfericidade<span class="term-mark">?</span></span>
    </div>
    <div style="flex:1;height:6px;background:var(--ink-mist);position:relative;">
      <div style="position:absolute;left:0;top:0;height:100%;width:${pct}%;background:var(--ocre);"></div>
    </div>
    <div style="font-family:'Cormorant Garamond',serif;font-size:22px;color:var(--ocre);font-weight:500;line-height:1;min-width:54px;text-align:right;">
      ${pct}<span style="font-size:13px;color:var(--ink-soft);">%</span>
    </div>
  `;
  return wrap;
}

// ─── Aviso para truncamento = esfera completa ─────────────────────────────
function renderEsferaWarning() {
  const w = document.createElement('div');
  w.style.cssText = `
    margin-top:10px;padding:12px 14px;border-left:3px solid var(--sangue);
    background:rgba(138,47,26,0.06);font-family:'IBM Plex Mono', monospace;
    font-size:11px;line-height:1.6;color:var(--ink);
  `;
  w.innerHTML = `
    <strong style="color:var(--sangue);text-transform:uppercase;letter-spacing:0.12em;font-size:10px;">⚠ esfera completa</strong>
    <div style="margin-top:6px;">
      Esta é uma <strong>"esfera geodésica"</strong>, não um domo — não tem piso, não se apoia no chão.
      Use somente para <strong>escultura, balão, maquete pedagógica ou estrutura suspensa</strong>.
      Para casa habitável, escolha <strong>½ esfera, ⅝ domo</strong> ou <strong>¾ domo</strong>.
      <div style="margin-top:4px;font-style:italic;color:var(--ink-soft);">— Maron, 2018, p. 44</div>
    </div>
  `;
  return w;
}
