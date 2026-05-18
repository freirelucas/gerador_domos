// synthesis.js — Funções puras de síntese do projeto.
//
// Computa custo, peso e cargas a partir de (dome, state, data). Sem DOM.
// Consumido por wizard-side-panel.js (painel ao vivo) e disponível para
// reuso no dossiê (etapa 5) numa próxima rodada.
//
// Paleta para o breakdown segue TYPE_COLORS para coerência visual, mas
// com cores próprias por categoria de orçamento.

import { cargaTotalDomo } from './regiao-cargas.js';

const CAT_COLORS = {
  estrutura:  '#b4742a', // ocre (identidade)
  conectores: '#4a5d3a', // verde cerrado
  cobertura:  '#2a4d70', // blueprint
  piso:       '#8a2f1a', // sangue
  riser:      '#6b4a8c', // violeta
  fundacao:   '#3a3a3a', // ink
  agua:       '#5a87a8',
  energia:    '#d99a4a',
  aberturas:  '#6b8056',
};

/** Conta hubs do anel inferior (base). Mesmo critério do dossiê. */
function countBaseHubs(dome) {
  if (!dome.hubs || dome.hubs.length === 0) return 0;
  const r = dome.diameter / 2;
  const ys = dome.hubs.map((h) => h.pos[2] * r);
  const minY = Math.min(...ys);
  return dome.hubs.filter((h) => Math.abs(h.pos[2] * r - minY) < 0.05).length;
}

/** Soma o custo das aberturas escolhidas. */
function aberturasCusto(ab, OP) {
  if (!ab || !OP) return 0;
  let s = 0;
  if (ab.porta_principal) s += OP.porta_principal.custo;
  if (ab.porta_emergencia) s += OP.porta_emergencia.custo;
  s += (ab.janelas_basc || 0) * OP.janela_basculante.custo;
  s += (ab.janelas_redondas || 0) * OP.janela_redonda.custo;
  if (ab.cupula_zenital) s += OP.cupula_zenital.custo;
  s += (ab.abertura_ventilacao || 0) * OP.abertura_ventilacao.custo;
  return s;
}

/**
 * Calcula o orçamento completo do projeto.
 * @returns {{ total: number, breakdown: Array<{cat,val,color}>, struct, conn, cover, piso, riser, fund }}
 */
export function computeBudget(dome, state, data, helpers) {
  const material   = data.STRUCTURE_MATERIALS.find((m) => m.id === state.sistemas.estrutura);
  const connector  = data.HUB_CONNECTORS.find((m) => m.id === state.sistemas.conector);
  const covering   = data.COVERINGS.find((m) => m.id === state.sistemas.cobertura)
                  || data.MANTIQUEIRA_COVERINGS?.find((m) => m.id === state.sistemas.cobertura);
  const foundation = data.FOUNDATIONS.find((m) => m.id === state.sistemas.fundacao);
  const piso       = data.FLOOR_SYSTEMS?.find((m) => m.id === state.sistemas.piso);
  const water      = data.WATER_SYSTEMS.find((m) => m.id === state.sistemas.agua);
  const energy     = data.ENERGY_SYSTEMS.find((m) => m.id === state.sistemas.energia);

  const valencias = (dome.edges?.length || 0) * 2;
  const baseHubs  = countBaseHubs(dome);
  const pisoArea  = Math.PI * (dome.diameter / 2) ** 2;

  const struct = material ? helpers.pricePerStruct(material, dome.totalLinear).custo : 0;
  const conn   = connector  ? valencias * connector.precoPorValencia : 0;
  const cover  = covering   ? dome.totalArea * 1.12 * covering.precoPorM2 : 0;
  const pisoC  = piso       ? piso.precoPorM2 * pisoArea * 1.08 : 0;
  const riserC = state.riser?.ativa
    ? state.riser.altura * 2 * Math.PI * dome.footRadius * 95
    : 0;
  const fund   = foundation ? baseHubs * foundation.custoBase : 0;
  const aguaC  = water      ? water.custo  : 0;
  const enerC  = energy     ? energy.custo : 0;
  const abC    = aberturasCusto(state.aberturas, data.OPENING_TYPES);

  const breakdown = [
    { cat: 'estrutura',  val: struct, color: CAT_COLORS.estrutura },
    { cat: 'conectores', val: conn,   color: CAT_COLORS.conectores },
    { cat: 'cobertura',  val: cover,  color: CAT_COLORS.cobertura },
    { cat: 'piso',       val: pisoC,  color: CAT_COLORS.piso },
    { cat: 'riser',      val: riserC, color: CAT_COLORS.riser },
    { cat: 'fundação',   val: fund,   color: CAT_COLORS.fundacao },
    { cat: 'água',       val: aguaC,  color: CAT_COLORS.agua },
    { cat: 'energia',    val: enerC,  color: CAT_COLORS.energia },
    { cat: 'aberturas',  val: abC,    color: CAT_COLORS.aberturas },
  ];
  const total = breakdown.reduce((s, b) => s + b.val, 0);
  return { total, breakdown, struct, conn, cover, piso: pisoC, riser: riserC, fund };
}

/**
 * Calcula o peso do projeto em kg.
 * estrutura = pesoLinear * totalLinear
 * cobertura = pesoPorM2 * área * 1.12 (sobra). Se cobertura não tem pesoPorM2,
 * usa 1.5 kg/m² como fallback razoável (lona/policarbonato).
 */
export function computeWeight(dome, state, data) {
  const material = data.STRUCTURE_MATERIALS.find((m) => m.id === state.sistemas.estrutura);
  const covering = data.COVERINGS.find((m) => m.id === state.sistemas.cobertura)
                || data.MANTIQUEIRA_COVERINGS?.find((m) => m.id === state.sistemas.cobertura);
  const estrutura = material ? material.pesoLinear * dome.totalLinear : 0;
  const coberturaPesoM2 = covering?.pesoPorM2 ?? covering?.peso_kgm2 ?? 1.5;
  const cobertura = dome.totalArea * 1.12 * coberturaPesoM2;
  return { estrutura, cobertura, total: estrutura + cobertura };
}

/**
 * Cargas de vento + neve para a região atual.
 * Não falha se a região não existir; retorna zeros.
 */
export function computeLoads(dome, state, data) {
  const regiao = data.REGIOES?.find((r) => r.id === state.v3?.regiao);
  if (!regiao || !dome) {
    return { regiao: '—', vento: 0, neve: 0, porHub: 0 };
  }
  const alturaTotal = dome.height + (state.riser?.ativa ? state.riser.altura : 0);
  const c = cargaTotalDomo(regiao, dome, Math.max(alturaTotal, 1));
  return {
    regiao: regiao.label || regiao.nome || regiao.id,
    vento: c.F_arrasto_N,
    neve:  c.F_neve_N,
    porHub: c.F_por_hub_kgf * 9.81,
  };
}
