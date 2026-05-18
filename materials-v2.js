// materials-v2.js — Catálogo expandido com citações de fontes reais (mai/2026)
//
// Cada item carrega `fontes`: array de { url, label, preco, data, observ }.
// Os preços `precoLinear`/`precoPorM2` são MÉDIAS do varejo conservadoras;
// calibre conforme cotação local.

// ── ESTRUTURA ──────────────────────────────────────────────────────────────
export const STRUCTURE_MATERIALS = [
  {
    id: 'bambu_mosso',
    nome: 'Bambu mossô tratado',
    nomeCientifico: 'Phyllostachys edulis',
    diametro: 60,
    espessuraParede: 10,
    pesoLinear: 1.4,
    precoLinear: 11.0,
    comprimentoComercial: 6,
    tracaoMax: 180,
    moduloElasticidade: 18000,
    desperdicio: 0.15,
    nota: 'Tratamento em autoclave ou imersão bórax + ácido bórico. NBR 16828.',
    cor: '#a78145',
    fontes: [
      {
        url: 'https://loja.artbambu.com/bambu-mosso-tratado/',
        label: 'ArtBambu (atacado, SP)',
        preco: 'R$ 60–90/vara 6m → R$ 10–15/m',
        data: 'set/2025',
        observ: 'Tratamento em autoclave; venda em atacado.',
      },
      {
        url: 'https://www.mfrural.com.br/busca/bambu-mosso',
        label: 'MF Rural — anúncios verificados',
        preco: 'R$ 15/vara (in natura) a R$ 25/vara (tratado)',
        data: 'mai/2026',
      },
    ],
  },
  {
    id: 'bambu_dendro',
    nome: 'Bambu Dendrocalamus (gigante)',
    nomeCientifico: 'Dendrocalamus asper',
    diametro: 100,
    espessuraParede: 18,
    pesoLinear: 2.8,
    precoLinear: 16.0,
    comprimentoComercial: 6,
    tracaoMax: 200,
    moduloElasticidade: 20000,
    desperdicio: 0.15,
    nota: 'Para domos > 6 m. Vão maior, parede mais espessa.',
    cor: '#8d6b35',
    fontes: [
      {
        url: 'https://loja.artbambu.com/bambu-mosso-tratado/',
        label: 'ArtBambu / produtores SP-MG',
        preco: 'R$ 90–120/vara 6m',
        data: 'set/2025',
      },
    ],
  },
  {
    id: 'eucalipto_rolico',
    nome: 'Eucalipto roliço tratado',
    nomeCientifico: 'Eucalyptus citriodora / Cloeziana (CCA)',
    diametro: 80,
    pesoLinear: 4.5,
    precoLinear: 22.0,
    comprimentoComercial: 6,
    tracaoMax: 90,
    moduloElasticidade: 13000,
    desperdicio: 0.08,
    nota: 'Tratamento autoclave CCA vácuo-pressão (NBR 9480). Garantia 15+ anos.',
    cor: '#7b5a36',
    fontes: [
      {
        url: 'https://www.calipto.com.br/product-page/eucalipto-roli%C3%A7o-tratado-6m',
        label: 'Calipto (Itu, SP) — Tora 6m',
        preco: 'R$ 110–150/peça → R$ 18–25/m (φ 8–12 cm)',
        data: 'mai/2026',
      },
      {
        url: 'https://www.citriodoraeucalipto.com.br/',
        label: 'Citriodora Eucalipto Tratado (Grande SP)',
        preco: 'Garantia 15 anos; Cloeziana preferido',
        data: 'mai/2026',
      },
    ],
  },
  {
    id: 'sarrafo_pinus',
    nome: 'Sarrafo de pinus 5×10 cm',
    nomeCientifico: 'Pinus elliottii / taeda',
    secao: '50 × 100 mm',
    pesoLinear: 2.3,
    precoLinear: 10.0,
    comprimentoComercial: 3,
    tracaoMax: 40,
    moduloElasticidade: 9000,
    desperdicio: 0.12,
    nota: 'Padrão do mercado. Receber stain + verniz UV. Imunização salgadeira.',
    cor: '#c69466',
    fontes: [
      {
        url: 'https://www.leroymerlin.com.br/sarrafo-pinus-aparelhado-10cm_1570817376',
        label: 'Leroy Merlin — Sarrafo Pinus 10×2×300 cm',
        preco: 'R$ 29,77 (3 m) → R$ 9,92/m',
        data: 'mai/2026',
      },
      {
        url: 'https://www.leroymerlin.com.br/sarrafo-de-pinus-s-no-de-10cm_1570817387',
        label: 'Leroy Merlin — Sarrafo Pinus s/nó 10cm',
        preco: 'R$ 33,03 (3 m) → R$ 11/m',
        data: 'dez/2025',
      },
    ],
  },
  {
    id: 'sarrafo_pinus_fino',
    nome: 'Sarrafo de pinus 5×2 cm',
    nomeCientifico: 'Pinus elliottii',
    secao: '50 × 20 mm',
    pesoLinear: 0.7,
    precoLinear: 5.0,
    comprimentoComercial: 3,
    tracaoMax: 40,
    moduloElasticidade: 9000,
    desperdicio: 0.12,
    nota: 'Para domos pequenos (≤ 4 m) e estruturas leves. Reforçar emendas.',
    cor: '#d6a87a',
    fontes: [
      {
        url: 'https://www.leroymerlin.com.br/sarrafo-pinus-aparelhado-5cm_1570815951',
        label: 'Leroy Merlin — Sarrafo Pinus 5×2×300',
        preco: 'R$ 14,88 (3 m) → R$ 4,96/m',
        data: 'mai/2026',
      },
    ],
  },
  {
    id: 'pequi_cumbaru',
    nome: 'Cumbaru / Pequi (manejada)',
    nomeCientifico: 'Dipteryx alata / Caryocar brasiliense',
    diametro: 70,
    pesoLinear: 4.0,
    precoLinear: 38.0,
    comprimentoComercial: 4,
    tracaoMax: 110,
    moduloElasticidade: 15000,
    desperdicio: 0.18,
    nota: 'APENAS manejo certificado (DOF/IBAMA). Alta densidade, dureza.',
    cor: '#5d3f1f',
    fontes: [
      {
        url: 'https://www.ibama.gov.br/servicos/dof',
        label: 'IBAMA · DOF (Doc. Origem Florestal)',
        preco: 'Variação alta; preço sob consulta com manejador certificado',
        data: '—',
        observ: 'Sem DOF é crime ambiental.',
      },
    ],
  },
  {
    id: 'pvc_50mm',
    nome: 'Tubo PVC 50 mm (DIY internacional)',
    nomeCientifico: 'PVC rígido NBR 5688',
    diametro: 50,
    espessuraParede: 2.8,
    pesoLinear: 0.55,
    precoLinear: 18.0,
    comprimentoComercial: 6,
    tracaoMax: 30,
    moduloElasticidade: 3200,
    desperdicio: 0.05,
    nota: 'Popular em domos DIY de festival/feira. UV envelhece em 3-5 anos — pintar branco e proteger. Bom para ≤ 4 m.',
    cor: '#d9d6cf',
    fontes: [
      {
        url: 'https://www.tigre.com.br',
        label: 'Tigre — tubos PVC esgoto',
        preco: 'R$ 100–130 / barra 6 m → R$ 17-22/m',
        data: 'mai/2026',
      },
      {
        url: 'http://www.domerama.com/connectors/pvc-pipe-and-fittings/',
        label: 'Domerama · PVC pipe domes',
        preco: '—',
        observ: 'Referência DIY internacional. Citação do guia Maron 2018.',
      },
    ],
  },
  {
    id: 'tubo_aco_galv',
    nome: 'Tubo de aço galvanizado Ø 32 mm',
    nomeCientifico: 'Aço-carbono galvanizado a fogo, NBR 5580',
    diametro: 32,
    espessuraParede: 2.25,
    pesoLinear: 1.62,
    precoLinear: 42.0,
    comprimentoComercial: 6,
    tracaoMax: 250,
    moduloElasticidade: 200000,
    desperdicio: 0.10,
    nota: 'Permanente, alta resistência, histórico das primeiras cobertura geodésicas (Bauersfeld 1922). Exige furadeira potente e fluido de corte.',
    cor: '#8a9094',
    fontes: [
      {
        url: 'https://www.gerdau.com',
        label: 'Gerdau / Apolo · tubo galvanizado 1¼"',
        preco: 'R$ 240–280 / barra 6 m → R$ 40-47/m',
        data: 'mai/2026',
      },
    ],
  },
  {
    id: 'tubo_aluminio',
    nome: 'Tubo de alumínio Ø 38 mm',
    nomeCientifico: 'Liga 6063-T5, NBR 6835',
    diametro: 38,
    espessuraParede: 2.0,
    pesoLinear: 0.61,
    precoLinear: 58.0,
    comprimentoComercial: 6,
    tracaoMax: 180,
    moduloElasticidade: 69000,
    desperdicio: 0.08,
    nota: 'Leve (1/3 do aço), inoxidável, longa vida. Indicado para grandes vãos e zonas litorâneas. Exige rebites/parafusos especiais.',
    cor: '#c0c4c8',
    fontes: [
      {
        url: 'https://www.alcoa.com/brasil',
        label: 'Alcoa / Alucé · perfis 6063',
        preco: 'R$ 340–400 / barra 6 m → R$ 57-67/m',
        data: 'mai/2026',
      },
    ],
  },
];

