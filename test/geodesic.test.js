// test/geodesic.test.js — snapshots fiduciais de buildDome().
//
// geodesic.js é Class I (Maron 2018) e marcado "NÃO TOCAR" no CLAUDE.md.
// Estes testes não provam matemática — eles detectam refactor silencioso
// que mude o output. Se um teste falhar, ou o cálculo regrediu, ou foi
// uma mudança intencional (e o snapshot precisa ser atualizado).
//
// Valores gerados rodando o próprio geodesic.js em Node e congelando.
// Rode com: npm test  (= node --test test/)

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDome } from '../geodesic.js';

const round = (x, p = 6) => Number(x.toFixed(p));
const roundStruts = (struts) => struts.map((s) => ({
  label: s.label,
  count: s.count,
  chord: round(s.chord),
  length: round(s.length),
}));

test('buildDome V=1 esfera completa (radius=1)', () => {
  const d = buildDome({ freq: 1, truncation: 1.0, radius: 1.0 });
  assert.equal(d.struts.length, 1, 'icosaedro só tem 1 tipo de aresta');
  assert.equal(d.faces.length, 20, 'icosaedro tem 20 faces');
  assert.equal(d.used.size, 12, 'icosaedro tem 12 vértices');
  assert.equal(round(d.totalArea), 9.574541);
  assert.equal(round(d.totalLinear), 31.543867);
  assert.equal(round(d.height), 2);
  assert.equal(round(d.footRadius), 0.894427);
  assert.deepEqual(roundStruts(d.struts), [
    { label: 'A', count: 30, chord: 1.051462, length: 1.051462 },
  ]);
});

test('buildDome V=2 truncado (radius=3)', () => {
  const d = buildDome({ freq: 2, truncation: 0.625, radius: 3.0 });
  assert.equal(d.struts.length, 2);
  assert.equal(d.faces.length, 40);
  assert.equal(d.used.size, 26);
  assert.equal(round(d.totalArea), 52.496691);
  assert.equal(round(d.totalLinear), 114.081544);
  assert.equal(round(d.height), 3);
  assert.equal(round(d.footRadius), 3);
  assert.deepEqual(roundStruts(d.struts), [
    { label: 'A', count: 30, chord: 0.546533, length: 1.639599 },
    { label: 'B', count: 35, chord: 0.618034, length: 1.854102 },
  ]);
});

test('buildDome V=3 hemisfério (radius=5)', () => {
  const d = buildDome({ freq: 3, truncation: 0.5, radius: 5.0 });
  assert.equal(d.struts.length, 3);
  assert.equal(d.faces.length, 75);
  assert.equal(d.used.size, 46);
  assert.equal(round(d.totalArea), 124.667657);
  assert.equal(round(d.totalLinear), 236.104838);
  assert.equal(round(d.height), 4.141803);
  assert.equal(round(d.footRadius), 4.925799);
  assert.deepEqual(roundStruts(d.struts), [
    { label: 'A', count: 30, chord: 0.348615, length: 1.743077 },
    { label: 'B', count: 40, chord: 0.403548, length: 2.017741 },
    { label: 'C', count: 50, chord: 0.412411, length: 2.062057 },
  ]);
});

test('totalLinear é soma de count × length', () => {
  const d = buildDome({ freq: 2, truncation: 0.625, radius: 3.0 });
  const sum = d.struts.reduce((s, g) => s + g.count * g.length, 0);
  assert.equal(round(sum), round(d.totalLinear));
});
