// wizard-steps.js — Renderizadores das etapas 1-4

import { term } from './glossario.js';
import { el, FMT as fmt } from './dom-helpers.js';

function head(eyebrow, title, sub) {
  const h = el('div', { class: 'step-head' }, [
    el('div', { class: 'step-eyebrow' }, eyebrow),
    el('h1', { class: 'step-title', html: title }),
    sub ? el('div', { class: 'step-subtitle' }, sub) : null,
  ]);
  return h;
}

// ─── STEP 1 · PROGRAMA ─────────────────────────────────────────────────────
export function renderStep1(wrap, api) {
  const { state, data } = api;
  wrap.appendChild(head(
    'etapa 01 · programa',
    'Para que <em>serve</em> seu domo?',
    'Escolha um cenário base, ajuste os módulos funcionais, capacidade e zona climática. Tudo isso vai pré-dimensionar a forma na próxima etapa.',
  ));

  // Cenários (grid de cartões)
  const scenarios = el('div', { class: 'scenarios' });
  for (const s of data.USE_SCENARIOS) {
    const card = el('button', {
      class: 'scenario-card' + (state.programa.cenario === s.id ? ' is-active' : ''),
      onclick: () => {
        state.programa.cenario = s.id;
        state.programa.modulos = [...s.modulosDefault];
        state.programa.capacidade = s.capacidade;
        state.forma.diametro = s.sugestaoDiametro;
        state.forma.freq = s.sugestaoFreq;
        state.forma.truncamento = s.sugestaoTrunc;
        state.sistemas.estrutura = s.sugestaoEstrutura;
        state.sistemas.cobertura = s.sugestaoCobertura;
        api.render();
      },
    }, [
      el('div', { class: 'scenario-icon' }, s.icone),
      el('div', { class: 'scenario-name' }, s.nome),
      el('div', { class: 'scenario-desc' }, s.descricao),
      el('div', { class: 'scenario-spec' }, [
        `Ø ${s.sugestaoDiametro} m`,
        `${s.sugestaoFreq}V`,
        `${s.capacidade}p`,
      ]),
    ]);
    scenarios.appendChild(card);
  }
  wrap.appendChild(scenarios);

  // Detalhe: módulos | capacidade | clima  +  card resumo
  const detail = el('div', { class: 'programa-detail' });
  const left = el('div');
  const right = el('div');
  detail.appendChild(left);
  detail.appendChild(right);

  // Módulos
  const modSection = el('div', { class: 'programa-section' }, [
    el('h3', { class: 'section-title' }, 'módulos funcionais'),
    el('div', { class: 'hint', style: { marginBottom: '12px' } },
      'Quais ambientes o domo precisa abrigar? A soma define o diâmetro mínimo.'),
  ]);
  const modGrid = el('div', { class: 'module-grid' });
  for (const [id, mod] of Object.entries(data.PROGRAM_MODULES)) {
    const active = state.programa.modulos.includes(id);
    const tile = el('button', {
      class: 'module-tile' + (active ? ' is-active' : ''),
      onclick: () => {
        if (active) {
          state.programa.modulos = state.programa.modulos.filter((m) => m !== id);
        } else {
          state.programa.modulos = [...state.programa.modulos, id];
        }
        api.saveState();
        renderStep1(wrap.querySelector('.step-page') || wrap, api);
        // re-render this step in place
        const stage = document.getElementById('stage');
        stage.innerHTML = '';
        const newWrap = el('div', { class: 'step-page' });
        stage.appendChild(newWrap);
        renderStep1(newWrap, api);
        // refresh stepper/footbar
        api.render();
      },
    }, [
      el('div', { class: 'module-name' }, mod.label),
      el('div', { class: 'module-meta' }, `${mod.areaMin} m² · ${mod.nota}`),
    ]);
    modGrid.appendChild(tile);
  }
  modSection.appendChild(modGrid);
  left.appendChild(modSection);

  // Capacidade
  const capSection = el('div', { class: 'programa-section' }, [
    el('h3', { class: 'section-title' }, 'capacidade'),
    el('div', { class: 'capacity-row' }, [
      el('button', {
        class: 'capacity-btn',
        onclick: () => {
          state.programa.capacidade = Math.max(1, state.programa.capacidade - 1);
          api.render();
        },
      }, '−'),
      el('div', { class: 'capacity-val' }, String(state.programa.capacidade)),
      el('button', {
        class: 'capacity-btn',
        onclick: () => {
          state.programa.capacidade = Math.min(30, state.programa.capacidade + 1);
          api.render();
        },
      }, '+'),
      el('div', { class: 'capacity-unit' }, 'pessoas'),
    ]),
  ]);
  left.appendChild(capSection);

  // Clima
  const climSection = el('div', { class: 'programa-section' }, [
    el('h3', { class: 'section-title' }, 'zona climática'),
  ]);
  const climGrid = el('div', { class: 'climate-grid' });
  for (const z of data.CLIMATE_ZONES) {
    const active = state.programa.clima === z.id;
    const tile = el('button', {
      class: 'climate-tile' + (active ? ' is-active' : ''),
      onclick: () => { state.programa.clima = z.id; api.render(); },
    }, [
      el('div', { class: 'climate-tile-name' }, z.label),
      el('div', { class: 'climate-tile-nota' }, z.nota),
    ]);
    climGrid.appendChild(tile);
  }
  climSection.appendChild(climGrid);
  left.appendChild(climSection);

  // Card resumo (direita)
  const areas = api.helpers.programaArea(state.programa.modulos);
  const sugDiam = api.helpers.suggestDiameter(state.programa.modulos);
  const cenario = data.USE_SCENARIOS.find((s) => s.id === state.programa.cenario);
  const climate = data.CLIMATE_ZONES.find((z) => z.id === state.programa.clima);

  const summary = el('div', { class: 'summary-card' }, [
    el('h3', { html: 'Pré-<em>programa</em>' }),
    el('div', { class: 'summary-row' }, [
      el('span', { class: 'k' }, 'cenário'),
      el('span', { class: 'v' }, cenario?.nome || '—'),
    ]),
    el('div', { class: 'summary-row' }, [
      el('span', { class: 'k' }, 'capacidade'),
      el('span', { class: 'v' }, state.programa.capacidade + ' pess.'),
    ]),
    el('div', { class: 'summary-row' }, [
      el('span', { class: 'k' }, 'módulos'),
      el('span', { class: 'v' }, state.programa.modulos.length + ' un.'),
    ]),
    el('div', { class: 'summary-row' }, [
      el('span', { class: 'k' }, 'área útil'),
      el('span', { class: 'v' }, fmt.m2(areas.uso)),
    ]),
    el('div', { class: 'summary-row' }, [
      el('span', { class: 'k' }, 'circulação +30%'),
      el('span', { class: 'v' }, fmt.m2(areas.circulacao)),
    ]),
    el('div', { class: 'summary-row' }, [
      el('span', { class: 'k' }, 'área total'),
      el('span', { class: 'v' }, fmt.m2(areas.total)),
    ]),
    el('div', { class: 'summary-row' }, [
      el('span', { class: 'k' }, 'Ø mínimo sugerido'),
      el('span', { class: 'v' }, fmt.m(sugDiam)),
    ]),
    climate ? el('div', { class: 'suggestion' }, [
      el('strong', {}, climate.label),
      ' · ', climate.nota,
    ]) : null,
    state.programa.modulos.length > 0 ? el('div', { class: 'suggestion' }, [
      el('strong', {}, 'Raciocínio: '),
      `área(módulos) × 1,3 = ${areas.total.toFixed(1)} m². Para meia-esfera, raio = √(A/π) ≈ ${(sugDiam/2).toFixed(2)} m → Ø ${sugDiam} m.`,
    ]) : null,
  ]);
  right.appendChild(summary);

  wrap.appendChild(detail);
}

