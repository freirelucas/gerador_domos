# Handoff Claude Code · Gerador de Domos v3 · Sprint 3 final

**Para:** desenvolvedor usando Claude Code
**De:** designer que construiu v1 → v3 em HTML/JS
**Status:** 15 de 19 achados de auditoria já implementados aqui. **4 features pendentes** — descritas abaixo.

---

## 1. Sobre o projeto

**Gerador de Domos** é uma ferramenta web em português brasileiro para projetar cúpulas geodésicas DIY. Público-alvo: construtor mão-na-massa.

- **Stack atual:** HTML + JS módulos puros (ES modules) + Three.js + CSS sem framework. Sem build step.
- **Não é design reference. É código que roda hoje.** Você abre o `Gerador de Domos v3.html` num navegador e funciona.
- **Decisão de framework:** mantenha JS puro/módulos. Não migre pra React/Vue — o projeto cresceu assim e tá funcionando. Adicione novos módulos seguindo o padrão dos existentes.

### Arquitetura

```
Gerador de Domos v3.html       ← host; importmap de three.js
wizard-styles.css              ← base do design system "caderno cerrado"
wizard-v3-styles.css           ← camada blueprint/temas/canvas-toolbar/diário

wizard-v3-app.js               ← orquestrador: estado, three.js scene, navegação, tweaks
wizard-v3-step2.js             ← etapa 2 (forma) com canvas+toolbar+equação Maron
wizard-v3-extras.js            ← etapa 1 benefícios + dossiê 16b/17/18/19
wizard-steps.js                ← etapas 1, 3, 4 (compartilhadas com v2)
wizard-dossie.js               ← etapa 5 base (compartilhada)

geodesic.js                    ← cálculo geodésico Class I (não tocar)
materials-v2.js                ← catálogo de materiais com fontes citadas
programa.js                    ← cenários de uso + módulos funcionais
extras.js                      ← floor systems, mantiqueira coverings, validação
regiao-cargas.js               ← cargas vento/neve + lojas
glossario.js                   ← termos com popover
exporter.js                    ← SVG/DXF/CSV/OBJ exports
```

### Estado global

Tudo persiste em `localStorage` com key `dome_wizard_state_v3`. Estrutura em `wizard-v3-app.js` no objeto `DEFAULTS`. Use o mesmo padrão pra qualquer novo estado.

```js
state = {
  step: 1,
  programa: {...}, forma: {...}, aberturas: {...},
  sistemas: {...}, riser: {...},
  v3: {
    tema, viewMode, explodido, sol, montagem, montagemPlaying,
    regiao, diarioStart, diarioChecks, diarioNotes,
    // ↓ adicione aqui novos flags
  },
}
```

### Convenções de código

- **Helper `el(tag, props, children)`** — definido localmente em cada módulo de view. Cria DOM com classes, eventos, estilos inline. Use o mesmo padrão.
- **Importar do glossário:** `import { term } from './glossario.js'` e usar `term('rótulo', 'chave-no-glossario')` que retorna HTML com popover.
- **Cores via CSS vars:** `var(--ink)`, `var(--ocre)`, `var(--paper)`, `var(--paper-soft)`, `var(--verde)`, `var(--sangue)`, `var(--blueprint)`. Definidas em `wizard-styles.css` (tema cerrado) e overridden em `[data-theme="blueprint"]` / `[data-theme="drafting"]`.
- **Fontes:** Cormorant Garamond (display, com `em` em itálico para destaque ocre), IBM Plex Mono (técnico/UI), IBM Plex Sans (corpo).
- **Português brasileiro em todo lugar.** Nada em inglês exceto termos técnicos consagrados (hub, chord, V/v).
- **Mantenha citação de fonte** em qualquer dado novo (URL + label + preço + data).

---

## 2. O que já foi feito

Da auditoria contra o guia **Maron 2018** (`Auditoria contra o guia.html`), 15 de 19 achados estão implementados. Ver detalhe no comit log mental:

✅ Equação Maron didática no Step 2  
✅ Aviso "esfera completa" ≠ habitável  
✅ Timeline de origem (Bauersfeld 1922 → hoje) no dossiê  
✅ "v" minúsculo padronizado  
✅ "300.000 domos no mundo" no topbar  
✅ Tags articulado/fixo/sem em hubs  
✅ +3 estruturas (PVC, aço galv, alumínio)  
✅ +5 coberturas (ferrocimento, telhas asf., policarbonato, vidro, chapa metálica) + banner reciclado  
✅ +2 hubs (madeira maciça + **vigas recíprocas** sem hub)  
✅ Card "Por que um domo?" no Step 1  
✅ Glossário com 10 termos novos do guia  
✅ Filtro de coberturas por categoria  
✅ Métrica de esfericidade (1v=23% → 4v=89%)  
✅ Tag categoria nas coberturas

---

## 3. O que falta · 4 features

Detalhes precisos para cada uma. Implemente nesta ordem (incremental, do mais simples ao mais complexo):

