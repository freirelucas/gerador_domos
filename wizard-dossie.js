// wizard-dossie.js — Etapa 5: Dossiê construtivo completo

import { exportSVG, exportDXF, exportCSV, exportOBJ, exportHubsSVG, downloadFile } from './exporter.js';
import { term } from './glossario.js';
import { el, FMT as fmt, TYPE_COLORS } from './dom-helpers.js';

export function renderStep5(wrap, api) {
  const { state, data } = api;
  const dome = api.getDome();
  const material   = data.STRUCTURE_MATERIALS.find((m) => m.id === state.sistemas.estrutura);
  const connector  = data.HUB_CONNECTORS.find((m) => m.id === state.sistemas.conector);
  const covering   = data.COVERINGS.find((m) => m.id === state.sistemas.cobertura);
  const foundation = data.FOUNDATIONS.find((m) => m.id === state.sistemas.fundacao);
  const piso       = data.FLOOR_SYSTEMS.find((m) => m.id === state.sistemas.piso);
  const water      = data.WATER_SYSTEMS.find((m) => m.id === state.sistemas.agua);
  const energy     = data.ENERGY_SYSTEMS.find((m) => m.id === state.sistemas.energia);
  const cenario    = data.USE_SCENARIOS.find((s) => s.id === state.programa.cenario);
  const clima      = data.CLIMATE_ZONES.find((z) => z.id === state.programa.clima);

  // Cabeçalho
  wrap.appendChild(el('div', { class: 'step-head' }, [
    el('div', { class: 'step-eyebrow' }, 'etapa 05 · dossiê construtivo'),
    el('h1', { class: 'step-title', html: 'O <em>caderno</em> do seu domo' }),
    el('div', { class: 'step-subtitle' },
      'Plano completo para entregar ao marceneiro: cut list, hubs, montagem dia-a-dia, orçamento referenciado e memorial. Tudo aqui é editável no navegador e pode ser impresso em PDF.'),
  ]));

  // Print bar
  wrap.appendChild(el('div', { class: 'print-bar' }, [
    el('div', { class: 'label' }, '↳ exportar para marcenaria & CAD aberto'),
    el('button', { class: 'btn-ghost', onclick: () => window.print() }, 'imprimir / salvar PDF'),
    el('button', {
      class: 'btn-ghost',
      onclick: () => downloadFile(`dome-cutlist-${state.forma.freq}V-${state.forma.diametro}m.svg`, exportSVG(dome, state, material), 'image/svg+xml'),
      title: 'Vetorial, escala 1:20 — abre em Inkscape, Illustrator e browser',
    }, '⬇ cut list SVG'),
    el('button', {
      class: 'btn-ghost',
      onclick: () => downloadFile(`dome-cutlist-${state.forma.freq}V-${state.forma.diametro}m.dxf`, exportDXF(dome, state, material), 'application/dxf'),
      title: 'DXF ASCII R12 — abre em LibreCAD, FreeCAD, QCAD, AutoCAD',
    }, [`⬇ cut list `, el('span', { html: term('DXF', 'dxf') })]),
    el('button', {
      class: 'btn-ghost',
      onclick: () => downloadFile(`dome-hubs-${state.forma.freq}V.svg`, exportHubsSVG(dome, connector), 'image/svg+xml'),
      title: 'Gabaritos 1:1 para furação dos hubs',
    }, '⬇ gabaritos hubs SVG'),
    el('button', {
      class: 'btn-ghost',
      onclick: () => downloadFile(`dome-cutlist.csv`, exportCSV(dome, state, material), 'text/csv'),
      title: 'Planilha para Excel/LibreOffice',
    }, '⬇ CSV'),
    el('button', {
      class: 'btn-ghost',
      onclick: () => downloadFile(`dome-mesh-${state.forma.freq}V-${state.forma.diametro}m.obj`, exportOBJ(dome, state), 'text/plain'),
      title: 'Malha 3D — abre em Blender, FreeCAD, SketchUp',
    }, '⬇ malha 3D OBJ'),
    el('button', { class: 'btn-ghost', onclick: () => exportJSON(state) }, '⬇ projeto JSON'),
  ]));

  // TOC
  wrap.appendChild(el('div', { class: 'dossie-toc' }, [
    el('a', { href: '#s-visao' },     '01 · visão geral'),
    el('a', { href: '#s-valid' },     '02 · validação estrutural'),
    el('a', { href: '#s-geom' },      '03 · geometria'),
    el('a', { href: '#s-cut' },       '04 · cut list'),
    el('a', { href: '#s-hubs' },      '05 · hubs'),
    el('a', { href: '#s-riser' },     '06 · riser wall'),
    el('a', { href: '#s-cobertura' }, '07 · cobertura'),
    el('a', { href: '#s-piso' },      '08 · piso'),
    el('a', { href: '#s-aberturas' }, '09 · aberturas'),
    el('a', { href: '#s-fund' },      '10 · fundação'),
    el('a', { href: '#s-sist' },      '11 · água + energia'),
    el('a', { href: '#s-tools' },     '12 · ferramentas'),
    el('a', { href: '#s-mont' },      '13 · plano de montagem'),
    el('a', { href: '#s-orca' },      '14 · orçamento'),
    el('a', { href: '#s-fontes' },    '15 · fontes citadas'),
    el('a', { href: '#s-mem' },       '16 · memorial descritivo'),
  ]));

  // ── 01 Visão geral ──
  wrap.appendChild(sheet('s-visao', '01', 'Visão <em>geral</em>',
    `${state.forma.freq}V · ${truncLabel(state.forma.truncamento)} · Ø ${dome.diameter.toFixed(1)} m`,
    [
      el('table', { class: 'spec' }, [
        el('tbody', {}, [
          specRow('cenário de uso', cenario?.nome || '—'),
          specRow('capacidade', state.programa.capacidade + ' pessoas'),
          specRow('zona climática', clima?.label || '—'),
          specRow('módulos do programa',
            state.programa.modulos.map((m) => data.PROGRAM_MODULES[m]?.label).filter(Boolean).join(', ') || '—'),
          specRow('diâmetro', fmt.m(dome.diameter)),
          specRow('altura interna', fmt.m(dome.height)),
          specRow('área da casca', fmt.m2(dome.totalArea)),
          specRow('área do piso', fmt.m2(Math.PI * (dome.diameter / 2) ** 2)),
          specRow('frequência geodésica', state.forma.freq + 'V (Class I alternate)'),
          specRow('truncamento', truncLabel(state.forma.truncamento)),
        ]),
      ]),
    ]));

  // ── 02 Validação Estrutural ──
  const validation = api.helpers.validateStructure(state, dome, data);
  wrap.appendChild(sheet('s-valid', '02',
    validation.passou ? 'Validação <em>estrutural</em>' : '<em style="color:var(--sangue)">Atenção</em> — validação estrutural',
    validation.resumoTexto,
    [renderValidation(validation, state, dome, data)],
  ));

  // ── 03 Geometria ──
  wrap.appendChild(sheet('s-geom', '03', 'Geometria <em>de referência</em>',
    'subdivisão icosaédrica · chord factors',
    [
      el('div', { class: 'memorial', style: { fontSize: '14px' } }, [
        el('p', {}, [
          'A geometria do domo parte de um ',
          el('strong', {}, 'icosaedro regular'),
          ' (20 faces triangulares, 12 vértices) com um vértice no polo norte. Cada face é subdividida em ',
          el('strong', {}, state.forma.freq + ' × ' + state.forma.freq),
          ' = ' + (state.forma.freq ** 2) + ' subfaces; cada vértice da grade resultante é projetado radialmente sobre a esfera de raio R = ' + (dome.diameter / 2).toFixed(3) + ' m.',
        ]),
        el('p', {}, [
          'O truncamento ', el('strong', {}, truncLabel(state.forma.truncamento)),
          ' descarta todas as faces com qualquer vértice abaixo do plano z = ',
          (1 - 2 * state.forma.truncamento).toFixed(3),
          ' · R. Da malha resultante extraímos ', el('strong', {}, dome.edges.length + ' arestas'),
          ' agrupadas em ', el('strong', {}, dome.struts.length + ' tipos por comprimento'),
          ' (tolerância 10⁻⁴ · R).',
        ]),
      ]),
      el('div', { style: { marginTop: '18px' } }, [
        el('table', { class: 'spec' }, [
          el('thead', {}, el('tr', {}, [
            el('th', {}, 'tipo'), el('th', {}, 'qtd'),
            el('th', {}, 'chord factor (unidade)'),
            el('th', {}, 'comprimento exato'),
          ])),
          el('tbody', {}, dome.struts.map((g) => el('tr', {}, [
            el('td', {}, [
              el('span', { class: 'type-chip', style: { background: TYPE_COLORS[g.label] } }),
              el('strong', {}, g.label),
            ]),
            el('td', { class: 'mono' }, g.count + ' un.'),
            el('td', { class: 'mono' }, g.chord.toFixed(6)),
            el('td', { class: 'mono' }, fmt.mm(g.length) + '  (= ' + g.chord.toFixed(4) + ' × R)'),
          ]))),
        ]),
      ]),
    ]));

  // ── 03 Cut list ──
  const cutCards = dome.struts.map((g) => renderCutCard(g, material));
  wrap.appendChild(sheet('s-cut', '03', 'Cut list <em>detalhada</em>',
    `${dome.edges.length} peças · ${dome.totalLinear.toFixed(1)} m lineares`,
    [
      el('div', { class: 'memorial', style: { fontSize: '13.5px' } }, [
        el('p', {}, [
          'Corte cada peça no comprimento indicado, com ',
          el('strong', {}, 'tolerância de ± 1 mm'),
          '. Marque a ponta com tinta da cor do tipo (',
          ...dome.struts.map((g, i) => [
            i > 0 ? ' · ' : '',
            el('span', { style: { color: TYPE_COLORS[g.label], fontWeight: 600 } }, g.label),
          ]).flat(),
          ') antes de levantar. Em ' + material.nome + ', faça o corte com serra circular ',
          material.diametro ? '(disco de metal duro 24 dentes para peça roliça).' : '(disco fino para sarrafo aparelhado).',
        ]),
      ]),
      el('div', { class: 'cut-detail' }, cutCards),
    ]));

  // ── 04 Hubs ──
  const hubCounts = dome.hubs.reduce((acc, h) => {
    acc[h.valence] = (acc[h.valence] || 0) + 1; return acc;
  }, {});
  wrap.appendChild(sheet('s-hubs', '04', 'Hubs <em>(nós conectores)</em>',
    `${[...dome.used].length} nós · ${connector.nome.toLowerCase()}`,
    [
      el('div', { class: 'memorial', style: { fontSize: '13.5px' } }, [
        el('p', {}, [
          'Cada nó conecta de ', el('strong', {}, '3 a 6 barras'),
          ' em ângulos fixos. Use o desenho de cada hub como gabarito para furação. ',
          el('strong', {}, connector.nome),
          ' — ', connector.nota,
        ]),
      ]),
      el('div', { class: 'hubs-grid' },
        Object.keys(hubCounts).map(Number).sort((a, b) => b - a).map((v) =>
          renderHubCard(v, hubCounts[v], connector))),
    ]));

  // ── 06 Riser wall ──
  if (state.riser?.ativa) {
    const baseHubsCount = countBaseHubs(dome);
    wrap.appendChild(sheet('s-riser', '06',
      `${term('Riser wall', 'riser wall')} <em>· parede de elevação</em>`,
      `${state.riser.altura.toFixed(2)} m de altura · ${baseHubsCount} pranchas`,
      [
        el('div', { class: 'memorial', style: { fontSize: '13.5px' } }, [
          el('p', { html: `
            Parede vertical curta sob o domo. Sua função é dupla: ${'(1)'} dá ${state.riser.altura.toFixed(2)} m
            de pé-direito útil extra em todo o perímetro; ${'(2)'} cria superfícies retangulares para
            instalar portas e janelas convencionais de mercado sem precisar fazer
            <em>compound miter cuts</em> na curvatura do domo.
          `}),
          el('p', {}, [
            'Configuração executiva: ',
            el('strong', {}, baseHubsCount + ' pranchas trapezoidais'),
            ` de eucalipto tratado 25×${(state.riser.altura*100).toFixed(0)} cm, encaixadas entre os hubs do anel inferior. `,
            'Ângulos internos do polígono base = ', String(((baseHubsCount-2) * 180 / baseHubsCount).toFixed(1)), '°. ',
            'Comprimento de cada prancha = corda do polígono = ',
            el('strong', {}, fmt.m(2 * dome.footRadius * Math.sin(Math.PI / baseHubsCount))),
            '.',
          ]),
          el('p', {}, [
            el('em', {}, 'Por que riser wall? '),
            'Em domos sem riser, a porta acompanha a curvatura da casca e precisa ser feita em arco ou ter a folha cortada em ângulo. ',
            'Com riser ≥ 60 cm, uma porta padrão 80×210 cm encaixa diretamente. ',
            'AiDomes, BobVila e MadeHow recomendam riser de 30 a 120 cm para qualquer domo residencial.',
          ]),
        ]),
        el('table', { class: 'spec' }, [
          el('tbody', {}, [
            specRow('altura', state.riser.altura.toFixed(2) + ' m'),
            specRow('número de pranchas', baseHubsCount + ' (= hubs do anel inferior)'),
            specRow('comprimento de cada prancha', fmt.m(2 * dome.footRadius * Math.sin(Math.PI / baseHubsCount))),
            specRow('seção recomendada', 'eucalipto tratado 25 × ' + (state.riser.altura*100).toFixed(0) + ' cm'),
            specRow('fixação à fundação', 'chumbador parabolt M10 a cada 60 cm'),
            specRow('fixação à base do domo', 'cantoneira de aço galvanizado 3 mm'),
          ]),
        ]),
      ]));
  } else {
    wrap.appendChild(sheet('s-riser', '06', 'Riser wall <em>· desativada</em>',
      'opção: nenhuma',
      [
        el('div', { class: 'memorial', style: { fontSize: '13.5px' } }, [
          el('p', {}, [
            'Nesta configuração o domo apoia direto na fundação, sem ',
            term('riser wall', 'riser wall'),
            '. Portas e janelas precisam ser projetadas dentro dos triângulos da base — ',
            'considere usar ', term('arco de porta', 'arco de porta'),
            ' (hoop door) para distribuir as cargas. Recomendado para estufas, quiosques e instalações temporárias.',
          ]),
        ]),
      ]));
  }

  // ── 07 Cobertura ──
  wrap.appendChild(sheet('s-cobertura', '07', 'Cobertura <em>externa</em>',
    `${covering.nome.toLowerCase()} · ${fmt.m2(dome.totalArea)}`,
    [
      el('table', { class: 'spec' }, [
        el('tbody', {}, [
          specRow('material', covering.nome),
          specRow('preço unitário', `${fmt.brl(covering.precoPorM2)}/m²`,
            covering.fontes),
          specRow('área total a cobrir', fmt.m2(dome.totalArea) + ' (= soma dos ' + dome.faces.length + ' triângulos)'),
          specRow('+ 12% de sobra para emendas e ilhós', fmt.m2(dome.totalArea * 1.12)),
          specRow('peso estimado', (covering.pesoPorM2 * dome.totalArea).toFixed(0) + ' kg'),
          specRow('durabilidade', covering.durabilidade || '—'),
          specRow('observação', covering.nota),
        ]),
      ]),
      el('div', { class: 'memorial', style: { fontSize: '13.5px', marginTop: '18px' } }, [
        el('p', {}, [
          'Para ', el('strong', {}, covering.nome),
          ', recomenda-se fabricar a cobertura como ', el('strong', {}, 'mosaico de triângulos planos'),
          ' (não esférico) — cada face é um triângulo plano de lados iguais aos chord factors da camada. ',
          'Sobreponha 30 mm em cada lado para fixação na barra adjacente.',
        ]),
      ]),
    ]));

  // ── 08 Piso ──
  if (piso) {
    const pisoArea = Math.PI * (dome.diameter / 2) ** 2;
    wrap.appendChild(sheet('s-piso', '08', 'Piso <em>interno</em>',
      `${piso.nome.toLowerCase()} · ${fmt.m2(pisoArea)}`,
      [
        el('table', { class: 'spec' }, [
          el('tbody', {}, [
            specRow('sistema escolhido', piso.nome, piso.fontes),
            specRow('área do piso', fmt.m2(pisoArea) + ' (círculo Ø ' + dome.diameter.toFixed(2) + ' m)'),
            specRow('preço unitário', fmt.brl(piso.precoPorM2) + '/m²'),
            specRow('+ 8% de sobra', fmt.m2(pisoArea * 1.08)),
            specRow('peso estimado', (piso.pesoPorM2 * pisoArea).toFixed(0) + ' kg'),
            specRow('durabilidade', piso.durabilidade),
            specRow('observação', piso.nota),
          ]),
        ]),
      ]));
  }

  // ── 09 Aberturas ──
  wrap.appendChild(sheet('s-aberturas', '09', '<em>Aberturas</em>',
    'portas · janelas · ventilação',
    [
      el('table', { class: 'spec' }, [
        el('thead', {}, el('tr', {}, [
          el('th', {}, 'abertura'),
          el('th', {}, 'qtd'),
          el('th', {}, 'dimensões'),
          el('th', {}, 'área un.'),
          el('th', {}, 'custo un.'),
        ])),
        el('tbody', {}, openingsRows(state.aberturas, data.OPENING_TYPES)),
      ]),
      el('div', { class: 'memorial', style: { fontSize: '13.5px', marginTop: '16px' } }, [
        el('p', {}, [
          'Porta principal voltada para ', el('strong', {}, orientName(state.aberturas.orientacaoPorta || 90)),
          ' (', String(state.aberturas.orientacaoPorta || 90), '°). ',
          state.aberturas.cupula_zenital
            ? 'Cúpula zenital ativa: o gradiente térmico aspira ar pela base e ventila por cima (efeito chaminé).'
            : 'Sem cúpula zenital — considere adicionar para conforto térmico no cerrado.',
        ]),
      ]),
    ]));

  // ── 10 Fundação ──
  const baseHubs = dome.hubs.filter((h) =>
    Math.abs(h.pos[2] - Math.min(...[...dome.used].map((i) => dome.verts[i][2]))) < 0.05,
  ).length;
  wrap.appendChild(sheet('s-fund', '10', 'Fundação <em>e ancoragem</em>',
    `${baseHubs} pontos de apoio · ${foundation.nome.toLowerCase()}`,
    [
      el('table', { class: 'spec' }, [
        el('tbody', {}, [
          specRow('sistema escolhido', foundation.nome, foundation.fontes),
          specRow('pontos de fundação', baseHubs + ' (= hubs do anel inferior)'),
          specRow('custo unitário', fmt.brl(foundation.custoBase)),
          specRow('tempo por ponto', (foundation.tempoHoras || 1) + ' h'),
          specRow('observação', foundation.nota),
        ]),
      ]),
      el('div', { class: 'memorial', style: { fontSize: '13.5px', marginTop: '16px' } }, [
        el('p', {}, [
          'Marcação: trace na terra um círculo de raio ',
          el('strong', {}, fmt.m(dome.footRadius)),
          ' usando estaca central e barbante. Divida o círculo em ',
          el('strong', {}, baseHubs + ' setores iguais'),
          ' (' + (360 / baseHubs).toFixed(2) + '° entre cada um) e marque os pontos de fundação. ',
          'Confira o nível entre todos os pontos com mangueira d\'água ou nível a laser.',
        ]),
      ]),
    ]));

  // ── 11 Sistemas (água + energia) ──
  wrap.appendChild(sheet('s-sist', '11', 'Água e <em>energia</em>',
    'sistemas autônomos · cerrado',
    [
      el('table', { class: 'spec' }, [
        el('tbody', {}, [
          specRow('água + esgoto', water.nome + ' — ' + fmt.brl(water.custo), water.fontes),
          specRow('observação água', water.nota),
          specRow('energia', energy.nome + ' — ' + fmt.brl(energy.custo), energy.fontes),
          specRow('observação energia', energy.nota),
        ]),
      ]),
    ]));

  // ── 12 Ferramentas ──
  wrap.appendChild(sheet('s-tools', '12', '<em>Ferramentas</em> necessárias',
    'kit mínimo para um marceneiro DIY',
    [
      el('div', { class: 'tools' }, data.TOOLS.map((t) => el('div', { class: 'tool-row' }, [
        el('div', { class: 'tool-name' }, t.nome),
        el('div', { class: 'tool-uso' }, t.uso),
      ]))),
    ]));

  // ── 13 Plano de montagem ──
  wrap.appendChild(sheet('s-mont', '13', '<em>Plano</em> de montagem',
    'cronograma dia-a-dia · equipe de 3 pessoas',
    [renderSchedule(dome, state, data)]));

  // ── 14 Orçamento ──
  const orca = buildBudget(dome, state, data, api);
  wrap.appendChild(sheet('s-orca', '14', '<em>Orçamento</em> consolidado',
    `BRL · referências mai/2026`,
    [orca.dom]));

  // ── 15 Fontes citadas ──
  wrap.appendChild(sheet('s-fontes', '15', '<em>Fontes</em> citadas',
    'todas as URLs usadas para os preços e referências técnicas',
    [renderFontes([material, connector, covering, foundation, piso, water, energy])]));

  // ── 16 Memorial descritivo ──
  wrap.appendChild(sheet('s-mem', '16', '<em>Memorial</em> descritivo',
    'texto pronto para anexar ao projeto',
    [renderMemorial(dome, state, data, orca.total, material, connector, covering, foundation)]));
}

