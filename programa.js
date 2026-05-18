// programa.js — Módulos funcionais (banheiro, cozinha, etc.) e cenários de uso
//
// Cada módulo de programa tem uma área mínima recomendada (m²) baseada em
// dimensionamento residencial padrão para projetos pequenos / cabanas / glamping.
//
// Referências de dimensionamento:
//   - NBR 9050 (acessibilidade): banheiro acessível ≥ 1,50 × 1,70 m = 2,55 m²
//   - SindusCon-SP / projetos tiny house: dormitório casal ≥ 7 m²,
//     cozinha-copa compacta ≥ 5 m², sala/estar mínima ≥ 7 m².

export const PROGRAM_MODULES = {
  banheiro: {
    label: 'Banheiro completo',
    areaMin: 3.5,
    nota: 'Vaso + chuveiro + lavatório. NBR 9050 para acesso.',
    raciocinio: 'NBR 9050: módulo de manobra 1,50 × 1,70 m + área molhada.',
  },
  banheiro_seco: {
    label: 'Banheiro seco (compostagem)',
    areaMin: 2.0,
    nota: 'Vaso compostável + lavatório externo. Comum em ecovilas.',
    raciocinio: 'Sem caixa d\'água; ventilação cruzada obrigatória.',
  },
  cozinha: {
    label: 'Cozinha / copa',
    areaMin: 6.0,
    nota: 'Pia, fogão, geladeira, bancada. Coifa recomendada.',
    raciocinio: 'Bancada linear 2,5 m + circulação 1 m + zona de refeição.',
  },
  kitchenette: {
    label: 'Kitchenette mínima',
    areaMin: 3.0,
    nota: 'Pia + cooktop 2 bocas + frigobar. Sem zona de refeição.',
    raciocinio: 'Bancada compacta 1,8 m, sem coifa formal.',
  },
  dormitorio: {
    label: 'Dormitório casal',
    areaMin: 8.0,
    nota: 'Cama queen 1,60 × 2,00 m + circulação + guarda-roupa.',
    raciocinio: 'Cama (3,2 m²) + circulação lateral 60 cm em 3 lados + 1,5 m² armário.',
  },
  dormitorio_solo: {
    label: 'Dormitório solteiro',
    areaMin: 5.0,
    nota: 'Cama 0,88 × 1,88 m + circulação.',
    raciocinio: 'Cama (1,65 m²) + circulação + mesa lateral.',
  },
  sala_estar: {
    label: 'Sala de estar',
    areaMin: 9.0,
    nota: 'Sofá + poltrona + mesa de centro. 3-4 pessoas.',
    raciocinio: 'Sofá 2 lugares (1,4 m²) + circulação + zona social.',
  },
  varanda: {
    label: 'Varanda / deck externo',
    areaMin: 6.0,
    nota: 'Estende a área útil; não conta para vedação.',
    raciocinio: 'Faixa periférica 1,5 m × frente do domo.',
  },
  lareira: {
    label: 'Lareira / fogão à lenha',
    areaMin: 2.5,
    nota: 'Recuo mínimo 1,5 m de qualquer combustível.',
    raciocinio: 'Base de alvenaria + chaminé saindo pela cúpula.',
  },
  hidromassagem: {
    label: 'Banheira / ofurô',
    areaMin: 4.5,
    nota: 'Reforço estrutural no piso obrigatório (>500 kg cheio).',
    raciocinio: 'Banheira 1,60 × 0,75 m + área molhada perimetral.',
  },
};

