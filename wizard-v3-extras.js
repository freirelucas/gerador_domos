// wizard-v3-extras.js — Seções extras do dossiê para v3
// 17. Cargas vento + neve por região
// 18. Lista de compras agrupada por loja
// 19. Diário de obra com checklist persistente

import { REGIOES, LOJAS, cargaTotalDomo, categoriaParaLoja } from './regiao-cargas.js';
import { el, FMT as fmt } from './dom-helpers.js';

export function appendDossieExtras(wrap, api) {
  const { state, data } = api;
  const dome = api.getDome();

  // Inserir entradas na TOC existente
  const toc = wrap.querySelector('.dossie-toc');
  if (toc) {
    toc.appendChild(el('a', { href: '#s-origem' }, '16b · origem'));
    toc.appendChild(el('a', { href: '#s-cargas' }, '17 · vento + neve'));
    toc.appendChild(el('a', { href: '#s-lojas' }, '18 · lista por loja'));
    toc.appendChild(el('a', { href: '#s-diario' }, '19 · diário de obra'));
  }

  // ─── 16b · Origem (timeline histórica) ──────────────────────────────
  wrap.appendChild(renderOrigemSheet());

  // ─── 17 · Cargas vento + neve por região ─────────────────────────────
  wrap.appendChild(renderCargasSheet(state, dome));

  // ─── 18 · Lista de compras por loja ──────────────────────────────────
  wrap.appendChild(renderLojasSheet(state, dome, data, api));

  // ─── 19 · Diário de obra ─────────────────────────────────────────────
  wrap.appendChild(renderDiarioSheet(state, dome, data, api));
}

// ─── "Por que um domo?" — benefícios do guia Maron 2018 ──────────────
export function appendStep1Benefits(wrap, api) {
  const card = el('div', {
    style: {
      marginTop: '36px',
      padding: '28px 30px',
      border: '1px solid var(--ink)',
      background: 'var(--paper-soft)',
    },
  });

  card.appendChild(el('div', {
    style: {
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: '10.5px',
      letterSpacing: '0.28em',
      textTransform: 'uppercase',
      color: 'var(--ocre)',
      marginBottom: '14px',
    },
  }, '↳ por que um domo? · benefícios estruturais documentados'));

  card.appendChild(el('h3', {
    style: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: '34px',
      fontWeight: '500',
      lineHeight: '1.05',
      color: 'var(--ink)',
      marginBottom: '20px',
      letterSpacing: '-0.015em',
      maxWidth: '24ch',
    },
    html: 'A <em style="color:var(--ocre);">forma mais forte, leve e eficiente</em> de encerrar espaço',
  }));

  const benefits = [
    {
      icon: '◯', n: '30%', unit: 'economia',
      title: 'Homeostase térmica',
      desc: 'Calor se distribui uniforme; até 30% menos com aquecimento/resfriamento.',
    },
    {
      icon: '◊', n: '100%', unit: 'vão livre',
      title: 'Sem colunas internas',
      desc: 'Maior vão livre por unidade de material. Layout sem restrição.',
    },
    {
      icon: '▽', n: '+100', unit: 'km/h',
      title: 'Resistência ao vento',
      desc: 'Forma esférica distribui cargas em todas as direções. Polo Sul, Patagônia.',
    },
    {
      icon: '◐', n: '300k', unit: 'mundo',
      title: 'História provada',
      desc: 'Construções desde 1922 (Bauersfeld/Zeiss). Hoje há mais de 300 mil em todo o mundo.',
    },
    {
      icon: '◌', n: '+30%', unit: 'mais rápido',
      title: 'Construção rápida e limpa',
      desc: 'Fabricação fora do canteiro, pouca cimentação, gera pouco resíduo, transportável.',
    },
    {
      icon: '◉', n: '◉', unit: 'útero',
      title: 'Acústica e acolhimento',
      desc: 'Reverberação excelente. Sensação de aconchego pelo formato esférico.',
    },
  ];

  const grid = el('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '14px',
    },
  });

  for (const b of benefits) {
    grid.appendChild(el('div', {
      style: {
        padding: '16px 18px',
        background: 'var(--paper)',
        border: '1px solid var(--ink-faint)',
      },
    }, [
      el('div', {
        style: {
          display: 'flex',
          alignItems: 'baseline',
          gap: '10px',
          marginBottom: '6px',
        },
      }, [
        el('span', {
          style: {
            fontSize: '20px',
            color: 'var(--ocre)',
            lineHeight: '1',
          },
        }, b.icon),
        el('div', {
          style: {
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '28px',
            fontWeight: '500',
            color: 'var(--ocre)',
            lineHeight: '1',
          },
        }, b.n),
        el('span', {
          style: {
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '9.5px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--ink-soft)',
          },
        }, b.unit),
      ]),
      el('div', {
        style: {
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '11px',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--ink)',
          fontWeight: '500',
          marginBottom: '4px',
        },
      }, b.title),
      el('div', {
        style: {
          fontSize: '12.5px',
          lineHeight: '1.55',
          color: 'var(--ink-soft)',
        },
      }, b.desc),
    ]));
  }
  card.appendChild(grid);

  card.appendChild(el('div', {
    style: {
      marginTop: '18px',
      paddingTop: '14px',
      borderTop: '1px dashed var(--ink-faint)',
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: '10.5px',
      color: 'var(--ink-soft)',
      fontStyle: 'italic',
    },
    html: 'fonte: <a href="https://www.amerindia.eco.br" target="_blank" rel="noopener" style="color:var(--blueprint);text-decoration:none;border-bottom:1px dashed currentColor;">Maron, J. <em>Cúpulas Geodésicas — Guia para Iniciantes</em>. Ameríndia, 2018, p. 54-55</a> · Instituto Americano de Arquitetura',
  }));

  wrap.appendChild(card);
}