// ─── Helpers de render ────────────────────────────────────────────────────
function renderValidation(v, state, dome, data) {
  const wrap = el('div');

  // Resumo grande
  const resumo = el('div', { class: 'validation-summary' + (v.passou ? ' is-pass' : ' is-fail') }, [
    el('div', { class: 'validation-icon' }, v.passou ? '✓' : '⚠'),
    el('div', { class: 'validation-text' }, [
      el('div', { class: 'validation-headline' },
        v.passou ? 'Construível com as escolhas atuais' : 'Existem problemas críticos a resolver'),
      el('div', { class: 'validation-sub' }, [
        v.cnt['crítico'] ? (v.cnt['crítico'] + ' crítico(s) · ') : '',
        v.cnt['aviso'] ? (v.cnt['aviso'] + ' aviso(s) · ') : '',
        v.cnt['info'] ? (v.cnt['info'] + ' info · ') : '',
        (v.ok.length) + ' itens ok',
      ].join('')),
    ]),
  ]);
  wrap.appendChild(resumo);

  // Findings (críticos primeiro)
  const sorted = [...v.findings].sort((a, b) => {
    const order = { 'crítico': 0, 'aviso': 1, 'info': 2 };
    return order[a.tipo] - order[b.tipo];
  });
  if (sorted.length > 0) {
    wrap.appendChild(el('h4', { class: 'validation-section-title' }, 'pontos de atenção'));
    for (const f of sorted) {
      wrap.appendChild(el('div', { class: `finding finding-${f.tipo}` }, [
        el('div', { class: 'finding-head' }, [
          el('span', { class: 'finding-tipo' }, f.tipo),
          el('span', { class: 'finding-area' }, f.area),
        ]),
        el('div', { class: 'finding-msg', html: f.msg }),
        f.ref ? el('div', { class: 'finding-ref' }, [
          'referência: ',
          f.url ? el('a', { href: f.url, target: '_blank', rel: 'noopener' }, f.ref) : f.ref,
        ]) : null,
      ]));
    }
  }

  // Métricas
  wrap.appendChild(el('h4', { class: 'validation-section-title', style: { marginTop: '24px' } }, 'métricas estruturais'));
  const metrics = el('table', { class: 'spec' }, [
    el('tbody', {}, [
      specRow('maior barra', fmt.m(v.metrics.maiorBarra)),
      specRow('esbeltez (L/espessura)', v.metrics.esbeltez.toFixed(1) + '× (limite saudável: ≤ 35×)'),
      specRow('peso da estrutura', v.metrics.pesoEstrutura.toFixed(0) + ' kg'),
      specRow('peso da cobertura', v.metrics.pesoCobertura.toFixed(0) + ' kg · ' + (v.metrics.pesoCobertura / dome.totalArea).toFixed(1) + ' kg/m²'),
      specRow('carga média por barra', v.metrics.cargaPorBarra.toFixed(1) + ' kg'),
      specRow('aberturas na casca', v.metrics.pctAberturas.toFixed(1) + '% (limite: 25%)'),
    ]),
  ]);
  wrap.appendChild(metrics);

  // Raciocínio
  wrap.appendChild(el('div', { class: 'memorial', style: { marginTop: '24px', fontSize: '13.5px' } }, [
    el('p', { html: `
      <strong>Raciocínio:</strong> a validação cruza 7 critérios derivados de literatura DIY (Domerama,
      MadeHow, AiDomes) e normas brasileiras (NBR 6123 vento, NBR 7190 madeira, NBR 9480 tratamento):
      frequência V × diâmetro, esbeltez da peça, peso da cobertura, vento × fundação,
      truncamento × cobertura, percentual de aberturas e necessidade de riser wall.
      Estimativas são conservadoras — não substituem o cálculo estrutural de um engenheiro
      quando o domo for usado para hospedagem comercial ou residência permanente.
    ` }),
  ]));

  return wrap;
}

