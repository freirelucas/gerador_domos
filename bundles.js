// bundles.js — Catálogo de "assinaturas construtivas" + composição de projeto.
//
// Um bundle é uma combinação pré-vetada de (estrutura + conector + cobertura +
// fundação) cuja compatibilidade material foi pensada antes — dilatação
// térmica, vedação no ápice, disponibilidade regional, peso compatível com a
// fundação. Em vez de deixar o usuário escolher entre 504 combinações livres
// na Etapa 4 (das quais talvez 60 funcionam de verdade), o funil oferece
// 4 bundles internamente coerentes.
//
// MVP: 2 estilos × 2 regiões = 4 bundles. A função (pra que serve o domo)
// vem dos USE_SCENARIOS já existentes em programa.js — não duplico dados.
// Expansão para mais estilos/regiões: adicionar entradas em BUNDLES; tudo
// resto é dirigido pela combinação `${estilo}_${regiao}` como chave.
//
// Compatibilidade material aplicada em cada bundle:
//   - vernáculo: madeira-com-madeira (hub_madeira + estrutura em madeira) →
//     ambos respondem à umidade na mesma proporção, sem folga diferencial.
//   - técnico: aço com madeira → especificar **furo oblongo** em
//     notasConstrutivas pra acomodar dilatação diferencial
//     (αaço=12e-6/°C vs αmadeira_longitudinal=4e-6/°C).
//   - Mantiqueira: chuva 120 mm/dia + geada → vedação reforçada no ápice +
//     fundação ancorada/seca elevada (sem alagamento).
//   - Cerrado: UV intensa + vento NE seco → proteção semestral de membranas
//     + ancoragem ao vento (≥ 350 N/hub do anel inferior).

import { USE_SCENARIOS } from './programa.js';

// ── Funções (6 tags amigáveis → cenários existentes) ─────────────────────────
// Cada tag agrupa 1+ cenários do USE_SCENARIOS. O `defaultCenario` é o que
// vai ser usado pra preencher programa/forma; os demais ficam disponíveis
// pra refinar depois na Etapa 1.
export const FUNCOES = [
  {
    id: 'hospedar',
    label: 'hospedar',
    icone: '⛺',
    desc: 'receber gente — glamping, quarto de hóspedes, hospedagem temporária',
    exemplo: 'ex: glamping para um casal',
    cenarios: ['glamping_casal', 'quiosque'],
    defaultCenario: 'glamping_casal',
  },
  {
    id: 'habitar',
    label: 'habitar',
    icone: '⌂',
    desc: 'morar — casa-domo com cozinha, banho, dormitório',
    exemplo: 'ex: casa-domo completa',
    cenarios: ['casa_pequena'],
    defaultCenario: 'casa_pequena',
  },
  {
    id: 'trabalhar',
    label: 'trabalhar',
    icone: '◇',
    desc: 'estúdio, ateliê, coworking, escritório',
    exemplo: 'ex: ateliê com luz zenital',
    cenarios: ['ateliê'],
    defaultCenario: 'ateliê',
  },
  {
    id: 'cultivar',
    label: 'cultivar',
    icone: '🌱',
    desc: 'horta protegida, estufa, viveiro, aviário',
    exemplo: 'ex: estufa / horta',
    cenarios: ['estufa_horta', 'aviario'],
    defaultCenario: 'estufa_horta',
  },
  {
    id: 'contemplar',
    label: 'contemplar',
    icone: '♨︎',
    desc: 'sauna, temazcal, espaço meditativo',
    exemplo: 'ex: sauna baixa fechada',
    cenarios: ['sauna'],
    defaultCenario: 'sauna',
  },
  {
    id: 'ensinar',
    label: 'ensinar',
    icone: '★',
    desc: 'playground, escola, oficina educativa',
    exemplo: 'ex: playground infantil',
    cenarios: ['playground'],
    defaultCenario: 'playground',
  },
];

// ── Estilos (2) ──────────────────────────────────────────────────────────────
export const ESTILOS = [
  {
    id: 'vernaculo',
    label: 'vernáculo rústico',
    pitch:
      'Madeira aparente, baixa tecnologia, vocabulário rural-serrano. ' +
      'Hub de madeira maciça feito por marceneiro local — sem aço visível, ' +
      'sem soldagem. Cobertura natural ou taubilha. Fundação seca quando dá.',
    atributos: ['madeira aparente', 'hub de madeira', 'sem solda'],
    fonte: {
      label: 'inspirado em Scali Wood+Arch · Serra da Mantiqueira',
      url: 'https://scali.com.br/servicos/coberturas-ecologicas/',
      ano: '2024',
    },
  },
  {
    id: 'tecnico',
    label: 'cabana técnica',
    pitch:
      'Madeira engenheirada + hub metálico com furo oblongo (acomoda ' +
      'dilatação diferencial aço×madeira). Cobertura industrial selável, ' +
      'fundação ancorada. Pegada construtiva próxima do que Maron descreve.',
    atributos: ['hub metálico furo oblongo', 'cobertura industrial', 'fundação ancorada'],
    fonte: {
      label: 'MARON 2018 · Cúpulas Geodésicas (Ameríndia, CC BY-SA)',
      url: 'https://amerindia.org.br/',
      ano: '2018',
    },
  },
];

