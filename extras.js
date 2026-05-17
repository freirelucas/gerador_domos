// extras.js — Pisos, Mantiqueira coverings, validação estrutural

// ── PISO ──────────────────────────────────────────────────────────────────
export const FLOOR_SYSTEMS = [
  {
    id: 'deck_madeira',
    nome: 'Deck de madeira (eucalipto tratado)',
    precoPorM2: 165,
    pesoPorM2: 22,
    nota: 'Réguas 14×2 cm parafusadas sobre vigas. Vão livre máx 80 cm.',
    cor: '#7b5a36',
    durabilidade: '15+ anos com manutenção anual de stain',
    fontes: [
      { url: 'https://www.leroymerlin.com.br/deck-madeira', label: 'Leroy Merlin — Deck eucalipto', preco: 'Régua 14×2×290: R$ 38–55 → R$ 130–170/m²', data: 'mai/2026' },
    ],
  },
  {
    id: 'piso_radier',
    nome: 'Radier de concreto + acabamento',
    precoPorM2: 220,
    pesoPorM2: 240,
    nota: 'Concreto 8 cm + tela + isolamento. Acabamento polido ou cerâmico.',
    cor: '#9a988e',
    durabilidade: 'Permanente',
    fontes: [
      { url: 'https://www.sienge.com.br/blog/preco-radier', label: 'Sienge · radier residencial', preco: 'R$ 180–280/m² (sem revestimento)', data: 'mai/2026' },
    ],
  },
  {
    id: 'piso_terra',
    nome: 'Piso de barro batido + cera (bioconstrução)',
    precoPorM2: 45,
    pesoPorM2: 80,
    nota: 'Barro + areia + bosta de vaca + óleo de linhaça. Tradição.',
    cor: '#8a6a3c',
    durabilidade: '10+ anos com manutenção bianual',
    fontes: [
      { url: 'https://www.embrapa.br', label: 'Embrapa · pisos rústicos', preco: 'Material local + horas de trabalho', data: '2024' },
    ],
  },
  {
    id: 'piso_palhete',
    nome: 'Estrado de bambu/palhete (suspenso)',
    precoPorM2: 110,
    pesoPorM2: 8,
    nota: 'Para domos sazonais ou em terreno irregular. Permeável.',
    cor: '#a78145',
    durabilidade: '8–10 anos',
    fontes: [
      { url: 'https://loja.artbambu.com', label: 'ArtBambu · estrado bambu', preco: 'R$ 95–130/m² montado', data: 'mai/2026' },
    ],
  },
  {
    id: 'piso_pedra',
    nome: 'Pedra mineira / São Tomé (laje)',
    precoPorM2: 195,
    pesoPorM2: 65,
    nota: 'Lajota 30×30 cm assentada sobre contrapiso. Inércia térmica.',
    cor: '#8a7a60',
    durabilidade: 'Permanente',
    fontes: [
      { url: 'https://www.leroymerlin.com.br/pedra-sao-tome', label: 'Leroy Merlin — Pedra São Tomé', preco: 'R$ 70–110/m² + assentamento', data: 'mai/2026' },
    ],
  },
];

