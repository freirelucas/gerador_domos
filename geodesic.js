// geodesic.js — Geometria de domos geodésicos baseados no icosaedro
// Class I "alternate" — subdivisão de cada face triangular em V² subfaces,
// projetando cada vértice na esfera unitária.
//
// Convenção: vértice pentagonal no topo (+Z). Truncamento por plano horizontal.

function normalize(v) {
  const n = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / n, v[1] / n, v[2] / n];
}

export function icosahedron() {
  // Construção com 1 vértice no polo norte, 5 no anel superior,
  // 5 no anel inferior (defasados 36°), 1 no polo sul.
  // z dos anéis = ±1/√5 após normalização.
  const zUp = 1 / Math.sqrt(5);
  const rUp = Math.sqrt(1 - zUp * zUp);
  const verts = [];
  verts.push([0, 0, 1]); // 0 — topo
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5;
    verts.push([rUp * Math.cos(a), rUp * Math.sin(a), zUp]);
  }
  for (let i = 0; i < 5; i++) {
    const a = ((i + 0.5) * 2 * Math.PI) / 5;
    verts.push([rUp * Math.cos(a), rUp * Math.sin(a), -zUp]);
  }
  verts.push([0, 0, -1]); // 11 — base

  const faces = [];
  for (let i = 0; i < 5; i++) {
    faces.push([0, 1 + i, 1 + ((i + 1) % 5)]);
  }
  for (let i = 0; i < 5; i++) {
    const u1 = 1 + i;
    const u2 = 1 + ((i + 1) % 5);
    const l1 = 6 + i;
    const l2 = 6 + ((i + 1) % 5);
    faces.push([u1, l1, u2]);
    faces.push([u2, l1, l2]);
  }
  for (let i = 0; i < 5; i++) {
    faces.push([11, 6 + ((i + 1) % 5), 6 + i]);
  }

  return { verts, faces };
}

export function subdivide({ verts, faces }, V) {
  const out = [];
  const vmap = new Map();
  const KEY_PREC = 6;
  const key = (v) =>
    `${v[0].toFixed(KEY_PREC)},${v[1].toFixed(KEY_PREC)},${v[2].toFixed(KEY_PREC)}`;
  const add = (v) => {
    const k = key(v);
    if (vmap.has(k)) return vmap.get(k);
    const idx = out.length;
    out.push(v);
    vmap.set(k, idx);
    return idx;
  };

  const newFaces = [];
  for (const [a, b, c] of faces) {
    const va = verts[a];
    const vb = verts[b];
    const vc = verts[c];
    const grid = [];
    for (let i = 0; i <= V; i++) {
      grid[i] = [];
      for (let j = 0; j <= V - i; j++) {
        const u = j / V;
        const w = i / V;
        const t = 1 - u - w;
        const p = normalize([
          va[0] * t + vb[0] * u + vc[0] * w,
          va[1] * t + vb[1] * u + vc[1] * w,
          va[2] * t + vb[2] * u + vc[2] * w,
        ]);
        grid[i][j] = add(p);
      }
    }
    for (let i = 0; i < V; i++) {
      for (let j = 0; j < V - i; j++) {
        newFaces.push([grid[i][j], grid[i][j + 1], grid[i + 1][j]]);
        if (j < V - i - 1) {
          newFaces.push([grid[i][j + 1], grid[i + 1][j + 1], grid[i + 1][j]]);
        }
      }
    }
  }
  return { verts: out, faces: newFaces };
}

export function extractEdges(faces) {
  const seen = new Set();
  const edges = [];
  for (const [a, b, c] of faces) {
    for (const pair of [[a, b], [b, c], [c, a]]) {
      const i = Math.min(pair[0], pair[1]);
      const j = Math.max(pair[0], pair[1]);
      const k = `${i}-${j}`;
      if (seen.has(k)) continue;
      seen.add(k);
      edges.push([i, j]);
    }
  }
  return edges;
}

/**
 * Trunca o domo mantendo apenas faces cujos vértices têm z >= zMin.
 * zMin = 1 - 2 * fração (fração=0.5 → corte no equador).
 */
export function truncate({ verts, faces }, fraction) {
  const zMin = 1 - 2 * fraction;
  const keepVert = verts.map((v) => v[2] >= zMin - 1e-4);
  const newFaces = faces.filter((f) => f.every((i) => keepVert[i]));
  const used = new Set();
  newFaces.forEach((f) => f.forEach((i) => used.add(i)));
  return { verts, faces: newFaces, used };
}

