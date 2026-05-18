// wizard-v3-app.js — Orquestrador v3
// Diferenças vs v2:
//   1. Canvas com 4 modos de vista (perspectiva / planta / elevação / axo)
//   2. Slider "explodido" — barras se afastam do centro
//   3. Slider "hora do sol" — luz direcional rotaciona; sombras em tempo real
//   4. Animação de montagem peça-por-peça (botão play)
//   5. Painel de Tweaks com 3 temas exploratórios (cerrado / blueprint / drafting)
//   6. Etapa 5 ganha: cargas vento+neve por região, lista de compras por loja, diário de obra

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildDome } from './geodesic.js';
import {
  STRUCTURE_MATERIALS, HUB_CONNECTORS, COVERINGS, FOUNDATIONS,
  WATER_SYSTEMS, ENERGY_SYSTEMS, OPENING_TYPES, TOOLS, pricePerStruct,
} from './materials-v2.js';
import {
  PROGRAM_MODULES, USE_SCENARIOS, CLIMATE_ZONES,
  programaArea, suggestDiameter,
} from './programa.js';
import { FLOOR_SYSTEMS, MANTIQUEIRA_COVERINGS, validateStructure } from './extras.js';
import { initGlossarioPopover } from './glossario.js';
import { renderStep1, renderStep3, renderStep4 } from './wizard-steps.js';
import { renderStep5, initSheetCollapse } from './wizard-dossie.js';
import { mountSidePanel, refreshSidePanel } from './wizard-side-panel.js';
import { renderStep2V3 } from './wizard-v3-step2.js';
import { appendDossieExtras, appendStep1Benefits } from './wizard-v3-extras.js';
import { appendStep1Galeria } from './wizard-v3-galeria.js';
import { REGIOES, LOJAS } from './regiao-cargas.js';

const ALL_COVERINGS = [...COVERINGS, ...MANTIQUEIRA_COVERINGS];

// ─── Estado ────────────────────────────────────────────────────────────────
// Incremente SCHEMA_VERSION sempre que mudar a FORMA de DEFAULTS (novos
// campos, rename, remoção). A migração é não-incremental: estados antigos
// são resetados para DEFAULTS. O usuário só perde o wizard em andamento.
const SCHEMA_VERSION = 5;

/**
 * @typedef {Object} DomeState
 * @property {number} __version  versão do schema; ver SCHEMA_VERSION
 * @property {number} step       etapa atual (1-5)
 * @property {{cenario: string, capacidade: number, modulos: string[], clima: string}} programa
 * @property {{diametro: number, freq: number, truncamento: number}} forma
 * @property {Object} aberturas  portas, janelas, ventilação, orientação
 * @property {Object} sistemas   estrutura, conector, cobertura, fundação, piso, água, energia
 * @property {{ativa: boolean, altura: number}} riser
 * @property {Object} v3         tema, viewMode, explodido, sol, montagem, diário etc.
 */

/** @type {DomeState} */
const DEFAULTS = {
  __version: SCHEMA_VERSION,
  step: 1,
  programa: {
    cenario: 'glamping_casal',
    capacidade: 2,
    modulos: ['dormitorio', 'banheiro', 'kitchenette'],
    clima: 'cerrado_central',
  },
  forma: { diametro: 5.5, freq: 3, truncamento: 0.625 },
  aberturas: {
    porta_principal: true, porta_emergencia: false,
    janelas_basc: 4, janelas_redondas: 2, cupula_zenital: true,
    abertura_ventilacao: 2, orientacaoPorta: 90, mosquiteiro: true,
  },
  sistemas: {
    estrutura: 'eucalipto_rolico', conector: 'aco_galv',
    cobertura: 'lona_pvc', fundacao: 'pedras_secas', piso: 'deck_madeira',
    agua: 'cisterna_2000', energia: 'fotovoltaico_basico',
  },
  riser: { ativa: true, altura: 0.8 },
  v3: {
    tema: 'cerrado',
    viewMode: 'perspective',  // perspective | planta | elevacao | axo
    explodido: 0,             // 0..1
    sol: 12,                  // 6..18, hora do dia
    montagem: 1,              // 0..1, fração das peças montadas
    montagemPlaying: false,
    regiao: 'cerrado_central',// para cargas
    diarioStart: null,        // data início obra
    diarioChecks: {},         // map "d2:0" -> bool
    diarioNotes: {},          // map "d2" -> string
    dossieClosed: ['s-origem'],  // IDs de <section class="sheet"> fechadas
  },
  // Comparação A/B opcional. null = modo single-projeto (default).
  // Quando ativo: { A: snapshot, B: snapshot }, activeVariante: 'A' | 'B'.
  variantes: null,
  activeVariante: null,
};
const STORAGE_KEY = 'dome_wizard_state_v3';
function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (stored.__version !== SCHEMA_VERSION) {
      if (stored.__version !== undefined) {
        console.info(`[dome] schema v${stored.__version} → v${SCHEMA_VERSION}: resetando estado`);
      }
      return structuredClone(DEFAULTS);
    }
    return deepMerge(structuredClone(DEFAULTS), stored);
  } catch { return structuredClone(DEFAULTS); }
}
function deepMerge(target, src) {
  for (const k of Object.keys(src || {})) {
    if (src[k] && typeof src[k] === 'object' && !Array.isArray(src[k])) {
      target[k] = deepMerge(target[k] || {}, src[k]);
    } else { target[k] = src[k]; }
  }
  return target;
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

let state = loadState();

// ─── Aplicar tema no DOM ──────────────────────────────────────────────────
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  // Atualiza cores dos materiais 3D para combinar
  rebuildSceneColors();
}