function sheet(id, num, title, meta, children) {
  return el('section', { class: 'sheet', id }, [
    el('div', { class: 'sheet-head' }, [
      el('div', { class: 'sheet-tag' }, num),
      el('h2', { html: title }),
      el('div', { class: 'sheet-meta' }, meta),
    ]),
    ...[].concat(children),
  ]);
}

/**
 * Torna cada `<section class="sheet">` no wrap colapsável.
 * Adiciona um botão chevron no `.sheet-head`, persiste o conjunto de
 * IDs fechados em `state.v3.dossieClosed`, e re-abre automaticamente
 * uma seção quando ela é alvo de scroll via âncora do TOC.
 */
export function initSheetCollapse(wrap, state, saveState) {
  const closed = new Set(state.v3.dossieClosed || []);
  const sheets = wrap.querySelectorAll('section.sheet');

  for (const s of sheets) {
    const head = s.querySelector('.sheet-head');
    if (!head) continue;

    const toggle = el('button', {
      class: 'sheet-toggle',
      type: 'button',
      'aria-expanded': closed.has(s.id) ? 'false' : 'true',
      'aria-controls': s.id + '-body',
      'aria-label': 'Recolher ou expandir esta seção',
      onclick: () => {
        const wasClosed = s.classList.toggle('sheet--closed');
        toggle.setAttribute('aria-expanded', wasClosed ? 'false' : 'true');
        if (wasClosed) closed.add(s.id); else closed.delete(s.id);
        state.v3.dossieClosed = [...closed];
        saveState();
      },
    }, '▾');
    head.appendChild(toggle);

    // body wrapper para ARIA + animação previsível
    const body = el('div', { class: 'sheet-body', id: s.id + '-body' });
    while (head.nextSibling) body.appendChild(head.nextSibling);
    s.appendChild(body);

    if (closed.has(s.id)) s.classList.add('sheet--closed');
  }

  // TOC abre a seção automaticamente.
  wrap.querySelectorAll('.dossie-toc a').forEach((link) => {
    link.addEventListener('click', () => {
      const targetId = link.getAttribute('href').slice(1);
      const target = wrap.querySelector('#' + CSS.escape(targetId));
      if (target && target.classList.contains('sheet--closed')) {
        target.classList.remove('sheet--closed');
        target.querySelector('.sheet-toggle')?.setAttribute('aria-expanded', 'true');
        closed.delete(targetId);
        state.v3.dossieClosed = [...closed];
        saveState();
      }
    });
  });
}

