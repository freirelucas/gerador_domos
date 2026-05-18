// wizard-v3-galeria.js — Feature A do HANDOFF (§3).
//
// Galeria horizontal de domos icônicos da história, todos desenhados em
// escala linear real (px = m × SCALE), com o domo do usuário intercalado
// e destacado em ocre. Serve para calibrar a expectativa de tamanho.

import { el, FMT } from './dom-helpers.js';

const SCALE = 4; // px por metro real
const PESSOA_ALTURA = 1.70; // m, referência humana

/**
 * @typedef {Object} DomoFamoso
 * @property {string} id     slug
 * @property {string} nome
 * @property {string} local
 * @property {number} diametro  metros
 * @property {number} ano
 * @property {string} nota   contexto histórico
 * @property {string} url    link de referência (Wikipedia)
 */

/** @type {DomoFamoso[]} */
const DOMOS_FAMOSOS = [
  {
    id: 'drop_city',
    nome: 'Drop City',
    local: 'Colorado, EUA',
    diametro: 5,
    ano: 1965,
    nota: 'Primeira comuna hippie a usar domos geodésicos; estruturas cobertas com latarias de carro recortadas a marreta. Inspirou movimentos DIY até hoje.',
    url: 'https://en.wikipedia.org/wiki/Drop_City',
  },
  {
    id: 'ecocamp',
    nome: 'EcoCamp Patagônia',
    local: 'Torres del Paine, Chile',
    diametro: 8,
    ano: 2001,
    nota: 'Hotel sustentável certificado; aguenta ventos patagônicos acima de 100 km/h. Modelo comercial de glamping em domo.',
    url: 'https://en.wikipedia.org/wiki/EcoCamp_Patagonia',
  },
  {
    id: 'bauersfeld',
    nome: 'Bauersfeld / Zeiss',
    local: 'Jena, Alemanha',
    diametro: 16,
    ano: 1922,
    nota: 'Primeira cúpula geodésica do mundo, no telhado da fábrica Zeiss. Estrutura de aço + casca de ferrocimento "Zeiss-Dywidag". Anterior a Fuller em 25 anos.',
    url: 'https://en.wikipedia.org/wiki/Walther_Bauersfeld',
  },
  {
    id: 'maravilha_jena',
    nome: 'A Maravilha de Jena',
    local: 'Jena, Alemanha',
    diametro: 25,
    ano: 1926,
    nota: 'Planetário público mais antigo do mundo ainda em operação. Mesma escola Zeiss que construiu Bauersfeld.',
    url: 'https://en.wikipedia.org/wiki/Zeiss-Planetarium_Jena',
  },
  {
    id: 'spaceship_earth',
    nome: 'Spaceship Earth',
    local: 'Epcot, Florida, EUA',
    diametro: 50,
    ano: 1982,
    nota: 'Ícone do Epcot Disney. Esfera completa (não meio domo) sustentada por seis pilares; revestimento em painéis de alumínio anodizado.',
    url: 'https://en.wikipedia.org/wiki/Spaceship_Earth_(Epcot)',
  },
  {
    id: 'eden_project',
    nome: 'Eden Project',
    local: 'Cornwall, Reino Unido',
    diametro: 53,
    ano: 2001,
    nota: 'Biomas tropicais sob domos hexagonais de ETFE inflado (mais leve que ar). Maior estufa do mundo na época.',
    url: 'https://en.wikipedia.org/wiki/Eden_Project',
  },
  {
    id: 'biosfera_montreal',
    nome: 'Biosfera de Montreal',
    local: 'Île Sainte-Hélène, Canadá',
    diametro: 76,
    ano: 1967,
    nota: 'Pavilhão dos EUA na Expo 67 desenhado por Buckminster Fuller. Hoje é museu de meio ambiente.',
    url: 'https://en.wikipedia.org/wiki/Montreal_Biosphere',
  },
  {
    id: 'nagoya_dome',
    nome: 'Nagoya Dome',
    local: 'Nagoya, Japão',
    diametro: 187,
    ano: 1997,
    nota: 'Estádio multiuso (beisebol, shows). Não é geodésica pura — usa treliça espacial — mas dá referência visual de "domo grande".',
    url: 'https://en.wikipedia.org/wiki/Nagoya_Dome',
  },
];