// ─── Three.js ────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const perspCam = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
perspCam.position.set(12, 9, 14);
const orthoCam = new THREE.OrthographicCamera(-8, 8, 6, -6, 0.1, 200);
let camera = perspCam;

const controls = new OrbitControls(perspCam, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 1.5, 0);

// Luzes
const hemiLight = new THREE.HemisphereLight(0xfff0d0, 0x4a3a25, 0.55);
scene.add(hemiLight);
const dirLight = new THREE.DirectionalLight(0xfff2cf, 1.05);
dirLight.position.set(10, 14, 8);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.camera.left = -14;
dirLight.shadow.camera.right = 14;
dirLight.shadow.camera.top = 14;
dirLight.shadow.camera.bottom = -14;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 50;
dirLight.shadow.bias = -0.0004;
scene.add(dirLight);

const TYPE_COLORS_CERRADO = {
  A: 0xb4742a, B: 0x4a5d3a, C: 0x2a4d70, D: 0x8a2f1a,
  E: 0x6b4a8c, F: 0x3a3a3a, G: 0x9c5a2a, H: 0x2a6a4a,
};
const TYPE_COLORS_BLUEPRINT = {
  A: 0x5ee0ff, B: 0xa0f0a0, C: 0xffd76a, D: 0xff7a5a,
  E: 0xc5a5ff, F: 0xb0ecff, G: 0xffe7a0, H: 0xa0e6ff,
};
const TYPE_COLORS_DRAFTING = {
  A: 0x111111, B: 0x444444, C: 0x222222, D: 0xc8141c,
  E: 0x555555, F: 0x222222, G: 0xc8141c, H: 0x333333,
};
function typeColors() {
  if (state.v3.tema === 'blueprint') return TYPE_COLORS_BLUEPRINT;
  if (state.v3.tema === 'drafting') return TYPE_COLORS_DRAFTING;
  return TYPE_COLORS_CERRADO;
}

const strutsGroup = new THREE.Group();
const hubsGroup = new THREE.Group();
const groundGroup = new THREE.Group();
const openingsGroup = new THREE.Group();
scene.add(strutsGroup, hubsGroup, groundGroup, openingsGroup);

// Plano de sombra
const shadowReceiver = (function makeReceiver() {
  const geo = new THREE.CircleGeometry(13, 96);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.ShadowMaterial({ opacity: 0.22 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 0;
  mesh.receiveShadow = true;
  return mesh;
})();
scene.add(shadowReceiver);

(function makeGround() {
  const r = 12;
  const geo = new THREE.CircleGeometry(r, 96);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ color: 0xefe6cf, transparent: true, opacity: 0.35 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = -0.01;
  groundGroup.add(mesh);
  for (let i = 1; i <= 6; i++) {
    const ringGeo = new THREE.RingGeometry(i, i + 0.012, 96);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x6c5a3a, transparent: true, opacity: 0.18, side: THREE.DoubleSide,
    });
    groundGroup.add(new THREE.Mesh(ringGeo, ringMat));
  }
  const axisMat = new THREE.LineBasicMaterial({ color: 0x6c5a3a, transparent: true, opacity: 0.32 });
  const axisPts = [[-r,0,0],[r,0,0],[0,0,-r],[0,0,r]];
  for (let i = 0; i < axisPts.length; i += 2) {
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...axisPts[i]),
      new THREE.Vector3(...axisPts[i+1]),
    ]);
    groundGroup.add(new THREE.Line(g, axisMat));
  }
})();
// Compass labels
(function makeCompass() {
  const r = 11.5;
  const dirs = [
    { label: 'N', pos: [0,0,-r] }, { label: 'L', pos: [r,0,0] },
    { label: 'S', pos: [0,0,r] }, { label: 'O', pos: [-r,0,0] },
  ];
  for (const d of dirs) {
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1c1209';
    ctx.font = '500 36px IBM Plex Mono, monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(d.label, 32, 32);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(...d.pos);
    sprite.scale.set(0.6, 0.6, 0.6);
    groundGroup.add(sprite);
  }
})();

let currentDome = null;
let highlightedType = null;