// ─── 16b · TIMELINE DE ORIGEM ────────────────────────────────────────────
function renderOrigemSheet() {
  const sheet = el('section', { class: 'sheet', id: 's-origem' });
  sheet.appendChild(el('div', { class: 'sheet-head' }, [
    el('div', { class: 'sheet-tag' }, '16b'),
    el('h2', { html: '<em>Origem</em> · timeline dos domos geodésicos' }),
    el('div', { class: 'sheet-meta' }, '1922 → hoje · 300.000+ no mundo'),
  ]));

  sheet.appendChild(el('div', { class: 'memorial', style: { fontSize: '13.5px' } }, [
    el('p', { html: `
      A maioria das pessoas atribui a invenção da cúpula geodésica a <strong>Buckminster Fuller</strong>.
      Erro histórico comum: Fuller batizou e patenteou, mas
      <strong>Walter Bauersfeld já tinha construído uma em 1922</strong>, 26 anos antes.
      Aqui a linha do tempo correta.
    ` }),
  ]));

  const events = [
    {
      year: '~400 a.C.',
      title: 'Platão descreve o icosaedro',
      desc: 'Em seu tratado sobre os Sólidos Platônicos. Não inventou — apenas registrou um padrão da natureza.',
    },
    {
      year: '1922',
      title: 'Bauersfeld / Zeiss · Jena, Alemanha',
      desc: 'Primeira cúpula geodésica documentada. 16 m de diâmetro, 3.480 barras de metal, frequência 16, cobertura em ferrocimento — também a primeira cúpula de ferrocimento do mundo. Construída para abrigar o "Modelo I", o primeiro projetor planetário do mundo.',
      destaque: true,
    },
    {
      year: '1926',
      title: '"A Maravilha de Jena" · Zeiss',
      desc: 'Segunda cúpula, 25 m de diâmetro. Existe até hoje — o planetário mais antigo do mundo.',
    },
    {
      year: '1948-49',
      title: 'Fuller batiza "Geodésica"',
      desc: 'Buckminster Fuller no Black Mountain College, com Kenneth Snelson, cunha o termo "geodésica" e desenvolve sistematização matemática.',
    },
    {
      year: '1953',
      title: 'Primeira em escala industrial',
      desc: '28,3 m de alumínio para a Ford Motors. Marketing pessoal de Fuller atrai milhares de seguidores.',
    },
    {
      year: '1954',
      title: 'Fuller obtém patente US 2.682.235',
      desc: 'É creditado pela popularização — patente americana de 29 de junho de 1954.',
    },
    {
      year: '1965-70',
      title: 'Contracultura · Drop City',
      desc: 'Comunidade hippie no Colorado constrói domos com latarias de carro e vidro de para-brisa. Documentário "Drop City" registra o movimento DIY.',
    },
    {
      year: '1967',
      title: 'Biosfera Montreal',
      desc: 'Primeiro mega-domo do mundo: 76 m de diâmetro, 61 m de altura. Expo Mundial.',
    },
    {
      year: '1975',
      title: 'Domo no Polo Sul',
      desc: 'Construído para resistir a neve extrema e ventos antárcticos. Prova de resistência da forma.',
    },
    {
      year: '1985',
      title: 'Descoberta do Buckminsterfullereno (C60)',
      desc: 'Molécula de carbono com padrão geodésico 2V. Prêmio Nobel de Química 1996. Prova que a geometria é um padrão da natureza.',
    },
    {
      year: '2001',
      title: 'EcoCamp Patagônia · Chile',
      desc: 'Primeiro hotel 100% sustentável em domos. Desenho inspirado nas habitações Kawéskar — resistente a ventos > 100 km/h.',
    },
    {
      year: '~2010s',
      title: 'LILD/PUC-Rio · vigas recíprocas',
      desc: 'Pesquisadores brasileiros desenvolvem o método "giro" — domos sem conector central, com barras se apoiando em rotação. Contribuição brasileira para a literatura geodésica.',
    },
    {
      year: '2018',
      title: 'Maron / Ameríndia · guia em português',
      desc: 'Jorge Maron publica "Cúpulas Geodésicas — Guia para Iniciantes" — primeira sistematização DIY em português brasileiro. 70 páginas, licença Creative Commons. Fonte desta auditoria.',
      destaque: true,
    },
    {
      year: 'hoje',
      title: '300.000+ domos no mundo',
      desc: 'De Norte a Sul, de Leste a Oeste — incluindo áreas remotas como Polos. Estações de radar, observatórios, planetários, residências, estufas, hospedagens. Este app: o domo nº 300.001 espera você.',
    },
  ];

  const timeline = el('div', { style: { marginTop: '24px' } });
  for (const e of events) {
    const row = el('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: '120px 1fr',
        gap: '20px',
        padding: '14px 0',
        borderBottom: '1px dashed var(--ink-faint)',
      },
    }, [
      el('div', {
        style: {
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontSize: e.destaque ? '28px' : '22px',
          color: e.destaque ? 'var(--ocre)' : 'var(--ink-soft)',
          textAlign: 'right',
          lineHeight: '1.05',
        },
      }, e.year),
      el('div', { style: { borderLeft: e.destaque ? '2px solid var(--ocre)' : '2px solid var(--ink-faint)', paddingLeft: '18px' } }, [
        el('div', {
          style: {
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11.5px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: e.destaque ? 'var(--ocre)' : 'var(--ink)',
            fontWeight: '500',
            marginBottom: '6px',
          },
        }, e.title),
        el('div', { style: { fontSize: '13px', lineHeight: '1.6', color: 'var(--ink)' } }, e.desc),
      ]),
    ]);
    timeline.appendChild(row);
  }
  sheet.appendChild(timeline);

  sheet.appendChild(el('div', {
    class: 'cite-list',
    style: { marginTop: '20px' },
    html: `Fontes: <a href="https://www.zeiss.com/planetariums/int/about-us/history.html" target="_blank" rel="noopener">Zeiss · história</a> · 
    <a href="https://www.bfi.org" target="_blank" rel="noopener">Buckminster Fuller Institute</a> · 
    <a href="https://www.amerindia.eco.br" target="_blank" rel="noopener">Maron 2018</a> · 
    <a href="http://www.dropcitydoc.com" target="_blank" rel="noopener">Drop City documentário</a>`,
  }));

  return sheet;
}