/**
 * Desenha um meio-domo (semicírculo + base) num SVG, retornando o markup.
 * Coordenadas: origem no canto inferior-esquerdo do domo, eixo Y para cima.
 */
function semicirculoDomo({ x, y, diametro, cor, opacity = 0.6, strokeWidth = 1.5 }) {
  const r = (diametro * SCALE) / 2;
  const cx = x + r;
  // SVG Y é invertido; o "chão" fica em y, e o topo em y - r.
  return `
    <path d="M ${cx - r} ${y} A ${r} ${r} 0 0 1 ${cx + r} ${y} L ${cx - r} ${y} Z"
          fill="${cor}" fill-opacity="${opacity * 0.18}"
          stroke="${cor}" stroke-opacity="${opacity}" stroke-width="${strokeWidth}" />
  `.trim();
}

/** Silhueta de pessoa de 1.70 m em SVG, ancorada pelos pés em (x, y). */
function pessoa({ x, y }) {
  const h = PESSOA_ALTURA * SCALE; // altura total
  const cabeca = h * 0.16;
  const tronco = h * 0.42;
  const pernas = h * 0.42;
  const headR = cabeca / 2;
  const headCy = y - h + headR;
  const shoulderY = headCy + headR;
  const hipY = shoulderY + tronco;
  return `
    <g stroke="var(--ink)" stroke-width="1.2" stroke-linecap="round" fill="none">
      <circle cx="${x}" cy="${headCy}" r="${headR}" fill="var(--ink)" />
      <line x1="${x}" y1="${shoulderY}" x2="${x}" y2="${hipY}" />
      <line x1="${x}" y1="${shoulderY + tronco * 0.25}" x2="${x - tronco * 0.4}" y2="${shoulderY + tronco * 0.7}" />
      <line x1="${x}" y1="${shoulderY + tronco * 0.25}" x2="${x + tronco * 0.4}" y2="${shoulderY + tronco * 0.7}" />
      <line x1="${x}" y1="${hipY}" x2="${x - pernas * 0.25}" y2="${y}" />
      <line x1="${x}" y1="${hipY}" x2="${x + pernas * 0.25}" y2="${y}" />
    </g>
  `.trim();
}

/**
 * Constrói a galeria SVG completa.
 * Intercala o domo do usuário em ordem crescente de diâmetro, destacado.
 */