function buildSceneFromDome(dome) {
  strutsGroup.clear();
  hubsGroup.clear();
  openingsGroup.clear();

  const r = dome.diameter / 2;
  const minY = Math.min(...[...dome.used].map((i) => dome.verts[i][2] * r));
  const riserH = state.riser?.ativa ? state.riser.altura : 0;
  const colors = typeColors();

  // Calcular alturas máx para a "animação de montagem"
  const allYs = [...dome.used].map((i) => dome.verts[i][2] * r - minY + riserH);
  const maxY = Math.max(...allYs);

  // Ordem das barras por altura média (anel-por-anel, base para topo)
  const allEdges = [];
  for (const group of dome.struts) {
    for (const edge of group.edges) {
      const va = dome.verts[edge.a], vb = dome.verts[edge.b];
      const aY = va[2]*r - minY + riserH;
      const bY = vb[2]*r - minY + riserH;
      allEdges.push({ group, edge, va, vb, midY: (aY+bY)/2 });
    }
  }
  allEdges.sort((a, b) => a.midY - b.midY);

  // Quantas barras revelar (animação)
  const showFraction = state.v3.montagem;
  const showCount = Math.ceil(allEdges.length * showFraction);

  const explodido = state.v3.explodido;

  let idx = 0;
  for (const item of allEdges) {
    const { group, edge, va, vb } = item;
    if (idx++ >= showCount) break;
    const dim = highlightedType && highlightedType !== group.label;
    const color = colors[group.label] || 0x444444;
    const mat = new THREE.MeshStandardMaterial({
      color, roughness: 0.85, metalness: 0.05,
      transparent: dim, opacity: dim ? 0.18 : 1,
    });
    const strutRadius = state.sistemas.estrutura === 'bambu_dendro' ? 0.06 : 0.04;
    let a = new THREE.Vector3(va[0]*r, va[2]*r - minY + riserH, -va[1]*r);
    let b = new THREE.Vector3(vb[0]*r, vb[2]*r - minY + riserH, -vb[1]*r);
    // Explodido: mover cada barra radialmente do eixo Y (centro do domo)
    if (explodido > 0) {
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const radial = new THREE.Vector3(mid.x, 0, mid.z).normalize();
      const upward = mid.y * 0.35;
      const offset = radial.clone().multiplyScalar(explodido * (r * 0.8)).add(new THREE.Vector3(0, explodido * upward, 0));
      a = a.clone().add(offset);
      b = b.clone().add(offset);
    }
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const geom = new THREE.CylinderGeometry(strutRadius, strutRadius, len, 8, 1);
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.copy(a).add(dir.clone().multiplyScalar(0.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    mesh.castShadow = true;
    mesh.receiveShadow = false;
    strutsGroup.add(mesh);
  }

  // Hubs (sempre todos)
  const hubGeo = new THREE.SphereGeometry(0.075, 12, 10);
  const matBase = new THREE.MeshStandardMaterial({ color: 0x8a2f1a, roughness: 0.6 });
  const mat5 = new THREE.MeshStandardMaterial({ color: 0x1c1209, roughness: 0.6 });
  const mat6 = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.6 });
  if (state.v3.tema === 'blueprint') {
    matBase.color.set(0xff7a5a); mat5.color.set(0xe6f4ff); mat6.color.set(0x9cc5e0);
  } else if (state.v3.tema === 'drafting') {
    matBase.color.set(0xc8141c); mat5.color.set(0x0a0a0a); mat6.color.set(0x444444);
  }

  for (const h of dome.hubs) {
    const isBase = Math.abs(h.pos[2] * r - minY) < 0.05;
    const m = new THREE.Mesh(hubGeo, isBase ? matBase : (h.valence === 5 ? mat5 : mat6));
    let pos = new THREE.Vector3(h.pos[0] * r, h.pos[2] * r - minY + riserH, -h.pos[1] * r);
    if (explodido > 0) {
      const radial = new THREE.Vector3(pos.x, 0, pos.z).normalize();
      pos.add(radial.multiplyScalar(explodido * r * 0.8));
      pos.y += explodido * pos.y * 0.35;
    }
    m.position.copy(pos);
    m.castShadow = true;
    hubsGroup.add(m);
  }

  // Riser wall
  if (riserH > 0 && state.v3.montagem >= 0.05 && explodido < 0.05) {
    const baseHubs = dome.hubs.filter((h) => Math.abs(h.pos[2] * r - minY) < 0.05);
    const sorted = baseHubs.slice().sort((a, b) =>
      Math.atan2(a.pos[1], a.pos[0]) - Math.atan2(b.pos[1], b.pos[0]));
    let riserColor = 0xc69466;
    if (state.v3.tema === 'blueprint') riserColor = 0x355875;
    else if (state.v3.tema === 'drafting') riserColor = 0xe0dccc;
    const riserMat = new THREE.MeshStandardMaterial({
      color: riserColor, roughness: 0.85,
      transparent: true, opacity: 0.55, side: THREE.DoubleSide,
    });
    for (let i = 0; i < sorted.length; i++) {
      const h1 = sorted[i], h2 = sorted[(i + 1) % sorted.length];
      const x1 = h1.pos[0]*r, z1 = -h1.pos[1]*r;
      const x2 = h2.pos[0]*r, z2 = -h2.pos[1]*r;
      const seg = Math.hypot(x2-x1, z2-z1);
      const geom = new THREE.PlaneGeometry(seg, riserH);
      const mesh = new THREE.Mesh(geom, riserMat);
      mesh.position.set((x1+x2)/2, riserH/2, (z1+z2)/2);
      mesh.rotation.y = Math.atan2(-(z2-z1), (x2-x1));
      mesh.castShadow = true;
      hubsGroup.add(mesh);
    }
  }

  // Aberturas (só quando NÃO está explodido e montagem ≥ 90%)
  if (explodido < 0.05 && state.v3.montagem >= 0.9) {
    drawOpenings(dome, minY);
  }
}

