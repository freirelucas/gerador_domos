// wizard-funil.js — Funil de onboarding em 3 perguntas + síntese.
//
// Renderizado quando state.v3.funilAtivo === true. Quatro telas:
//   1. Função (pra que serve) → 6 cards
//   2. Estilo (que cara vai ter) → 2 cards
//   3. Região (Mantiqueira ou Cerrado) → 2 cards
//   4. Síntese: bundle recomendado + 2 CTAs (começar a editar / voltar)
//
// O progresso vive em state.v3.funilProgress = { step, funcao, estilo, regiao }
// e é persistido em localStorage a cada escolha — fechar a aba no meio do
// caminho e voltar retoma exatamente onde parou.
//
// Quando o usuário confirma na tela 4, composeBundle gera o patch e ele é
// mergeado sobre o state; welcomeSeen=true e touched=true são marcados;
// funilAtivo=false; funilProgress=null; render() leva pra Etapa 1.

import { el, FMT } from './dom-helpers.js';
import {
  FUNCOES, ESTILOS, REGIOES_FUNIL, BUNDLES, composeBundle, bundleSelo,
} from './bundles.js';

export function renderFunil(host, api) {
  const s = api.state;
  // Inicializa progress se for primeira entrada
  if (!s.v3.funilProgress) {
    s.v3.funilProgress = { step: 1, funcao: null, estilo: null, regiao: null };
    api.persistRaw();
  }
  const p = s.v3.funilProgress;
  // Trava o step máximo às escolhas feitas — se o usuário voltou pra trás
  // via dots, mantém p.step menor que o máximo permitido.
  const maxStep = stepMaxAllowed(p);
  if (p.step > maxStep) { p.step = maxStep; api.persistRaw(); }

  const root = el('div', { class: 'funil', role: 'region', 'aria-label': 'Recomendador de projeto' });

  // ── Header com progress dots + fechar ────────────────────────────
  root.appendChild(buildHeader(api, p));

  // ── Conteúdo da tela atual ───────────────────────────────────────
  const screen = el('div', {
    class: 'funil-screen',
    role: 'group',
    'aria-live': 'polite',
    'aria-atomic': 'false',
  });
  if (p.step === 1) screen.appendChild(buildFuncao(api, p));
  else if (p.step === 2) screen.appendChild(buildEstilo(api, p));
  else if (p.step === 3) screen.appendChild(buildRegiao(api, p));
  else if (p.step === 4) screen.appendChild(buildSintese(api, p));
  root.appendChild(screen);

  // ── Footer com voltar/continuar ──────────────────────────────────
  root.appendChild(buildFooter(api, p));

  host.appendChild(root);
}

// ── Header ───────────────────────────────────────────────────────────
function buildHeader(api, p) {
  const dots = el('div', { class: 'funil-dots', role: 'tablist', 'aria-label': 'Progresso do recomendador' });
  for (let i = 1; i <= 4; i++) {
    const cls = ['funil-dot'];
    if (i === p.step) cls.push('is-active');
    if (i < p.step)  cls.push('is-done');
    const allowedMax = stepMaxAllowed(p);
    const canJump = i <= allowedMax;
    dots.appendChild(el('button', {
      type: 'button',
      class: cls.join(' '),
      role: 'tab',
      'aria-selected': i === p.step ? 'true' : 'false',
      'aria-label': `Ir para passo ${i} de 4`,
      disabled: canJump ? null : 'disabled',
      onclick: canJump ? () => goToFunilStep(api, i) : null,
    }, String(i)));
  }
  return el('header', { class: 'funil-header' }, [
    el('div', { class: 'funil-eyebrow' }, `passo ${p.step} de 4 · recomendador`),
    dots,
    el('button', {
      type: 'button',
      class: 'funil-close',
      'aria-label': 'Fechar recomendador e voltar à tela de abertura',
      onclick: () => confirmClose(api),
    }, '×'),
  ]);
}

