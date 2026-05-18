# Gerador de Domos

Ferramenta web em português brasileiro para projetar cúpulas geodésicas DIY. Público-alvo: construtor mão-na-massa.

## Como rodar

Sem build step. Servir os arquivos via HTTP local (CORS quebra em `file://`):

```bash
npm run dev
# ou
python3 -m http.server 8000
```

Abrir <http://localhost:8000/>.

## Como rodar os testes

```bash
npm test
# ou
node --test test/
```

Os testes cobrem `geodesic.js` (cálculo Class I) e `exporter.js` (SVG/DXF/CSV/OBJ). Não precisam de browser.

## Stack

- HTML + ES modules + Three.js (CDN, v0.160.0 via importmap)
- CSS sem framework, com design system "caderno cerrado" + 3 temas (cerrado, blueprint, drafting)
- Estado persistido em `localStorage['dome_wizard_state_v3']`
- PWA: funciona offline depois do primeiro load

## Documentação

- `docs/HANDOFF.md` — handoff técnico completo (arquitetura, convenções, features pendentes)
- `docs/auditoria.html` — auditoria das decisões contra o guia Maron 2018
- `docs/guia-geodesicas.pdf` — fonte primária: MARON, Jorge. _Cúpulas Geodésicas — Guia para Iniciantes_. Ameríndia, 2018. CC BY-SA.
- `CLAUDE.md` — convenções de código para contribuição

## Licença

CC BY-SA 4.0 — mesma do guia Maron citado.
