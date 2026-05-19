// test/funil.test.js — Snapshots dos 4 bundles + determinismo do compositor.
//
// O funil de onboarding (wizard-funil.js) usa composeBundle de bundles.js
// pra montar um patch a partir de (função, estilo, região). Estes testes:
//   1. Verificam que cada uma das 24 combinações (6 funções × 2 estilos
//      × 2 regiões) produz output não-vazio e referenciando ids reais.
//   2. Snapshotam os 4 bundles (combinação canônica: glamping_casal +
//      cada estilo/região) pra detectar mudança silenciosa nos catálogos.
//   3. Confirmam idempotência — chamar 50× retorna o mesmo conteúdo.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FUNCOES, ESTILOS, REGIOES_FUNIL, BUNDLES, composeBundle, bundleSelo,
} from '../bundles.js';
import { USE_SCENARIOS, CLIMATE_ZONES } from '../programa.js';
import {
  STRUCTURE_MATERIALS, HUB_CONNECTORS, COVERINGS, FOUNDATIONS,
} from '../materials-v2.js';
import { MANTIQUEIRA_COVERINGS } from '../extras.js';

const ALL_COVERINGS = [...COVERINGS, ...MANTIQUEIRA_COVERINGS];

test('bundles: tem exatamente 4 bundles (2 estilos × 2 regiões)', () => {
  assert.equal(Object.keys(BUNDLES).length, 4);
  for (const e of ESTILOS) {
    for (const r of REGIOES_FUNIL) {
      const key = `${e.id}_${r.id}`;
      assert.ok(BUNDLES[key], `bundle ${key} deve existir`);
    }
  }
});

test('bundles: todos os ids de materiais referenciados existem nos catálogos', () => {
  for (const [key, b] of Object.entries(BUNDLES)) {
    assert.ok(STRUCTURE_MATERIALS.find((m) => m.id === b.estrutura),
      `${key}: estrutura "${b.estrutura}" não existe em STRUCTURE_MATERIALS`);
    assert.ok(HUB_CONNECTORS.find((m) => m.id === b.conector),
      `${key}: conector "${b.conector}" não existe em HUB_CONNECTORS`);
    assert.ok(ALL_COVERINGS.find((m) => m.id === b.cobertura),
      `${key}: cobertura "${b.cobertura}" não existe em COVERINGS+MANTIQUEIRA`);
    assert.ok(FOUNDATIONS.find((m) => m.id === b.fundacao),
      `${key}: fundação "${b.fundacao}" não existe em FOUNDATIONS`);
  }
});

test('bundles: todos têm pelo menos 1 nota construtiva e 1 fonte', () => {
  for (const [key, b] of Object.entries(BUNDLES)) {
    assert.ok(Array.isArray(b.notasConstrutivas) && b.notasConstrutivas.length >= 1,
      `${key}: deve ter notas construtivas`);
    assert.ok(Array.isArray(b.fontes) && b.fontes.length >= 1,
      `${key}: deve ter pelo menos 1 fonte`);
    for (const f of b.fontes) {
      assert.ok(f.label && f.url && f.ano, `${key}: fonte deve ter label+url+ano`);
    }
  }
});

test('FUNCOES: cada função referencia cenários reais em USE_SCENARIOS', () => {
  for (const f of FUNCOES) {
    assert.ok(USE_SCENARIOS.find((s) => s.id === f.defaultCenario),
      `função ${f.id}: defaultCenario "${f.defaultCenario}" não existe`);
    for (const cid of f.cenarios) {
      assert.ok(USE_SCENARIOS.find((s) => s.id === cid),
        `função ${f.id}: cenario "${cid}" não existe`);
    }
  }
});

test('REGIOES_FUNIL: climaDefault aponta pra CLIMATE_ZONES real', () => {
  for (const r of REGIOES_FUNIL) {
    assert.ok(CLIMATE_ZONES.find((c) => c.id === r.climaDefault),
      `região ${r.id}: clima "${r.climaDefault}" não existe`);
  }
});