// Cenários de uso pré-configurados (sugestões de combinação)
export const USE_SCENARIOS = [
  {
    id: 'glamping_casal',
    nome: 'Glamping para casal',
    descricao: 'Hospedagem ⅝ domo com banheiro e mini-copa.',
    icone: '⛺',
    sugestaoDiametro: 5.5,
    sugestaoFreq: 3,
    sugestaoTrunc: 0.625,
    modulosDefault: ['dormitorio', 'banheiro', 'kitchenette'],
    capacidade: 2,
    sugestaoEstrutura: 'eucalipto_rolico',
    sugestaoCobertura: 'lona_pvc',
  },
  {
    id: 'estufa_horta',
    nome: 'Estufa / horta',
    descricao: 'Cultivo protegido com ventilação cruzada e cúpula.',
    icone: '🌱',
    sugestaoDiametro: 4.5,
    sugestaoFreq: 2,
    sugestaoTrunc: 0.5,
    modulosDefault: [],
    capacidade: 1,
    sugestaoEstrutura: 'bambu_mosso',
    sugestaoCobertura: 'sombrite',
  },
  {
    id: 'sauna',
    nome: 'Sauna / temazcal',
    descricao: 'Domo baixo com massa térmica e vedação fechada.',
    icone: '♨︎',
    sugestaoDiametro: 4.0,
    sugestaoFreq: 2,
    sugestaoTrunc: 0.5,
    modulosDefault: ['lareira'],
    capacidade: 4,
    sugestaoEstrutura: 'sarrafo_pinus',
    sugestaoCobertura: 'taipa_leve',
  },
  {
    id: 'quiosque',
    nome: 'Quiosque / sala aberta',
    descricao: 'Cobertura social aberta nas laterais.',
    icone: '☂︎',
    sugestaoDiametro: 7.0,
    sugestaoFreq: 3,
    sugestaoTrunc: 0.5,
    modulosDefault: ['sala_estar'],
    capacidade: 8,
    sugestaoEstrutura: 'eucalipto_rolico',
    sugestaoCobertura: 'buriti',
  },
  {
    id: 'casa_pequena',
    nome: 'Casa-domo completa',
    descricao: 'Moradia 1 dormitório com banheiro e cozinha.',
    icone: '⌂',
    sugestaoDiametro: 8.0,
    sugestaoFreq: 3,
    sugestaoTrunc: 0.625,
    modulosDefault: ['dormitorio', 'banheiro', 'cozinha', 'sala_estar'],
    capacidade: 2,
    sugestaoEstrutura: 'eucalipto_rolico',
    sugestaoCobertura: 'tabua_pinus',
  },
  {
    id: 'aviario',
    nome: 'Galinheiro / aviário',
    descricao: 'Estrutura ventilada com tela e poleiros.',
    icone: '✦',
    sugestaoDiametro: 4.0,
    sugestaoFreq: 2,
    sugestaoTrunc: 0.5,
    modulosDefault: [],
    capacidade: 12,
    sugestaoEstrutura: 'bambu_mosso',
    sugestaoCobertura: 'sombrite',
  },
  {
    id: 'playground',
    nome: 'Playground infantil',
    descricao: 'Estrutura escalável para crianças, redes, balanços.',
    icone: '★',
    sugestaoDiametro: 5.0,
    sugestaoFreq: 2,
    sugestaoTrunc: 0.625,
    modulosDefault: [],
    capacidade: 6,
    sugestaoEstrutura: 'sarrafo_pinus',
    sugestaoCobertura: 'lona_pvc',
  },
  {
    id: 'ateliê',
    nome: 'Ateliê / coworking',
    descricao: 'Espaço de trabalho com luz zenital.',
    icone: '◇',
    sugestaoDiametro: 6.5,
    sugestaoFreq: 3,
    sugestaoTrunc: 0.625,
    modulosDefault: ['sala_estar', 'kitchenette', 'banheiro'],
    capacidade: 4,
    sugestaoEstrutura: 'eucalipto_rolico',
    sugestaoCobertura: 'lona_pvc',
  },
];

// Zonas climáticas do Cerrado (orientações de projeto)
export const CLIMATE_ZONES = [
  {
    id: 'cerrado_central',
    label: 'Cerrado central (DF/GO/TO)',
    chuva: 'mai–set seco; out–abr chuvas intensas',
    vento: 'predominante leste, rajadas até 80 km/h em tempestade',
    sol: 'incidência alta — proteger oeste',
    nota: 'Cumeeira N-S; abertura principal a leste; sombreamento oeste.',
  },
  {
    id: 'cerrado_norte',
    label: 'Cerrado norte (MA/PI/BA oeste)',
    chuva: 'chuvas dez–mar; resto seco extremo',
    vento: 'fraco a moderado',
    sol: 'severo o ano todo',
    nota: 'Cobertura clara/refletiva; ventilação cruzada essencial.',
  },
  {
    id: 'cerrado_sul',
    label: 'Cerrado sul (MG/SP)',
    chuva: 'distribuída; invernos secos',
    vento: 'moderado, predominante sul',
    sol: 'moderado',
    nota: 'Abertura principal a norte; isolar piso para inverno.',
  },
  {
    id: 'pantanal',
    label: 'Pantanal/transição',
    chuva: 'cheia nov–mar; alagamentos',
    vento: 'fraco',
    sol: 'severo',
    nota: 'Elevar piso ≥ 50 cm; mosquiteiro obrigatório.',
  },
  {
    id: 'mantiqueira',
    label: 'Serra da Mantiqueira',
    chuva: 'chuvas concentradas dez–mar; neblina o ano todo',
    vento: 'rajadas frias do sul; até 90 km/h em frente fria',
    sol: 'moderado; alta umidade',
    nota: 'Cobertura impermeável + alta inclinação (taubilha/palha). Isolar piso. Ventilação cruzada controlável (fechável no inverno).',
  },
];

// Calcula área útil mínima dos módulos escolhidos (com circulação)
export function programaArea(modulosIds) {
  const base = modulosIds.reduce(
    (s, id) => s + (PROGRAM_MODULES[id]?.areaMin || 0),
    0,
  );
  // Acréscimo de 30% para circulação e perdas por geometria curva
  return { uso: base, total: base * 1.3, circulacao: base * 0.3 };
}

// Sugere diâmetro mínimo para acomodar o programa (área = π * r²)
// para meia esfera, área útil ≈ π * r² do piso.
export function suggestDiameter(modulosIds) {
  const { total } = programaArea(modulosIds);
  if (total === 0) return 4.0;
  const r = Math.sqrt(total / Math.PI);
  const d = 2 * r;
  // Arredondar para 0,5 m e impor mínimo 3 m
  return Math.max(3, Math.ceil(d * 2) / 2);
}