// ── Footer ───────────────────────────────────────────────────────────
function buildFooter(api, p) {
  const podeAvancar = (
    (p.step === 1 && p.funcao) ||
    (p.step === 2 && p.estilo) ||
    (p.step === 3 && p.regiao)
    // tela 4 tem CTA próprio dentro do screen
  );
  const continuar = p.step < 4 && el('button', {
    type: 'button',
    class: 'funil-cta',
    disabled: podeAvancar ? null : 'disabled',
    onclick: podeAvancar ? () => goToFunilStep(api, p.step + 1) : null,
  }, 'continuar →');
  const voltar = p.step > 1 && el('button', {
    type: 'button',
    class: 'funil-ghost',
    onclick: () => goToFunilStep(api, p.step - 1),
  }, '← voltar');
  return el('footer', { class: 'funil-footer' }, [
    voltar || el('span', { class: 'funil-spacer' }),
    el('div', { class: 'funil-honest' },
      'você pode mudar qualquer coisa depois — esta é uma sugestão, não uma trava.'),
    continuar || el('span', { class: 'funil-spacer' }),
  ]);
}

// ── Tela 1 · Função ──────────────────────────────────────────────────
function buildFuncao(api, p) {
  const wrap = el('div', { class: 'funil-body' }, [
    el('h2', { class: 'funil-title', html: 'pra que vai <em>servir</em>?' }),
    el('p', { class: 'funil-lede' },
      'A função define o tamanho recomendado, os módulos internos e a capacidade de pessoas. ' +
      'Escolha o que melhor descreve o seu uso principal.'),
  ]);
  const grid = el('div', { class: 'funil-grid funil-grid--6', role: 'radiogroup', 'aria-label': 'Função do domo' });
  for (const f of FUNCOES) {
    const isActive = p.funcao === f.id;
    grid.appendChild(el('button', {
      type: 'button',
      class: 'funil-card funil-card--func' + (isActive ? ' is-active' : ''),
      role: 'radio',
      'aria-checked': isActive ? 'true' : 'false',
      onclick: () => selectFuncao(api, f.id),
    }, [
      el('div', { class: 'funil-card-icon' }, f.icone),
      el('div', { class: 'funil-card-title' }, f.label),
      el('div', { class: 'funil-card-desc' }, f.desc),
      el('div', { class: 'funil-card-exemplo' }, f.exemplo),
    ]));
  }
  wrap.appendChild(grid);
  return wrap;
}

// ── Tela 2 · Estilo ──────────────────────────────────────────────────
function buildEstilo(api, p) {
  const wrap = el('div', { class: 'funil-body' }, [
    el('h2', { class: 'funil-title', html: 'que <em>cara</em> vai ter?' }),
    el('p', { class: 'funil-lede' },
      'O estilo escolhe o conjunto de materiais que se comportam bem juntos. ' +
      'Os dois estilos abaixo são internamente compatíveis (dilatação, vedação, peso) por design.'),
  ]);
  const grid = el('div', { class: 'funil-grid funil-grid--2', role: 'radiogroup', 'aria-label': 'Estilo construtivo' });
  for (const e of ESTILOS) {
    const isActive = p.estilo === e.id;
    grid.appendChild(el('button', {
      type: 'button',
      class: 'funil-card funil-card--estilo' + (isActive ? ' is-active' : ''),
      role: 'radio',
      'aria-checked': isActive ? 'true' : 'false',
      onclick: () => selectEstilo(api, e.id),
    }, [
      el('div', { class: 'funil-card-eyebrow' }, e.id === 'vernaculo' ? 'rústico · low-tech' : 'engenheirado · pragmático'),
      el('div', { class: 'funil-card-title funil-card-title--lg' }, e.label),
      el('p', { class: 'funil-card-pitch' }, e.pitch),
      el('ul', { class: 'funil-card-attrs' },
        e.atributos.map((a) => el('li', {}, a))),
      el('div', { class: 'funil-card-fonte' }, e.fonte.label + ' · ' + e.fonte.ano),
    ]));
  }
  wrap.appendChild(grid);
  return wrap;
}

// ── Tela 3 · Região ──────────────────────────────────────────────────
function buildRegiao(api, p) {
  const wrap = el('div', { class: 'funil-body' }, [
    el('h2', { class: 'funil-title', html: 'onde <em>vai ficar</em>?' }),
    el('p', { class: 'funil-lede' },
      'A região define cargas de vento e neve (NBR 6123/6120), materiais locais disponíveis ' +
      'e os riscos típicos que o projeto precisa endereçar. Esta versão cobre dois biomas brasileiros.'),
  ]);
  const grid = el('div', { class: 'funil-grid funil-grid--2', role: 'radiogroup', 'aria-label': 'Região' });
  for (const r of REGIOES_FUNIL) {
    const isActive = p.regiao === r.id;
    grid.appendChild(el('button', {
      type: 'button',
      class: 'funil-card funil-card--regiao' + (isActive ? ' is-active' : ''),
      role: 'radio',
      'aria-checked': isActive ? 'true' : 'false',
      onclick: () => selectRegiao(api, r.id),
    }, [
      el('div', { class: 'funil-card-eyebrow' }, 'bioma · NBR 6123 zona 1'),
      el('div', { class: 'funil-card-title funil-card-title--lg' }, r.label),
      el('div', { class: 'funil-card-cidades' }, r.cidades.join(' · ')),
      el('div', { class: 'funil-card-metricas' }, r.metricas),
      el('ul', { class: 'funil-card-riscos' },
        r.riscos.map((x) => el('li', {}, x))),
    ]));
  }
  wrap.appendChild(grid);
  return wrap;
}

