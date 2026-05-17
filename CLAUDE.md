# CLAUDE.md · Guia para o Claude Code

Convenções e regras inegociáveis deste projeto. Leia antes de editar.

## O que é

Ferramenta web em pt-BR para projetar cúpulas geodésicas DIY. Stack: HTML + ES modules + Three.js, **sem build step**. Documentação completa em `docs/HANDOFF.md`.

## Regras inegociáveis

1. **Não tocar `geodesic.js`.** É o cálculo geodésico Class I, com snapshot tests protegendo refactors em `test/geodesic.test.js`. Se mudar, tem que justificar e rodar testes.
2. **Manter pt-BR em toda a UI.** Único inglês permitido: termos técnicos consagrados (hub, chord, V/v).
3. **Manter citação de fonte** em qualquer dado novo (URL + label + preço + data).
4. **Não migrar para build step.** Sem Webpack/Vite/Babel. Sem TypeScript. JSDoc é OK.
5. **Não trocar Three.js de CDN.** O importmap em `index.html` aponta para unpkg v0.160.0; serviço offline depende disso estar pinado.

## Padrões de código

### Estado global
- Estado vive em `wizard-v3-app.js` no objeto `DEFAULTS` (linhas ~32-80).
- Persistido em `localStorage['dome_wizard_state_v3']`.
- **Schema versionado**: incrementar `SCHEMA_VERSION` ao alterar a forma de `DEFAULTS`. A migração reseta para defaults — não há migração field-a-field.

### Helpers DOM
- **Não duplicar `el()`/`FMT`/`TYPE_COLORS`.** Importar de `./dom-helpers.js`:
  ```js
  import { el, FMT, TYPE_COLORS } from './dom-helpers.js';
  ```
- `el(tag, props, children)` cria DOM com classes, eventos (`onclick: fn`), estilos inline (`style: {...}`), atributos. `props.html` define `innerHTML`.

### Glossário
- Termos técnicos com popover: `import { term } from './glossario.js'` → `term('rótulo visível', 'chave-no-glossario')`.

### Cores
- Sempre via CSS vars: `var(--ink)`, `var(--ocre)`, `var(--paper)`, `var(--paper-soft)`, `var(--verde)`, `var(--sangue)`, `var(--blueprint)`.
- Definidas em `wizard-styles.css` (tema cerrado) e overridas em `[data-theme="blueprint"]` / `[data-theme="drafting"]`.

### Tipografia
- Cormorant Garamond (display, `em` em itálico ocre destaca)
- IBM Plex Mono (técnico/UI)
- IBM Plex Sans (corpo)

## Como rodar e testar

```bash
npm run dev      # python3 -m http.server 8000
npm test         # node --test test/
```

Abrir <http://localhost:8000/>. Estado em `localStorage['dome_wizard_state_v3']` — limpe com `localStorage.clear()` pra testar do zero.

## Critério de aceitação

Para qualquer mudança:
- [ ] `npm test` passa
- [ ] Funciona nos 3 temas (cerrado, blueprint, drafting)
- [ ] Mobile-friendly (< 720 px)
- [ ] Print-friendly (Cmd+P)
- [ ] Persiste em `localStorage` se for stateful
- [ ] Cita fontes onde há dados externos
- [ ] Não quebra os exports SVG/DXF/CSV/OBJ

## Arquitetura resumida

```
index.html               ← host; importmap de three.js + PWA
wizard-styles.css        ← base do design system "caderno cerrado"
wizard-v3-styles.css     ← blueprint/drafting/canvas-toolbar/diário

wizard-v3-app.js         ← orquestrador: estado, three.js, navegação
wizard-v3-step2.js       ← etapa 2 (forma) com canvas+toolbar+equação Maron
wizard-v3-extras.js      ← etapa 1 benefícios + dossiê 16b/17/18/19
wizard-steps.js          ← etapas 1, 3, 4
wizard-dossie.js         ← etapa 5 base

dom-helpers.js           ← el(), FMT, TYPE_COLORS compartilhados
geodesic.js              ← cálculo geodésico Class I (NÃO TOCAR)
materials-v2.js          ← catálogo de materiais com fontes
programa.js              ← cenários de uso + módulos
extras.js                ← floor systems, mantiqueira coverings
regiao-cargas.js         ← cargas vento/neve + lojas
glossario.js             ← termos com popover
exporter.js              ← SVG/DXF/CSV/OBJ exports
sw.js                    ← service worker (PWA offline)
manifest.json            ← PWA manifest
```

## Features pendentes (do HANDOFF)

Implementar nesta ordem:
1. **A** — Galeria de exemplos famosos com escala comparativa
2. **B** — Animação SVG da esfera magnética imaginária
3. **C** — Modo "maquete primeiro" (escala 1:30)
4. **D** — Modo iniciante × construtor avançado

Detalhe completo em `docs/HANDOFF.md` §3.