function drawOpenings(dome, minY) {
  const r = dome.diameter / 2;
  const ab = state.aberturas;
  const riserH = state.riser?.ativa ? state.riser.altura : 0;

  if (ab.porta_principal) drawDoorFrame(ab.orientacaoPorta || 90, 0.9, 2.05, '#3a2410', dome, riserH);
  if (ab.porta_emergencia) drawDoorFrame(((ab.orientacaoPorta || 90) + 180) % 360, 0.8, 2.00, '#6a3a1a', dome, riserH);

  if (ab.cupula_zenital) {
    const topY = dome.verts[0][2] * r - minY + riserH + 0.05;
    const cupGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.08, 24);
    const cupMat = new THREE.MeshStandardMaterial({ color: 0x2a4d70, transparent: true, opacity: 0.45, roughness: 0.2 });
    const cup = new THREE.Mesh(cupGeo, cupMat);
    cup.position.set(0, topY, 0); openingsGroup.add(cup);
    const glassGeo = new THREE.SphereGeometry(0.42, 24, 12, 0, Math.PI*2, 0, Math.PI/2);
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xaaccdd, transparent: true, opacity: 0.35, roughness: 0.1, metalness: 0.1 });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0, topY + 0.04, 0); openingsGroup.add(glass);
  }
  const nVent = Math.min(ab.abertura_ventilacao || 0, 6);
  if (nVent > 0 && riserH > 0.3) {
    for (let k = 0; k < nVent; k++) {
      const baseAng = (ab.orientacaoPorta || 90);
      const ang = baseAng + 60 + (k / nVent) * 240;
      const rad = (ang * Math.PI) / 180;
      const footR = dome.footRadius;
      const x = Math.sin(rad) * footR;
      const z = -Math.cos(rad) * footR;
      const geom = new THREE.PlaneGeometry(0.6, 0.25);
      const mat = new THREE.MeshStandardMaterial({ color: 0x4a5d3a, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
      const m = new THREE.Mesh(geom, mat);
      m.position.set(x, riserH * 0.4, z); m.lookAt(0, riserH * 0.4, 0);
      openingsGroup.add(m);
    }
  }
  const nJ = Math.min(ab.janelas_basc || 0, 12);
  if (nJ > 0) {
    const triangulos = dome.faces.map((f) => {
      const ps = f.map((i) => dome.verts[i]);
      const zMed = (ps[0][2] + ps[1][2] + ps[2][2]) / 3;
      const cx = (ps[0][0] + ps[1][0] + ps[2][0]) / 3;
      const cy = (ps[0][1] + ps[1][1] + ps[2][1]) / 3;
      const cz = (ps[0][2] + ps[1][2] + ps[2][2]) / 3;
      return { f, zMed, c: [cx, cy, cz], ps };
    }).filter((t) => t.zMed > 0.05 && t.zMed < 0.55).sort((a, b) => a.zMed - b.zMed);
    const portaAng = ((ab.orientacaoPorta || 90) * Math.PI) / 180;
    const triFiltrados = triangulos.filter((t) => {
      const ang = Math.atan2(-t.c[1], t.c[0]);
      const angDoor = Math.atan2(-Math.cos(portaAng), Math.sin(portaAng));
      const diff = Math.abs(((ang - angDoor + Math.PI*3) % (Math.PI*2)) - Math.PI);
      return diff > 0.6;
    });
    const step = Math.max(1, Math.floor(triFiltrados.length / nJ));
    for (let k = 0; k < nJ && k * step < triFiltrados.length; k++) {
      drawWindowInTriangle(triFiltrados[k * step], r, minY, riserH, 0x2a4d70, 0.6);
    }
  }
  const nR = Math.min(ab.janelas_redondas || 0, 8);
  if (nR > 0) {
    const triangulos = dome.faces.map((f) => {
      const ps = f.map((i) => dome.verts[i]);
      const zMed = (ps[0][2] + ps[1][2] + ps[2][2]) / 3;
      const cx = (ps[0][0] + ps[1][0] + ps[2][0]) / 3;
      const cy = (ps[0][1] + ps[1][1] + ps[2][1]) / 3;
      const cz = (ps[0][2] + ps[1][2] + ps[2][2]) / 3;
      return { f, zMed, c: [cx, cy, cz] };
    }).filter((t) => t.zMed > 0.4 && t.zMed < 0.85).sort((a, b) => a.zMed - b.zMed);
    const step = Math.max(1, Math.floor(triangulos.length / nR));
    for (let k = 0; k < nR && k * step < triangulos.length; k++) {
      drawRoundWindowInTriangle(triangulos[k * step], r, minY, riserH);
    }
  }
}

function drawWindowInTriangle(tri, r, minY, riserH, color, scale = 0.55) {
  const ps = tri.f.map((i) => {
    const v = currentDome.verts[i];
    return new THREE.Vector3(v[0]*r, v[2]*r - minY + riserH, -v[1]*r);
  });
  const c = new THREE.Vector3(
    (ps[0].x + ps[1].x + ps[2].x) / 3,
    (ps[0].y + ps[1].y + ps[2].y) / 3,
    (ps[0].z + ps[1].z + ps[2].z) / 3,
  );
  const geom = new THREE.BufferGeometry();
  const pos = new Float32Array(9);
  for (let i = 0; i < 3; i++) {
    const v = ps[i].clone().sub(c).multiplyScalar(scale).add(c);
    pos[i*3] = v.x; pos[i*3+1] = v.y; pos[i*3+2] = v.z;
  }
  geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geom.setIndex([0, 1, 2]); geom.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.55, roughness: 0.1, metalness: 0.2, side: THREE.DoubleSide });
  openingsGroup.add(new THREE.Mesh(geom, mat));
  const edges = new THREE.EdgesGeometry(geom);
  openingsGroup.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x1c1209 })));
}
function drawRoundWindowInTriangle(tri, r, minY, riserH) {
  const ps = tri.f.map((i) => {
    const v = currentDome.verts[i];
    return new THREE.Vector3(v[0]*r, v[2]*r - minY + riserH, -v[1]*r);
  });
  const c = new THREE.Vector3(
    (ps[0].x + ps[1].x + ps[2].x) / 3,
    (ps[0].y + ps[1].y + ps[2].y) / 3,
    (ps[0].z + ps[1].z + ps[2].z) / 3,
  );
  const v1 = new THREE.Vector3().subVectors(ps[1], ps[0]);
  const v2 = new THREE.Vector3().subVectors(ps[2], ps[0]);
  const normal = new THREE.Vector3().crossVectors(v1, v2).normalize();
  const geom = new THREE.CircleGeometry(0.22, 24);
  const mat = new THREE.MeshStandardMaterial({ color: 0xe6b864, transparent: true, opacity: 0.65, roughness: 0.15, side: THREE.DoubleSide });
  const m = new THREE.Mesh(geom, mat);
  m.position.copy(c); m.lookAt(c.clone().add(normal));
  openingsGroup.add(m);
  const ringGeo = new THREE.RingGeometry(0.22, 0.245, 24);
  const ring = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({ color: 0x1c1209, side: THREE.DoubleSide }));
  ring.position.copy(c); ring.lookAt(c.clone().add(normal));
  openingsGroup.add(ring);
}
function drawDoorFrame(angleDeg, width, height, color, dome, riserH) {
  const a = (angleDeg * Math.PI) / 180;
  const footR = dome.footRadius;
  const x = Math.sin(a) * footR;
  const z = -Math.cos(a) * footR;
  const geom = new THREE.PlaneGeometry(width, height);
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), side: THREE.DoubleSide, transparent: true, opacity: 0.92, roughness: 0.7 });
  const door = new THREE.Mesh(geom, mat);
  door.position.set(x, height / 2, z); door.lookAt(0, height / 2, 0);
  openingsGroup.add(door);
  const frameGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-width/2, 0, 0.01),
    new THREE.Vector3(-width/2, height, 0.01),
    new THREE.Vector3(width/2, height, 0.01),
    new THREE.Vector3(width/2, 0, 0.01),
  ]);
  const frame = new THREE.Line(frameGeo, new THREE.LineBasicMaterial({ color: 0x1c1209 }));
  frame.position.copy(door.position); frame.quaternion.copy(door.quaternion);
  openingsGroup.add(frame);
  const handle = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0xb4742a, metalness: 0.7 }));
  const handleLocal = new THREE.Vector3(width/2 - 0.08, 1.0, 0.04);
  handle.position.copy(door.position).add(handleLocal.applyQuaternion(door.quaternion));
  openingsGroup.add(handle);
}