// ─── STEP 2 · FORMA ────────────────────────────────────────────────────────
export function renderStep2(wrap, api) {
  const { state } = api;
  const dome = api.getDome();

  wrap.appendChild(head(
    'etapa 02 · forma',
    'A <em>geometria</em> do domo',
    `Diâmetro, ${term('frequência V', 'frequência v')} (quantas vezes cada face do ${term('icosaedro', 'icosaedro')} é subdividida) e ${term('truncamento', 'truncamento')}. Quanto maior o V, mais peças e mais esférico fica.`,
  ));

  const split = el('div', { class: 'split' });

  // Esquerda: 3D
  const canvasCol = el('div');
  const canvasWrap = el('div', { class: 'canvas-wrap' });
  const canvasInner = el('div', {
    style: { position: 'absolute', inset: '0', zIndex: '1' },
  });
  canvasWrap.appendChild(canvasInner);
  canvasWrap.appendChild(el('div', { class: 'canvas-hud tl' }, `Ø ${state.forma.diametro.toFixed(1)} m`));
  canvasWrap.appendChild(el('div', { class: 'canvas-hud tr' }, `${state.forma.freq}V · ${truncLabel(state.forma.truncamento)}`));
  canvasWrap.appendChild(el('div', { class: 'canvas-hud bl' }, 'arraste · roda para zoom'));
  canvasWrap.appendChild(el('div', { class: 'canvas-hud br' }, `h ${dome.height.toFixed(2)} m · A ${dome.totalArea.toFixed(1)} m²`));
  canvasCol.appendChild(canvasWrap);
  // Stats abaixo do 3D
  const statsRow = el('div', { class: 'control-block', style: { marginTop: '12px' } }, [
    el('h4', {}, 'sistema'),
    statRow('barras estruturais', dome.edges.length + ' un.'),
    statRow('hubs (nós)', [...dome.used].length + ' un.'),
    statRow('tipos de barra', dome.struts.length + ' tipos (A…' + (dome.struts[dome.struts.length-1]?.label || 'A') + ')'),
    statRow('metros lineares', dome.totalLinear.toFixed(2) + ' m'),
    statRow('triângulos da casca', dome.faces.length + ' un.'),
    statRow('área da casca', fmt.m2(dome.totalArea)),
  ]);
  // adicionar nota sobre chord factor
  statsRow.appendChild(el('div', {
    class: 'hint',
    style: { marginTop: '10px' },
    html: `Cada barra é uma <strong>${term('chord (corda)', 'chord')}</strong>; o <strong>${term('chord factor', 'chord factor')}</strong> é o comprimento da barra em unidades de R (raio).`,
  }));
  canvasCol.appendChild(statsRow);
  split.appendChild(canvasCol);

  // Direita: controles
  const controls = el('div', { class: 'controls' });

  // Sugestão baseada no programa
  const sugDiam = api.helpers.suggestDiameter(state.programa.modulos);
  if (Math.abs(sugDiam - state.forma.diametro) > 0.5) {
    const sug = el('div', { class: 'suggestion' }, [
      el('strong', {}, `Sugestão: Ø ${sugDiam} m`),
      ` para acomodar os módulos do programa (${state.programa.modulos.length} ambientes).`,
      el('br'),
      el('button', {
        class: 'suggestion-action',
        onclick: () => { state.forma.diametro = sugDiam; api.render(); },
      }, 'aplicar sugestão →'),
    ]);
    controls.appendChild(sug);
  }

  // Diâmetro
  controls.appendChild(controlBlock('dimensões', [
    sliderRow('diâmetro', state.forma.diametro, 2, 12, 0.5, 'm', (v) => {
      state.forma.diametro = v; api.render();
    }),
    el('div', { class: 'hint' }, [
      'Referência humana: 1,70 m. Em ',
      el('strong', {}, fmt.m(state.forma.diametro)),
      `, área útil ≈ ${(Math.PI * (state.forma.diametro/2)**2).toFixed(1)} m² (piso).`,
    ]),
  ]));

  // Frequência
  controls.appendChild(controlBlock('frequência V', [
    segRow([
      { id: 1, label: '1V' },
      { id: 2, label: '2V' },
      { id: 3, label: '3V' },
      { id: 4, label: '4V' },
    ], state.forma.freq, (v) => {
      state.forma.freq = v; api.render();
    }),
    el('div', { class: 'hint' }, [
      explainFreq(state.forma.freq),
    ]),
  ]));

  // Truncamento
  controls.appendChild(controlBlock('truncamento', [
    segRow([
      { id: 0.5, label: '½' },
      { id: 0.625, label: '⅝' },
      { id: 0.75, label: '¾' },
      { id: 1.0, label: 'esfera' },
    ], state.forma.truncamento, (v) => {
      state.forma.truncamento = v; api.render();
    }),
    el('div', { class: 'hint' }, explainTrunc(state.forma.truncamento)),
  ]));

  split.appendChild(controls);
  wrap.appendChild(split);

  // Anexar o canvas (chamada síncrona para garantir attach antes do paint)
  api.attachCanvas(canvasInner);
}