function specRow(k, v, fontes) {
  const td = el('td', {}, [
    typeof v === 'string' ? document.createTextNode(v) : v,
  ]);
  if (fontes && fontes.length > 0) {
    const sup = el('sup', { class: 'cite' }, [
      ...fontes.flatMap((f, i) => [
        i > 0 ? ',' : '',
        el('a', { href: f.url, target: '_blank', rel: 'noopener', style: { color: 'inherit' } }, '['+(i+1)+']'),
      ]),
    ]);
    td.appendChild(sup);
    td.appendChild(el('div', { class: 'cite-list' }, fontes.map((f) =>
      el('div', {}, [
        '· ',
        el('a', { href: f.url, target: '_blank', rel: 'noopener' }, f.label),
        f.preco ? ' — ' + f.preco : '',
        f.data ? ` (${f.data})` : '',
      ]),
    )));
  }
  return el('tr', {}, [
    el('td', { style: { width: '32%', color: 'var(--ink-soft)', fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' } }, k),
    td,
  ]);
}

function renderCutCard(g, material) {
  const NS = 'http://www.w3.org/2000/svg';
  const W = 240, H = 40;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', W); svg.setAttribute('height', H);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  // Barra
  const barH = material.diametro ? 16 : 10;
  const barY = (H - barH) / 2;
  const bar = document.createElementNS(NS, 'rect');
  bar.setAttribute('x', 20); bar.setAttribute('y', barY);
  bar.setAttribute('width', W - 40); bar.setAttribute('height', barH);
  bar.setAttribute('fill', TYPE_COLORS[g.label]);
  bar.setAttribute('stroke', '#1c1209');
  if (material.diametro) bar.setAttribute('rx', barH / 2);
  svg.appendChild(bar);

  // Tag nas pontas
  const tagL = document.createElementNS(NS, 'circle');
  tagL.setAttribute('cx', 12); tagL.setAttribute('cy', H/2);
  tagL.setAttribute('r', 6);
  tagL.setAttribute('fill', '#1c1209');
  svg.appendChild(tagL);
  const tagR = document.createElementNS(NS, 'circle');
  tagR.setAttribute('cx', W - 12); tagR.setAttribute('cy', H/2);
  tagR.setAttribute('r', 6);
  tagR.setAttribute('fill', '#1c1209');
  svg.appendChild(tagR);

  // Cotagem
  const ext1 = document.createElementNS(NS, 'line');
  ext1.setAttribute('x1', 12); ext1.setAttribute('y1', H/2 - 12);
  ext1.setAttribute('x2', 12); ext1.setAttribute('y2', H/2 - 18);
  ext1.setAttribute('stroke', '#1c1209'); ext1.setAttribute('stroke-width', '0.6');
  svg.appendChild(ext1);
  const ext2 = document.createElementNS(NS, 'line');
  ext2.setAttribute('x1', W - 12); ext2.setAttribute('y1', H/2 - 12);
  ext2.setAttribute('x2', W - 12); ext2.setAttribute('y2', H/2 - 18);
  ext2.setAttribute('stroke', '#1c1209'); ext2.setAttribute('stroke-width', '0.6');
  svg.appendChild(ext2);

  return el('div', { class: 'cut-card' }, [
    el('div', { class: 'cut-card-head' }, [
      el('div', { class: 'cut-card-label' }, g.label),
      el('div', { class: 'cut-card-count' }, '× ' + g.count),
    ]),
    el('div', { class: 'cut-card-len' }, fmt.mm(g.length)),
    svg,
    el('div', { class: 'cut-card-spec' }, [
      el('div', {}, `chord factor: ${g.chord.toFixed(5)} · R`),
      el('div', {}, `peça: ${material.nome}`),
      el('div', {}, material.diametro
        ? `Ø ${material.diametro} mm${material.espessuraParede ? ' · parede ' + material.espessuraParede + ' mm' : ''}`
        : `seção ${material.secao}`),
      el('div', {}, `total linear no tipo: ${(g.length * g.count).toFixed(2)} m`),
      el('div', { style: { marginTop: '4px', color: 'var(--ocre)' } },
        `aproveitamento: ${Math.ceil(material.comprimentoComercial / g.length)} pç por barra ${material.comprimentoComercial}m`),
    ]),
  ]);
}

function renderHubCard(valence, count, connector) {
  const NS = 'http://www.w3.org/2000/svg';
  const size = 140;
  const cx = size / 2, cy = size / 2, r = 50;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', size); svg.setAttribute('height', size);
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

  // anel ref
  const ring = document.createElementNS(NS, 'circle');
  ring.setAttribute('cx', cx); ring.setAttribute('cy', cy);
  ring.setAttribute('r', r);
  ring.setAttribute('fill', 'none');
  ring.setAttribute('stroke', '#8b7a5d');
  ring.setAttribute('stroke-dasharray', '2 3');
  svg.appendChild(ring);

  for (let i = 0; i < valence; i++) {
    const a = (i / valence) * 2 * Math.PI - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    const ln = document.createElementNS(NS, 'line');
    ln.setAttribute('x1', cx); ln.setAttribute('y1', cy);
    ln.setAttribute('x2', x); ln.setAttribute('y2', y);
    ln.setAttribute('stroke', '#1c1209');
    ln.setAttribute('stroke-width', 2);
    svg.appendChild(ln);
    const dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('cx', x); dot.setAttribute('cy', y);
    dot.setAttribute('r', 3.5);
    dot.setAttribute('fill', '#1c1209');
    svg.appendChild(dot);
  }
  // Centro
  const center = document.createElementNS(NS, 'circle');
  center.setAttribute('cx', cx); center.setAttribute('cy', cy);
  center.setAttribute('r', 8);
  center.setAttribute('fill', connector.cor || '#b4742a');
  center.setAttribute('stroke', '#1c1209');
  svg.appendChild(center);

  // ângulo entre barras
  const ang = (360 / valence).toFixed(1);

  return el('div', { class: 'hub-card' }, [
    svg,
    el('div', { class: 'hub-label' }, valence + '-edge'),
    el('div', { class: 'hub-meta' }, [
      el('div', {}, '×' + count + ' nós'),
      el('div', {}, 'ângulo plano: ' + ang + '°'),
      el('div', {}, hubDescription(valence)),
    ]),
  ]);
}

function hubDescription(v) {
  if (v === 6) return 'hexagonal · interior';
  if (v === 5) return 'pentagonal · vértice icosaedro';
  if (v === 4) return 'anel de corte';
  if (v === 3) return 'borda · canto';
  if (v === 2) return 'extremidade';
  return v + ' arestas';
}

function openingsRows(ab, OP) {
  const rows = [];
  function pushRow(qty, type) {
    const def = OP[type];
    if (!def || !qty) return;
    rows.push(el('tr', {}, [
      el('td', {}, def.label),
      el('td', { class: 'mono' }, '× ' + qty),
      el('td', { class: 'mono' },
        def.larguraDefault
          ? `${(def.larguraDefault*100)|0}×${(def.alturaDefault*100)|0} cm`
          : `Ø ${(def.diametroDefault*100)|0} cm`),
      el('td', { class: 'mono' }, def.area.toFixed(2) + ' m²'),
      el('td', { class: 'mono' }, 'R$ ' + def.custo.toLocaleString('pt-BR')),
    ]));
  }
  pushRow(ab.porta_principal ? 1 : 0, 'porta_principal');
  pushRow(ab.porta_emergencia ? 1 : 0, 'porta_emergencia');
  pushRow(ab.janelas_basc || 0, 'janela_basculante');
  pushRow(ab.janelas_redondas || 0, 'janela_redonda');
  pushRow(ab.cupula_zenital ? 1 : 0, 'cupula_zenital');
  pushRow(ab.abertura_ventilacao || 0, 'abertura_ventilacao');
  return rows;
}

function renderSchedule(dome, state, data) {
  const totalBarras = dome.edges.length;
  const totalHubs = [...dome.used].length;
  const tasks = [
    {
      day: 'D−7',
      title: 'Preparativo',
      tasks: [
        'Conferir terreno e nivelamento (variação máx. ± 5 cm)',
        'Confirmar lista de materiais com fornecedor; agendar entrega',
        'Imprimir cut list e desenhos de hubs',
        'Imunizar peças se aplicável (bórax/CCA já feito de fábrica?)',
      ],
    },
    {
      day: 'D−1',
      title: 'Recebimento',
      tasks: [
        'Receber e conferir todas as peças (tolerância ±1 mm)',
        'Separar por tipo (A, B, C…) e marcar com tinta a ponta de cada barra',
        'Pré-furar parafusos passantes se for o caso',
      ],
    },
    {
      day: 'D1',
      title: 'Fundação',
      tasks: [
        'Marcar circunferência de raio ' + fmt.m(dome.footRadius),
        'Marcar pontos de apoio (' + countBaseHubs(dome) + ' pontos)',
        'Executar fundação: ' + (data.FOUNDATIONS.find((f) => f.id === state.sistemas.fundacao)?.nome || ''),
        'Aguardar cura mínima (24 h para concreto)',
      ],
    },
    {
      day: 'D2',
      title: 'Anel inferior',
      tasks: [
        'Fixar hubs do anel inferior nos chumbadores',
        'Erguer e parafusar as ' + dome.struts[0].count + ' barras do tipo A no anel inferior',
        'Conferir prumo e nível geral',
      ],
    },
    {
      day: 'D3',
      title: 'Pré-montar pentágonos / hexágonos no chão',
      tasks: [
        'Pré-montar grupos de barras como módulos triangulares no chão',
        'Identificar cada módulo com a posição final',
        'Conferir cada módulo no gabarito de cota antes de erguer',
      ],
    },
    {
      day: 'D4–D5',
      title: 'Levantar a casca',
      tasks: [
        'Içar módulos com escora interna ou grua leve',
        'Fechar a malha do equador para o topo, parafusando hubs',
        totalBarras > 100
          ? 'Atenção: domos 3V+ exigem 3+ pessoas e escora central até fechar a cúpula'
          : 'Em 2V ou pequenos, 2 pessoas resolvem com escada articulada',
        'Conferir esquadro pentagonal (5 vértices = 72°) e hexagonal (60°)',
      ],
    },
    {
      day: 'D6',
      title: 'Aberturas',
      tasks: [
        'Marcar e cortar membranas/painéis onde irão portas/janelas',
        'Fixar batentes de porta(s) e janelas com cantoneiras',
        state.aberturas.cupula_zenital
          ? 'Instalar cúpula zenital + selante de poliuretano' : null,
      ].filter(Boolean),
    },
    {
      day: 'D7–D8',
      title: 'Cobertura externa',
      tasks: [
        'Fixar a cobertura (' + (data.COVERINGS.find((c) => c.id === state.sistemas.cobertura)?.nome || '') + ')',
        'Selar emendas com fita ou solda quente (lonas)',
        'Verificar escoamento (declividade ≥ 5%) em todos os pontos',
      ],
    },
    {
      day: 'D9',
      title: 'Acabamentos',
      tasks: [
        'Lixar pontas de barras expostas',
        'Aplicar stain UV + verniz nas peças de madeira',
        'Instalar mosquiteiro nas aberturas se aplicável',
      ],
    },
    {
      day: 'D10',
      title: 'Sistemas',
      tasks: [
        'Instalar cisterna e tubulação',
        'Instalar painéis solares / conexão à rede',
        'Teste de estanqueidade (mangueira por 15 min em cada quadrante)',
        'Vistoria final + entrega ao usuário',
      ],
    },
  ];

  // Estimativa total
  const horasPorBarra = state.sistemas.conector === 'corda_sisal' ? 0.5 : 0.25;
  const horasMontagem = totalBarras * horasPorBarra + totalHubs * 0.15 + 12; // fundação base
  const dias = Math.ceil(horasMontagem / (3 * 8));

  const wrap = el('div');
  wrap.appendChild(el('div', { class: 'memorial', style: { fontSize: '13.5px' } }, [
    el('p', {}, [
      'Estimativa: ', el('strong', {}, horasMontagem.toFixed(0) + ' homem-hora'),
      ' (= ' + totalBarras + ' barras × ' + horasPorBarra + ' h + ' + totalHubs + ' hubs × 0,15 h + 12 h de fundação base). ',
      'Equipe de 3 pessoas trabalhando 8 h/dia → ', el('strong', {}, dias + ' dias úteis'),
      ', distribuídos como abaixo:',
    ]),
  ]));
  const sched = el('div', { class: 'schedule' });
  for (const t of tasks) {
    sched.appendChild(el('div', { class: 'schedule-day' }, t.day));
    const task = el('div', { class: 'schedule-task' }, [
      el('strong', {}, t.title),
      el('ul', {}, t.tasks.map((x) => el('li', {}, x))),
    ]);
    sched.appendChild(task);
  }
  wrap.appendChild(sched);
  return wrap;
}

function countBaseHubs(dome) {
  const r = dome.diameter / 2;
  const minY = Math.min(...[...dome.used].map((i) => dome.verts[i][2] * r));
  return dome.hubs.filter((h) => Math.abs(h.pos[2]*r - minY) < 0.05).length;
}

function buildBudget(dome, state, data, api) {
  const material   = data.STRUCTURE_MATERIALS.find((m) => m.id === state.sistemas.estrutura);
  const connector  = data.HUB_CONNECTORS.find((m) => m.id === state.sistemas.conector);
  const covering   = data.COVERINGS.find((m) => m.id === state.sistemas.cobertura);
  const foundation = data.FOUNDATIONS.find((m) => m.id === state.sistemas.fundacao);
  const piso       = data.FLOOR_SYSTEMS.find((m) => m.id === state.sistemas.piso);
  const water      = data.WATER_SYSTEMS.find((m) => m.id === state.sistemas.agua);
  const energy     = data.ENERGY_SYSTEMS.find((m) => m.id === state.sistemas.energia);

  const price = api.helpers.pricePerStruct(material, dome.totalLinear);
  const valencias = dome.edges.length * 2;
  const baseHubs = countBaseHubs(dome);
  const aberturasCusto = computeAberturasCusto(state.aberturas, data.OPENING_TYPES);
  const pisoArea = Math.PI * (dome.diameter / 2) ** 2;
  const pisoCusto = piso ? piso.precoPorM2 * pisoArea * 1.08 : 0;
  // Riser wall: estimativa 65 BRL/m² × área lateral
  const riserCusto = state.riser?.ativa
    ? state.riser.altura * 2 * Math.PI * dome.footRadius * 95
    : 0;

  const struct = price.custo;
  const conn = valencias * connector.precoPorValencia;
  const cover = dome.totalArea * 1.12 * covering.precoPorM2;
  const fund = baseHubs * foundation.custoBase;
  const total = struct + conn + cover + fund + pisoCusto + riserCusto + water.custo + energy.custo + aberturasCusto;

  const dom = el('div');
  dom.appendChild(el('div', { class: 'budget' }, [
    budgetRow(
      'estrutura', material.nome,
      [
        `${dome.totalLinear.toFixed(1)} m necessários + ${(material.desperdicio*100).toFixed(0)}% desperdício = ${(dome.totalLinear*(1+material.desperdicio)).toFixed(1)} m`,
        `${price.bars} × barras ${material.comprimentoComercial} m = ${price.linearComprado} m × ${fmt.brl(material.precoLinear)}/m`,
      ],
      struct,
    ),
    budgetRow(
      'conectores', connector.nome,
      [
        `${dome.edges.length} barras × 2 pontas = ${valencias} encaixes`,
        `${valencias} × ${fmt.brl(connector.precoPorValencia)}/encaixe`,
      ],
      conn,
    ),
    budgetRow(
      'cobertura', covering.nome,
      [
        `${dome.totalArea.toFixed(1)} m² da casca × 1,12 (sobra emendas)= ${(dome.totalArea*1.12).toFixed(1)} m²`,
        `× ${fmt.brl(covering.precoPorM2)}/m²`,
      ],
      cover,
    ),
    piso ? budgetRow(
      'piso', piso.nome,
      [
        `${pisoArea.toFixed(1)} m² × 1,08 (sobra) = ${(pisoArea*1.08).toFixed(1)} m²`,
        `× ${fmt.brl(piso.precoPorM2)}/m²`,
      ],
      pisoCusto,
    ) : null,
    state.riser?.ativa ? budgetRow(
      'riser wall', `parede ${state.riser.altura.toFixed(2)}m`,
      [
        `perímetro ${(2 * Math.PI * dome.footRadius).toFixed(2)} m × altura ${state.riser.altura.toFixed(2)} m`,
        `× R$ 95/m² (eucalipto tratado 25mm + selo)`,
      ],
      riserCusto,
    ) : null,
    budgetRow(
      'fundação', foundation.nome,
      [
        `${baseHubs} pontos × ${fmt.brl(foundation.custoBase)}/ponto`,
      ],
      fund,
    ),
    budgetRow('água + esgoto', water.nome, [water.nota], water.custo),
    budgetRow('energia', energy.nome, [energy.nota], energy.custo),
    aberturasCusto > 0 ? budgetRow(
      'aberturas',
      'portas + janelas + cúpula',
      ['soma das aberturas escolhidas na etapa 3'],
      aberturasCusto,
    ) : null,
    el('div', { class: 'budget-total' }, [
      el('div', {}, 'Total estimado'),
      el('div', {}, fmt.brl(total)),
    ]),
    el('div', { class: 'hint', style: { marginTop: '8px' } },
      `≈ ${fmt.brl(total / dome.totalArea)}/m² de casca · ${fmt.brl(total / (Math.PI*(dome.diameter/2)**2))}/m² de piso · sem mão de obra terceirizada · preços com fontes na seção 12.`),
  ]));
  return { dom, total };
}

function budgetRow(cat, name, calcs, val) {
  return el('div', { class: 'budget-row' }, [
    el('div', { class: 'budget-cat' }, cat),
    el('div', { class: 'budget-detail' }, [
      el('strong', {}, name),
      ...calcs.map((c) => el('span', { class: 'calc' }, c)),
    ]),
    el('div', { class: 'budget-val' }, fmt.brl(val)),
  ]);
}

function computeAberturasCusto(ab, OP) {
  let s = 0;
  if (ab.porta_principal) s += OP.porta_principal.custo;
  if (ab.porta_emergencia) s += OP.porta_emergencia.custo;
  s += (ab.janelas_basc || 0) * OP.janela_basculante.custo;
  s += (ab.janelas_redondas || 0) * OP.janela_redonda.custo;
  if (ab.cupula_zenital) s += OP.cupula_zenital.custo;
  s += (ab.abertura_ventilacao || 0) * OP.abertura_ventilacao.custo;
  return s;
}

function renderFontes(items) {
  const out = el('div', { class: 'cite-list' });
  let n = 1;
  for (const item of items) {
    if (!item || !item.fontes) continue;
    for (const f of item.fontes) {
      out.appendChild(el('div', {}, [
        '[', String(n++), '] ',
        item.nome ? el('strong', {}, item.nome + ' — ') : '',
        el('a', { href: f.url, target: '_blank', rel: 'noopener' }, f.label),
        f.preco ? ' · ' + f.preco : '',
        f.data ? ` (${f.data})` : '',
        f.observ ? el('span', { style: { color: 'var(--ink-soft)' } }, ' · ' + f.observ) : '',
      ]));
    }
  }
  out.appendChild(el('div', { style: { marginTop: '14px', color: 'var(--ink-soft)' } }, [
    el('em', {}, 'Aviso: '),
    'preços flutuam regionalmente. Use as URLs como referência e cote localmente. O gerador foi calibrado com dados maio/2026 do varejo brasileiro.',
  ]));
  return out;
}

function renderMemorial(dome, state, data, totalBudget, material, connector, covering, foundation) {
  const cenario = data.USE_SCENARIOS.find((s) => s.id === state.programa.cenario);
  const clima = data.CLIMATE_ZONES.find((z) => z.id === state.programa.clima);
  return el('div', { class: 'memorial' }, [
    el('p', {}, [
      'Trata-se de domo geodésico de ',
      el('em', {}, `${state.forma.freq}V ${truncLabel(state.forma.truncamento)}`),
      `, diâmetro ${fmt.m(dome.diameter)}, altura interna ${fmt.m(dome.height)}, área de casca ${fmt.m2(dome.totalArea)} e área de piso ${fmt.m2(Math.PI*(dome.diameter/2)**2)}. `,
      `Destinado a ${cenario?.nome.toLowerCase() || 'uso geral'} para ${state.programa.capacidade} pessoa(s), implantado em ${clima?.label.toLowerCase() || 'zona climática a definir'}.`,
    ]),
    el('p', {}, [
      `A estrutura é composta por ${dome.edges.length} barras de ${material.nome.toLowerCase()} (${material.diametro ? 'Ø ' + material.diametro + ' mm' : 'seção ' + material.secao}), `,
      `agrupadas em ${dome.struts.length} comprimentos diferentes (chord factors A–${dome.struts[dome.struts.length-1].label}). `,
      `Total linear: ${dome.totalLinear.toFixed(1)} m. Conexão nos ${[...dome.used].length} nós via ${connector.nome.toLowerCase()}.`,
    ]),
    el('p', {}, [
      `A casca externa será impermeabilizada com ${covering.nome.toLowerCase()} (${fmt.m2(dome.totalArea * 1.12)} considerando emendas), `,
      state.aberturas.cupula_zenital ? 'com cúpula zenital para ventilação natural por efeito chaminé. ' : '',
      `Aberturas: ${countOpenings(state.aberturas)} no total, com porta principal voltada para ${orientName(state.aberturas.orientacaoPorta || 90)}.`,
    ]),
    el('p', {}, [
      `Fundação: ${foundation.nome.toLowerCase()} em ${countBaseHubs(dome)} pontos do anel inferior, círculo de raio ${fmt.m(dome.footRadius)}. `,
      `Investimento total estimado: ${fmt.brl(totalBudget)} (~${fmt.brl(totalBudget / dome.totalArea)}/m² de casca), conforme cotações da seção 11 e fontes da seção 12.`,
    ]),
    el('p', {}, [
      el('em', {}, 'Observações de obra: '),
      'tolerância de corte ± 1 mm. ',
      material.id === 'eucalipto_rolico' ? 'Exigir certificado de tratamento autoclave CCA conforme NBR 9480. ' : '',
      material.id.startsWith('bambu') ? 'Bambu tratado por imersão em bórax + ácido bórico (12% m/m, 7 dias) ou autoclave. ' : '',
      state.aberturas.porta_emergencia ? 'Saída de emergência oposta à porta principal conforme NBR 9077. ' : '',
      'Verificar prumo e nível a cada anel concluído. Não escalar a casca antes de fechar toda a malha.',
    ]),
  ]);
}

function countOpenings(ab) {
  return (ab.porta_principal ? 1 : 0) + (ab.porta_emergencia ? 1 : 0)
    + (ab.janelas_basc || 0) + (ab.janelas_redondas || 0)
    + (ab.cupula_zenital ? 1 : 0) + (ab.abertura_ventilacao || 0);
}

function truncLabel(v) {
  if (v === 0.5) return '½ esfera';
  if (v === 0.625) return '⅝ domo';
  if (v === 0.75) return '¾ domo';
  return 'esfera completa';
}
function orientName(d) {
  const dirs = ['N','NE','L','SE','S','SO','O','NO'];
  return dirs[Math.round(((d % 360) / 45)) % 8];
}

function exportJSON(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dome-projeto.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