// ── Tela 4 · Síntese ─────────────────────────────────────────────────
function buildSintese(api, p) {
  const patch = composeBundle({ funcao: p.funcao, estilo: p.estilo, regiao: p.regiao });
  const bundle = BUNDLES[`${p.estilo}_${p.regiao}`];
  const selo = bundleSelo({ funcao: p.funcao, estilo: p.estilo, regiao: p.regiao });

  // Labels humanas dos materiais a partir do api.data
  const lookup = (list, id) => list.find((x) => x.id === id);
  const matEstrutura = lookup(api.data.STRUCTURE_MATERIALS, patch.sistemas.estrutura);
  const matConector  = lookup(api.data.HUB_CONNECTORS,     patch.sistemas.conector);
  const matCobertura = lookup(api.data.COVERINGS,          patch.sistemas.cobertura);
  const matFundacao  = lookup(api.data.FOUNDATIONS,        patch.sistemas.fundacao);
  const cenario = api.data.USE_SCENARIOS.find((x) => x.id === patch.programa.cenario);

  const wrap = el('div', { class: 'funil-body funil-body--sintese' }, [
    el('h2', { class: 'funil-title', html: 'veja o que <em>recomendamos</em>' }),
    el('p', { class: 'funil-lede' },
      'Bundle internamente compatível para sua combinação. Você cai na Etapa 1 com tudo pré-preenchido e edita o que quiser.'),
  ]);

  // Card grande
  const card = el('article', { class: 'funil-sintese' }, [
    el('div', { class: 'funil-sintese-head' }, [
      el('div', { class: 'funil-sintese-eyebrow' }, 'bundle recomendado'),
      el('h3', { class: 'funil-sintese-title' }, selo),
      cenario && el('div', { class: 'funil-sintese-cenario' },
        `${cenario.icone}  ${cenario.nome} · ${cenario.descricao}`),
    ]),

    el('div', { class: 'funil-sintese-grid' }, [
      kv('forma',     `Ø ${FMT.m(patch.forma.diametro)} · ${patch.forma.freq}V · ${fracTrunc(patch.forma.truncamento)} domo`),
      kv('capacidade', `${patch.programa.capacidade} pessoa${patch.programa.capacidade !== 1 ? 's' : ''}`),
      kv('módulos',   patch.programa.modulos.length
        ? patch.programa.modulos.map((m) => api.data.PROGRAM_MODULES[m]?.label || m).join(', ')
        : '— (livre)'),
      kv('clima',     api.data.CLIMATE_ZONES.find((c) => c.id === patch.programa.clima)?.label || patch.programa.clima),
      kv('estrutura', matEstrutura?.nome || patch.sistemas.estrutura),
      kv('hub',       matConector?.nome  || patch.sistemas.conector),
      kv('cobertura', matCobertura?.nome || patch.sistemas.cobertura),
      kv('fundação',  matFundacao?.nome  || patch.sistemas.fundacao),
    ]),

    el('div', { class: 'funil-sintese-avisos' }, [
      el('h4', { class: 'funil-sintese-h4' }, 'pontos críticos desta combinação'),
      el('ul', { class: 'funil-sintese-avisos-list' },
        patch.avisosRegionais.map((a) => el('li', {}, a))),
    ]),

    el('div', { class: 'funil-sintese-fontes' }, [
      el('div', { class: 'funil-sintese-fontes-label' }, 'fontes'),
      el('ul', { class: 'funil-sintese-fontes-list' },
        patch.fontes.map((f) => el('li', {}, [
          el('a', { href: f.url, target: '_blank', rel: 'noopener' }, f.label),
          ' · ', f.ano,
        ]))),
    ]),
  ]);
  wrap.appendChild(card);

  // CTAs
  wrap.appendChild(el('div', { class: 'funil-sintese-ctas' }, [
    el('button', {
      type: 'button',
      class: 'funil-cta funil-cta--primary',
      onclick: () => confirmFinish(api, patch),
    }, 'começar a editar →'),
    el('button', {
      type: 'button',
      class: 'funil-ghost',
      onclick: () => goToFunilStep(api, 3),
    }, '← ajustar região'),
  ]));

  return wrap;
}