// ── Regiões (2) ──────────────────────────────────────────────────────────────
// `climaDefault` mapeia para um id de CLIMATE_ZONES (programa.js).
// `regiaoId` mapeia para REGIOES (regiao-cargas.js) — usado em state.v3.regiao.
export const REGIOES_FUNIL = [
  {
    id: 'mantiqueira',
    label: 'Serra da Mantiqueira',
    climaDefault: 'mantiqueira',
    regiaoId: 'mantiqueira',
    cidades: ['Campos do Jordão', 'Monte Verde', 'Passa Quatro', 'Visconde de Mauá', 'Itamonte'],
    metricas: 'vento 38 m/s · chuva 120 mm/dia · neve 0 (decorativa, sem carga) · –3 °C a 28 °C típicas',
    riscos: [
      'infiltração no ápice por chuva concentrada + neblina',
      'fungo na madeira por umidade > 80 % o ano todo — tratamento antifúngico essencial',
      'geada frequente jun-ago — protege madeira do contato direto; não impõe carga, mas pede inclinação ≥ 22° pra escoar chuva',
    ],
  },
  {
    id: 'cerrado',
    label: 'Cerrado',
    climaDefault: 'cerrado_central',
    regiaoId: 'cerrado_central',
    cidades: ['Brasília', 'Goiânia', 'Cuiabá', 'Palmas', 'Pirenópolis'],
    metricas: 'vento 35 m/s · chuva 95 mm/dia · neve 0 · –2 °C a 42 °C típicas',
    riscos: [
      'UV intensa o ano todo — membranas precisam de manutenção semestral',
      'ressecamento da madeira na seca jul-set',
      'rajadas NE podem levantar lonas mal ancoradas (≥ 350 N/hub)',
    ],
  },
];

// ── Os 4 bundles ─────────────────────────────────────────────────────────────
// Chave = `${estiloId}_${regiaoId}`. Cada bundle aponta para ids reais dos
// catálogos (materials-v2.js + extras.js). Coberturas de Mantiqueira vivem
// em MANTIQUEIRA_COVERINGS (extras.js); o resto em COVERINGS (materials-v2.js).
// O renderer da Etapa 4 já faz merge dos dois catálogos via api.data.COVERINGS.
export const BUNDLES = {
  vernaculo_mantiqueira: {
    id: 'vernaculo_mantiqueira',
    estilo: 'vernaculo',
    regiao: 'mantiqueira',
    estrutura: 'eucalipto_rolico',
    conector: 'hub_madeira',
    cobertura: 'taubilha_pinus',   // extras.js · MANTIQUEIRA_COVERINGS
    fundacao: 'pedras_secas',
    notasConstrutivas: [
      'overlap mínimo de 7 cm na taubilha — escoa chuva concentrada (120 mm/dia)',
      'cumeeira de chumbo (ou zinco dobrado) no pentágono superior — é onde a água converge',
      'drenagem perimetral de brita + impermeabilizar tope das pedras secas pra cortar capilaridade',
      'inclinação de cobertura ≥ 22° já vem garantida pela frequência 3v · ⅝',
      'lambril ventilado entre cobertura e estrutura pra evitar condensação interna',
    ],
    fontes: [
      { label: 'Scali Wood+Arch · coberturas naturais', url: 'https://scali.com.br/servicos/coberturas-ecologicas/coberturas-naturais/', ano: '2024' },
      { label: 'NBR 6123 · cargas de vento', url: 'https://www.abntcatalogo.com.br', ano: '2013' },
    ],
  },
  vernaculo_cerrado: {
    id: 'vernaculo_cerrado',
    estilo: 'vernaculo',
    regiao: 'cerrado',
    estrutura: 'eucalipto_rolico',
    conector: 'hub_madeira',
    cobertura: 'tabua_pinus',       // tábua pinus + manta asfáltica
    fundacao: 'pedras_secas',
    notasConstrutivas: [
      'verniz UV ou óleo de linhaça semestral na madeira aparente — ressecamento forte na seca',
      'sombreamento opcional na face oeste (toldo retrátil ou trepadeira) reduz pico térmico em 4–6 °C',
      'considere pequi/cumbaru (Cerrado · manejada) se houver oferta local — durabilidade superior ao eucalipto, ~3× o custo',
      'manta asfáltica sob a tábua pinus precisa de respiro lateral pra não aquecer demais',
    ],
    fontes: [
      { label: 'MARON 2018 · Cúpulas Geodésicas', url: 'https://amerindia.org.br/', ano: '2018' },
      { label: 'Embrapa Cerrados · madeiras nativas manejadas', url: 'https://www.embrapa.br/cerrados', ano: '2021' },
    ],
  },
  tecnico_mantiqueira: {
    id: 'tecnico_mantiqueira',
    estilo: 'tecnico',
    regiao: 'mantiqueira',
    estrutura: 'eucalipto_rolico',
    conector: 'aco_galv',
    cobertura: 'telha_shingle',     // extras.js · MANTIQUEIRA_COVERINGS (shingle adapta-se à curvatura)
    fundacao: 'estaca_helicoidal',
    notasConstrutivas: [
      'furo oblongo nos hubs de aço (alongamento radial 3 mm) — acomoda dilatação diferencial αaço×αmadeira',
      'arruela de pressão + EPDM 3 mm em cada parafuso passante — selo dinâmico que aguenta a respiração da madeira',
      'rufo de alumínio nos 5 pentágonos superiores — é onde shingle costuma vazar em superfície curva',
      'starter strip + drip edge na base obrigatórios — escorrimento concentrado',
      'estaca helicoidal Ø 76 mm × 1,5 m em cada hub do anel inferior — ancoragem a vento + drenagem livre',
    ],
    fontes: [
      { label: 'MARON 2018 · Cúpulas Geodésicas', url: 'https://amerindia.org.br/', ano: '2018' },
      { label: 'IKO · manual técnico de telha shingle', url: 'https://www.iko.com.br', ano: '2024' },
      { label: 'NBR 6123 · cargas de vento (zona 1, altitude > 1500 m)', url: 'https://www.abntcatalogo.com.br', ano: '2013' },
    ],
  },
  tecnico_cerrado: {
    id: 'tecnico_cerrado',
    estilo: 'tecnico',
    regiao: 'cerrado',
    estrutura: 'eucalipto_rolico',
    conector: 'aco_galv',
    cobertura: 'lona_pvc',
    fundacao: 'pneu_terra',
    notasConstrutivas: [
      'furo oblongo nos hubs (mesmo motivo do bundle Mantiqueira: dilatação aço×madeira)',
      'lona PVC encerada com proteção UV — reaplicar tratamento UV a cada 24 meses',
      'tensionamento radial constante: revisar tensão da lona a cada 6 meses (especialmente após seca)',
      'pneus enterrados precisam ser preenchidos com terra socada compactada (camadas de 15 cm)',
      'ancoragem mínima 350 N por hub do anel inferior — rajada NE característica',
    ],
    fontes: [
      { label: 'MARON 2018 · Cúpulas Geodésicas', url: 'https://amerindia.org.br/', ano: '2018' },
      { label: 'NBR 6123 · cargas de vento (Cerrado · zona 1)', url: 'https://www.abntcatalogo.com.br', ano: '2013' },
      { label: 'Earthship Biotecture · pneu-terra', url: 'https://www.earthshipglobal.com/', ano: '2023' },
    ],
  },
};

