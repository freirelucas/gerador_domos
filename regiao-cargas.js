// regiao-cargas.js — Cargas de vento, neve e referência de cidades por região
// Fontes: NBR 6123 (vento), NBR 6120 (cargas variáveis), INMET (mapa de ventos),
// CB-ABNT 6123 anexo A. Para neve, NBR 14762:2010 (estruturas em aço).

export const REGIOES = [
  {
    id: 'cerrado_central',
    label: 'Cerrado · BR-Central',
    cidades: ['Brasília', 'Goiânia', 'Cuiabá', 'Palmas', 'Pirenópolis'],
    vento_v0: 35,         // m/s — velocidade básica NBR 6123 (V0 a 10 m, T=50 anos)
    vento_referencia: 'NBR 6123 zona 1 — interior do BR-Central',
    neve_kgm2: 0,
    chuva_mm_dia: 95,     // chuva intensa típica (24h, T=10 anos)
    temp_extrema_c: [-2, 42],
    sismo: 'baixa',
    observ: 'Estação seca jul-set: vento NE pode levantar lonas mal ancoradas. Ancoragem ≥ 350 N por hub do anel inferior.',
  },
  {
    id: 'mata_atl_costa',
    label: 'Mata Atlântica · costa',
    cidades: ['Florianópolis', 'Rio de Janeiro', 'Vitória', 'Salvador'],
    vento_v0: 45,
    vento_referencia: 'NBR 6123 zona 2 — costa atlântica sul/sudeste',
    neve_kgm2: 0,
    chuva_mm_dia: 140,
    temp_extrema_c: [8, 40],
    sismo: 'baixa',
    observ: 'Brisa marítima carrega sal: prefira aço galvanizado a frio ou inox para hubs. Lonas com proteção UV obrigatória.',
  },
  {
    id: 'mantiqueira',
    label: 'Serra da Mantiqueira',
    cidades: ['Campos do Jordão', 'Monte Verde', 'Visconde de Mauá', 'Itamonte'],
    vento_v0: 38,
    vento_referencia: 'NBR 6123 zona 1 — altitude > 1500 m',
    neve_kgm2: 18,        // geada pesada e neve ocasional — carga estática
    chuva_mm_dia: 120,
    temp_extrema_c: [-6, 30],
    sismo: 'baixa',
    observ: 'Geadas em junho-julho. Inclinação da cobertura ≥ 22° para escoar gelo. Pé-direito útil maior é vantagem térmica.',
  },
  {
    id: 'caatinga',
    label: 'Caatinga · semi-árido',
    cidades: ['Petrolina', 'Mossoró', 'Juazeiro', 'Campina Grande'],
    vento_v0: 40,
    vento_referencia: 'NBR 6123 zona 1 — semi-árido NE',
    neve_kgm2: 0,
    chuva_mm_dia: 70,
    temp_extrema_c: [10, 45],
    sismo: 'baixa-moderada',
    observ: 'Radiação solar extrema. Cobertura clara, ventilação cruzada e cúpula zenital são essenciais. Madeira da região: aroeira, angico.',
  },
  {
    id: 'amazonia',
    label: 'Amazônia · floresta',
    cidades: ['Manaus', 'Belém', 'Porto Velho', 'Rio Branco'],
    vento_v0: 30,
    vento_referencia: 'NBR 6123 zona 1 — Amazônia ocidental',
    neve_kgm2: 0,
    chuva_mm_dia: 180,
    temp_extrema_c: [18, 38],
    sismo: 'baixa',
    observ: 'Umidade > 85%. Madeira não-tratada apodrece em <2 anos. Use jatobá-folha-miúda ou bambu autoclavado. Cobertura impermeável obrigatória.',
  },
  {
    id: 'pampa',
    label: 'Pampa · Sul',
    cidades: ['Bagé', 'Pelotas', 'Santana do Livramento', 'São Gabriel'],
    vento_v0: 50,         // ventos minuano podem chegar a 100 km/h
    vento_referencia: 'NBR 6123 zona 3 — região sul, ventos minuano',
    neve_kgm2: 8,
    chuva_mm_dia: 110,
    temp_extrema_c: [-5, 38],
    sismo: 'baixa',
    observ: 'Minuano sopra forte de SO. Orientar porta principal para NE. Ancoragem mínima 600 N por hub. Cobertura com costuras duplas.',
  },
];