function explainFreq(v) {
  const map = {
    1: 'Icosaedro puro — 30 arestas inteiras. Estética angular, montagem simples mas pouco esférica.',
    2: '~65 barras em ⅝ · 2 tipos (A,B) · DIY mais comum. Tolerâncias confortáveis.',
    3: '~165 barras em ⅝ · 3 tipos (A,B,C) · Visual mais "esférico". Geometria do icosaedro Class I.',
    4: '~250+ barras · 6 tipos · Indicado para domos grandes (>8 m). Exige gabarito preciso.',
  };
  return map[v] || '';
}
function explainTrunc(v) {
  const map = {
    0.5: 'Meia esfera. Pé-direito máximo = R. Bom para estufas e quiosques abertos.',
    0.625: '⅝ domo. Pé-direito > R. Geometria padrão de glamping; janelas verticais nas laterais.',
    0.75: '¾ domo. Mais imponente, mais material, mais difícil entrar e sair.',
    1.0: 'Esfera completa. Para esculturas, balões, e maquetes. Sem piso.',
  };
  return map[v] || '';
}
function truncLabel(v) {
  if (v === 0.5) return '½ esfera';
  if (v === 0.625) return '⅝ domo';
  if (v === 0.75) return '¾ domo';
  return 'esfera';
}