function buildGallerySVG(diametroUsuario) {
  const userDome = {
    id: '__user__',
    nome: 'SEU DOMO',
    local: 'agora',
    diametro: diametroUsuario,
    ano: new Date().getFullYear(),
    nota: 'O domo que você está projetando agora mesmo.',
    url: null,
    destaque: true,
  };

  const todos = [...DOMOS_FAMOSOS, userDome].sort((a, b) => a.diametro - b.diametro);
  const maxR = Math.max(...todos.map((d) => (d.diametro * SCALE) / 2));

  const gap = 60;
  const padX = 40;
  const padTop = 70;
  const padBottom = 60;
  const baselineY = padTop + maxR;
  const svgHeight = padTop + maxR + padBottom;

  let x = padX;
  let svgBody = '';
  const items = [];

  // Pessoa de referência logo no início.
  svgBody += pessoa({ x: x + 6, y: baselineY });
  svgBody += `
    <text x="${x + 14}" y="${baselineY + 16}" font-family="'IBM Plex Mono', monospace"
          font-size="9" fill="var(--ink-soft, #4a3a2a)">pessoa · 1.70 m</text>
  `;
  x += 40;

  for (const d of todos) {
    const r = (d.diametro * SCALE) / 2;
    const isUser = !!d.destaque;
    const cor = isUser ? 'var(--ocre)' : 'var(--ink)';
    const opacity = isUser ? 1.0 : 0.6;
    const strokeWidth = isUser ? 2.6 : 1.5;
    svgBody += semicirculoDomo({ x, y: baselineY, diametro: d.diametro, cor, opacity, strokeWidth });

    const cx = x + r;
    const nomeTop = baselineY - r * 2 - 8;
    const labelFill = isUser ? 'var(--ocre)' : 'var(--ink)';
    const labelWeight = isUser ? 'bold' : 'normal';
    svgBody += `
      <text x="${cx}" y="${nomeTop}" text-anchor="middle"
            font-family="'Cormorant Garamond', serif" font-style="italic"
            font-size="${isUser ? 15 : 13}" font-weight="${labelWeight}"
            fill="${labelFill}">${escapeXml(d.nome)}</text>
      <text x="${cx}" y="${baselineY + 16}" text-anchor="middle"
            font-family="'IBM Plex Mono', monospace" font-size="10"
            fill="${labelFill}" font-weight="${labelWeight}">Ø ${d.diametro} m · ${d.ano}</text>
      <text x="${cx}" y="${baselineY + 30}" text-anchor="middle"
            font-family="'IBM Plex Sans', sans-serif" font-size="10"
            fill="var(--ink-soft, #5a4a30)" opacity="0.7">${escapeXml(d.local)}</text>
    `;

    items.push({ ...d, hitX: x, hitY: baselineY - r * 2, hitW: r * 2, hitH: r * 2 });
    x += r * 2 + gap;
  }

  const svgWidth = x + padX;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}"
         viewBox="0 0 ${svgWidth} ${svgHeight}" style="display:block;">
      <line x1="0" y1="${baselineY}" x2="${svgWidth}" y2="${baselineY}"
            stroke="var(--ink)" stroke-opacity="0.25" stroke-width="1" stroke-dasharray="3 4" />
      ${svgBody}
    </svg>
  `;
  return { svg, items };
}

function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Mostra um popover discreto com a nota e link de referência. */
function showPopover(host, item, anchor) {
  // Remove popover anterior
  host.querySelectorAll('.galeria-popover').forEach((n) => n.remove());

  const pop = el('div', {
    class: 'galeria-popover',
    style: {
      position: 'absolute',
      maxWidth: '280px',
      padding: '14px 16px',
      background: 'var(--paper)',
      border: '1px solid var(--ink)',
      boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
      zIndex: '50',
      fontFamily: "'IBM Plex Sans', sans-serif",
      fontSize: '12.5px',
      lineHeight: '1.45',
      color: 'var(--ink)',
    },
  }, [
    el('div', {
      style: {
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle: 'italic',
        fontSize: '17px',
        marginBottom: '4px',
        color: 'var(--ocre)',
      },
    }, item.nome),
    el('div', {
      style: {
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '10px',
        letterSpacing: '0.08em',
        color: 'var(--ink-soft, #5a4a30)',
        marginBottom: '10px',
      },
    }, `Ø ${item.diametro} m · ${item.ano} · ${item.local}`),
    el('div', { style: { marginBottom: '10px' } }, item.nota),
    item.url ? el('a', {
      href: item.url, target: '_blank', rel: 'noopener',
      style: {
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '11px',
        color: 'var(--ocre)',
        textDecoration: 'underline',
      },
    }, 'ler na wikipedia →') : null,
  ]);

  // Posicionar próximo ao anchor (clique relativo ao container)
  const hostRect = host.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();
  pop.style.left = `${anchorRect.left - hostRect.left + 12}px`;
  pop.style.top = `${anchorRect.top - hostRect.top - 8}px`;
  host.appendChild(pop);

  // Fechar ao clicar fora
  setTimeout(() => {
    const onAway = (e) => {
      if (!pop.contains(e.target)) {
        pop.remove();
        document.removeEventListener('click', onAway);
      }
    };
    document.addEventListener('click', onAway);
  }, 0);
}

/**
 * Anexa a galeria ao wrap da Etapa 1 (depois do appendStep1Benefits).
 * Padrão idêntico ao appendStep1Benefits.
 */
export function appendStep1Galeria(wrap, api) {
  const { state } = api;
  const diametroUsuario = state.forma.diametro;
  const { svg, items } = buildGallerySVG(diametroUsuario);

  const card = el('div', {
    style: {
      marginTop: '24px',
      padding: '28px 30px',
      border: '1px solid var(--ink)',
      background: 'var(--paper-soft)',
      position: 'relative',
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
  }, '↳ contexto · escala comparativa com domos famosos'));

  card.appendChild(el('h3', {
    style: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: '30px',
      fontWeight: '500',
      lineHeight: '1.05',
      color: 'var(--ink)',
      marginBottom: '10px',
      letterSpacing: '-0.015em',
      maxWidth: '32ch',
    },
    html: `Onde o <em style="color:var(--ocre); font-style:italic;">seu domo</em> entra na história`,
  }));

  card.appendChild(el('p', {
    style: {
      fontFamily: "'IBM Plex Sans', sans-serif",
      fontSize: '14px',
      lineHeight: '1.55',
      color: 'var(--ink)',
      marginBottom: '20px',
      maxWidth: '60ch',
      opacity: '0.85',
    },
    html: `Desde 1922 já se construíram mais de 300 mil domos no mundo, do tamanho de um quarto até estádios. ` +
          `Seu domo de <strong style="color:var(--ocre)">Ø ${FMT.m(diametroUsuario)}</strong> aparece em ocre. ` +
          `Clique em qualquer um para detalhes. Role para o lado.`,
  }));

  // Container scroll horizontal
  const scrollWrap = el('div', {
    class: 'galeria-scroll',
    style: {
      overflowX: 'auto',
      overflowY: 'visible',
      padding: '4px 0 12px',
      borderTop: '1px dashed var(--ink)',
      borderBottom: '1px dashed var(--ink)',
      cursor: 'grab',
    },
  });

  const svgHost = el('div', {
    style: { position: 'relative', display: 'inline-block', minWidth: '100%' },
    html: svg,
  });
  scrollWrap.appendChild(svgHost);
  card.appendChild(scrollWrap);

  // Hit-areas invisíveis para clique/hover por cima do SVG.
  // Inseridas em sobreposição no svgHost.
  const svgEl = svgHost.querySelector('svg');
  if (svgEl) {
    const overlay = el('div', {
      style: {
        position: 'absolute', inset: '0', pointerEvents: 'none',
      },
    });
    for (const it of items) {
      const hit = el('button', {
        type: 'button',
        title: `${it.nome} · ${it.diametro} m`,
        'aria-label': `${it.nome}, ${it.diametro} metros de diâmetro, ${it.ano}${it.local ? ', ' + it.local : ''}. Clique para detalhes.`,
        style: {
          position: 'absolute',
          left: `${it.hitX}px`,
          top: `${it.hitY}px`,
          width: `${it.hitW}px`,
          height: `${it.hitH}px`,
          background: 'transparent',
          border: '0',
          padding: '0',
          cursor: 'pointer',
          pointerEvents: 'auto',
          outline: 'none',
        },
        onclick: (e) => {
          e.stopPropagation();
          showPopover(card, it, hit);
        },
      });
      overlay.appendChild(hit);
    }
    svgHost.appendChild(overlay);
  }

  // Rodapé com nota de fonte
  card.appendChild(el('div', {
    style: {
      marginTop: '14px',
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: '10px',
      letterSpacing: '0.05em',
      color: 'var(--ink-soft, #5a4a30)',
      opacity: '0.7',
    },
  }, 'escala linear · 1 m = ' + SCALE + ' px · diâmetros verificáveis em fontes públicas (Wikipedia)'));

  wrap.appendChild(card);
}