/**
 * Classifica arestas por comprimento (chord factor), atribuindo rótulos A, B, C...
 */
export function classifyEdges(edges, verts, tol = 1e-4) {
  const data = edges.map(([a, b]) => {
    const va = verts[a];
    const vb = verts[b];
    const len = Math.hypot(va[0] - vb[0], va[1] - vb[1], va[2] - vb[2]);
    return { a, b, len };
  });
  const groups = [];
  for (const e of data) {
    let g = groups.find((gr) => Math.abs(gr.len - e.len) < tol);
    if (!g) {
      g = { len: e.len, count: 0, edges: [] };
      groups.push(g);
    }
    g.count++;
    g.edges.push(e);
  }
  groups.sort((x, y) => x.len - y.len);
  const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  groups.forEach((g, i) => (g.label = labels[i] || `T${i}`));
  // Anotar a aresta com o rótulo
  for (const g of groups) {
    g.edges.forEach((e) => (e.type = g.label));
  }
  return { groups, edges: data };
}

/**
 * Classifica vértices (hubs) por valência (número de arestas que chegam).
 */
export function classifyHubs(edges, verts, usedSet) {
  const valence = new Map();
  for (const [a, b] of edges) {
    valence.set(a, (valence.get(a) || 0) + 1);
    valence.set(b, (valence.get(b) || 0) + 1);
  }
  // Em domos não-truncados, valência = 5 (pentagonal) ou 6 (hexagonal).
  // Em domos truncados, vértices do anel de corte têm valência menor.
  const hubs = [];
  for (const i of usedSet) {
    const v = valence.get(i) || 0;
    hubs.push({ idx: i, valence: v, pos: verts[i] });
  }
  // Agrupar por valência
  const byVal = new Map();
  for (const h of hubs) {
    if (!byVal.has(h.valence)) byVal.set(h.valence, []);
    byVal.get(h.valence).push(h);
  }
  const groups = [...byVal.entries()]
    .map(([val, list]) => ({ valence: val, count: list.length, hubs: list }))
    .sort((a, b) => b.valence - a.valence);
  return { hubs, groups };
}

/**
 * Constrói malha completa de domo a partir dos parâmetros.
 *   freq:        frequência V (1..6)
 *   truncation:  fração da esfera mantida (0.5=meio, 0.625=5/8, 0.75=3/4, 1=completa)
 *   radius:      raio em metros
 */
export function buildDome({ freq, truncation, radius }) {
  let mesh = icosahedron();
  if (freq > 1) mesh = subdivide(mesh, freq);
  const trunc = truncate(mesh, truncation);
  const edges = extractEdges(trunc.faces);
  const classified = classifyEdges(edges, mesh.verts);
  // Escalar pelos verdadeiros comprimentos
  const struts = classified.groups.map((g) => ({
    label: g.label,
    count: g.count,
    chord: g.len, // unitário
    length: g.len * radius, // metros
    edges: g.edges,
  }));
  const hubsResult = classifyHubs(edges, mesh.verts, trunc.used);

  // Triângulos (cobertura)
  const triangles = trunc.faces.map((f) => {
    const a = mesh.verts[f[0]];
    const b = mesh.verts[f[1]];
    const c = mesh.verts[f[2]];
    // Área via produto vetorial, escalada por radius²
    const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const cross = [
      ab[1] * ac[2] - ab[2] * ac[1],
      ab[2] * ac[0] - ab[0] * ac[2],
      ab[0] * ac[1] - ab[1] * ac[0],
    ];
    const area = 0.5 * Math.hypot(...cross) * radius * radius;
    return { verts: f, area };
  });

  const totalArea = triangles.reduce((s, t) => s + t.area, 0);
  const totalLinear = struts.reduce((s, g) => s + g.length * g.count, 0);

  // Altura final do domo
  const usedZs = [...trunc.used].map((i) => mesh.verts[i][2]);
  const heightFactor = Math.max(...usedZs) - Math.min(...usedZs);
  const height = heightFactor * radius;
  const footRadius =
    Math.max(...[...trunc.used].map((i) => Math.hypot(mesh.verts[i][0], mesh.verts[i][1]))) *
    radius;

  return {
    verts: mesh.verts,
    used: trunc.used,
    faces: trunc.faces,
    edges,
    struts,
    hubs: hubsResult.hubs,
    hubGroups: hubsResult.groups,
    triangles,
    totalArea,
    totalLinear,
    height,
    footRadius,
    diameter: 2 * radius,
  };
}