// ─── 17 · CARGAS ─────────────────────────────────────────────────────────
function renderCargasSheet(state, dome) {
  const regiao = REGIOES.find((r) => r.id === state.v3.regiao) || REGIOES[0];
  const alturaTotal = dome.height + (state.riser?.ativa ? state.riser.altura : 0);
  const cargas = cargaTotalDomo(regiao, dome, alturaTotal);

  const sheet = el('section', { class: 'sheet', id: 's-cargas' });
  sheet.appendChild(el('div', { class: 'sheet-head' }, [
    el('div', { class: 'sheet-tag' }, '17'),
    el('h2', { html: 'Cargas <em>· vento e neve</em>' }),
    el('div', { class: 'sheet-meta' }, `NBR 6123 · NBR 14762 · ${regiao.label}`),
  ]));

  // Selector de região
  const selector = el('div', { class: 'regiao-selector' });
  for (const r of REGIOES) {
    selector.appendChild(el('button', {
      class: state.v3.regiao === r.id ? 'is-active' : '',
      onclick: () => {
        state.v3.regiao = r.id;
        // Re-render apenas esta sheet
        const newSheet = renderCargasSheet(state, dome);
        sheet.replaceWith(newSheet);
        // Salvar
        try { localStorage.setItem('dome_wizard_state_v3', JSON.stringify(state)); } catch {}
      },
    }, r.label));
  }
  sheet.appendChild(selector);

  // Card de região
  sheet.appendChild(el('div', { class: 'regiao-card' }, [
    el('div', { class: 'regiao-info' }, [
      el('h4', {}, regiao.label),
      el('div', { class: 'cidades' }, regiao.cidades.join(' · ')),
      el('div', { class: 'observ' }, regiao.observ),
    ]),
    metricCard('vento V₀ (NBR 6123)', regiao.vento_v0.toFixed(0), 'm/s',
      `Velocidade básica a 10 m, T = 50 anos`),
    metricCard('pressão dinâmica q', cargas.pressao.q_kgm2.toFixed(0), 'kgf/m²',
      `q = 0,613 × Vk² · Vk = V₀ × S₁ × S₂ × S₃`),
    metricCard('força de arrasto F', (cargas.F_arrasto_N/9.81).toFixed(0), 'kgf · total',
      `F = Cₐ × q × A_proj · Cₐ = ${cargas.Ca} (domo geodésico ⅝)`),
    metricCard('tração por hub do anel', cargas.F_por_hub_kgf.toFixed(0), 'kgf cada',
      `distribuído em metade dos hubs base (lado a barlavento)`),
    metricCard('carga de neve', regiao.neve_kgm2.toFixed(0), 'kgf/m²',
      regiao.neve_kgm2 > 0 ? `total estático: ${fmt.kg(cargas.F_neve_kg)} sobre o piso projetado` : 'sem neve nesta região'),
    metricCard('chuva máxima 24h', regiao.chuva_mm_dia.toFixed(0), 'mm/dia',
      `dimensiona escoamento das emendas da cobertura`),
  ]));

  // Diagrama (SVG)
  sheet.appendChild(el('div', { class: 'cargas-diagram' }, [
    renderCargaDiagram(cargas, dome, alturaTotal),
    el('div', {}, [
      el('div', { class: 'memorial', style: { fontSize: '13px' } }, [
        el('p', {}, [
          el('strong', {}, 'Leitura: '),
          'a maior carga horizontal vem do vento de ',
          el('strong', {}, regiao.vento_v0 + ' m/s'),
          ' (= ' + Math.round(regiao.vento_v0 * 3.6) + ' km/h). Cada hub do anel inferior do lado a barlavento ',
          'precisa resistir a uma tração estimada de ',
          el('strong', {}, cargas.F_por_hub_kgf.toFixed(0) + ' kgf'),
          ' (≈ ' + Math.round(cargas.F_por_hub_kgf * 9.81) + ' N) — equivalente a ' + (cargas.F_por_hub_kgf / 80).toFixed(1) + ' adultos pendurados.',
        ]),
        el('p', {}, [
          el('strong', {}, 'Ancoragem recomendada: '),
          recomendarAncoragem(cargas.F_por_hub_kgf),
        ]),
        regiao.neve_kgm2 > 0 ? el('p', {}, [
          el('strong', {}, 'Neve: '),
          'em ' + regiao.label + ', considere inclinação mínima de 22° para que gelo escorra; ',
          'cargas pontuais em galhos só se houver árvores acima do domo.',
        ]) : null,
      ]),
    ]),
  ]));

  // Memorial técnico
  sheet.appendChild(el('div', { class: 'memorial', style: { marginTop: '20px', fontSize: '13.5px' } }, [
    el('p', {}, [
      el('em', {}, '⚠ verifique com um engenheiro: '),
      'os números acima são estimativas conservadoras baseadas em NBR 6123 reduzida (coeficientes S₁ = 1, S₂ = 0,86, S₃ = 1) e Cₐ = 0,65 para domo geodésico ⅝. ',
      'Para uso comercial, hospedagem ou estrutura > 8 m de diâmetro, contrate ',
      el('strong', {}, 'cálculo estrutural detalhado'),
      ' de engenheiro civil com ART. Esta estimativa serve para dimensionar a ancoragem inicial e validar a escolha do material estrutural.',
    ]),
  ]));

  return sheet;
}

