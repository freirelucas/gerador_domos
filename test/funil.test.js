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
import { REGIOES } from '../regiao-cargas.js';

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

// ── Anti-regressão factual ───────────────────────────────────────────────
// Acionado por revisão factual de mai/2026: o app afirmava 18 kg/m² de neve
// na Mantiqueira e 8 kg/m² no Pampa. Brasil inteiro tem carga de neve
// estrutural = 0 conforme NBR 6120:2019 §6.4 (eventos esporádicos derretem
// em horas, sem requisito de projeto). Se alguém reintroduzir neve > 0
// pra alguma região brasileira no futuro, este teste pega.

test('regiao-cargas: nenhuma região brasileira tem carga de neve estrutural', () => {
  for (const r of REGIOES) {
    assert.equal(r.neve_kgm2, 0,
      `${r.label}: neve estrutural deve ser 0 — Brasil não tem carga de neve de projeto per NBR 6120 §6.4. ` +
      `Eventos de neve em altitude (Mantiqueira, Pampa) são esporádicos e decorativos, sem requisito estrutural.`);
  }
});

test('bundles + regiao-cargas: V0 do vento bate entre as duas fontes', () => {
  // Cross-check: REGIOES_FUNIL.metricas é string mostrada no funil; REGIOES
  // tem o valor numérico canônico. Se alguém atualizar um e esquecer o
  // outro, esta asserção pega o drift silencioso.
  for (const rf of REGIOES_FUNIL) {
    const r = REGIOES.find((x) => x.id === rf.regiaoId);
    assert.ok(r, `regiao-cargas precisa ter id "${rf.regiaoId}" (usado por REGIOES_FUNIL.${rf.id})`);
    assert.ok(rf.metricas.includes(`${r.vento_v0} m/s`),
      `${rf.id}: metricas "${rf.metricas}" deve citar V0=${r.vento_v0} m/s do regiao-cargas`);
  }
});

test('regiao-cargas: a Mantiqueira não afirma extremos sem rótulo', () => {
  // Mais específico: garante que a temperatura de Mantiqueira não volta
  // a ser apresentada como [-6, 30] "extrema" — o recorde histórico tem
  // que ficar separado da faixa típica de projeto.
  const m = REGIOES.find((r) => r.id === 'mantiqueira');
  assert.ok(m, 'mantiqueira presente');
  assert.ok(m.temp_minmax_tipica_c, 'mantiqueira deve ter temp_minmax_tipica_c (faixa de projeto)');
  assert.ok(m.temp_minmax_tipica_c[0] >= -5,
    `mín. típica Mantiqueira ${m.temp_minmax_tipica_c[0]} parece extremo histórico (–6 °C foi a alegação que motivou esta correção)`);
});