// ── COBERTURAS · SERRA DA MANTIQUEIRA ─────────────────────────────────────
// Adicionadas ao catálogo principal de coverings.
export const MANTIQUEIRA_COVERINGS = [
  {
    id: 'taubilha_pinus',
    nome: 'Taubilha pinus tratado (50×15×2 cm)',
    precoPorM2: 95,
    pesoPorM2: 16,
    durabilidade: '15–20 anos com verniz',
    nota: 'Tradição da Mantiqueira. 32 peças/m². Tripla camada = isolamento termo-acústico.',
    cor: '#c69466',
    regiao: 'mantiqueira',
    fontes: [
      { url: 'https://www.usinaaraucaria.com.br/aplicacoes/taubilha/', label: 'Usina Araucária — Cunha/SP', preco: 'R$ 85–110/m² c/ tratamento autoclave', data: '2024' },
      { url: 'https://omelhordamadeira.com/produto/telha-de-pinus-tratado---taubilha/54/', label: 'O Melhor da Madeira — Taubilha pinus', preco: 'Padrão 50×14×1,5 cm', data: '2025' },
    ],
  },
  {
    id: 'taubilha_massaranduba',
    nome: 'Taubilha massaranduba (madeira de lei)',
    precoPorM2: 220,
    pesoPorM2: 19,
    durabilidade: '20–25 anos',
    nota: '28 peças/m². Madeira de lei certificada. Visual nobre.',
    cor: '#6f3a1a',
    regiao: 'mantiqueira',
    fontes: [
      { url: 'https://www.aecweb.com.br/produto/telhas-de-madeira-taubilha/3636', label: 'AECweb · Taubilha de massaranduba', preco: 'R$ 180–250/m²', data: '2024' },
      { url: 'https://imobilismadeiras.com.br/telhas-de-madeira-taubilha-wood-shingles-beleza-e-durabilidade-para-seu-telhado/', label: 'Imobilis Madeiras — Wood Shingles', preco: '13×2×50 cm, 28 telhas/m²', data: '2024' },
    ],
  },
  {
    id: 'telha_ceramica',
    nome: 'Telha cerâmica colonial',
    precoPorM2: 78,
    pesoPorM2: 45,
    durabilidade: '40+ anos',
    nota: 'Tradicional, pesada. Exige estrutura reforçada e inclinação ≥ 30%.',
    cor: '#a05030',
    regiao: 'mantiqueira',
    fontes: [
      { url: 'https://www.leroymerlin.com.br/telha-ceramica-colonial', label: 'Leroy Merlin · Telha colonial', preco: 'R$ 1,80–2,80/telha → R$ 70–90/m²', data: 'mai/2026' },
    ],
  },
  {
    id: 'palha_santafe',
    nome: 'Palha Santa Fé (sapé do Uruguai)',
    precoPorM2: 165,
    pesoPorM2: 22,
    durabilidade: '15–25 anos (camada de 25 cm)',
    nota: 'Tradição gaúcha/uruguaia. Excelente conforto térmico. Espessura final 25 cm.',
    cor: '#b48050',
    regiao: 'mantiqueira',
    fontes: [
      { url: 'https://scali.com.br/servicos/coberturas-ecologicas/coberturas-naturais/', label: 'Scali Wood+Arch · Coberturas naturais', preco: 'R$ 140–190/m² instalada', data: '2024' },
    ],
  },
  {
    id: 'telha_shingle',
    nome: 'Telha asfáltica shingle',
    precoPorM2: 65,
    pesoPorM2: 12,
    durabilidade: '20–25 anos',
    nota: 'Excelente para superfícies curvas. Boa para domos. Mantiqueira/sul.',
    cor: '#3a2a25',
    regiao: 'mantiqueira',
    fontes: [
      { url: 'https://www.iko.com.br', label: 'IKO · telhas shingle', preco: 'R$ 55–80/m² aplicada', data: 'mai/2026' },
    ],
  },
];