// ─── STEP 3 · ABERTURAS ────────────────────────────────────────────────────
export function renderStep3(wrap, api) {
  const { state, data } = api;
  const dome = api.getDome();
  wrap.appendChild(head(
    'etapa 03 · aberturas',
    '<em>Portas, janelas</em> e ventilação',
    `Defina onde entra luz, ar e gente. Use uma ${term('riser wall', 'riser wall')} (parede de elevação) para encaixar portas e janelas retangulares sem brigar com a curvatura do domo.`,
  ));

  const split = el('div', { class: 'split' });

  // Canvas
  const canvasCol = el('div');
  const canvasWrap = el('div', { class: 'canvas-wrap' });
  const canvasInner = el('div', { style: { position: 'absolute', inset: '0', zIndex: '1' } });
  canvasWrap.appendChild(canvasInner);
  const ab = state.aberturas;
  const totalOps =
    (ab.porta_principal ? 1 : 0) + (ab.porta_emergencia ? 1 : 0)
    + (ab.janelas_basc || 0) + (ab.janelas_redondas || 0)
    + (ab.cupula_zenital ? 1 : 0) + (ab.abertura_ventilacao || 0);
  canvasWrap.appendChild(el('div', { class: 'canvas-hud tl' }, `${totalOps} aberturas`));
  canvasWrap.appendChild(el('div', { class: 'canvas-hud tr' }, [
    `porta → ${orientName(ab.orientacaoPorta || 90)}`,
  ]));
  canvasWrap.appendChild(el('div', { class: 'canvas-hud bl' }, 'arraste para girar'));
  canvasCol.appendChild(canvasWrap);

  // Rosa dos ventos (orientação da porta)
  const compass = el('div', { class: 'control-block', style: { marginTop: '12px' } }, [
    el('h4', {}, 'orientação da porta principal'),
    renderCompass(ab.orientacaoPorta || 90, (deg) => {
      state.aberturas.orientacaoPorta = deg;
      api.render();
    }),
    el('div', { class: 'hint' }, [
      `Atual: `, el('strong', {}, `${ab.orientacaoPorta || 90}° (${orientName(ab.orientacaoPorta || 90)})`),
      el('br'),
      'Cerrado: sol nasce a leste (cumeeira norte-sul minimiza ganho solar). Porta a leste recebe luz suave da manhã.',
    ]),
  ]);
  canvasCol.appendChild(compass);
  split.appendChild(canvasCol);

  // Direita: aberturas toggles
  const controls = el('div', { class: 'controls' });

  // Riser wall (NOVO)
  const riser = state.riser || { ativa: true, altura: 0.8 };
  state.riser = riser;
  controls.appendChild(controlBlock('riser wall (parede de elevação)', [
    el('div', { class: 'control-row' }, [
      toggleRow(`ativar ${term('riser wall', 'riser wall')}`, riser.ativa, (v) => {
        state.riser.ativa = v; api.render();
      }),
    ]),
    riser.ativa ? sliderRow('altura', riser.altura, 0.3, 1.5, 0.1, 'm', (v) => {
      state.riser.altura = v; api.render();
    }) : null,
    el('div', { class: 'hint', html: [
      'A riser wall é uma parede curta vertical entre fundação e domo. ',
      'Permite usar <strong>portas e janelas retangulares de mercado</strong> sem ',
      'cortes em ângulo composto. Recomendado para uso residencial.',
    ].join('') }),
  ].filter(Boolean)));

  // Aberturas obrigatórias (porta principal, emergência)
  controls.appendChild(controlBlock('portas', [
    toggleRow('porta principal', ab.porta_principal, (v) => {
      state.aberturas.porta_principal = v; api.render();
    }, data.OPENING_TYPES.porta_principal),
    toggleRow(`saída de emergência (${term('NBR 9077', 'nbr 9077')})`, ab.porta_emergencia, (v) => {
      state.aberturas.porta_emergencia = v; api.render();
    }, data.OPENING_TYPES.porta_emergencia),
  ]));

  // Janelas (counts)
  controls.appendChild(controlBlock('janelas', [
    sliderRow('basculantes (80×60 cm)', ab.janelas_basc || 0, 0, 12, 1, 'un.', (v) => {
      state.aberturas.janelas_basc = v; api.render();
    }),
    sliderRow('redondas (Ø 60 cm)', ab.janelas_redondas || 0, 0, 8, 1, 'un.', (v) => {
      state.aberturas.janelas_redondas = v; api.render();
    }),
    el('div', { class: 'hint' },
      'Distribuídas automaticamente nos triângulos disponíveis. Limite ≤ 25% da área da casca.'),
  ]));

  // Ventilação
  controls.appendChild(controlBlock('ventilação', [
    toggleRow(`cúpula zenital (${term('efeito chaminé', 'efeito chaminé')})`, ab.cupula_zenital, (v) => {
      state.aberturas.cupula_zenital = v; api.render();
    }, data.OPENING_TYPES.cupula_zenital),
    sliderRow('aberturas inferiores (ventilação cruzada)', ab.abertura_ventilacao || 0, 0, 6, 1, 'un.', (v) => {
      state.aberturas.abertura_ventilacao = v; api.render();
    }),
    toggleRow('mosquiteiro em todas as aberturas', ab.mosquiteiro, (v) => {
      state.aberturas.mosquiteiro = v; api.render();
    }),
    el('div', { class: 'hint' }, [
      el('strong', {}, 'Efeito chaminé: '),
      'ar quente sobe e sai pela cúpula; ar fresco entra pela parte inferior. Diferença térmica de 2–4 °C em condições típicas do cerrado.',
    ]),
  ]));

  // Estimativa da área removida
  const opnArea = computeOpeningsArea(state.aberturas, data.OPENING_TYPES);
  const pct = (opnArea / dome.totalArea) * 100;
  const warn = pct > 25;
  controls.appendChild(el('div', {
    class: 'suggestion',
    style: warn ? { borderLeftColor: 'var(--sangue)', background: 'rgba(138,47,26,0.06)' } : {},
  }, [
    el('strong', {}, `${pct.toFixed(0)}% da casca em aberturas `),
    `(${opnArea.toFixed(2)} m² de ${dome.totalArea.toFixed(1)} m²).`,
    warn ? el('div', {}, '⚠ Acima de 25% — reforçar barras adjacentes ou reduzir aberturas.') : null,
  ]));

  split.appendChild(controls);
  wrap.appendChild(split);

  api.attachCanvas(canvasInner);
}