// ── CONECTORES ─────────────────────────────────────────────────────────────
export const HUB_CONNECTORS = [
  {
    id: 'aco_galv',
    nome: 'Hub aço galvanizado (estrela cortada a laser)',
    tipo: 'fixo',
    precoPorValencia: 14.0,
    nota: 'Chapa 3 mm + parafuso M8 sextavado + arruela. Encomenda local.',
    cor: '#7a8893',
    fontes: [
      {
        url: 'https://www.gerdau.com/br',
        label: 'Chapa galvanizada — referência Gerdau',
        preco: 'Chapa 3mm: R$ 90–120/m² + corte ~R$ 5/peça',
        data: 'mai/2026',
        observ: 'Estimativa por peça inclui matéria-prima + corte CNC local.',
      },
    ],
  },
  {
    id: 'borracha_pneu',
    nome: 'Manguito de pneu reciclado',
    tipo: 'articulado',
    precoPorValencia: 3.5,
    nota: 'Tiras de câmara de ar 50 mm + abraçadeira aço inox.',
    cor: '#2b2b2b',
    fontes: [
      {
        url: 'https://www.reciclanip.org.br',
        label: 'Reciclanip — câmara de ar reciclada',
        preco: 'Câmara descartada gratuita em borracharias',
        data: '—',
      },
    ],
  },
  {
    id: 'corda_sisal',
    nome: 'Amarração em sisal trançado',
    tipo: 'articulado',
    precoPorValencia: 1.8,
    nota: 'Tradição construtiva. Tratar com cera de carnaúba.',
    cor: '#b89760',
    fontes: [
      {
        url: 'https://www.mercadolivre.com.br/corda-sisal',
        label: 'Mercado Livre — Sisal 10mm',
        preco: 'R$ 8–14/m (rolos de 100 m)',
        data: 'mai/2026',
      },
    ],
  },
  {
    id: 'parafuso_passante',
    nome: 'Parafuso passante M10 + chapa plana',
    tipo: 'fixo',
    precoPorValencia: 8.0,
    nota: 'Para sarrafos de pinus. Furação calibrada com gabarito.',
    cor: '#888888',
    fontes: [
      {
        url: 'https://www.leroymerlin.com.br/parafuso-sextavado',
        label: 'Leroy Merlin — Parafuso sextavado M10×80',
        preco: 'R$ 3–5/peça + porca + arruelas',
        data: 'mai/2026',
      },
    ],
  },
  {
    id: 'pipe_tee',
    nome: 'Hub PVC / aço (sistema "pipe-tee" caseiro)',
    tipo: 'fixo',
    precoPorValencia: 4.5,
    nota: 'PVC 50mm cortado em ângulos. Comum em DIY internacional.',
    cor: '#d9d6cf',
    fontes: [
      {
        url: 'https://www.tigre.com.br',
        label: 'Tigre — tubos PVC',
        preco: 'Tubo PVC 50mm: ~R$ 18/m',
        data: 'mai/2026',
      },
    ],
  },
  {
    id: 'hub_madeira',
    nome: 'Hub de madeira maciça (marceneiro)',
    tipo: 'fixo',
    precoPorValencia: 6.5,
    nota: 'Tarugos de eucalipto/cumbaru cortados em estrela. Acessível a marceneiros locais. Tradição brasileira DIY.',
    cor: '#7b5a36',
    fontes: [
      {
        url: 'https://www.amerindia.eco.br',
        label: 'Ameríndia / Maron 2018 · conexões artesanais',
        preco: 'Custo da peça + ~30 min/hub de marcenaria',
        data: '2018',
      },
    ],
  },
  {
    id: 'vigas_reciprocas',
    nome: 'Sem hub — vigas recíprocas (método "giro")',
    tipo: 'sem',
    precoPorValencia: 0.5,
    nota: 'Invenção brasileira do LILD/PUC-Rio. Barras se apoiam umas nas outras em rotação, sem conector central. Reduz custos e tempo de montagem; ideal para sarrafos.',
    cor: '#4a5d3a',
    fontes: [
      {
        url: 'https://www.puc-rio.br/sobrepuc/depto/arq/lild/',
        label: 'LILD · Lab. Invest. em Livre Desenho, PUC-Rio',
        preco: 'Apenas custo da fixação (parafusos longos ou amarração)',
        data: '—',
        observ: 'Documentado no guia Maron 2018 p.49.',
      },
    ],
  },
];