---

### Feature A · Galeria de exemplos famosos com escala comparativa

**Onde:** novo módulo `wizard-v3-galeria.js`, chamado de `wizard-v3-app.js` no `appendStep1Benefits` ou como nova seção embaixo dele.

**O que faz:** mostra 6 domos icônicos numa faixa horizontal, todos desenhados no mesmo eixo Y de escala, com o domo atual do usuário sobreposto pra comparar.

**Domos a incluir:**

| Nome | Local | Diâmetro | Ano | Nota |
|---|---|---|---|---|
| Drop City | Colorado, EUA | ~5 m | 1965 | Comunidade hippie, latarias de carro |
| EcoCamp Patagônia | Chile | 8 m | 2001 | Hotel sustentável, ventos > 100 km/h |
| Bauersfeld / Zeiss original | Jena, Alemanha | 16 m | 1922 | Primeira cúpula geodésica do mundo, ferrocimento |
| "A Maravilha de Jena" | Jena, Alemanha | 25 m | 1926 | Planetário mais antigo do mundo |
| Spaceship Earth | Florida, EUA | 50 m | 1982 | Epcot Disney World |
| Eden Project | Cornwall, UK | 53 m | 2001 | Biomas tropicais, hexagonais ETFE |
| Biosfera Montreal | Canadá | 76 m | 1967 | Mega-domo Fuller, Expo 67 |
| Nagoya Dome | Japão | 187 m | 1997 | Estádio multiuso |

**UX/Visual:**
- SVG horizontal scrolável, com todos os domos desenhados em escala real (1 px = X m)
- Cada domo: silhueta de semicírculo + base + label (nome, diâmetro, ano)
- O **domo do usuário** aparece destacado em ocre (--ocre) entre os outros, com label "SEU DOMO · Ø X m"
- Hover/click num domo: popover com nota histórica + link Wikipedia
- Acima da faixa: pessoinha de 1.70 m como referência visual
- Cor: silhuetas em var(--ink) com opacidade 0.6; o do usuário com 100%

**Por que importa:** ajuda o usuário a calibrar expectativa. "Meu domo de 5 m é tipo Drop City. Pra ser Eden Project preciso 10× mais."

---

### Feature B · Animação SVG da esfera magnética imaginária

**Onde:** novo componente em `wizard-v3-step2.js` ou módulo separado `wizard-v3-magnetic-sphere.js`. Inserir logo após o `renderChordExplainer` no Step 2.

**O que faz:** animação SVG didática que ilustra a metáfora pedagógica do Maron — "esfera magnética invisível atrai os vértices do icosaedro até virar geodésica".

**Storyboard (loop):**
1. Frame 0–2s: Icosaedro renderizado em SVG plano (12 vértices, 30 arestas). Esfera tracejada em volta, levemente brilhante. Texto: *"Imagine uma esfera magnética invisível ao redor do icosaedro…"*
2. Frame 2–4s: Triângulos do icosaedro se subdividem em N² subfaces (animar a aparição das linhas). Texto: *"Cada face é dividida em V × V triângulos menores."*
3. Frame 4–7s: Os vértices novos da subdivisão "voam" radialmente para a superfície da esfera tracejada — animar transform: translate. Texto: *"Os vértices são atraídos magneticamente para a esfera…"*
4. Frame 7–9s: Resultado: geodésica V completa. Triângulos coloridos por tipo (A, B, C…). Texto: *"…e o resultado é uma geodésica de N tipos de barra."*
5. Loop reinicia.

**Controles:**
- Botão play/pause/reset embaixo
- Slider de V (1 a 4) que muda quantas subdivisões a animação mostra
- Velocidade ajustável (0.5×, 1×, 2×)

**Implementação:**
- SVG 600×400, 2D mesmo (não precisa Three.js)
- CSS `@keyframes` ou JS com `requestAnimationFrame`
- Bezier easing pra dar peso ao movimento
- Crédito: "*metáfora pedagógica de Maron, 2018, p. 38-41*"

**Por que importa:** É a explicação visual mais clara que existe da geometria geodésica. Hoje só temos texto + um SVG estático. Vira o "wow moment" do app.

---

### Feature C · Modo "Maquete primeiro"

**Onde:** novo toggle no topbar (ou no painel Tweaks) + lógica de override em `wizard-v3-app.js`.

**O que faz:** botão "modo maquete" que recalcula tudo em **escala 1:30** para que o usuário construa primeiro uma maquete de mesa antes de comprar madeira de verdade. Pedagogia direta do guia Maron (p. 56-67).

**Mudanças quando "modo maquete" está ligado:**

