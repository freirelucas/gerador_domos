// wizard-welcome.js — Tela de abertura.
//
// Aparece quando state.v3.welcomeSeen === false. Substitui o conteúdo da
// Etapa 1 com uma intro + duas chamadas pra ação:
//   - "começar de um exemplo": mantém DEFAULTS pré-preenchidos.
//   - "começar do zero": limpa programa (cenário/módulos/clima), state
//     vira "untouched" e o painel de síntese fica oculto até o usuário
//     fazer alguma escolha.
//
// Visível só na primeira visita. Após qualquer botão, welcomeSeen=true e
// o usuário nunca mais vê esta tela (a menos que limpe localStorage).

import { el } from './dom-helpers.js';

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
  wrap.appendChild(el('div', { class: 'welcome-cards' }, [
    el('button', {
      type: 'button',
      class: 'welcome-card welcome-card--primary',
      'aria-label': 'Começar com o exemplo padrão · glamping para um casal',
      onclick: () => startWithExample(api),
    }, [
      el('div', { class: 'welcome-card-eyebrow' }, 'caminho rápido'),
      el('div', { class: 'welcome-card-title', html: 'começar de um <em>exemplo</em>' }),
      el('div', { class: 'welcome-card-body' },
        'Carrega um glamping para um casal (Ø 5,5 m · 3v · ⅝ domo) pré-configurado. ' +
        'Bom pra ver o app todo funcionando antes de começar o seu projeto real.'),
      el('div', { class: 'welcome-card-cta' }, 'usar este exemplo →'),
    ]),
    el('button', {
      type: 'button',
      class: 'welcome-card',
      'aria-label': 'Começar do zero · sem cenário pré-selecionado',
      onclick: () => startBlank(api),
    }, [
      el('div', { class: 'welcome-card-eyebrow' }, 'caminho aberto'),
      el('div', { class: 'welcome-card-title', html: 'começar <em>do zero</em>' }),
      el('div', { class: 'welcome-card-body' },
        'Você escolhe cada coisa. Nada pré-selecionado. O painel de síntese (custo, peso, breakdown) ' +
        'aparece depois da sua primeira escolha, pra não atropelar o pensamento.'),
      el('div', { class: 'welcome-card-cta' }, 'partir em branco →'),
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