function metricCard(label, value, unit, raciocinio) {
  return el('div', { class: 'regiao-metric' }, [
    el('div', { class: 'label' }, label),
    el('div', { class: 'value' }, value),
    el('div', { class: 'unit' }, unit),
    el('div', { class: 'raciocinio' }, raciocinio),
  ]);
}

function recomendarAncoragem(kgf) {
  if (kgf < 80) return 'pedra seca ou bloco enterrado (60–80 kgf por ponto) já basta. Boa para estufas e quiosques.';
  if (kgf < 250) return 'chumbador parabolt M10 em sapata de concreto 30×30×40 cm (resistência ≈ 250 kgf por chumbador).';
  if (kgf < 600) return 'chumbador M12 em estaca helicoidal ou sapata 40×40×60 cm — resistência ≈ 600 kgf. Verificar arrancamento do solo.';
  return 'cálculo estrutural obrigatório. Considere fundação corrida em concreto armado com ancoragem química M16+ ou estaca helicoidal certificada.';
}

function renderCargaDiagram(cargas, dome, alturaTotal) {
  const NS = 'http://www.w3.org/2000/svg';
  const W = 280, H = 220;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  // Chão
  const ground = document.createElementNS(NS, 'line');
  ground.setAttribute('x1', 20); ground.setAttribute('x2', W-20);
  ground.setAttribute('y1', H - 30); ground.setAttribute('y2', H - 30);
  ground.setAttribute('stroke', 'currentColor'); ground.setAttribute('stroke-width', '1.4');
  svg.appendChild(ground);
  // Hachura chão
  for (let i = 20; i < W-20; i += 8) {
    const ln = document.createElementNS(NS, 'line');
    ln.setAttribute('x1', i); ln.setAttribute('y1', H - 30);
    ln.setAttribute('x2', i - 5); ln.setAttribute('y2', H - 22);
    ln.setAttribute('stroke', 'currentColor'); ln.setAttribute('stroke-width', '0.5'); ln.setAttribute('opacity', '0.6');
    svg.appendChild(ln);
  }

  // Domo (semi-elipse)
  const cx = W/2;
  const baseY = H - 30;
  const rx = 90;
  const ry = 100;
  const path = document.createElementNS(NS, 'path');
  path.setAttribute('d', `M ${cx-rx} ${baseY} A ${rx} ${ry} 0 0 1 ${cx+rx} ${baseY}`);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.4');
  svg.appendChild(path);
  // Malha geodésica simplificada
  for (let i = 0; i < 5; i++) {
    const ang = -Math.PI/2 + (i-2) * 0.35;
    const x = cx + Math.cos(ang) * rx;
    const y = baseY + Math.sin(ang) * ry;
    const ln = document.createElementNS(NS, 'line');
    ln.setAttribute('x1', cx); ln.setAttribute('y1', baseY);
    ln.setAttribute('x2', x); ln.setAttribute('y2', y);
    ln.setAttribute('stroke', 'currentColor'); ln.setAttribute('stroke-width', '0.4'); ln.setAttribute('opacity', '0.4');
    svg.appendChild(ln);
  }

  // Setas de vento (da esquerda)
  for (let i = 0; i < 4; i++) {
    const y = baseY - 20 - i*30;
    const len = 30 + i*4;
    const arrow = document.createElementNS(NS, 'path');
    arrow.setAttribute('d', `M 6 ${y} L ${6+len} ${y} M ${len} ${y-3} L ${6+len} ${y} L ${len} ${y+3}`);
    arrow.setAttribute('stroke', '#5ee0ff');
    arrow.setAttribute('stroke-width', '1.5');
    arrow.setAttribute('fill', 'none');
    svg.appendChild(arrow);
  }
  // Label vento
  const txt = document.createElementNS(NS, 'text');
  txt.setAttribute('x', 6); txt.setAttribute('y', 22);
  txt.setAttribute('font-family', 'IBM Plex Mono, monospace');
  txt.setAttribute('font-size', '9');
  txt.setAttribute('fill', '#5ee0ff');
  txt.textContent = 'VENTO →';
  svg.appendChild(txt);

  // Setas de tração nos hubs (verticais para baixo)
  const hubXs = [cx - rx + 10, cx - rx + 35, cx - rx + 60];
  for (const x of hubXs) {
    const arr = document.createElementNS(NS, 'path');
    arr.setAttribute('d', `M ${x} ${baseY - 4} L ${x} ${baseY + 14} M ${x-3} ${baseY+11} L ${x} ${baseY+14} L ${x+3} ${baseY+11}`);
    arr.setAttribute('stroke', '#c8141c');
    arr.setAttribute('stroke-width', '1.5');
    arr.setAttribute('fill', 'none');
    svg.appendChild(arr);
  }
  const txt2 = document.createElementNS(NS, 'text');
  txt2.setAttribute('x', cx - rx); txt2.setAttribute('y', H-5);
  txt2.setAttribute('font-family', 'IBM Plex Mono, monospace');
  txt2.setAttribute('font-size', '9');
  txt2.setAttribute('fill', '#c8141c');
  txt2.textContent = 'F_hub ↓';
  svg.appendChild(txt2);

  // Neve se houver
  if (cargas.F_neve_N > 0) {
    for (let i = 0; i < 6; i++) {
      const ang = -Math.PI/2 + (i-2.5) * 0.18;
      const x = cx + Math.cos(ang) * rx;
      const y = baseY + Math.sin(ang) * ry;
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', x); c.setAttribute('cy', y - 6);
      c.setAttribute('r', '2.5');
      c.setAttribute('fill', '#dde6f0');
      c.setAttribute('stroke', 'currentColor'); c.setAttribute('stroke-width', '0.4');
      svg.appendChild(c);
    }
  }

  // Cotagem altura
  const dim = document.createElementNS(NS, 'g');
  dim.innerHTML = `
    <line x1="${cx+rx+18}" y1="${baseY}" x2="${cx+rx+18}" y2="${baseY-ry}" stroke="currentColor" stroke-width="0.6"/>
    <line x1="${cx+rx+14}" y1="${baseY}" x2="${cx+rx+22}" y2="${baseY}" stroke="currentColor" stroke-width="0.6"/>
    <line x1="${cx+rx+14}" y1="${baseY-ry}" x2="${cx+rx+22}" y2="${baseY-ry}" stroke="currentColor" stroke-width="0.6"/>
    <text x="${cx+rx+24}" y="${baseY - ry/2 + 3}" font-family="IBM Plex Mono, monospace" font-size="9" fill="currentColor">${alturaTotal.toFixed(1)} m</text>
  `;
  svg.appendChild(dim);

  return svg;
}