// ── COBERTURAS ─────────────────────────────────────────────────────────────
export const COVERINGS = [
  {
    id: 'lona_pvc',
    nome: 'Lona PVC 0,7 mm (encerada)',
    precoPorM2: 38.0,
    pesoPorM2: 0.85,
    durabilidade: '5–8 anos (cor) · 10+ anos (translúcida)',
    nota: 'Impermeável. Solda quente nas emendas.',
    cor: '#e8dcc0',
    categoria: 'industrial',
    fontes: [
      {
        url: 'https://www.locktrucks.com.br/lona-pvc',
        label: 'Locktrucks / Brastoldas — Lona PVC 0,7mm',
        preco: 'R$ 32–45/m² (lote completo, c/ ilhós)',
        data: 'mai/2026',
      },
    ],
  },
  {
    id: 'sombrite',
    nome: 'Sombrite 70% (tela agrícola)',
    precoPorM2: 9.0,
    pesoPorM2: 0.12,
    durabilidade: '3–5 anos',
    nota: 'Para estufas e aviários. Não impermeável.',
    cor: '#383838',
    categoria: 'industrial',
    fontes: [
      {
        url: 'https://www.leroymerlin.com.br/tela-sombrite',
        label: 'Leroy Merlin — Sombrite 70%',
        preco: 'R$ 7–12/m² (rolos 1,5 × 50 m)',
        data: 'mai/2026',
      },
    ],
  },
  {
    id: 'buriti',
    nome: 'Palha de buriti / babaçu',
    precoPorM2: 24.0,
    pesoPorM2: 1.6,
    durabilidade: '3–4 anos (manutenção a cada 2)',
    nota: 'Tradição cerrado. Treliça de bambu + amarração.',
    cor: '#a07a3a',
    categoria: 'bioconstrucao',
    fontes: [
      {
        url: 'https://www.embrapa.br/cerrados',
        label: 'Embrapa Cerrados · cadeia do buriti',
        preco: 'R$ 15–30/m² (varia por região; comprar do extrativista)',
        data: '2024',
        observ: 'Apoiar cooperativas locais (MA/TO/PI).',
      },
    ],
  },
  {
    id: 'tabua_pinus',
    nome: 'Tábua pinus 1×15 cm + manta asfáltica',
    precoPorM2: 75.0,
    pesoPorM2: 14.0,
    durabilidade: '15+ anos',
    nota: 'Rigida. Permite isolamento interno (lã de PET).',
    cor: '#c69466',
    categoria: 'industrial',
    fontes: [
      {
        url: 'https://www.leroymerlin.com.br/tabua-pinus',
        label: 'Leroy Merlin — Tábua pinus 1×15×300',
        preco: 'Tábua R$ 35–45/peça + manta R$ 22/m²',
        data: 'mai/2026',
      },
    ],
  },
  {
    id: 'taipa_leve',
    nome: 'Taipa-leve (madeira + barro + palha)',
    precoPorM2: 22.0,
    pesoPorM2: 35.0,
    durabilidade: 'Permanente com manutenção',
    nota: 'Bioconstrução. Massa térmica alta. Mão de obra intensiva.',
    cor: '#8a6a3c',
    categoria: 'bioconstrucao',
    fontes: [
      {
        url: 'https://bioconstruir.org',
        label: 'Rede Brasileira de Bioconstrução',
        preco: 'Material local quase gratuito; valor é em horas de trabalho',
        data: '—',
      },
    ],
  },
  {
    id: 'eva_geo',
    nome: 'EVA geodésico (placas triangulares 8mm)',
    precoPorM2: 48.0,
    pesoPorM2: 1.1,
    durabilidade: '8 anos com proteção UV',
    nota: 'Estética moderna. Encaixe seco em hub. Requer overlap.',
    cor: '#f1e1c4',
    categoria: 'industrial',
    fontes: [
      {
        url: 'https://www.mercadolivre.com.br/placa-eva-construcao',
        label: 'Mercado Livre — Placa EVA 8mm',
        preco: 'R$ 40–55/m²',
        data: 'mai/2026',
      },
    ],
  },
  {
    id: 'ferrocimento',
    nome: 'Ferrocimento (histórica · Bauersfeld 1922)',
    precoPorM2: 95.0,
    pesoPorM2: 55.0,
    durabilidade: '40+ anos · permanente',
    nota: 'Cobertura da primeira cúpula geodésica do mundo (Jena, 1922). Trama de aço soldada + camada fina de argamassa (15–25 mm). Pesada — exige fundação reforçada.',
    cor: '#b8b3a7',
    categoria: 'bioconstrucao',
    fontes: [
      {
        url: 'https://www.cimentoitambe.com.br/ferrocimento-historia',
        label: 'Cimento Itambé · técnica do ferrocimento',
        preco: 'Aço CA-50 R$ 12/kg + cimento R$ 50/saco',
        data: 'mai/2026',
      },
      {
        url: 'https://www.amerindia.eco.br',
        label: 'Maron 2018 · "primeira cúpula de ferrocimento do mundo"',
        preco: '—', data: '2018',
      },
    ],
  },
  {
    id: 'telha_asfaltica',
    nome: 'Telha asfáltica (shingle)',
    precoPorM2: 78.0,
    pesoPorM2: 12.0,
    durabilidade: '20–25 anos',
    nota: 'Padrão norte-americano para domos residenciais. Fácil adaptação à curvatura. Cola sobre OSB ou tábua. Requer subcobertura.',
    cor: '#3a3530',
    categoria: 'industrial',
    fontes: [
      {
        url: 'https://www.leroymerlin.com.br/telha-asfaltica',
        label: 'Leroy Merlin · telha asfáltica IKO/Owens',
        preco: 'R$ 60–90/m² + cola asfáltica',
        data: 'mai/2026',
      },
    ],
  },
  {
    id: 'policarbonato',
    nome: 'Policarbonato alveolar 10 mm',
    precoPorM2: 145.0,
    pesoPorM2: 1.7,
    durabilidade: '10 anos UV-stabilizado',
    nota: 'Translúcido. Para estufas, ateliês e estruturas que precisam de luz natural. Vedação com perfil de alumínio + selante neutro.',
    cor: '#d8e5ed',
    categoria: 'industrial',
    fontes: [
      {
        url: 'https://www.polysolution.com.br',
        label: 'Polysolution · policarbonato alveolar 10mm',
        preco: 'R$ 130–170/m² (chapas 2,10 × 6 m)',
        data: 'mai/2026',
      },
    ],
  },
  {
    id: 'vidro_temperado',
    nome: 'Vidro temperado 8 mm (premium)',
    precoPorM2: 320.0,
    pesoPorM2: 20.0,
    durabilidade: 'Permanente',
    nota: 'Estética "Spaceship Earth". Para domos < 8 m. Triângulos planos colados em estrutura metálica. Exige projeto de engenheiro.',
    cor: '#e0eef5',
    categoria: 'industrial',
    fontes: [
      {
        url: 'https://www.cebrace.com.br',
        label: 'Cebrace · vidro temperado float 8mm',
        preco: 'R$ 280–360/m² + corte triangular',
        data: 'mai/2026',
      },
    ],
  },
  {
    id: 'chapa_metalica',
    nome: 'Chapa galvanizada ondulada',
    precoPorM2: 65.0,
    pesoPorM2: 5.5,
    durabilidade: '25+ anos',
    nota: 'Padrão "antártico". Para climas frios, expostos ou Pampa. Costuras em zigue-zague com rebites. Refletiva — pintar interior.',
    cor: '#a8b0b8',
    categoria: 'industrial',
    fontes: [
      {
        url: 'https://www.gerdau.com',
        label: 'Gerdau · chapa zincada #26 (0,45mm)',
        preco: 'R$ 55–75/m²',
        data: 'mai/2026',
      },
    ],
  },
  {
    id: 'banner_reciclado',
    nome: 'Lona banner reciclada (Drop City)',
    precoPorM2: 12.0,
    pesoPorM2: 0.5,
    durabilidade: '2–4 anos',
    nota: 'Estética anos-60. Lonas de outdoor descartadas, costuradas. Custo quase zero se conseguir doação. Estética colorida, "patchwork".',
    cor: '#c45a3a',
    categoria: 'diy',
    fontes: [
      {
        url: 'https://www.mercadolivre.com.br/lona-banner-reciclada',
        label: 'Mercado Livre · banner usado',
        preco: 'R$ 5–20/m² ou doação direta de gráficas',
        data: 'mai/2026',
        observ: 'Documentado em Drop City (anos 60) e guia Maron 2018.',
      },
    ],
  },
];