// ── Compositor ───────────────────────────────────────────────────────────────
// Recebe { funcao, estilo, regiao } e retorna o "patch" pra mergear em state.
// Determinístico (chamadas iguais retornam objetos com mesmo conteúdo) —
// fundamental pros snapshot tests.
//
// Não muta nada externamente; retorna estrutura nova.
export function composeBundle({ funcao, estilo, regiao }) {
  const funcaoDef = FUNCOES.find((f) => f.id === funcao);
  if (!funcaoDef) throw new Error(`composeBundle: função desconhecida "${funcao}"`);

  const cenarioId = funcaoDef.defaultCenario;
  const cenario = USE_SCENARIOS.find((s) => s.id === cenarioId);
  if (!cenario) throw new Error(`composeBundle: cenário "${cenarioId}" não existe em USE_SCENARIOS`);

  const regiaoDef = REGIOES_FUNIL.find((r) => r.id === regiao);
  if (!regiaoDef) throw new Error(`composeBundle: região desconhecida "${regiao}"`);

  const bundleId = `${estilo}_${regiao}`;
  const bundle = BUNDLES[bundleId];
  if (!bundle) throw new Error(`composeBundle: bundle "${bundleId}" não existe`);

  return {
    programa: {
      cenario:    cenarioId,
      capacidade: cenario.capacidade,
      modulos:    [...cenario.modulosDefault],
      clima:      regiaoDef.climaDefault,
    },
    forma: {
      diametro:    cenario.sugestaoDiametro,
      freq:        cenario.sugestaoFreq,
      truncamento: cenario.sugestaoTrunc,
    },
    sistemas: {
      estrutura: bundle.estrutura,
      conector:  bundle.conector,
      cobertura: bundle.cobertura,
      fundacao:  bundle.fundacao,
    },
    v3: {
      regiao: regiaoDef.regiaoId,
      funilEscolha: { funcao, estilo, regiao, bundleId, cenarioId },
    },
    avisosRegionais: [...bundle.notasConstrutivas],
    fontes:          bundle.fontes.map((f) => ({ ...f })),
  };
}

// Helper: lookup label "humano" do bundle pra mostrar no selo do wizard.
export function bundleSelo({ funcao, estilo, regiao }) {
  const f = FUNCOES.find((x) => x.id === funcao);
  const e = ESTILOS.find((x) => x.id === estilo);
  const r = REGIOES_FUNIL.find((x) => x.id === regiao);
  if (!f || !e || !r) return null;
  return `${f.label} · ${e.label} · ${r.label}`;
}
