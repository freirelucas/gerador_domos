// dom-helpers.js — Helpers DOM compartilhados entre módulos de view.
//
// Antes deste módulo, `el()`, `fmt` e `TYPE_COLORS` eram duplicados em
// wizard-steps.js, wizard-dossie.js, wizard-v3-step2.js, wizard-v3-extras.js
// e exporter.js. Fonte única aqui.

/**
 * Cria um elemento DOM com props e children.
 *
 * Props especiais:
 *   - `class`: string → e.className
 *   - `html`: string → e.innerHTML
 *   - `style`: objeto → Object.assign(e.style, v)
 *   - `on<Event>`: função → addEventListener(<event>, fn)
 *   - qualquer outra chave: setAttribute(k, v) se v != null
 *
 * Children: string (vira textNode), Node, ou array dos anteriores.
 * null/false são ignorados.
 */
export function el(tag, props = {}, children = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (v != null) e.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null || c === false) continue;
    e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return e;
}

/**
 * Formatadores numéricos consistentes em pt-BR.
 * Use FMT.m, FMT.m2, FMT.brl etc em vez de inventar variações locais.
 */
export const FMT = {
  m: (x) => x.toFixed(2) + ' m',
  m2: (x) => x.toFixed(1) + ' m²',
  mm: (x) => Math.round(x * 1000) + ' mm',
  brl: (x) =>
    'R$ ' + x.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
  kg: (x) => Math.round(x).toLocaleString('pt-BR') + ' kg',
  N: (x) => Math.round(x).toLocaleString('pt-BR') + ' N',
};

/**
 * Paleta usada para tipificar barras A/B/C/… no SVG export e no dossiê.
 * Mantém consistência entre o PDF de cut list e a visualização na tela.
 */
export const TYPE_COLORS = {
  A: '#b4742a', B: '#4a5d3a', C: '#2a4d70', D: '#8a2f1a',
  E: '#6b4a8c', F: '#3a3a3a', G: '#9c5a2a', H: '#2a6a4a',
};