// ── FUNDAÇÃO ──────────────────────────────────────────────────────────────
export const FOUNDATIONS = [
  {
    id: 'pedras_secas',
    nome: 'Pedras secas + sapatas pontuais',
    custoBase: 28.0,
    tempoHoras: 0.5,
    nota: 'Para terrenos firmes. Reversível. Sem cimento.',
    fontes: [
      {
        url: 'https://www.embrapa.br',
        label: 'Embrapa · construções rurais simples',
        preco: 'Pedra rachão: R$ 80–120/m³ posto. ~5 pedras/hub.',
        data: '2024',
      },
    ],
  },
  {
    id: 'concreto',
    nome: 'Sapata de concreto + chumbador',
    custoBase: 75.0,
    tempoHoras: 1.5,
    nota: 'Definitivo. Resiste vento >100 km/h. Concreto FCK 20 MPa.',
    fontes: [
      {
        url: 'https://www.sienge.com.br/blog/preco-concreto-usinado',
        label: 'Sienge · concreto usinado 2025',
        preco: 'FCK 20: R$ 380–450/m³ + transporte',
        data: 'mai/2026',
      },
    ],
  },
  {
    id: 'pneu_terra',
    nome: 'Pneus enterrados (earthship)',
    custoBase: 20.0,
    tempoHoras: 2.0,
    nota: 'Bioconstrução. Aproveita resíduo. Mão de obra intensa.',
    fontes: [
      {
        url: 'https://www.reciclanip.org.br',
        label: 'Reciclanip — pneus inservíveis gratuitos',
        preco: 'Pneu: gratuito. Trabalho: ~2 h/pneu para socar terra.',
        data: '—',
      },
    ],
  },
  {
    id: 'estaca_helicoidal',
    nome: 'Estaca helicoidal galvanizada',
    custoBase: 95.0,
    tempoHoras: 0.8,
    nota: 'Sem escavação. Reaproveitável. Indicado solo arenoso.',
    fontes: [
      {
        url: 'https://www.helibras.com.br/estacas-helicoidais',
        label: 'Fornecedores — estaca helicoidal D6 1,2m',
        preco: 'R$ 85–110/peça instalada',
        data: 'mai/2026',
      },
    ],
  },
];