test('composeBundle: cobre todas as 24 combinações sem erro', () => {
  let count = 0;
  for (const f of FUNCOES) {
    for (const e of ESTILOS) {
      for (const r of REGIOES_FUNIL) {
        const p = composeBundle({ funcao: f.id, estilo: e.id, regiao: r.id });
        assert.ok(p.programa.cenario, 'cenário preenchido');
        assert.ok(p.forma.diametro > 0, 'diâmetro válido');
        assert.ok(p.sistemas.estrutura, 'estrutura preenchida');
        assert.ok(p.v3.funilEscolha, 'selo preenchido');
        assert.equal(p.v3.funilEscolha.bundleId, `${e.id}_${r.id}`);
        count++;
      }
    }
  }
  assert.equal(count, 24, '24 combinações executadas');
});

test('composeBundle: é determinístico (idempotente em 50 chamadas)', () => {
  const args = { funcao: 'hospedar', estilo: 'vernaculo', regiao: 'mantiqueira' };
  const first = JSON.stringify(composeBundle(args));
  for (let i = 0; i < 50; i++) {
    assert.equal(JSON.stringify(composeBundle(args)), first);
  }
});

test('composeBundle: rejeita ids desconhecidos', () => {
  assert.throws(() => composeBundle({ funcao: 'inexistente', estilo: 'vernaculo', regiao: 'cerrado' }));
  assert.throws(() => composeBundle({ funcao: 'hospedar', estilo: 'inexistente', regiao: 'cerrado' }));
  assert.throws(() => composeBundle({ funcao: 'hospedar', estilo: 'vernaculo', regiao: 'inexistente' }));
});

test('composeBundle: hospedar × vernaculo × mantiqueira — snapshot', () => {
  const p = composeBundle({ funcao: 'hospedar', estilo: 'vernaculo', regiao: 'mantiqueira' });
  assert.equal(p.programa.cenario, 'glamping_casal');
  assert.equal(p.programa.clima, 'mantiqueira');
  assert.equal(p.forma.diametro, 5.5);
  assert.equal(p.forma.freq, 3);
  assert.equal(p.forma.truncamento, 0.625);
  assert.equal(p.sistemas.estrutura, 'eucalipto_rolico');
  assert.equal(p.sistemas.conector, 'hub_madeira');
  assert.equal(p.sistemas.cobertura, 'taubilha_pinus');
  assert.equal(p.sistemas.fundacao, 'pedras_secas');
  assert.equal(p.v3.regiao, 'mantiqueira');
});

test('composeBundle: hospedar × tecnico × cerrado — snapshot', () => {
  const p = composeBundle({ funcao: 'hospedar', estilo: 'tecnico', regiao: 'cerrado' });
  assert.equal(p.sistemas.conector, 'aco_galv');
  assert.equal(p.sistemas.cobertura, 'lona_pvc');
  assert.equal(p.sistemas.fundacao, 'pneu_terra');
  assert.equal(p.v3.regiao, 'cerrado_central');
});

test('composeBundle: habitar × tecnico × mantiqueira usa casa_pequena', () => {
  const p = composeBundle({ funcao: 'habitar', estilo: 'tecnico', regiao: 'mantiqueira' });
  assert.equal(p.programa.cenario, 'casa_pequena');
  assert.equal(p.programa.capacidade, 2);
  assert.equal(p.forma.diametro, 8.0);
  // Sistemas vêm do bundle, não do cenário
  assert.equal(p.sistemas.conector, 'aco_galv');
  assert.equal(p.sistemas.cobertura, 'telha_shingle');
});

test('composeBundle: retorno é mutável sem afetar fonte', () => {
  const p1 = composeBundle({ funcao: 'cultivar', estilo: 'vernaculo', regiao: 'cerrado' });
  p1.avisosRegionais.push('mutação local');
  p1.fontes[0].label = 'modificado';
  p1.programa.modulos.push('teste');
  const p2 = composeBundle({ funcao: 'cultivar', estilo: 'vernaculo', regiao: 'cerrado' });
  assert.notEqual(p2.avisosRegionais.length, p1.avisosRegionais.length);
  assert.notEqual(p2.fontes[0].label, 'modificado');
  assert.notEqual(p2.programa.modulos.length, p1.programa.modulos.length);
});

test('bundleSelo: gera label legível para combinações válidas', () => {
  const s = bundleSelo({ funcao: 'hospedar', estilo: 'vernaculo', regiao: 'mantiqueira' });
  assert.equal(s, 'hospedar · vernáculo rústico · Serra da Mantiqueira');
});

test('bundleSelo: retorna null para combinações inválidas', () => {
  assert.equal(bundleSelo({ funcao: 'X', estilo: 'Y', regiao: 'Z' }), null);
});