// ─── Cálculo de carga de vento simplificado (NBR 6123 reduzido) ────────────
// q = 0.613 · Vk²    onde Vk = V0 · S1 · S2 · S3
// S1 = topografia (1.0 plano), S2 = rugosidade+altura (0.86 para 5m altura),
// S3 = importância (1.0 residencial)
export function cargaVento(regiao, altura_m = 3.5) {
  const S1 = 1.0;
  const S2 = altura_m < 5 ? 0.86 : 0.93;
  const S3 = 1.0;
  const Vk = regiao.vento_v0 * S1 * S2 * S3;
  const q = 0.613 * Vk * Vk;                     // pressão dinâmica em N/m²
  return {
    Vk,
    q_Nm2: q,
    q_kgm2: q / 9.81,
  };
}

// Carga total na casca + tração por hub do anel inferior (simplificado)
// Força de arrasto: F = Ca · q · A  (Ca = 0.65 para domo geodésico ⅝, ABNT/ASCE 7-22)
export function cargaTotalDomo(regiao, dome, alturaTotal_m) {
  const v = cargaVento(regiao, alturaTotal_m / 2);
  const Ca = 0.65;
  // Projeção frontal aproximada do domo: A_proj ≈ π · R · h
  const R = dome.diameter / 2;
  const A_proj = Math.PI * R * alturaTotal_m * 0.5;  // metade da área frontal
  const F_total = Ca * v.q_Nm2 * A_proj;             // N
  // Distribui em metade dos hubs do anel inferior (lado a barlavento)
  const baseHubsCount = countBaseHubs(dome);
  const F_por_hub_N = F_total / Math.max(3, baseHubsCount / 2);
  const F_por_hub_kgf = F_por_hub_N / 9.81;
  // Neve uniforme sobre projeção horizontal
  const A_planta = Math.PI * R * R;
  const F_neve = regiao.neve_kgm2 * 9.81 * A_planta; // N
  return {
    pressao: v,
    F_arrasto_N: F_total,
    F_por_hub_kgf,
    F_neve_N: F_neve,
    F_neve_kg: regiao.neve_kgm2 * A_planta,
    A_proj,
    A_planta,
    Ca,
  };
}

function countBaseHubs(dome) {
  const r = dome.diameter / 2;
  const minY = Math.min(...[...dome.used].map((i) => dome.verts[i][2] * r));
  return dome.hubs.filter((h) => Math.abs(h.pos[2]*r - minY) < 0.05).length;
}

// ─── Lojas para a lista de compras ─────────────────────────────────────────
export const LOJAS = {
  serraria: {
    nome: 'Serraria / madeireira local',
    icone: '◗',
    cor: '#b4742a',
    pesquisa: 'https://www.google.com/search?q=serraria+eucalipto+tratado+',
    categorias: ['estrutura'],
  },
  ferragem: {
    nome: 'Loja de ferragens / casa do construtor',
    icone: '◍',
    cor: '#3a3a3a',
    pesquisa: 'https://www.google.com/search?q=ferragem+construtor+',
    categorias: ['conectores', 'aberturas-acessorios', 'ferramentas'],
  },
  lonas: {
    nome: 'Loja de lonas e plásticos técnicos',
    icone: '▱',
    cor: '#2a4d70',
    pesquisa: 'https://www.google.com/search?q=lonas+PVC+750+',
    categorias: ['cobertura'],
  },
  vidracaria: {
    nome: 'Vidraçaria / esquadrias',
    icone: '▢',
    cor: '#6b4a8c',
    pesquisa: 'https://www.google.com/search?q=vidracaria+esquadrias+',
    categorias: ['aberturas'],
  },
  agua: {
    nome: 'Loja de hidráulica',
    icone: '◐',
    cor: '#4a5d3a',
    pesquisa: 'https://www.google.com/search?q=hidraulica+cisterna+',
    categorias: ['agua'],
  },
  solar: {
    nome: 'Loja solar / elétrica',
    icone: '☀',
    cor: '#d99a4a',
    pesquisa: 'https://www.google.com/search?q=kit+solar+fotovoltaico+',
    categorias: ['energia'],
  },
  obra: {
    nome: 'Material de obra (concreto, areia)',
    icone: '▦',
    cor: '#8b7a5d',
    pesquisa: 'https://www.google.com/search?q=concreto+saco+50kg+',
    categorias: ['fundacao', 'piso'],
  },
};

// Mapa: categoria → loja
export function categoriaParaLoja(categoria) {
  for (const [id, loja] of Object.entries(LOJAS)) {
    if (loja.categorias.includes(categoria)) return id;
  }
  return 'ferragem'; // fallback
}
