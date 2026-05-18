// glossario.js — Termos técnicos com definições e fontes
//
// Renderiza um <span class="term" data-term="..."> que vira um popover ao hover/clique.

export const GLOSSARIO = {
  'chord factor': {
    titulo: 'Chord factor',
    def: 'Razão entre o comprimento de uma aresta do domo e o raio R da esfera circunscrita. Cada subdivisão geodésica gera de 1 a 6 chord factors diferentes — eles são os comprimentos exatos das barras, em unidades de R.',
    raciocinio: 'Em um domo 3V Class I de raio 3 m, se um chord factor for 0,3486, a barra correspondente terá 0,3486 × 3 = 1,046 m.',
    fontes: [
      { url: 'https://simplydifferently.org/Geodesic_Dome_Notes', label: 'Simply Differently — chord factors tables' },
      { url: 'https://en.wikipedia.org/wiki/Geodesic_polyhedron', label: 'Wikipedia · Geodesic polyhedron' },
    ],
  },
  'frequência v': {
    titulo: 'Frequência (V)',
    def: 'Quantas vezes cada face triangular do icosaedro é subdividida. V=1 é o icosaedro puro (30 barras), V=2 quadruplica subfaces, V=3 multiplica por 9, etc.',
    raciocinio: 'Quanto maior V, mais barras (e mais tipos diferentes), mais esférico fica o domo, mais preciso precisa ser o corte.',
    fontes: [
      { url: 'http://www.domerama.com/calculators/', label: 'Domerama · calculadoras V1–V6' },
    ],
  },
  'classe i': {
    titulo: 'Class I (Alternate)',
    def: 'Tipo mais comum de subdivisão geodésica: divide cada face em V² triângulos iguais paralelos aos lados da face original, depois projeta cada vértice na esfera.',
    raciocinio: 'Class II e Class III existem (Triacon, Skew) mas Class I gera o menor número de tipos de barra distintos — é o padrão DIY.',
    fontes: [
      { url: 'https://en.wikipedia.org/wiki/Geodesic_polyhedron', label: 'Wikipedia · Class I/II/III' },
    ],
  },
  'truncamento': {
    titulo: 'Truncamento',
    def: 'A fração da esfera que vai virar domo. ½ esfera = meio domo; ⅝ domo = corte acima do equador, paredes verticais; ¾ domo = mais alto que largo.',
    raciocinio: 'O corte é feito por um plano horizontal em z = 1 − 2 · fração. Faces com qualquer vértice abaixo do plano são descartadas.',
    fontes: [
      { url: 'https://www.domerama.com/calculators/2v-geodesic-dome-calculator/', label: 'Domerama · ½ vs ⅝ vs ¾' },
    ],
  },
  'hub': {
    titulo: 'Hub (nó)',
    def: 'Cada ponto onde 3, 4, 5 ou 6 barras se encontram. Pode ser feito de chapa de aço cortada a laser, manguito de pneu, amarração de sisal, ou outros.',
    raciocinio: 'Domos Class I têm sempre hubs de valência 5 (nos 12 vértices originais do icosaedro) e valência 6 (no interior). Hubs do anel de corte têm valência menor.',
    fontes: [
      { url: 'http://www.domerama.com/connectors/', label: 'Domerama · tipos de hubs' },
    ],
  },
  'valência': {
    titulo: 'Valência de um hub',
    def: 'Número de barras que chegam num mesmo nó. Determina a geometria do conector e a complexidade da furação.',
    raciocinio: 'Em domos Class I os interiores têm valência 5 ou 6. O anel de corte tem 3 ou 4. Quanto maior a valência, mais ângulos a calcular.',
    fontes: [
      { url: 'http://www.domerama.com/connectors/', label: 'Domerama · valências' },
    ],
  },
  'icosaedro': {
    titulo: 'Icosaedro',
    def: 'Poliedro regular com 20 faces triangulares, 12 vértices e 30 arestas. É o sólido platônico base de quase todo domo geodésico.',
    raciocinio: 'Por ter o maior número de faces entre os sólidos platônicos, é o que mais se aproxima de uma esfera — perfeito como ponto de partida.',
    fontes: [
      { url: 'https://en.wikipedia.org/wiki/Icosahedron', label: 'Wikipedia · Icosaedro' },
    ],
  },
  'riser wall': {
    titulo: 'Riser wall (parede de elevação)',
    def: 'Pequena parede vertical (30 a 120 cm) entre a fundação e a base do domo. Serve para elevar a casca, criar paredes laterais retas para portas/janelas convencionais e melhorar pé-direito útil.',
    raciocinio: 'Sem riser, portas e janelas precisam acompanhar a curvatura do domo (compound miter cuts) — bem mais difícil. Com riser, esquadrias retangulares de mercado encaixam normalmente.',
    fontes: [
      { url: 'https://www.aidomes.com/entryways-and-dormers/', label: 'AiDomes · entryways & dormers' },
      { url: 'https://www.bobvila.com/design/geodesic-dome-house/', label: 'BobVila · risers 1–4 ft' },
      { url: 'https://www.madehow.com/Volume-6/Geodesic-Dome.html', label: 'MadeHow · até 50% dos triângulos inferiores podem sair' },
    ],
  },
  'arco de porta': {
    titulo: 'Arco de porta (hoop door)',
    def: 'Estrutura curva (tubo metálico ou madeira laminada) que substitui os triângulos removidos para abrir a porta. Distribui o peso da cobertura ao redor da abertura.',
    raciocinio: 'Em vez de cortar a casca e enfraquecer o domo, o arco une os hubs adjacentes e mantém a integridade estrutural. Em domos < 6 m, parafusar uma cantoneira de aço em volta da abertura também funciona.',
    fontes: [
      { url: 'http://www.domerama.com/fabricating/making-doors/', label: 'Domerama · fabricando portas' },
    ],
  },
  'efeito chaminé': {
    titulo: 'Efeito chaminé (stack effect)',
    def: 'Diferença de pressão causada pelo gradiente térmico que faz o ar quente subir e sair pela cúpula zenital, puxando ar fresco pelas aberturas inferiores.',
    raciocinio: 'Em clima quente do cerrado, a cúpula zenital + aberturas inferiores produz ventilação passiva contínua. Diferença térmica observada: 2 a 4 °C.',
    fontes: [
      { url: 'https://www.energy.gov/energysaver/natural-ventilation', label: 'US DOE · ventilação natural' },
    ],
  },
  'cca': {
    titulo: 'CCA (tratamento autoclave)',
    def: 'Arseniato de Cobre Cromatado: tratamento de impregnação a vácuo-pressão de madeiras (eucalipto, pinus) que penetra até o cerne. Resistência a cupins e fungos por 15+ anos.',
    raciocinio: 'Regulamentado pela NBR 9480. Madeira deve ter selo do tratador. Para uso externo enterrado, exigir retenção mínima de 9,6 kg/m³.',
    fontes: [
      { url: 'https://www.abntcatalogo.com.br/norma.aspx?ID=4117', label: 'ABNT NBR 9480' },
    ],
  },
  'class i alternate': {
    titulo: 'Class I Alternate',
    def: 'A subdivisão geodésica mais comum: cada aresta do icosaedro é dividida em V segmentos iguais, formando uma grade triangular. Conhecida como "alternate" porque alterna triângulos pra cima/pra baixo.',
    raciocinio: 'É o padrão Buckminster Fuller; quase todo software DIY de domos usa esta classe.',
    fontes: [
      { url: 'https://en.wikipedia.org/wiki/Geodesic_polyhedron', label: 'Wikipedia · classes geodésicas' },
    ],
  },
  'nbr 9077': {
    titulo: 'NBR 9077',
    def: 'Norma brasileira de saídas de emergência em edificações. Para uso residencial, recomenda-se segunda saída quando a área supera 50 m² ou capacidade > 10 pessoas.',
    raciocinio: 'Em domos de glamping/hospedagem, é boa prática ter saída oposta à porta principal mesmo abaixo dos limites legais.',
    fontes: [
      { url: 'https://www.abntcatalogo.com.br/norma.aspx?ID=1115', label: 'ABNT NBR 9077' },
    ],
  },
  'nbr 9050': {
    titulo: 'NBR 9050',
    def: 'Norma brasileira de acessibilidade. Banheiro acessível precisa de módulo de manobra 1,50 × 1,70 m. Vãos de porta ≥ 80 cm.',
    raciocinio: 'Mesmo em projetos privados, vale aplicar — facilita uso em todas as fases da vida.',
    fontes: [
      { url: 'https://www.abntcatalogo.com.br/norma.aspx?ID=361753', label: 'ABNT NBR 9050' },
    ],
  },
  'taubilha': {
    titulo: 'Taubilha',
    def: 'Telha de madeira em pequenas tábuas (~50 × 15 × 2 cm). Tradição caiçara e da Serra da Mantiqueira; modernamente feita em pinus ou eucalipto tratado em autoclave. Cerca de 32 peças/m².',
    raciocinio: 'Excelente para domos pela facilidade de adaptar a curvas. Camada tripla = isolamento termo-acústico. Vida útil 15+ anos com manutenção.',
    fontes: [
      { url: 'https://www.usinaaraucaria.com.br/aplicacoes/taubilha/', label: 'Usina Araucária · Cunha/SP' },
      { url: 'https://scali.com.br/servicos/coberturas-ecologicas/coberturas-naturais/', label: 'Scali · coberturas naturais' },
    ],
  },
  'chord': {
    titulo: 'Chord',
    def: 'A reta que conecta dois pontos numa esfera passando pelo interior. Em domos geodésicos, cada barra é uma chord (corda).',
    raciocinio: 'A casca é uma "aproximação poliédrica" da esfera feita de chords retas. Quanto maior V, mais chords e mais próximo da esfera.',
  },
  'dxf': {
    titulo: 'DXF',
    def: 'Drawing Exchange Format — formato de intercâmbio de desenho técnico criado pela Autodesk em 1982. Texto puro, lido por LibreCAD, FreeCAD, QCAD, Inkscape e CNC.',
    raciocinio: 'Permite enviar o desenho ao marceneiro/maquinário com cotas exatas. É o "PDF da indústria CAD" — aberto e universal.',
    fontes: [
      { url: 'https://en.wikipedia.org/wiki/AutoCAD_DXF', label: 'Wikipedia · DXF' },
      { url: 'https://librecad.org/', label: 'LibreCAD · software livre' },
    ],
  },
  'estabilidade lateral': {
    titulo: 'Estabilidade lateral',
    def: 'Capacidade da estrutura de resistir a ventos horizontais. Em domos, é altíssima — a forma esférica distribui as cargas em todas as direções.',
    raciocinio: 'Geodésicos com V≥2 e fixação adequada ao solo resistem a ventos de 100+ km/h. Domos com cobertura têxtil são muito sensíveis a ventos pela face exposta — necessitam ancoragem extra.',
    fontes: [
      { url: 'https://www.researchgate.net/publication/geodesic-wind-load', label: 'Estudos de carga de vento em domos' },
    ],
  },
  'taipa-leve': {
    titulo: 'Taipa-leve',
    def: 'Técnica de bioconstrução onde uma estrutura de madeira é preenchida com mistura de barro+palha+água. Pesa cerca de 35 kg/m². Inércia térmica alta.',
    raciocinio: 'Sustentável, materiais locais, mas exige tempo de cura (2–4 semanas) e mão de obra intensiva.',
    fontes: [
      { url: 'https://bioconstruir.org', label: 'Rede Brasileira de Bioconstrução' },
    ],
  },

  // ─── Termos do guia Maron 2018 ───────────────────────────────────────────
  'bauersfeld': {
    titulo: 'Walter Bauersfeld (1879–1959)',
    def: 'Engenheiro alemão da Zeiss que projetou em 1922 a primeira cúpula geodésica documentada — no telhado da fábrica em Jena, com 16 m de diâmetro, 3.480 barras metálicas, frequência 16 e cobertura em ferrocimento. Buckminster Fuller só nomearia a forma "geodésica" 26 anos depois.',
    raciocinio: 'Atribuir a invenção apenas a Fuller é erro histórico comum. Bauersfeld desenhou para abrigar o primeiro projetor planetário do mundo ("Modelo I"). A cúpula maior de 25 m, "A Maravilha de Jena" (1926), existe até hoje.',
    fontes: [
      { url: 'https://www.zeiss.com/planetariums/int/about-us/history.html', label: 'Zeiss · história do planetário' },
      { url: 'https://www.amerindia.eco.br', label: 'Maron 2018 · p. 12-15' },
    ],
  },
  'esfera imaginária': {
    titulo: 'Esfera imaginária (matriz / geode)',
    def: 'Recurso pedagógico para entender a geometria geodésica: imagine uma esfera magnética e invisível ao redor do icosaedro. Cada vértice da subdivisão é atraído para a superfície dessa esfera, deformando os triângulos planos em triângulos esféricos.',
    raciocinio: 'A "esfera magnética" do Maron é a forma mais clara de visualizar a projeção radial. O resultado: arestas que seriam iguais no plano se separam em N grupos de comprimento — daí os tipos A, B, C... das barras.',
    fontes: [
      { url: 'https://www.amerindia.eco.br', label: 'Maron 2018 · p. 38-41' },
    ],
  },
  'vão livre': {
    titulo: 'Vão livre',
    def: 'Área interna sem colunas, vigas ou apoios intermediários. Os domos geodésicos têm o maior vão livre por unidade de material entre todas as estruturas conhecidas — o triângulo distribui as cargas sem precisar de apoio central.',
    raciocinio: 'Para oficinas, ateliês, salões e ambientes onde a circulação importa, é o maior diferencial estrutural do domo. Permite layouts livres sem restrição arquitetônica.',
    fontes: [
      { url: 'https://www.amerindia.eco.br', label: 'Maron 2018 · p. 54' },
    ],
  },
  'homeostase térmica': {
    titulo: 'Homeostase térmica',
    def: 'Capacidade de o domo regular sua temperatura interna através do formato esférico e da circulação livre de ar — o calor se distribui uniformemente, sem zonas frias/quentes. Resulta em até 30% de economia em aquecimento e resfriamento.',
    raciocinio: 'A geometria esférica oferece a melhor relação área/volume da arquitetura. Com cúpula zenital ativando o efeito chaminé, ventilação cruzada e isolamento adequado, o domo é um termo-regulador passivo natural.',
    fontes: [
      { url: 'https://www.amerindia.eco.br', label: 'Maron 2018 · p. 55' },
      { url: 'https://www.energy.gov/energysaver', label: 'US DOE · eficiência energética de formas esféricas' },
    ],
  },
  'vigas recíprocas': {
    titulo: 'Vigas recíprocas (método "giro")',
    def: 'Sistema construtivo onde as barras se apoiam umas nas outras em rotação, sem hub central. Cada barra suporta a anterior e é suportada pela próxima. Desenvolvido no Brasil pelo LILD (Laboratório de Investigação em Livre Desenho) da PUC-Rio.',
    raciocinio: 'Reduz custos (sem conector), acelera a montagem e tem estética distintiva. Ideal para sarrafos de madeira; fixação por parafusos longos ou amarração. Variação adaptada do conceito clássico de "reciprocal frame".',
    fontes: [
      { url: 'https://www.puc-rio.br/sobrepuc/depto/arq/lild/', label: 'LILD · PUC-Rio' },
      { url: 'https://www.amerindia.eco.br', label: 'Maron 2018 · p. 49' },
    ],
  },
  'ferrocimento': {
    titulo: 'Ferrocimento',
    def: 'Técnica desenvolvida na Alemanha no início do século XX: trama densa de aço (telas + ferros finos) revestida com camada fina (15–25 mm) de argamassa rica. Cria estruturas leves e impermeáveis com pouca matéria-prima.',
    raciocinio: 'Foi a cobertura escolhida pela construtora "Dykerhoff e Wydmann" para a primeira cúpula geodésica do mundo em 1922. Permanente, baixo custo, mas pesada — exige fundação reforçada e mão de obra qualificada.',
    fontes: [
      { url: 'https://www.cimentoitambe.com.br/ferrocimento', label: 'Cimento Itambé · técnica do ferrocimento' },
      { url: 'https://www.amerindia.eco.br', label: 'Maron 2018 · p. 14, 51' },
    ],
  },
  'sólidos platônicos': {
    titulo: 'Sólidos Platônicos',
    def: 'Os 5 poliedros regulares (tetraedro, cubo, octaedro, dodecaedro, icosaedro) descritos por Platão há 2.600 anos. Suas faces são todas polígonos regulares idênticos. Todos podem servir de matriz para uma cúpula geodésica.',
    raciocinio: 'Fuller (e a maioria dos projetistas modernos) escolhe o icosaedro como matriz por ter mais faces — gera o domo mais estável e mais próximo da esfera. Mas Bauersfeld já trabalhava com o icosaedro em 1922 por intuição de Platão.',
    fontes: [
      { url: 'https://en.wikipedia.org/wiki/Platonic_solid', label: 'Wikipedia · Sólidos Platônicos' },
      { url: 'https://www.amerindia.eco.br', label: 'Maron 2018 · p. 31-32' },
    ],
  },
  'fullereno': {
    titulo: 'Buckminsterfullereno (C60)',
    def: 'Molécula de carbono descoberta em 1985 com 60 átomos organizados em 12 pentágonos + 20 hexágonos — exatamente o padrão de uma cúpula geodésica 2V. Rendeu o Prêmio Nobel de Química em 1996 e foi batizada em homenagem a Fuller.',
    raciocinio: 'Prova que a geometria geodésica não é só invenção humana — é um padrão da natureza, presente em escala atômica. Tem aplicações em medicina, farmacêutica e aeronáutica.',
    fontes: [
      { url: 'https://en.wikipedia.org/wiki/Buckminsterfullerene', label: 'Wikipedia · C60' },
      { url: 'https://www.amerindia.eco.br', label: 'Maron 2018 · p. 25' },
    ],
  },
  'esfericidade': {
    titulo: 'Esfericidade',
    def: 'Medida de quanto um poliedro se aproxima de uma esfera perfeita. Calculada pela razão entre o volume e o volume da esfera circunscrita: ψ = (V_poliedro / V_esfera)^(2/3).',
    raciocinio: 'Para domos Class I sobre icosaedro: 1V ≈ 23%, 2V ≈ 60%, 3V ≈ 78%, 4V ≈ 89%, 6V ≈ 95%, ∞V = 100% (esfera real). Ajuda a entender o ganho marginal de aumentar V.',
    fontes: [
      { url: 'https://en.wikipedia.org/wiki/Sphericity', label: 'Wikipedia · sphericity' },
    ],
  },
};