function computeOpeningsArea(ab, OP) {
  let a = 0;
  if (ab.porta_principal) a += OP.porta_principal.area;
  if (ab.porta_emergencia) a += OP.porta_emergencia.area;
  a += (ab.janelas_basc || 0) * OP.janela_basculante.area;
  a += (ab.janelas_redondas || 0) * OP.janela_redonda.area;
  if (ab.cupula_zenital) a += OP.cupula_zenital.area;
  a += (ab.abertura_ventilacao || 0) * OP.abertura_ventilacao.area;
  return a;
}

function orientName(d) {
  const dirs = ['N','NE','L','SE','S','SO','O','NO'];
  return dirs[Math.round(((d % 360) / 45)) % 8];
}

function renderCompass(currentDeg, onchange) {
  const NS = 'http://www.w3.org/2000/svg';
  const size = 200;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.style.display = 'block';
  svg.style.margin = '0 auto';
  svg.style.cursor = 'crosshair';
  const cx = size/2, cy = size/2, r = 84;

  // ring
  const ring = document.createElementNS(NS, 'circle');
  ring.setAttribute('cx', cx); ring.setAttribute('cy', cy);
  ring.setAttribute('r', r);
  ring.setAttribute('fill', 'none');
  ring.setAttribute('stroke', '#1c1209');
  svg.appendChild(ring);
  const ring2 = document.createElementNS(NS, 'circle');
  ring2.setAttribute('cx', cx); ring2.setAttribute('cy', cy);
  ring2.setAttribute('r', r - 6);
  ring2.setAttribute('fill', 'none');
  ring2.setAttribute('stroke', '#8b7a5d');
  ring2.setAttribute('stroke-dasharray', '2 3');
  svg.appendChild(ring2);

  // ticks every 15°
  for (let a = 0; a < 360; a += 15) {
    const rad = (a - 90) * Math.PI / 180;
    const isMajor = a % 90 === 0;
    const x1 = cx + Math.cos(rad) * (r - (isMajor ? 12 : 6));
    const y1 = cy + Math.sin(rad) * (r - (isMajor ? 12 : 6));
    const x2 = cx + Math.cos(rad) * r;
    const y2 = cy + Math.sin(rad) * r;
    const ln = document.createElementNS(NS, 'line');
    ln.setAttribute('x1', x1); ln.setAttribute('y1', y1);
    ln.setAttribute('x2', x2); ln.setAttribute('y2', y2);
    ln.setAttribute('stroke', '#1c1209');
    ln.setAttribute('stroke-width', isMajor ? '1.5' : '0.7');
    svg.appendChild(ln);
  }
  // letters
  const dirs = [['N',0],['L',90],['S',180],['O',270]];
  for (const [l, deg] of dirs) {
    const rad = (deg - 90) * Math.PI / 180;
    const x = cx + Math.cos(rad) * (r + 14);
    const y = cy + Math.sin(rad) * (r + 14) + 5;
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', x); t.setAttribute('y', y);
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('font-family', 'IBM Plex Mono, monospace');
    t.setAttribute('font-size', '14');
    t.setAttribute('fill', '#1c1209');
    t.textContent = l;
    svg.appendChild(t);
  }

  // arrow
  const arrowGroup = document.createElementNS(NS, 'g');
  const rad = (currentDeg - 90) * Math.PI / 180;
  arrowGroup.setAttribute('transform', `translate(${cx} ${cy}) rotate(${currentDeg})`);
  const arrow = document.createElementNS(NS, 'polygon');
  arrow.setAttribute('points', `0,-${r-14} -8,${r-30} 0,${r-40} 8,${r-30}`);
  arrow.setAttribute('fill', '#b4742a');
  arrow.setAttribute('stroke', '#1c1209');
  arrowGroup.appendChild(arrow);
  svg.appendChild(arrowGroup);

  const center = document.createElementNS(NS, 'circle');
  center.setAttribute('cx', cx); center.setAttribute('cy', cy);
  center.setAttribute('r', 4);
  center.setAttribute('fill', '#1c1209');
  svg.appendChild(center);

  // Interaction
  svg.addEventListener('click', (e) => {
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left - cx;
    const y = e.clientY - rect.top - cy;
    let deg = Math.atan2(x, -y) * 180 / Math.PI;
    if (deg < 0) deg += 360;
    deg = Math.round(deg / 15) * 15;
    onchange(deg);
  });
  return svg;
}

