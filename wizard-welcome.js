// wizard-welcome.js — Tela de abertura.
//
// Aparece quando state.v3.welcomeSeen === false && !funilAtivo. Três caminhos:
//   - "começar do zero": limpa programa; painel de síntese oculto até o
//     usuário fazer uma escolha.
//   - "recomendar um começo" (destaque): abre o funil de 3 perguntas
//     (wizard-funil.js) que monta um bundle internamente compatível.
//   - "usar um exemplo": carrega DEFAULTS (glamping casal pré-preenchido).
//
// A welcomeSeen vira true após "do zero" ou "usar exemplo"; o funil só marca
// quando o usuário confirma na tela de síntese (cancelar funil volta aqui).

import { el } from './dom-helpers.js';
import { startFunil, resetFunil } from './wizard-funil.js';

/**
 * @param {HTMLElement} host  div.step-page onde o conteúdo é injetado
 * @param {Object}      api   hub do app
 */
export function renderWelcome(host, api) {
  const wrap = el('div', { class: 'welcome' });

  // ── Cabeçalho ────────────────────────────────────────────────────
  wrap.appendChild(el('div', { class: 'welcome-brand' }, [
    el('div', { class: 'welcome-eyebrow' }, 'canteiro técnico · cúpulas geodésicas DIY'),
    el('h1', { class: 'welcome-title', html: 'Vamos projetar o <em>seu domo</em>?' }),
    el('p', { class: 'welcome-lede' },
      'Cinco etapas curtas, no seu tempo. Sem cadastro, sem login: tudo fica salvo aqui no navegador. ' +
      'Ao final você sai com cut list, gabaritos de hubs, lista de compras com preços e fontes citadas, ' +
      'e exports SVG/DXF/CSV/OBJ pra abrir em Inkscape, LibreCAD, Excel ou Blender.'),
  ]));

  // ── Cards de chamada ────────────────────────────────────────────
  // 3 caminhos: começar do zero · recomendar (funil) [destaque] · usar exemplo
  wrap.appendChild(el('div', { class: 'welcome-cards welcome-cards--3' }, [
    el('button', {
      type: 'button',
      class: 'welcome-card',
      'aria-label': 'Começar do zero · sem cenário pré-selecionado',
      onclick: () => startBlank(api),
    }, [
      el('div', { class: 'welcome-card-eyebrow' }, 'caminho aberto'),
      el('div', { class: 'welcome-card-title', html: 'começar <em>do zero</em>' }),
      el('div', { class: 'welcome-card-body' },
        'Você escolhe cada coisa. Nada pré-selecionado. O painel de síntese ' +
        'aparece depois da sua primeira escolha.'),
      el('div', { class: 'welcome-card-cta' }, 'partir em branco →'),
    ]),
    el('button', {
      type: 'button',
      class: 'welcome-card welcome-card--primary welcome-card--hero',
      'aria-label': 'Responder 3 perguntas e receber um projeto recomendado',
      onclick: () => startRecommender(api),
    }, [
      el('div', { class: 'welcome-card-eyebrow' }, 'recomendado · 3 perguntas'),
      el('div', { class: 'welcome-card-title', html: 'recomendar um <em>começo</em>' }),
      el('div', { class: 'welcome-card-body' },
        'Função × estilo × região. Em 3 cliques o app monta um projeto ' +
        'internamente compatível, com materiais que se comportam bem juntos.'),
      el('div', { class: 'welcome-card-cta' }, 'responder 3 perguntas →'),
    ]),
    el('button', {
      type: 'button',
      class: 'welcome-card',
      'aria-label': 'Começar com o exemplo padrão · glamping para um casal',
      onclick: () => startWithExample(api),
    }, [
      el('div', { class: 'welcome-card-eyebrow' }, 'caminho rápido'),
      el('div', { class: 'welcome-card-title', html: 'usar um <em>exemplo</em>' }),
      el('div', { class: 'welcome-card-body' },
        'Carrega um glamping para um casal (Ø 5,5 m · 3v · ⅝) pré-configurado. ' +
        'Bom pra ver o app todo funcionando antes do seu projeto real.'),
      el('div', { class: 'welcome-card-cta' }, 'usar este exemplo →'),
    ]),
  ]));

  // ── O que vem pela frente ───────────────────────────────────────
  const passos = [
    { n: '01', t: 'programa',  d: 'pra que serve, quantas pessoas, qual clima' },
    { n: '02', t: 'forma',     d: 'diâmetro, frequência V, fração de esfera' },
    { n: '03', t: 'aberturas', d: 'portas, janelas, ventilação, riser wall' },
    { n: '04', t: 'sistemas',  d: 'estrutura, hubs, cobertura, piso, água, energia' },
    { n: '05', t: 'dossiê',    d: 'memorial, cut list, gabaritos, lista de compras, exports' },
  ];
  wrap.appendChild(el('div', { class: 'welcome-roadmap' }, [
    el('div', { class: 'welcome-roadmap-label' }, 'a jornada · 5 etapas'),
    el('ol', { class: 'welcome-steps' }, passos.map((p) => el('li', { class: 'welcome-step' }, [
      el('span', { class: 'welcome-step-num' }, p.n),
      el('span', { class: 'welcome-step-title' }, p.t),
      el('span', { class: 'welcome-step-desc' }, p.d),
    ]))),
  ]));

  // ── Rodapé ──────────────────────────────────────────────────────
  wrap.appendChild(el('div', { class: 'welcome-foot' },
    'Baseado em MARON, Jorge · Cúpulas Geodésicas — Guia para Iniciantes (Ameríndia, 2018, CC BY-SA). Glossário com fontes citadas em cada termo técnico.'));

  host.appendChild(wrap);
}

function startWithExample(api) {
  api.state.v3.welcomeSeen = true;
  api.state.v3.touched = true;
  api.persistRaw();   // salva sem mexer no flag de touched
  api.render();
}

function startBlank(api) {
  const s = api.state;
  s.v3.welcomeSeen = true;
  s.v3.touched = false;
  // Limpa o programa pro usuário escolher do zero.
  s.programa.cenario = null;
  s.programa.modulos = [];
  s.programa.clima = null;
  api.persistRaw();
  api.render();
}

function startRecommender(api) {
  // Mantém welcomeSeen=false enquanto o funil estiver ativo — se o usuário
  // cancela o funil, volta direto pra essa tela de abertura.
  // Limpa qualquer progresso anterior (fresh start no funil).
  resetFunil(api);
  startFunil(api);
}