// ─── 18 · LOJAS ──────────────────────────────────────────────────────────
function renderLojasSheet(state, dome, data, api) {
  const sheet = el('section', { class: 'sheet', id: 's-lojas' });
  sheet.appendChild(el('div', { class: 'sheet-head' }, [
    el('div', { class: 'sheet-tag' }, '18'),
    el('h2', { html: 'Lista de compras <em>· por loja</em>' }),
    el('div', { class: 'sheet-meta' }, 'agrupado por categoria de fornecedor'),
  ]));

  sheet.appendChild(el('div', { class: 'memorial', style: { fontSize: '13.5px' } }, [
    el('p', {}, [
      'Mesma cut list, mas organizada para você fazer a corrida pelas lojas em ',
      el('strong', {}, Object.keys(LOJAS).length + ' visitas separadas'),
      '. Imprima cada cartão e leve no carro — não vai esquecer nada.',
    ]),
  ]));

  // Montar itens por loja
  const material = data.STRUCTURE_MATERIALS.find((m) => m.id === state.sistemas.estrutura);
  const connector = data.HUB_CONNECTORS.find((m) => m.id === state.sistemas.conector);
  const covering = data.COVERINGS.find((m) => m.id === state.sistemas.cobertura);
  const piso = data.FLOOR_SYSTEMS.find((m) => m.id === state.sistemas.piso);
  const foundation = data.FOUNDATIONS.find((m) => m.id === state.sistemas.fundacao);
  const water = data.WATER_SYSTEMS.find((m) => m.id === state.sistemas.agua);
  const energy = data.ENERGY_SYSTEMS.find((m) => m.id === state.sistemas.energia);

  const groups = {};
  function add(loja, item) {
    if (!groups[loja]) groups[loja] = [];
    groups[loja].push(item);
  }

  // Estrutura
  const price = api.helpers.pricePerStruct(material, dome.totalLinear);
  add('serraria', {
    qty: `${price.bars}×`,
    desc: material.nome + ' · barras ' + material.comprimentoComercial + ' m',
    calc: `${dome.totalLinear.toFixed(1)} m + ${(material.desperdicio*100).toFixed(0)}% desp.`,
    price: price.custo,
  });

  // Conectores
  const valencias = dome.edges.length * 2;
  add('ferragem', {
    qty: `${valencias}×`,
    desc: connector.nome + ' · encaixes',
    calc: `${dome.edges.length} barras × 2 pontas`,
    price: valencias * connector.precoPorValencia,
  });

  // Cobertura
  const coberArea = dome.totalArea * 1.12;
  add('lonas', {
    qty: `${coberArea.toFixed(1)} m²`,
    desc: covering.nome + ' · cobertura',
    calc: `${dome.totalArea.toFixed(1)} m² × 1.12 emendas`,
    price: coberArea * covering.precoPorM2,
  });

  // Piso
  if (piso) {
    const pisoArea = Math.PI * (dome.diameter / 2) ** 2;
    const pisoArea2 = pisoArea * 1.08;
    add('obra', {
      qty: `${pisoArea2.toFixed(1)} m²`,
      desc: piso.nome + ' · piso interno',
      calc: `${pisoArea.toFixed(1)} m² × 1.08 sobra`,
      price: pisoArea2 * piso.precoPorM2,
    });
  }

  // Riser
  if (state.riser?.ativa) {
    const perimetro = 2 * Math.PI * dome.footRadius;
    const baseHubs = countBaseHubs(dome);
    add('serraria', {
      qty: `${baseHubs}×`,
      desc: `pranchas eucalipto 25 cm × ${(state.riser.altura*100).toFixed(0)} cm · riser wall`,
      calc: `${baseHubs} segmentos × ${fmt.m(2 * dome.footRadius * Math.sin(Math.PI / baseHubs))}`,
      price: perimetro * state.riser.altura * 95,
    });
  }

  // Fundação
  const baseHubsCount = countBaseHubs(dome);
  add('obra', {
    qty: `${baseHubsCount}×`,
    desc: foundation.nome + ' · pontos de fundação',
    calc: `${baseHubsCount} hubs × ` + fmt.brl(foundation.custoBase) + '/ponto',
    price: baseHubsCount * foundation.custoBase,
  });

  // Aberturas
  const ab = state.aberturas;
  if (ab.porta_principal) add('vidracaria', {
    qty: '1×', desc: 'porta principal 90×210 cm', calc: 'eucalipto + ferragem',
    price: data.OPENING_TYPES.porta_principal.custo,
  });
  if (ab.porta_emergencia) add('vidracaria', {
    qty: '1×', desc: 'porta de emergência (NBR 9077)', calc: '80×210 cm com barra antipânico',
    price: data.OPENING_TYPES.porta_emergencia.custo,
  });
  if (ab.janelas_basc > 0) add('vidracaria', {
    qty: `${ab.janelas_basc}×`, desc: 'janelas basculantes 80×60 cm',
    calc: 'alumínio + vidro 4 mm',
    price: ab.janelas_basc * data.OPENING_TYPES.janela_basculante.custo,
  });
  if (ab.janelas_redondas > 0) add('vidracaria', {
    qty: `${ab.janelas_redondas}×`, desc: 'janelas redondas Ø 60 cm', calc: 'olho-de-boi',
    price: ab.janelas_redondas * data.OPENING_TYPES.janela_redonda.custo,
  });
  if (ab.cupula_zenital) add('vidracaria', {
    qty: '1×', desc: 'cúpula zenital Ø 80 cm', calc: 'acrílico ou policarbonato',
    price: data.OPENING_TYPES.cupula_zenital.custo,
  });

  // Acessórios de aberturas (ferragem)
  const totalAberturas = (ab.porta_principal ? 1 : 0) + (ab.porta_emergencia ? 1 : 0) +
    (ab.janelas_basc || 0) + (ab.janelas_redondas || 0);
  if (totalAberturas > 0) add('ferragem', {
    qty: '1 kit', desc: 'parafusos, cantoneiras, vedação',
    calc: 'silicone, parabolt, fita PVC',
    price: 380,
  });

  // Água
  add('agua', {
    qty: '1×', desc: water.nome + ' · água + esgoto', calc: water.nota.split('·')[0].trim() || water.nota.slice(0, 40),
    price: water.custo,
  });

  // Energia
  add('solar', {
    qty: '1×', desc: energy.nome + ' · energia', calc: energy.nota.slice(0, 50) + '…',
    price: energy.custo,
  });

  // Ferramentas
  add('ferragem', {
    qty: '1 kit', desc: 'ferramentas DIY (ver seção 12)',
    calc: 'serra circular, parafusadeira, nível, esquadro',
    price: 1200,
  });

  // Render grid
  const grid = el('div', { class: 'lojas-grid' });
  for (const lojaId of Object.keys(LOJAS)) {
    const loja = LOJAS[lojaId];
    const items = groups[lojaId] || [];
    if (items.length === 0) continue;
    const total = items.reduce((a, x) => a + x.price, 0);
    const card = el('div', { class: 'loja-card' }, [
      el('div', { class: 'loja-head' }, [
        el('div', { class: 'loja-icon', style: { color: loja.cor } }, loja.icone),
        el('div', { class: 'loja-meta' }, [
          el('div', { class: 'loja-name' }, loja.nome),
          el('div', { class: 'loja-hint' }, `${items.length} ${items.length === 1 ? 'item' : 'itens'}`),
        ]),
        el('div', { class: 'loja-total' }, fmt.brl(total)),
      ]),
      el('div', { class: 'loja-items' },
        items.map((it) => el('div', { class: 'loja-item' }, [
          el('span', { class: 'qty' }, it.qty),
          el('span', { class: 'desc' }, [
            it.desc,
            el('span', { class: 'calc' }, it.calc),
          ]),
          el('span', { class: 'price' }, fmt.brl(it.price)),
        ])),
      ),
      el('div', { class: 'loja-foot' }, [
        '↗ pesquisar perto: ',
        el('a', {
          href: loja.pesquisa, target: '_blank', rel: 'noopener',
        }, 'Google Maps'),
      ]),
    ]);
    grid.appendChild(card);
  }
  sheet.appendChild(grid);

  return sheet;
}