// ── ÁGUA / HIDRÁULICO ──────────────────────────────────────────────────────
export const WATER_SYSTEMS = [
  {
    id: 'cisterna_2000',
    nome: 'Cisterna 2000 L (PE rotomoldada)',
    custo: 1450.0,
    nota: 'Captação de chuva via calha perimetral. Suficiente p/ 2 pessoas / 20 dias.',
    fontes: [
      {
        url: 'https://www.fortlev.com.br/cisterna',
        label: 'Fortlev — Cisterna 2000L',
        preco: 'R$ 1.200–1.700 + acessórios',
        data: 'mai/2026',
      },
    ],
  },
  {
    id: 'cisterna_5000',
    nome: 'Cisterna 5000 L (família)',
    custo: 2950.0,
    nota: 'Para uso contínuo de 4 pessoas / >30 dias.',
    fontes: [
      {
        url: 'https://www.fortlev.com.br/cisterna',
        label: 'Fortlev — Cisterna 5000L',
        preco: 'R$ 2.500–3.400',
        data: 'mai/2026',
      },
    ],
  },
  {
    id: 'fossa_compost',
    nome: 'Fossa séptica + filtro + sumidouro',
    custo: 2200.0,
    nota: 'NBR 7229. Tratamento esgoto sem ETE.',
    fontes: [
      {
        url: 'https://www.acquasana.com.br',
        label: 'Acquasana — kit fossa séptica completo',
        preco: 'R$ 1.800–2.600 (até 5 pessoas)',
        data: 'mai/2026',
      },
    ],
  },
  {
    id: 'bacia_compost',
    nome: 'Bacia de evapotranspiração (BET)',
    custo: 850.0,
    nota: 'Bioconstrução. Trata águas negras com bananeiras.',
    fontes: [
      {
        url: 'https://www.embrapa.br/agrobiologia',
        label: 'Embrapa Agrobiologia · BET',
        preco: 'Material R$ 600–1.100 (lona, brita, plantas)',
        data: '2024',
      },
    ],
  },
];