// ─── STEP 4 · SISTEMAS ─────────────────────────────────────────────────────
export function renderStep4(wrap, api) {
  const { state, data } = api;
  wrap.appendChild(head(
    'etapa 04 · sistemas',
    'Materiais e <em>infraestrutura</em>',
    'Estrutura, conectores, cobertura, fundação, água e energia. Cada escolha traz fonte de preço com URL real para você cotar localmente.',
  ));

  const sections = [
    { title: 'estrutura', key: 'estrutura', list: data.STRUCTURE_MATERIALS, fmt: priceLinear },
    { title: 'conectores (hubs)', key: 'conector', list: data.HUB_CONNECTORS, fmt: priceValencia },
    { title: 'cobertura externa', key: 'cobertura', list: data.COVERINGS, fmt: priceM2 },
    { title: 'piso interno', key: 'piso', list: data.FLOOR_SYSTEMS, fmt: priceM2 },
    { title: 'fundação', key: 'fundacao', list: data.FOUNDATIONS, fmt: priceBase },
    { title: 'água + esgoto', key: 'agua', list: data.WATER_SYSTEMS, fmt: priceFixed },
    { title: 'energia', key: 'energia', list: data.ENERGY_SYSTEMS, fmt: priceFixed },
  ];

  for (const sec of sections) {
    const section = el('div', { class: 'system-section' }, [
      el('h3', { class: 'section-title' }, sec.title),
    ]);

    // Filtro por categoria (só para coberturas)
    let listFiltered = sec.list;
    if (sec.key === 'cobertura') {
      const cats = [
        { id: null, label: 'todas' },
        { id: 'diy', label: 'DIY · recicladas' },
        { id: 'industrial', label: 'mercado · industrial' },
        { id: 'bioconstrucao', label: 'bioconstrução' },
      ];
      const activeCat = sec_filter_cobertura;
      const filterBar = el('div', { class: 'seg', style: { marginBottom: '14px' } });
      for (const c of cats) {
        filterBar.appendChild(el('button', {
          class: 'seg-btn' + (activeCat === c.id ? ' is-active' : ''),
          onclick: () => { sec_filter_cobertura = c.id; api.render(); },
        }, c.label));
      }
      section.appendChild(filterBar);
      if (activeCat) {
        listFiltered = sec.list.filter((m) => m.categoria === activeCat);
      }
    }

    const grid = el('div', { class: 'material-grid' });
    for (const m of listFiltered) {
      const active = state.sistemas[sec.key] === m.id;
      const regiao = m.regiao === 'mantiqueira' ? 'Mantiqueira' : null;
      const card = el('button', {
        class: 'material-card' + (active ? ' is-active' : ''),
        onclick: () => { state.sistemas[sec.key] = m.id; api.render(); },
      }, [
        el('div', { class: 'head' }, [
          m.cor ? el('span', { class: 'material-swatch', style: { background: m.cor } }) : null,
          el('span', { class: 'material-name' }, m.nome),
          regiao ? el('span', { class: 'region-tag' }, regiao) : null,
          m.tipo ? el('span', {
            style: {
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '9px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: m.tipo === 'sem' ? 'var(--verde)' : m.tipo === 'articulado' ? 'var(--blueprint)' : 'var(--ink-soft)',
              border: '1px solid currentColor',
              padding: '1px 6px',
              marginRight: '6px',
            },
          }, m.tipo === 'sem' ? 'sem hub' : m.tipo) : null,
          m.categoria ? el('span', {
            style: {
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '9px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: m.categoria === 'diy' ? 'var(--verde)' : m.categoria === 'bioconstrucao' ? 'var(--ocre)' : 'var(--ink-soft)',
              border: '1px solid currentColor',
              padding: '1px 6px',
              marginRight: '6px',
            },
          }, m.categoria === 'bioconstrucao' ? 'biocon.' : m.categoria) : null,
          el('span', { class: 'material-price' }, sec.fmt(m)),
        ]),
        m.nomeCientifico ? el('div', { class: 'material-cientifico' }, m.nomeCientifico) : null,
        m.nota ? el('div', { class: 'material-nota' }, m.nota) : null,
        m.durabilidade ? el('div', { class: 'material-nota' }, [
          el('strong', { style: { color: 'var(--ocre)' } }, 'durabilidade: '),
          m.durabilidade,
        ]) : null,
        m.fontes && m.fontes.length > 0 ? el('div', { class: 'material-fontes' }, [
          'fonte: ',
          ...m.fontes.flatMap((f, i) => [
            i > 0 ? ' · ' : '',
            el('a', { href: f.url, target: '_blank', rel: 'noopener' }, f.label),
          ]),
        ]) : null,
      ]);
      grid.appendChild(card);
    }
    section.appendChild(grid);
    wrap.appendChild(section);
  }
}