// ── KV row helper ────────────────────────────────────────────────────
function kv(k, v) {
  return el('div', { class: 'funil-kv' }, [
    el('span', { class: 'funil-kv-k' }, k),
    el('span', { class: 'funil-kv-v' }, String(v)),
  ]);
}

function fracTrunc(t) {
  if (Math.abs(t - 0.5)   < 0.01) return '½';
  if (Math.abs(t - 0.625) < 0.01) return '⅝';
  if (Math.abs(t - 0.75)  < 0.01) return '¾';
  if (Math.abs(t - 1)     < 0.01) return 'inteira';
  return t.toFixed(2);
}

// ── State transitions ────────────────────────────────────────────────
function selectFuncao(api, id) {
  api.state.v3.funilProgress.funcao = id;
  api.persistRaw();
  api.render();
}
function selectEstilo(api, id) {
  api.state.v3.funilProgress.estilo = id;
  api.persistRaw();
  api.render();
}
function selectRegiao(api, id) {
  api.state.v3.funilProgress.regiao = id;
  api.persistRaw();
  api.render();
}
function goToFunilStep(api, n) {
  api.state.v3.funilProgress.step = Math.max(1, Math.min(4, n));
  api.persistRaw();
  api.render();
}

function stepMaxAllowed(p) {
  // O usuário só pode estar na tela N se as escolhas até N-1 já existem.
  if (!p.funcao) return 1;
  if (!p.estilo) return 2;
  if (!p.regiao) return 3;
  return 4;
}

// ── Fechar funil (com confirmação) ───────────────────────────────────
function confirmClose(api) {
  const overlay = el('div', { class: 'funil-modal-overlay', role: 'dialog', 'aria-modal': 'true' });
  const modal = el('div', { class: 'funil-modal' }, [
    el('h3', { class: 'funil-modal-title' }, 'fechar o recomendador?'),
    el('p', { class: 'funil-modal-body' },
      'Suas escolhas até aqui ficam salvas. Você pode reabrir o recomendador a qualquer momento ' +
      'pelas configurações (⚙ no canto). Para continuar agora, basta voltar.'),
    el('div', { class: 'funil-modal-ctas' }, [
      el('button', {
        type: 'button',
        class: 'funil-ghost',
        onclick: () => overlay.remove(),
      }, 'continuar no recomendador'),
      el('button', {
        type: 'button',
        class: 'funil-cta',
        onclick: () => {
          api.state.v3.funilAtivo = false;
          // mantém funilProgress pra retomada futura via tweaks
          api.persistRaw();
          overlay.remove();
          api.render();
        },
      }, 'fechar e voltar pra abertura'),
    ]),
  ]);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  // Esc fecha o overlay (não o funil)
  const escHandler = (ev) => {
    if (ev.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', escHandler); }
  };
  document.addEventListener('keydown', escHandler);
}

// ── Finalizar funil: aplicar patch ao state ─────────────────────────
function confirmFinish(api, patch) {
  const s = api.state;
  // Programa, forma, sistemas
  Object.assign(s.programa, patch.programa);
  Object.assign(s.forma,    patch.forma);
  Object.assign(s.sistemas, patch.sistemas);
  // v3 (regiao + selo)
  Object.assign(s.v3, patch.v3);
  // flags
  s.v3.welcomeSeen = true;
  s.v3.touched     = true;
  s.v3.funilAtivo  = false;
  s.v3.funilProgress = null;
  s.step = 1;
  api.persistRaw();
  api.render();
}

// ── Entrada externa: iniciar funil ───────────────────────────────────
// Chamada pelo welcome e pelo tweaks panel.
export function startFunil(api) {
  api.state.v3.funilAtivo = true;
  // Não limpa funilProgress aqui — permite retomar de onde parou se houver.
  // Se quiser começar limpo, chama resetFunil antes.
  api.persistRaw();
  api.render();
}

export function resetFunil(api) {
  api.state.v3.funilProgress = null;
  api.persistRaw();
}