// ── ENERGIA ────────────────────────────────────────────────────────────────
export const ENERGY_SYSTEMS = [
  {
    id: 'rede',
    nome: 'Conexão à rede (padrão concessionária)',
    custo: 1800.0,
    nota: 'Padrão de entrada bifásico + medidor. Tarifa branca recomendada.',
    fontes: [
      {
        url: 'https://www.aneel.gov.br',
        label: 'ANEEL · padrão de entrada',
        preco: 'Padrão de entrada residencial: R$ 1.500–2.200',
        data: 'mai/2026',
      },
    ],
  },
  {
    id: 'fotovoltaico_basico',
    nome: 'Sistema fotovoltaico ilha (1 kWp)',
    custo: 7500.0,
    nota: 'Painel 550Wp × 2 + controlador + bateria 2,4 kWh + inversor 1kVA.',
    fontes: [
      {
        url: 'https://www.solfacil.com.br',
        label: 'Solfácil — sistemas off-grid',
        preco: 'Kit 1 kWp off-grid: R$ 7.000–9.000',
        data: 'mai/2026',
      },
    ],
  },
  {
    id: 'fotovoltaico_grande',
    nome: 'Sistema fotovoltaico ilha (3 kWp)',
    custo: 18500.0,
    nota: 'Conforto residencial completo. Bateria 7,2 kWh.',
    fontes: [
      {
        url: 'https://www.solfacil.com.br',
        label: 'Solfácil / Portal Solar',
        preco: 'Kit 3 kWp off-grid: R$ 17.000–22.000',
        data: 'mai/2026',
      },
    ],
  },
  {
    id: 'minimo',
    nome: 'Apenas iluminação LED 12V + tomada USB',
    custo: 850.0,
    nota: 'Painel 50W + bateria selada 80Ah + 6 lâmpadas LED.',
    fontes: [
      {
        url: 'https://www.mercadolivre.com.br/kit-solar-12v',
        label: 'Mercado Livre — kits 12V iluminação',
        preco: 'R$ 600–1.100 (kit pronto)',
        data: 'mai/2026',
      },
    ],
  },
];