function rebuildSceneColors() {
  if (currentDome) buildSceneFromDome(currentDome);
}

// ─── Câmera por modo de vista ─────────────────────────────────────────────
function applyViewMode(mode) {
  if (mode === 'perspective') {
    camera = perspCam;
    controls.object = perspCam;
    controls.enableRotate = true;
  } else if (mode === 'planta') {
    camera = orthoCam;
    controls.object = orthoCam;
    orthoCam.position.set(0, 18, 0.001);  // direto de cima
    orthoCam.lookAt(0, 0, 0);
    orthoCam.up.set(0, 0, -1);
    controls.target.set(0, 0, 0);
    controls.enableRotate = false;
  } else if (mode === 'elevacao') {
    camera = orthoCam;
    controls.object = orthoCam;
    orthoCam.position.set(0, 3, 16);
    orthoCam.up.set(0, 1, 0);
    orthoCam.lookAt(0, 2, 0);
    controls.target.set(0, 2, 0);
    controls.enableRotate = false;
  } else if (mode === 'axo') {
    camera = orthoCam;
    controls.object = orthoCam;
    orthoCam.position.set(11, 11, 11);
    orthoCam.up.set(0, 1, 0);
    orthoCam.lookAt(0, 2, 0);
    controls.target.set(0, 2, 0);
    controls.enableRotate = true;
  }
  orthoCam.updateProjectionMatrix();
  perspCam.updateProjectionMatrix();
  controls.update();
}

// ─── Hora do sol → posição da luz ─────────────────────────────────────────
function applySunHour(hour) {
  // 6h = leste (x positivo), 12h = topo (y), 18h = oeste (x negativo)
  // arco sobre o eixo z; declive de 35° (latitude central BR)
  const t = (hour - 6) / 12; // 0..1
  const az = Math.PI * (1 - t);  // 0..π   começa em E (π), passa pelo zênite, vai a O (0)
  // Ajuste: queremos t=0 → leste (+x), t=0.5 → topo, t=1 → oeste (-x)
  const angle = Math.PI * t;  // 0=E, π=W (em radianos sobre o eixo z)
  const elevation = Math.sin(t * Math.PI); // 0 ao nascer/pôr, 1 ao meio-dia
  const radius = 16;
  dirLight.position.set(
    Math.cos(angle) * radius * 0.95,
    Math.max(0.4, elevation * 13),
    Math.sin(angle) * radius * 0.7 - 4,
  );
  dirLight.intensity = Math.max(0.15, elevation * 1.1 + 0.2);
  // Cor mais quente ao amanhecer/anoitecer
  const warm = 1 - Math.abs(elevation - 0.5) * 1.4;
  const r = 1.0, g = 0.94 - warm * 0.15, b = 0.78 - warm * 0.25;
  dirLight.color.setRGB(Math.min(1,r), Math.min(1,g), Math.max(0.4,b));
  // Hemisferica também baixa à noite
  hemiLight.intensity = 0.25 + elevation * 0.45;
}