1. **Diâmetro travado em escala 1:30** — se o usuário tinha 5 m, vira 16.7 cm. Slider de diâmetro vai de 8 cm a 30 cm.
2. **Cut list em centímetros**, não metros.
3. **Material da estrutura forçado para "palitos de churrasco bambu"** — adicionar em `STRUCTURE_MATERIALS`:
   ```js
   {
     id: 'palito_churrasco',
     nome: 'Palito de churrasco (bambu)',
     diametro: 3, // mm
     precoLinear: 0.10, // por metro = R$ 3/100 palitos × 30 cm
     comprimentoComercial: 0.30,
     ...
   }
   ```
4. **Hub forçado para "bala de goma"** — adicionar:
   ```js
   {
     id: 'bala_goma',
     nome: 'Bala de goma',
     tipo: 'fixo',
     precoPorValencia: 0.30,
     nota: 'Furar com palito, reforçar com cola quente.',
   }
   ```
5. **Lista de compras** vira: palitos de churrasco, balas de goma, pistola de cola quente, alicate, estilete, canetas piloto. Total ~R$ 50.
6. **Diário de obra** vira "passos da maquete" (3 níveis: tetraedro → 1v icosaedro → 2v geodésica) com fotos do guia Maron como referência.
7. **3D canvas** mantém igual, mas hubs aparecem como esferinhas vermelhas/amarelas (bala de goma) e barras finas.
8. **Mensagem no topo:** *"⚠ MODO MAQUETE 1:30. Construa esta maquete primeiro para validar a geometria. Quando estiver confortável, desligue e o app volta pra escala real."*

**Onde armazenar:** `state.v3.modoMaquete = false` no DEFAULTS.

**Por que importa:** Maron dedica 1/6 do guia a ensinar isso. É a melhor onboarding pedagógico possível — usuário testa por R$ 50 antes de gastar R$ 5.000.

---

### Feature D · Modo iniciante × construtor avançado

**Onde:** novo tweak no painel Tweaks (canto inferior direito).

**O que faz:** alterna entre dois níveis de detalhe na UI:

**Modo iniciante (default):**
- Esconde: chord factors numéricos, cálculo de NBR 6123, tabelas de validação estrutural, métricas em N (newton)
- Mostra: tudo em linguagem simples ("se segura bem", "precisa de fundação", "vai pesar mais")
- Mais explicações com `term()` (popovers do glossário)
- Equação Maron em destaque, mas sem números absolutos
- Diário de obra com mais dicas e fotos

**Modo construtor avançado:**
- Mostra TUDO: chord factors, esbeltez L/r, cargas em N e kgf, esforço por barra, ângulos de hub, normas técnicas
- Menos popovers (assume conhecimento)
- Cut list em mm com 4 casas decimais
- Aparece o botão "exportar para CAD" mais cedo

**Implementação:**
- `state.v3.nivel = 'iniciante' | 'avancado'`
- Adicionar `data-nivel` no `<html>` e usar CSS `:not([data-nivel="avancado"]) .for-avancado { display: none; }` para esconder elementos
- Marcar elementos técnicos com `class="for-avancado"` em todo o app

**Por que importa:** público misto. Hoje o app sobrecarrega o iniciante e subutiliza o avançado.

---

## 4. Como rodar e testar

1. Servir o projeto como HTTP local (CORS quebra em `file://`):
   ```bash
   python3 -m http.server 8000
   # ou
   npx http-server -p 8000
   ```
2. Abrir `http://localhost:8000/Gerador%20de%20Domos%20v3.html`
3. Devtools: o estado vive em `localStorage['dome_wizard_state_v3']` — limpe com `localStorage.clear()` pra testar do zero
4. O painel Tweaks (⚙) tem o toggle de tema (cerrado/blueprint/drafting) — bom pra ver consistência visual em cada tema

---

## 5. Critério de aceitação

Para cada feature:

- [ ] Funciona nos 3 temas (cerrado, blueprint, drafting)
- [ ] Mobile-friendly (testar < 720 px)
- [ ] Print-friendly (Cmd+P deve dar PDF razoável)
- [ ] Persiste em `localStorage` se for stateful
- [ ] Cita fontes (link com URL + data) onde há dados externos
- [ ] Português brasileiro consistente
- [ ] Não quebra os exports SVG/DXF/CSV/OBJ existentes

---

## 6. Fontes técnicas

Tudo está documentado e citado in-line no código. As principais referências:

- **MARON, Jorge.** _Cúpulas Geodésicas — Guia para Iniciantes_. Ameríndia, 2018. 70 p. CC BY-SA. — fonte principal desta auditoria
- **Domerama:** http://www.domerama.com/calculators/ — cálculos V1–V6
- **NBR 6123:** ventos
- **NBR 6120, 7190, 9077, 9480:** cargas, madeira, emergência, tratamento autoclave
- **Buckminster Fuller Institute:** https://www.bfi.org

---

## 7. Arquivos neste pacote

- `Gerador de Domos v3.html` — entrada
- Todos os `.js` e `.css` necessários
- `Auditoria contra o guia.html` — contexto completo das decisões
- `guia-geodesicas.pdf` — fonte primária (Maron 2018)
- `HANDOFF.md` — este documento

---

**Boa codada.**
