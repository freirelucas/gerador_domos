// test/exporter.test.js — smoke tests dos exports.
//
// Não validamos conteúdo numérico exato (isso é responsabilidade do
// geodesic.test.js). Aqui só garantimos que:
//   1. exporter.js carrega sem depender de DOM (importou TYPE_COLORS de
//      dom-helpers.js, que define `el` mas não chama document.* no top-level);
//   2. cada export retorna string não-vazia com marcadores estruturais
//      esperados (header SVG, SECTION DXF, primeira linha CSV, prefixo OBJ).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDome } from '../geodesic.js';
import {
  exportSVG, exportDXF, exportCSV, exportOBJ, exportHubsSVG,
} from '../exporter.js';

const dome = buildDome({ freq: 2, truncation: 0.625, radius: 3.0 });

const state = {
  forma: { diametro: 6.0, freq: 2, truncamento: 0.625 },
  sistemas: { estrutura: 'eucalipto_rolico', conector: 'aco_galv' },
};
const material = { nome: 'Eucalipto roliço Ø50', diametro: 50, secao: null };
const connector = { nome: 'Aço galvanizado · placa estrela' };

test('exportSVG gera SVG válido com header', () => {
  const out = exportSVG(dome, state, material);
  assert.ok(typeof out === 'string' && out.length > 0);
  assert.match(out, /^<\?xml/);
  assert.match(out, /<svg/);
  assert.match(out, /CUT LIST/);
  assert.match(out, /<\/svg>/);
});

test('exportDXF gera DXF ASCII R12', () => {
  const out = exportDXF(dome, state, material);
  assert.ok(typeof out === 'string' && out.length > 0);
  assert.match(out, /SECTION/);
  assert.match(out, /ENTITIES/);
  assert.match(out, /EOF/);
});

test('exportCSV gera linhas com header', () => {
  const out = exportCSV(dome, state, material);
  assert.ok(typeof out === 'string' && out.length > 0);
  const lines = out.split('\n').filter(Boolean);
  assert.ok(lines.length >= dome.struts.length + 1, 'header + 1 linha por tipo');
});

test('exportOBJ gera mesh OBJ', () => {
  const out = exportOBJ(dome, state);
  assert.ok(typeof out === 'string' && out.length > 0);
  assert.match(out, /^# Domo/m);
  assert.match(out, /^v /m, 'tem vértices');
  assert.match(out, /^f /m, 'tem faces');
});

test('exportHubsSVG gera gabaritos', () => {
  const out = exportHubsSVG(dome, connector);
  assert.ok(typeof out === 'string' && out.length > 0);
  assert.match(out, /<svg/);
  assert.match(out, /GABARITOS DE HUBS/);
});