// Cria o sistema de popover global
let popoverEl = null;

export function initGlossarioPopover() {
  // Hooks globais — qualquer .term-link renderiza o popover ao hover
  document.addEventListener('mouseover', (e) => {
    const t = e.target.closest('[data-term]');
    if (!t) return;
    showPopover(t);
  });
  document.addEventListener('mouseout', (e) => {
    const t = e.target.closest('[data-term]');
    if (!t) return;
    // Esconder se sair pra fora — manter visível se mouse entrou no popover
    setTimeout(() => {
      if (popoverEl && !popoverEl.matches(':hover')) hidePopover();
    }, 150);
  });
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-term]');
    if (t) {
      e.preventDefault();
      showPopover(t, true);
    } else if (popoverEl && !e.target.closest('.glossary-popover')) {
      hidePopover();
    }
  });
}

function showPopover(target, pinned = false) {
  const term = target.getAttribute('data-term').toLowerCase();
  const entry = GLOSSARIO[term];
  if (!entry) return;
  if (popoverEl) popoverEl.remove();

  const pop = document.createElement('div');
  pop.className = 'glossary-popover' + (pinned ? ' is-pinned' : '');
  pop.innerHTML = `
    <div class="glossary-titulo">${entry.titulo}</div>
    <div class="glossary-def">${entry.def}</div>
    ${entry.raciocinio ? `<div class="glossary-raciocinio"><strong>Por quê:</strong> ${entry.raciocinio}</div>` : ''}
    ${entry.fontes ? `<div class="glossary-fontes">${entry.fontes.map((f) =>
      `<a href="${f.url}" target="_blank" rel="noopener">${f.label} →</a>`).join('')}</div>` : ''}
  `;
  pop.addEventListener('mouseleave', () => { if (!pinned) hidePopover(); });
  document.body.appendChild(pop);
  popoverEl = pop;

  const rect = target.getBoundingClientRect();
  const popRect = pop.getBoundingClientRect();
  let top = rect.bottom + window.scrollY + 8;
  let left = rect.left + window.scrollX + rect.width / 2 - popRect.width / 2;
  if (left < 12) left = 12;
  if (left + popRect.width > window.innerWidth - 12) {
    left = window.innerWidth - popRect.width - 12;
  }
  if (top + popRect.height > window.scrollY + window.innerHeight) {
    top = rect.top + window.scrollY - popRect.height - 8;
  }
  pop.style.top = top + 'px';
  pop.style.left = left + 'px';
}

function hidePopover() {
  if (popoverEl) { popoverEl.remove(); popoverEl = null; }
}

/**
 * Helper para escrever termos no HTML.
 * Uso: term('chord factor', 'chord factor')
 */
export function term(label, key) {
  return `<span class="term-link" data-term="${(key || label).toLowerCase()}">${label}<span class="term-mark">?</span></span>`;
}