// ── VALIDAÇÃO ESTRUTURAL ──────────────────────────────────────────────────
// Heurísticas baseadas na literatura DIY e em domos construídos.
//
// Critérios:
//   1. Diâmetro vs. frequência V — V=1 só até 4 m; V=2 até 6 m; V=3 até 12 m; V=4+ para >10m
//   2. Diâmetro vs. seção da peça estrutural — relação L/r (esbeltez)
//   3. Peso da cobertura vs. material da estrutura — sobrecarga máxima
//   4. Vento — domos com cobertura têxtil precisam estacas helicoidais ou concreto
//   5. Truncamento — esfera completa só com cobertura leve
export function validateStructure(state, dome, data) {
  const findings = [];
  const ok = [];

  const material = data.STRUCTURE_MATERIALS.find((m) => m.id === state.sistemas.estrutura);
  const cobertura = [...data.COVERINGS, ...MANTIQUEIRA_COVERINGS].find((c) => c.id === state.sistemas.cobertura);
  const fundacao = data.FOUNDATIONS.find((f) => f.id === state.sistemas.fundacao);

  // Encontrar maior barra (mais longa)
  const maiorBarra = Math.max(...dome.struts.map((g) => g.length));
  const totalArea = dome.totalArea;

  // 1. Frequência adequada ao diâmetro
  const D = state.forma.diametro;
  if (D > 4 && state.forma.freq < 2) {
    findings.push({
      tipo: 'crítico',
      area: 'frequência × tamanho',
      msg: `Domo de Ø ${D} m com frequência ${state.forma.freq}V tem barras muito longas (${maiorBarra.toFixed(2)} m). Aumente para 2V ou 3V.`,
      ref: 'Domerama · escolha de frequência',
      url: 'http://www.domerama.com/fabricating/making-doors/',
    });
  } else if (D > 8 && state.forma.freq < 3) {
    findings.push({
      tipo: 'aviso',
      area: 'frequência × tamanho',
      msg: `Para Ø ${D} m, 3V é mais comum. Em 2V as barras passam dos 2 m e ficam pesadas.`,
      ref: 'Domerama',
      url: 'http://www.domerama.com/',
    });
  } else if (D > 12 && state.forma.freq < 4) {
    findings.push({
      tipo: 'aviso',
      area: 'frequência × tamanho',
      msg: `Domos > 12 m usam 4V ou 5V para distribuir cargas.`,
      ref: 'Domerama',
      url: 'http://www.domerama.com/',
    });
  } else {
    ok.push(`Frequência ${state.forma.freq}V é adequada para Ø ${D} m.`);
  }

  // 2. Esbeltez da peça (L / espessura)
  const espMm = material.diametro || (material.secao ? parseInt(material.secao.split('×')[1], 10) : 50);
  const esbeltez = (maiorBarra * 1000) / espMm;
  if (esbeltez > 50) {
    findings.push({
      tipo: 'crítico',
      area: 'esbeltez',
      msg: `Maior barra (${(maiorBarra*1000).toFixed(0)} mm) é ${esbeltez.toFixed(0)}× a espessura da peça (${espMm} mm). Acima de 50× há risco de flambagem. Use peça mais grossa ou aumente V.`,
      ref: 'NBR 7190 · projeto de madeira',
      url: 'https://www.abntcatalogo.com.br',
    });
  } else if (esbeltez > 35) {
    findings.push({
      tipo: 'aviso',
      area: 'esbeltez',
      msg: `Esbeltez ${esbeltez.toFixed(0)}× — aceitável mas reforçar contraventamento interno se houver carga de vento alta.`,
      ref: 'NBR 7190',
      url: 'https://www.abntcatalogo.com.br',
    });
  } else {
    ok.push(`Esbeltez ${esbeltez.toFixed(0)}× — abaixo do limite de 35×.`);
  }

  // 3. Peso da cobertura
  const pesoCobertura = cobertura.pesoPorM2 * totalArea;
  const pesoEstrutura = material.pesoLinear * dome.totalLinear;
  const cargaPorBarra = pesoCobertura / dome.edges.length;
  const tracaoMaxPerBarra = (material.tracaoMax * espMm * espMm) / 1000; // muito grosseiro
  if (pesoCobertura / totalArea > 30 && material.id.startsWith('bambu')) {
    findings.push({
      tipo: 'crítico',
      area: 'sobrecarga da cobertura',
      msg: `Cobertura pesa ${(pesoCobertura/totalArea).toFixed(0)} kg/m² sobre estrutura de bambu. Pesado demais — bambu suporta até ~25 kg/m² em casca. Trocar para eucalipto ou aliviar cobertura.`,
      ref: 'INBAR · diretrizes para bambu estrutural',
      url: 'https://www.inbar.int',
    });
  } else if (pesoCobertura / totalArea > 45 && !['eucalipto_rolico','pequi_cumbaru'].includes(material.id)) {
    findings.push({
      tipo: 'aviso',
      area: 'sobrecarga',
      msg: `Cobertura ${(pesoCobertura/totalArea).toFixed(0)} kg/m² é alta. Recomendado eucalipto roliço ou cumbaru.`,
      ref: 'NBR 7190',
    });
  } else {
    ok.push(`Cobertura ${(pesoCobertura/totalArea).toFixed(1)} kg/m² é compatível com estrutura.`);
  }

  // 4. Vento × fundação
  const coberturaPesada = pesoCobertura / totalArea > 30;
  const fundacaoFraca = ['pneu_terra','pedras_secas'].includes(fundacao.id);
  const areaExposta = totalArea * 0.5; // estimativa de área frontal
  if (!coberturaPesada && fundacaoFraca && D >= 5) {
    findings.push({
      tipo: 'aviso',
      area: 'ancoragem ao vento',
      msg: `Domo de Ø ${D} m com cobertura leve (${(pesoCobertura/totalArea).toFixed(1)} kg/m²) e fundação ${fundacao.nome.toLowerCase()} pode levantar com vento >70 km/h. Use estacas helicoidais ou sapatas de concreto.`,
      ref: 'NBR 6123 · cargas de vento',
      url: 'https://www.abntcatalogo.com.br',
    });
  } else {
    ok.push(`Fundação compatível com a carga prevista.`);
  }

  // 5. Truncamento + cobertura pesada
  if (state.forma.truncamento >= 0.75 && pesoCobertura / totalArea > 30) {
    findings.push({
      tipo: 'aviso',
      area: 'forma × cobertura',
      msg: `Domo ¾ com cobertura pesada concentra mais peso nas barras inferiores. Considere reforço dos hubs do anel de base.`,
    });
  }

  // 6. Aberturas
  const opnArea = computeOpeningsArea(state.aberturas, data.OPENING_TYPES);
  const pctAberturas = (opnArea / totalArea) * 100;
  if (pctAberturas > 30) {
    findings.push({
      tipo: 'crítico',
      area: 'integridade da casca',
      msg: `${pctAberturas.toFixed(0)}% da casca em aberturas é excessivo. Limite recomendado: 25%. Adicione riser wall para mover aberturas para parede vertical.`,
      ref: 'MadeHow · 50% só na base é ok, mas requer arcos',
      url: 'https://www.madehow.com/Volume-6/Geodesic-Dome.html',
    });
  } else if (pctAberturas > 20) {
    findings.push({
      tipo: 'aviso',
      area: 'integridade da casca',
      msg: `${pctAberturas.toFixed(0)}% em aberturas — atenção aos arcos de reforço em torno das maiores.`,
    });
  } else {
    ok.push(`Aberturas representam ${pctAberturas.toFixed(0)}% da casca — saudável.`);
  }

  // 7. Riser wall
  if ((state.aberturas.porta_principal || state.aberturas.porta_emergencia) && !state.riser?.ativa) {
    findings.push({
      tipo: 'info',
      area: 'portas vs. curvatura',
      msg: `Sem riser wall, portas precisam acompanhar a curvatura. Ative riser wall de 60–90 cm para usar portas retangulares de mercado.`,
      ref: 'BobVila · riser walls 1–4 ft',
      url: 'https://www.bobvila.com/design/geodesic-dome-house/',
    });
  }

  // Resumo: contagem por tipo
  const cnt = findings.reduce((acc, f) => { acc[f.tipo] = (acc[f.tipo]||0)+1; return acc; }, {});
  const passou = (cnt.crítico || 0) === 0;

  return {
    passou,
    cnt,
    findings,
    ok,
    resumoTexto: passou
      ? '✓ Construível com as escolhas atuais. Atender aos avisos eleva a segurança.'
      : '✗ Há problemas críticos que precisam ser corrigidos antes de obra.',
    metrics: {
      maiorBarra,
      esbeltez,
      pesoCobertura,
      pesoEstrutura,
      cargaPorBarra,
      pctAberturas,
    },
  };
}

function computeOpeningsArea(ab, OP) {
  let a = 0;
  if (ab.porta_principal) a += OP.porta_principal.area;
  if (ab.porta_emergencia) a += OP.porta_emergencia.area;
  a += (ab.janelas_basc || 0) * OP.janela_basculante.area;
  a += (ab.janelas_redondas || 0) * OP.janela_redonda.area;
  if (ab.cupula_zenital) a += OP.cupula_zenital.area;
  a += (ab.abertura_ventilacao || 0) * OP.abertura_ventilacao.area;
  return a;
}