// ─── 19 · DIÁRIO DE OBRA ─────────────────────────────────────────────────
function renderDiarioSheet(state, dome, data, api) {
  const totalBarras = dome.edges.length;
  const totalHubs = [...dome.used].length;

  const dias = [
    { id: 'd-7', name: 'D−7', title: 'Preparativo', tasks: [
      'Conferir terreno e nivelamento (variação máx. ±5 cm)',
      'Confirmar lista de materiais com fornecedor — usar lista por loja (seção 18)',
      'Imprimir cut list e desenhos de hubs',
      'Imunizar peças se aplicável (autoclave / bórax)',
    ]},
    { id: 'd-1', name: 'D−1', title: 'Recebimento', tasks: [
      'Receber e conferir todas as peças (tolerância ±1 mm)',
      'Separar por tipo (A, B, C…) — marcar com tinta da cor do tipo',
      'Pré-furar parafusos passantes se for o caso',
      'Conferir gabaritos de hubs',
    ]},
    { id: 'd1', name: 'D1', title: 'Fundação', tasks: [
      'Marcar circunferência de raio ' + fmt.m(dome.footRadius),
      `Marcar ${countBaseHubs(dome)} pontos de apoio (anel inferior)`,
      'Executar fundação: ' + (data.FOUNDATIONS.find((f) => f.id === state.sistemas.fundacao)?.nome || ''),
      'Aguardar cura mínima (24 h para concreto)',
    ]},
    { id: 'd2', name: 'D2', title: 'Anel inferior', tasks: [
      'Fixar hubs do anel inferior nos chumbadores',
      `Erguer e parafusar as ${dome.struts[0].count} barras do tipo A no anel inferior`,
      'Conferir prumo e nível geral',
      state.riser?.ativa ? 'Erguer riser wall (parede de elevação)' : null,
    ].filter(Boolean) },
    { id: 'd3', name: 'D3', title: 'Pré-montagem', tasks: [
      'Pré-montar pentágonos e hexágonos no chão',
      'Identificar cada módulo com a posição final',
      'Conferir cada módulo no gabarito antes de erguer',
    ]},
    { id: 'd4', name: 'D4–D5', title: 'Levantar a casca', tasks: [
      'Içar módulos com escora interna ou grua leve',
      'Fechar a malha do equador para o topo, parafusando hubs',
      totalBarras > 100
        ? 'Atenção: 3V+ exige 3+ pessoas e escora central até fechar a cúpula'
        : 'Em 2V, 2 pessoas resolvem com escada articulada',
      'Conferir esquadro: pentágono = 72°, hexágono = 60°',
    ]},
    { id: 'd6', name: 'D6', title: 'Aberturas', tasks: [
      'Marcar e cortar membranas onde irão portas/janelas',
      'Fixar batentes com cantoneiras de aço',
      state.aberturas.cupula_zenital ? 'Instalar cúpula zenital + selante de poliuretano' : null,
      state.aberturas.mosquiteiro ? 'Instalar mosquiteiro em todas as aberturas' : null,
    ].filter(Boolean) },
    { id: 'd7', name: 'D7–D8', title: 'Cobertura externa', tasks: [
      `Fixar a cobertura (${data.COVERINGS.find((c) => c.id === state.sistemas.cobertura)?.nome || ''})`,
      'Selar emendas com fita ou solda quente (lonas)',
      'Verificar escoamento (declividade ≥ 5%) em todos os pontos',
      'Teste de estanqueidade: mangueira por 15 min em cada quadrante',
    ]},
    { id: 'd9', name: 'D9', title: 'Acabamentos', tasks: [
      'Lixar pontas de barras expostas',
      'Aplicar stain UV + verniz nas peças de madeira',
      'Reapertar parafusos críticos',
    ]},
    { id: 'd10', name: 'D10', title: 'Sistemas + entrega', tasks: [
      'Instalar cisterna e tubulação',
      'Instalar painéis solares / conexão à rede',
      'Vistoria final e entrega ao usuário',
      'Foto do antes/depois para o portfólio 📷',
    ]},
  ];

  // Carregar checks do estado
  const checks = state.v3.diarioChecks || {};
  const notes = state.v3.diarioNotes || {};

  // Stats
  const allTasksCount = dias.reduce((a, d) => a + d.tasks.length, 0);
  const doneTasksCount = dias.reduce((a, d) => a + d.tasks.filter((_, i) => checks[d.id + ':' + i]).length, 0);
  const daysWithProgress = dias.filter((d) => d.tasks.some((_, i) => checks[d.id + ':' + i])).length;
  const daysComplete = dias.filter((d) => d.tasks.every((_, i) => checks[d.id + ':' + i])).length;
  const pct = allTasksCount > 0 ? Math.round((doneTasksCount / allTasksCount) * 100) : 0;

  const sheet = el('section', { class: 'sheet', id: 's-diario' });
  sheet.appendChild(el('div', { class: 'sheet-head' }, [
    el('div', { class: 'sheet-tag' }, '19'),
    el('h2', { html: '<em>Diário</em> de obra · checklist' }),
    el('div', { class: 'sheet-meta' }, 'progresso salvo no navegador'),
  ]));

  sheet.appendChild(el('div', { class: 'memorial', style: { fontSize: '13.5px' } }, [
    el('p', {}, [
      'Versão interativa do plano de montagem (seção 13). ',
      'Marque as caixas conforme completa, anote notas de obra em cada dia. ',
      el('strong', {}, 'Tudo salvo no seu navegador'),
      ' — abra a página em qualquer dispositivo do mesmo login e continue de onde parou. ',
      'Imprima a página inteira para levar no canteiro.',
    ]),
  ]));

  // Overview
  sheet.appendChild(el('div', { class: 'diario-overview' }, [
    el('div', { class: 'ov' }, [
      el('div', { class: 'ov-num' }, pct + '%'),
      el('div', { class: 'ov-label' }, 'progresso'),
    ]),
    el('div', { class: 'ov' }, [
      el('div', { class: 'ov-num' }, doneTasksCount + '/' + allTasksCount),
      el('div', { class: 'ov-label' }, 'tarefas'),
    ]),
    el('div', { class: 'ov' }, [
      el('div', { class: 'ov-num' }, daysComplete + '/' + dias.length),
      el('div', { class: 'ov-label' }, 'dias completos'),
    ]),
    el('div', { class: 'ov' }, [
      el('div', { class: 'ov-num' }, (dias.length - daysComplete) + ''),
      el('div', { class: 'ov-label' }, 'dias restantes'),
    ]),
  ]));

  const wrap = el('div', { class: 'diario' });

  for (const d of dias) {
    const doneInDay = d.tasks.filter((_, i) => checks[d.id + ':' + i]).length;
    const isDone = doneInDay === d.tasks.length;
    const dayEl = el('div', { class: 'diario-day' + (isDone ? ' is-done' : '') });

    dayEl.appendChild(el('div', { class: 'diario-day-head' }, [
      el('div', { class: 'diario-day-name' }, d.name),
      el('div', { class: 'diario-day-title' }, d.title),
      el('div', { class: 'diario-day-progress' }, [
        el('strong', {}, doneInDay + '/' + d.tasks.length), ' tarefas',
      ]),
      el('div', { class: 'diario-date' }, [
        el('input', {
          type: 'date',
          value: '',
          onchange: (e) => {
            state.v3.diarioNotes = state.v3.diarioNotes || {};
            state.v3.diarioNotes[d.id + ':date'] = e.target.value;
            saveDiario(state);
          },
        }),
      ]),
    ]));

    const tasksEl = el('div', { class: 'diario-tasks' });
    d.tasks.forEach((task, i) => {
      const key = d.id + ':' + i;
      const isChecked = !!checks[key];
      const taskEl = el('div', {
        class: 'diario-task' + (isChecked ? ' is-done' : ''),
        onclick: () => {
          state.v3.diarioChecks = state.v3.diarioChecks || {};
          state.v3.diarioChecks[key] = !state.v3.diarioChecks[key];
          saveDiario(state);
          // Re-render só esta sheet
          const newSheet = renderDiarioSheet(state, dome, data, api);
          sheet.replaceWith(newSheet);
        },
      }, [
        el('span', { class: 'diario-check' }),
        el('span', {}, task),
      ]);
      tasksEl.appendChild(taskEl);
    });
    dayEl.appendChild(tasksEl);

    // Notes
    const noteVal = notes[d.id] || '';
    dayEl.appendChild(el('div', { class: 'diario-notes' }, [
      el('label', {}, 'anotações deste dia'),
      el('textarea', {
        placeholder: 'O que aconteceu hoje? Pendências, surpresas, ajustes…',
        oninput: (e) => {
          state.v3.diarioNotes = state.v3.diarioNotes || {};
          state.v3.diarioNotes[d.id] = e.target.value;
          saveDiario(state);
        },
        html: noteVal,
      }),
    ]));

    wrap.appendChild(dayEl);
  }

  sheet.appendChild(wrap);
  return sheet;
}

function saveDiario(state) {
  try {
    localStorage.setItem('dome_wizard_state_v3', JSON.stringify(state));
  } catch {}
}

function countBaseHubs(dome) {
  const r = dome.diameter / 2;
  const minY = Math.min(...[...dome.used].map((i) => dome.verts[i][2] * r));
  return dome.hubs.filter((h) => Math.abs(h.pos[2]*r - minY) < 0.05).length;
}