// ─── Render loop ──────────────────────────────────────────────────────────
let resizeObs = null;
function attachCanvas(container) {
  if (!container) return;
  if (renderer.domElement.parentElement !== container) {
    container.appendChild(renderer.domElement);
  }
  if (resizeObs) resizeObs.disconnect();
  resizeObs = new ResizeObserver(() => {
    const rect = container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      renderer.setSize(rect.width, rect.height, false);
      const aspect = rect.width / rect.height;
      perspCam.aspect = aspect;
      perspCam.updateProjectionMatrix();
      const viewSize = 8;
      orthoCam.left = -viewSize * aspect;
      orthoCam.right = viewSize * aspect;
      orthoCam.top = viewSize;
      orthoCam.bottom = -viewSize;
      orthoCam.updateProjectionMatrix();
    }
  });
  resizeObs.observe(container);
  const rect = container.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  const aspect = rect.width / rect.height;
  perspCam.aspect = aspect;
  perspCam.updateProjectionMatrix();
  const viewSize = 8;
  orthoCam.left = -viewSize * aspect;
  orthoCam.right = viewSize * aspect;
  orthoCam.top = viewSize;
  orthoCam.bottom = -viewSize;
  orthoCam.updateProjectionMatrix();
}

// Animação de montagem
let lastTs = performance.now();
function animate(ts) {
  const dt = (ts - lastTs) / 1000;
  lastTs = ts;
  if (state.v3.montagemPlaying) {
    state.v3.montagem = Math.min(1, (state.v3.montagem || 0) + dt * 0.18);
    if (currentDome) buildSceneFromDome(currentDome);
    // Atualizar UI do slider se existir
    const slider = document.getElementById('csl-montagem');
    const val = document.getElementById('csl-montagem-val');
    if (slider) slider.value = String(state.v3.montagem);
    if (val) val.textContent = (state.v3.montagem * 100).toFixed(0) + '%';
    if (state.v3.montagem >= 1) {
      state.v3.montagemPlaying = false;
      const playBtn = document.getElementById('ct-play');
      if (playBtn) playBtn.innerHTML = playIcon('play');
      saveState();
    }
  }
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// ─── Compute ──────────────────────────────────────────────────────────────
function computeDome() {
  const dome = buildDome({
    freq: state.forma.freq,
    truncation: state.forma.truncamento,
    radius: state.forma.diametro / 2,
  });
  currentDome = dome;
  buildSceneFromDome(dome);
  return dome;
}

// ─── Navegação ────────────────────────────────────────────────────────────
const STEPS = [
  { num: 1, key: 'programa', label: 'programa' },
  { num: 2, key: 'forma',    label: 'forma' },
  { num: 3, key: 'aberturas',label: 'aberturas' },
  { num: 4, key: 'sistemas', label: 'sistemas' },
  { num: 5, key: 'dossie',   label: 'dossiê' },
];

function renderStepper() {
  const nav = document.getElementById('stepper');
  nav.innerHTML = '';
  for (const s of STEPS) {
    const btn = document.createElement('button');
    btn.className = 'step-pip';
    if (state.step === s.num) btn.classList.add('is-current');
    if (state.step > s.num) btn.classList.add('is-done');
    btn.innerHTML = `<span class="step-num">${state.step > s.num ? '✓' : s.num}</span><span class="step-label">${s.label}</span>`;
    btn.onclick = () => goToStep(s.num);
    nav.appendChild(btn);
  }
}
function goToStep(n) {
  state.step = Math.max(1, Math.min(5, n));
  saveState();
  render();
  // Reposiciona câmera só ao trocar de etapa (não a cada slider/clique
  // dentro de uma etapa) — preserva a vista 3D que o usuário ajustou.
  applyViewMode(state.v3.viewMode);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function renderFootbar() {
  const summary = document.getElementById('footbar-summary');
  const chips = [];
  const cenario = USE_SCENARIOS.find((s) => s.id === state.programa.cenario);
  if (cenario) chips.push(['programa', cenario.nome]);
  if (state.step >= 2 || state.forma.diametro) {
    chips.push(['Ø', state.forma.diametro.toFixed(1) + ' m']);
    chips.push(['freq.', state.forma.freq + 'V']);
  }
  if (state.step >= 3) {
    const ab = state.aberturas;
    const n = (ab.porta_principal ? 1 : 0) + (ab.porta_emergencia ? 1 : 0)
      + (ab.janelas_basc || 0) + (ab.janelas_redondas || 0)
      + (ab.cupula_zenital ? 1 : 0) + (ab.abertura_ventilacao || 0);
    chips.push(['aberturas', n + ' un.']);
  }
  if (state.step >= 4) {
    const m = STRUCTURE_MATERIALS.find((x) => x.id === state.sistemas.estrutura);
    if (m) chips.push(['estrutura', m.nome]);
  }
  summary.innerHTML = chips.map(([k,v]) => `<div class="summary-chip"><span>${k}</span><strong>${v}</strong></div>`).join('');
  document.getElementById('btn-prev').disabled = state.step === 1;
  const next = document.getElementById('btn-next');
  next.textContent = state.step === 5 ? 'imprimir / exportar →' : 'avançar →';
}

// ─── Comparação A/B (variantes) ──────────────────────────────────────────
// Os "slices" comparados são programa, forma, aberturas, sistemas, riser.
// Tudo dentro de state.v3 (tema, vistas, diário, etc.) NÃO entra na compare.
const VARIANT_SLICES = ['programa', 'forma', 'aberturas', 'sistemas', 'riser'];

function snapshotActiveSlices() {
  const snap = {};
  for (const k of VARIANT_SLICES) snap[k] = structuredClone(state[k]);
  return snap;
}

function restoreSlices(snap) {
  for (const k of VARIANT_SLICES) {
    if (snap[k] !== undefined) state[k] = structuredClone(snap[k]);
  }
}

function enableCompare() {
  const A = snapshotActiveSlices();
  state.variantes = { A, B: structuredClone(A) };
  state.activeVariante = 'A';
  saveState();
}

function switchVariante(id) {
  if (!state.variantes || !state.variantes[id]) return;
  // Salva o que está ativo agora no slot da variante atual.
  state.variantes[state.activeVariante] = snapshotActiveSlices();
  state.activeVariante = id;
  restoreSlices(state.variantes[id]);
  saveState();
  render();
}

function disableCompare() {
  // Mantém o que está ativo agora; descarta a outra variante.
  state.variantes = null;
  state.activeVariante = null;
  saveState();
  refreshSidePanel(api);
}

/**
 * Calcula métricas da variante NÃO ativa (read-only, sem mutar state).
 * Para o side panel mostrar A/B lado a lado.
 */
function peekOtherVariant() {
  if (!state.variantes || !state.activeVariante) return null;
  const otherId = state.activeVariante === 'A' ? 'B' : 'A';
  const snap = state.variantes[otherId];
  if (!snap) return null;
  // Monta um "state-like" só pros campos lidos pelo synthesis.
  const fakeState = { ...state };
  for (const k of VARIANT_SLICES) fakeState[k] = snap[k];
  // Reconstrói o dome a partir dos parâmetros da outra variante.
  const otherDome = buildDome({
    freq: snap.forma.freq,
    truncation: snap.forma.truncamento,
    radius: snap.forma.diametro / 2,
  });
  return { id: otherId, state: fakeState, dome: otherDome };
}

// ─── Hub API ──────────────────────────────────────────────────────────────
const api = {
  state, saveState, computeDome, attachCanvas,
  setHighlight(t) { highlightedType = t; if (currentDome) buildSceneFromDome(currentDome); },
  getDome: () => currentDome,
  goToStep, render: () => render(),
  applyViewMode, applySunHour,
  rebuildScene: () => { if (currentDome) buildSceneFromDome(currentDome); },
  data: {
    STRUCTURE_MATERIALS, HUB_CONNECTORS, COVERINGS: ALL_COVERINGS, FOUNDATIONS,
    WATER_SYSTEMS, ENERGY_SYSTEMS, OPENING_TYPES, TOOLS,
    PROGRAM_MODULES, USE_SCENARIOS, CLIMATE_ZONES,
    FLOOR_SYSTEMS, MANTIQUEIRA_COVERINGS,
    REGIOES, LOJAS,
  },
  helpers: { programaArea, suggestDiameter, pricePerStruct, validateStructure },
  // Comparação A/B
  enableCompare, disableCompare, switchVariante, peekOtherVariant,
};
window.__domeApi = api;

initGlossarioPopover();

// ─── Render principal ─────────────────────────────────────────────────────
function render() {
  computeDome();
  applySunHour(state.v3.sol);
  renderStepper();
  const stage = document.getElementById('stage');
  stage.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'step-page';
  stage.appendChild(wrap);

  if (state.step === 1) {
    renderStep1(wrap, api);
    appendStep1Benefits(wrap, api);
    appendStep1Galeria(wrap, api);
  }
  else if (state.step === 2) renderStep2V3(wrap, api);
  else if (state.step === 3) renderStep3(wrap, api);
  else if (state.step === 4) renderStep4(wrap, api);
  else if (state.step === 5) {
    renderStep5(wrap, api);
    appendDossieExtras(wrap, api);
    initSheetCollapse(wrap, state, saveState);
  }

  renderFootbar();
  saveState();
  refreshSidePanel(api);
}

// ─── Tweaks panel ─────────────────────────────────────────────────────────
function playIcon(mode) {
  if (mode === 'play') return '<svg viewBox="0 0 12 12"><polygon points="2,1 11,6 2,11" fill="currentColor"/></svg>';
  return '<svg viewBox="0 0 12 12"><rect x="2" y="1" width="3" height="10" fill="currentColor"/><rect x="7" y="1" width="3" height="10" fill="currentColor"/></svg>';
}

function initTweaks() {
  const fab = document.createElement('button');
  fab.className = 'tweaks-fab';
  fab.title = 'Ajustes · tema, sol, vistas';
  fab.setAttribute('aria-label', 'Abrir painel de ajustes: temas, sol e vistas');
  fab.setAttribute('aria-expanded', 'false');
  fab.innerHTML = '⚙';
  document.body.appendChild(fab);

  const panel = document.createElement('div');
  panel.className = 'tweaks-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Painel de ajustes');
  panel.innerHTML = `
    <h3>tweaks · temas <button id="tweaks-close" aria-label="Fechar painel de ajustes">×</button></h3>
    <div class="theme-swatches" id="theme-swatches"></div>
    <div class="tweak-row">
      <label>densidade da interface</label>
      <div class="tweak-segs" id="tweak-density">
        <button data-val="cozy" class="is-active">arejado</button>
        <button data-val="compact">compacto</button>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  const themes = [
    { id: 'cerrado', name: 'cerrado', preview: 'background:#efe6cf' },
    { id: 'blueprint', name: 'blueprint', preview: 'background:#0d2538' },
    { id: 'drafting', name: 'drafting', preview: 'background:#f8f6ef' },
  ];
  const swWrap = panel.querySelector('#theme-swatches');
  for (const t of themes) {
    const btn = document.createElement('button');
    btn.className = 'theme-swatch' + (state.v3.tema === t.id ? ' is-active' : '');
    btn.setAttribute('aria-label', `Tema ${t.name}`);
    btn.setAttribute('aria-pressed', state.v3.tema === t.id ? 'true' : 'false');
    btn.innerHTML = `
      <div class="ts-preview" style="${t.preview}">
        ${t.id === 'cerrado' ? '<svg viewBox="0 0 60 40" style="position:absolute;inset:0;width:100%;height:100%"><circle cx="30" cy="25" r="11" fill="none" stroke="#b4742a" stroke-width="1.5"/><line x1="19" y1="36" x2="41" y2="36" stroke="#b4742a"/></svg>' :
          t.id === 'blueprint' ? '<svg viewBox="0 0 60 40" style="position:absolute;inset:0;width:100%;height:100%"><defs><pattern id="g_'+t.id+'" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M6 0H0V6" fill="none" stroke="#5ee0ff" stroke-width="0.3" opacity="0.6"/></pattern></defs><rect width="60" height="40" fill="url(#g_'+t.id+')"/><circle cx="30" cy="25" r="11" fill="none" stroke="#5ee0ff" stroke-width="1.2"/><line x1="19" y1="36" x2="41" y2="36" stroke="#5ee0ff"/></svg>' :
          '<svg viewBox="0 0 60 40" style="position:absolute;inset:0;width:100%;height:100%"><circle cx="30" cy="25" r="11" fill="none" stroke="#0a0a0a" stroke-width="1.5"/><line x1="19" y1="36" x2="41" y2="36" stroke="#0a0a0a"/><circle cx="30" cy="6" r="2.5" fill="#c8141c"/></svg>'}
      </div>
      <div class="ts-name">${t.name}</div>
    `;
    btn.onclick = () => {
      state.v3.tema = t.id;
      saveState();
      applyTheme(t.id);
      // refresh swatches
      swWrap.querySelectorAll('.theme-swatch').forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
    };
    swWrap.appendChild(btn);
  }

  fab.onclick = () => {
    const open = panel.classList.toggle('is-open');
    fab.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) localStorage.setItem('tweaks_seen', '1');
  };
  panel.querySelector('#tweaks-close').onclick = () => {
    panel.classList.remove('is-open');
    fab.setAttribute('aria-expanded', 'false');
  };

  // ── First-run hint: balão apontando pro FAB se nunca foi aberto ────
  if (!localStorage.getItem('tweaks_seen')) {
    const hint = document.createElement('div');
    hint.className = 'tweaks-fab-hint';
    hint.textContent = 'tema · sol · vistas';
    document.body.appendChild(hint);
    const hide = () => { hint.classList.add('is-hiding'); setTimeout(() => hint.remove(), 300); };
    setTimeout(hide, 6000);
    fab.addEventListener('click', hide, { once: true });
  }

  // density toggle
  panel.querySelectorAll('#tweak-density button').forEach((b) => {
    b.onclick = () => {
      panel.querySelectorAll('#tweak-density button').forEach((x) => x.classList.remove('is-active'));
      b.classList.add('is-active');
      document.documentElement.dataset.density = b.dataset.val;
    };
  });
}

// ─── Validação suave antes de avançar (nudge, não wall) ─────────────────
function validateStep(step) {
  const missing = [];
  if (step === 1) {
    if (!state.programa.cenario) missing.push('um cenário de uso');
    if (!state.programa.clima) missing.push('uma zona climática');
  } else if (step === 2) {
    if (!(state.forma.diametro >= 2 && state.forma.diametro <= 12)) missing.push('diâmetro entre 2 e 12 m');
    if (!(state.forma.freq >= 1 && state.forma.freq <= 4)) missing.push('frequência V entre 1 e 4');
  } else if (step === 3) {
    if (!state.aberturas.porta_principal) missing.push('uma porta principal (como você sai do domo?)');
  } else if (step === 4) {
    if (!state.sistemas.estrutura) missing.push('estrutura');
    if (!state.sistemas.conector) missing.push('conector/hub');
    if (!state.sistemas.cobertura) missing.push('cobertura');
  }
  return { ok: missing.length === 0, missing };
}

let toastTimer = null;
function showToast(msg, tone = 'warn') {
  let toast = document.getElementById('dome-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'dome-toast';
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.remove('toast--ok', 'toast--warn');
  toast.classList.add('toast--' + tone, 'is-open');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-open'), 4200);
}

// ─── Listeners do topbar / footbar ───────────────────────────────────────
document.getElementById('btn-next').addEventListener('click', () => {
  if (state.step === 5) { window.print(); return; }
  const { ok, missing } = validateStep(state.step);
  if (!ok) {
    showToast('Faltou: ' + missing.join(', ') + '. Avançando mesmo assim.');
  }
  goToStep(state.step + 1);
});
document.getElementById('btn-prev').addEventListener('click', () => goToStep(state.step - 1));
document.getElementById('btn-reset').addEventListener('click', () => {
  if (confirm('Limpar todas as escolhas e recomeçar?')) {
    localStorage.removeItem(STORAGE_KEY);
    state = loadState();
    applyTheme(state.v3.tema);
    render();
  }
});

// Boot
applyTheme(state.v3.tema);
initTweaks();
mountSidePanel();
render();