// ── ABERTURAS ──────────────────────────────────────────────────────────────
// Cada abertura "consome" triângulos da malha; estimativa de área.
export const OPENING_TYPES = {
  porta_principal: {
    label: 'Porta principal',
    larguraDefault: 0.90,
    alturaDefault: 2.00,
    area: 1.80,
    custo: 850,
    nota: 'Folha madeira maciça 35mm + batente + dobradiças + maçaneta.',
    fontes: [
      { url: 'https://www.leroymerlin.com.br/portas-de-madeira', label: 'Leroy Merlin — Porta maciça 80×210', preco: 'R$ 600–1100', data: 'mai/2026' },
    ],
  },
  janela_basculante: {
    label: 'Janela basculante',
    larguraDefault: 0.80,
    alturaDefault: 0.60,
    area: 0.48,
    custo: 320,
    nota: 'Alumínio ou madeira; vidro 4mm. Boa p/ ventilação.',
    fontes: [
      { url: 'https://www.leroymerlin.com.br/janelas', label: 'Leroy Merlin — Janela basc. 80×60', preco: 'R$ 280–420', data: 'mai/2026' },
    ],
  },
  janela_redonda: {
    label: 'Janela redonda (claraboia lateral)',
    diametroDefault: 0.60,
    area: 0.28,
    custo: 480,
    nota: 'Encaixa em 1 triângulo. Vidro temperado 6mm.',
    fontes: [
      { url: '#', label: 'Vidraçaria local · vidro temperado 6mm', preco: 'R$ 380–550 com aro', data: 'mai/2026' },
    ],
  },
  cupula_zenital: {
    label: 'Cúpula zenital (lanterna)',
    diametroDefault: 0.80,
    area: 0.50,
    custo: 1200,
    nota: 'Acrílico curvado + base de madeira impermeabilizada.',
    fontes: [
      { url: 'https://www.acrilfix.com.br', label: 'Acrilfix — cúpula acrílica D80', preco: 'R$ 950–1.400', data: 'mai/2026' },
    ],
  },
  abertura_ventilacao: {
    label: 'Abertura de ventilação inferior',
    larguraDefault: 0.60,
    alturaDefault: 0.30,
    area: 0.18,
    custo: 180,
    nota: 'Tela mosquiteiro + persiana de madeira regulável.',
    fontes: [
      { url: '#', label: 'Construção local', preco: 'R$ 120–220', data: 'mai/2026' },
    ],
  },
  porta_emergencia: {
    label: 'Saída de emergência (oposta à principal)',
    larguraDefault: 0.70,
    alturaDefault: 1.80,
    area: 1.26,
    custo: 650,
    nota: 'Recomendado p/ uso residencial. NBR 9077.',
    fontes: [
      { url: 'https://www.abntcatalogo.com.br/norma.aspx?ID=1115', label: 'NBR 9077 · Saídas de emergência', preco: 'Norma técnica', data: '2001' },
    ],
  },
};