// Filtro de categoria para coberturas (módulo-level state)
let sec_filter_cobertura = null;

function priceLinear(m) { return `R$ ${m.precoLinear.toFixed(2)}/m`; }
function priceM2(m)     { return `R$ ${m.precoPorM2.toFixed(0)}/m²`; }
function priceValencia(m){ return `R$ ${m.precoPorValencia.toFixed(2)}/encaixe`; }
function priceBase(m)   { return `R$ ${m.custoBase.toFixed(0)}/hub`; }
function priceFixed(m)  { return `R$ ${m.custo.toLocaleString('pt-BR')}`; }

// ─── Helpers de UI ─────────────────────────────────────────────────────────
function controlBlock(title, children) {
  return el('div', { class: 'control-block' }, [
    el('h4', {}, title),
    ...[].concat(children),
  ]);
}
function sliderRow(label, value, min, max, step, unit, onchange) {
  const valSpan = el('span', { class: 'v' }, `${valueFmt(value, unit)}`);
  const input = el('input', {
    type: 'range', class: 'slider', min, max, step, value,
    oninput: (e) => {
      const v = step >= 1 ? parseInt(e.target.value, 10) : parseFloat(e.target.value);
      valSpan.textContent = valueFmt(v, unit);
      onchange(v);
    },
  });
  return el('div', { class: 'control-row' }, [
    el('div', { class: 'control-label' }, [
      el('span', {}, label),
      valSpan,
    ]),
    input,
  ]);
}
function valueFmt(v, unit) {
  if (typeof v !== 'number') return v + ' ' + unit;
  if (unit === 'm') return v.toFixed(2) + ' m';
  return v + ' ' + unit;
}
function segRow(options, value, onchange) {
  const wrap = el('div', { class: 'seg' });
  for (const o of options) {
    wrap.appendChild(el('button', {
      class: 'seg-btn' + (o.id === value ? ' is-active' : ''),
      onclick: () => onchange(o.id),
    }, o.label));
  }
  return el('div', { class: 'control-row' }, wrap);
}
function toggleRow(label, value, onchange, opMeta) {
  const isOn = !!value;
  return el('button', {
    class: 'opening-card' + (isOn ? ' is-active' : ''),
    style: { display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' },
    onclick: () => onchange(!isOn),
  }, [
    el('div', { class: 'opening-card-head' }, [
      el('span', { class: 'opening-name' }, label),
      opMeta ? el('span', { class: 'opening-dims' },
        opMeta.larguraDefault
          ? `${(opMeta.larguraDefault*100)|0}×${(opMeta.alturaDefault*100)|0} cm`
          : opMeta.diametroDefault
            ? `Ø ${(opMeta.diametroDefault*100)|0} cm`
            : '') : null,
    ]),
    opMeta?.nota ? el('div', { class: 'opening-nota' }, opMeta.nota) : null,
    opMeta?.custo ? el('div', { class: 'opening-price' }, `≈ R$ ${opMeta.custo.toLocaleString('pt-BR')}`) : null,
  ]);
}
function statRow(k, v) {
  return el('div', { class: 'summary-row' }, [
    el('span', { class: 'k' }, k),
    el('span', { class: 'v' }, v),
  ]);
}