// ── FERRAMENTAS NECESSÁRIAS ────────────────────────────────────────────────
export const TOOLS = [
  { nome: 'Serra de bancada / circular', uso: 'Cortar barras com precisão angular' },
  { nome: 'Furadeira de impacto', uso: 'Furos para parafusos passantes (M8/M10)' },
  { nome: 'Esquadro combinado + transferidor', uso: 'Aferir ângulos de corte' },
  { nome: 'Trena 5 m + nível de bolha 60 cm', uso: 'Marcação base e prumo' },
  { nome: 'Andaime ou escada articulada', uso: 'Acesso até a cúpula (a partir de 2,5 m)' },
  { nome: 'Chave catraca soquete 13/17 mm', uso: 'Apertar parafusos M8/M10' },
  { nome: 'Lixadeira orbital', uso: 'Acabamento das pontas' },
  { nome: 'EPI: capacete, luva, óculos, sapato', uso: 'Obrigatório acima de 1,8 m' },
];

// ── CÁLCULOS ───────────────────────────────────────────────────────────────
export function pricePerStruct(material, totalLinear) {
  const com = material.comprimentoComercial;
  const necessario = totalLinear * (1 + material.desperdicio);
  const bars = Math.ceil(necessario / com);
  const linearComprado = bars * com;
  return {
    bars,
    linearComprado,
    desperdicioMetros: linearComprado - totalLinear,
    custo: linearComprado * material.precoLinear,
  };
}
