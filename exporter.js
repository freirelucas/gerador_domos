// exporter.js — Exporta cut sheets em formatos abertos: SVG, DXF, CSV
//
// SVG  · vector, abre em Inkscape / browser / Illustrator
// DXF  · texto simples, ASCII R12 — abre em LibreCAD, FreeCAD, AutoCAD
// CSV  · planilha — abre em Excel, LibreOffice
//
// Cada export gera UM arquivo com TODOS os tipos de barra A, B, C…
// em escala 1:1 (em metros, com cotas em mm).

import { TYPE_COLORS } from './dom-helpers.js';

// ─── SVG ───────────────────────────────────────────────────────────────────
export function exportSVG(dome, state, material) {
  // Layout: cada tipo numa linha; barras em escala 1:20 dentro do SVG
  // mas com cotas em mm reais.
  const SCALE = 50; // 1 m = 50 mm (1:20)
  const margin = 30;
  const rowHeight = 80;
  const labelWidth = 80;

  const maxLen = Math.max(...dome.struts.map((g) => g.length));
  const width = labelWidth + maxLen * SCALE + 120;
  const height = margin * 2 + dome.struts.length * rowHeight + 60;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="${width}mm" height="${height}mm"
     viewBox="0 0 ${width} ${height}"
     font-family="IBM Plex Mono, monospace">
<defs>
  <style>
    .frame{fill:none;stroke:#1c1209;stroke-width:0.3}
    .bar{stroke:#1c1209;stroke-width:0.6}
    .cota{stroke:#1c1209;stroke-width:0.2}
    .label{font-size:5px;fill:#1c1209}
    .title{font-size:7px;fill:#1c1209;font-weight:600}
    .cota-txt{font-size:4px;fill:#1c1209}
    .meta{font-size:3.5px;fill:#4a3a2a}
  </style>
</defs>
<rect class="frame" x="2" y="2" width="${width-4}" height="${height-4}"/>
<text class="title" x="${margin}" y="20">CUT LIST · domo ${state.forma.freq}V · Ø ${state.forma.diametro.toFixed(2)} m · ${truncLabel(state.forma.truncamento)}</text>
<text class="meta" x="${margin}" y="28">${material.nome} · escala 1:20 · cotas em mm · gerado pelo gerador de domos do cerrado</text>
`;

  let y = margin + 24;
  for (const g of dome.struts) {
    const barLen = g.length * SCALE;
    const barH = material.diametro ? 8 : 5;
    const x0 = margin + labelWidth;
    const yBar = y + 30;
    const color = TYPE_COLORS[g.label] || '#3a3a3a';

    // Labels lado esquerdo
    svg += `
<text class="title" x="${margin}" y="${yBar+3}" fill="${color}">${g.label}</text>
<text class="label" x="${margin+10}" y="${yBar-2}">× ${g.count}</text>
<text class="label" x="${margin+10}" y="${yBar+10}">${(g.length*1000).toFixed(0)} mm</text>
`;

    // Barra
    if (material.diametro) {
      svg += `<rect x="${x0}" y="${yBar - barH/2}" width="${barLen}" height="${barH}" rx="${barH/2}" fill="${color}" stroke="#1c1209" stroke-width="0.2"/>`;
    } else {
      svg += `<rect x="${x0}" y="${yBar - barH/2}" width="${barLen}" height="${barH}" fill="${color}" stroke="#1c1209" stroke-width="0.2"/>`;
    }
    // Pontas (marca de tinta)
    svg += `<circle cx="${x0}" cy="${yBar}" r="2.5" fill="#1c1209"/>`;
    svg += `<circle cx="${x0+barLen}" cy="${yBar}" r="2.5" fill="#1c1209"/>`;

    // Cota
    const yCota = yBar + 16;
    svg += `<line class="cota" x1="${x0}" y1="${yBar+barH/2+3}" x2="${x0}" y2="${yCota+2}"/>`;
    svg += `<line class="cota" x1="${x0+barLen}" y1="${yBar+barH/2+3}" x2="${x0+barLen}" y2="${yCota+2}"/>`;
    svg += `<line class="cota" x1="${x0}" y1="${yCota}" x2="${x0+barLen}" y2="${yCota}" marker-end="url(#arrow)"/>`;
    // Setas de cota
    svg += `<polygon points="${x0},${yCota} ${x0+3},${yCota-2} ${x0+3},${yCota+2}" fill="#1c1209"/>`;
    svg += `<polygon points="${x0+barLen},${yCota} ${x0+barLen-3},${yCota-2} ${x0+barLen-3},${yCota+2}" fill="#1c1209"/>`;
    svg += `<text class="cota-txt" x="${x0+barLen/2}" y="${yCota-1}" text-anchor="middle">${(g.length*1000).toFixed(0)} mm</text>`;

    // Especificação à direita
    const xRight = x0 + barLen + 8;
    svg += `<text class="meta" x="${xRight}" y="${yBar-2}">chord: ${g.chord.toFixed(5)}</text>`;
    svg += `<text class="meta" x="${xRight}" y="${yBar+4}">total: ${(g.length*g.count).toFixed(2)} m</text>`;
    svg += `<text class="meta" x="${xRight}" y="${yBar+10}">${material.diametro ? `Ø${material.diametro}mm` : material.secao}</text>`;

    y += rowHeight;
  }

  // Rodapé com totais
  svg += `
<line class="cota" x1="${margin}" y1="${height-30}" x2="${width-margin}" y2="${height-30}"/>
<text class="title" x="${margin}" y="${height-18}">TOTAL: ${dome.edges.length} barras · ${dome.totalLinear.toFixed(2)} m lineares</text>
<text class="meta" x="${margin}" y="${height-10}">tolerância de corte ± 1 mm · marcar a ponta com tinta da cor do tipo</text>
</svg>`;

  return svg;
}

// ─── DXF (AutoCAD ASCII R12) ───────────────────────────────────────────────
// Reference: DXF ASCII R12 minimal subset
export function exportDXF(dome, state, material) {
  // Sistema de coordenadas: mm. Cada barra como LINE com cotas.
  // Camadas: por tipo (A, B, C…) + camada COTAS.
  const layers = ['COTAS', 'TEXTO', 'FRAME', ...dome.struts.map((g) => 'TIPO_' + g.label)];

  let dxf = '';

  // Header mínimo
  dxf += '0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1009\n9\n$INSUNITS\n70\n4\n0\nENDSEC\n';

  // Tables (layers)
  dxf += '0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n' + layers.length + '\n';
  for (let i = 0; i < layers.length; i++) {
    const lname = layers[i];
    const colorIdx = lname === 'COTAS' ? 8 : lname === 'TEXTO' ? 7 : lname === 'FRAME' ? 9 : (i % 7) + 1;
    dxf += '0\nLAYER\n2\n' + lname + '\n70\n0\n62\n' + colorIdx + '\n6\nCONTINUOUS\n';
  }
  dxf += '0\nENDTAB\n0\nENDSEC\n';

  // Entities
  dxf += '0\nSECTION\n2\nENTITIES\n';

  // Cada barra desenhada como LINE em mm com tag de tipo
  const SCALE = 1000; // m → mm
  const rowSpacing = 200; // mm entre tipos
  let y = 0;
  for (const g of dome.struts) {
    const len = g.length * SCALE;
    const layer = 'TIPO_' + g.label;

    // Linha principal
    dxf += '0\nLINE\n8\n' + layer + '\n10\n0\n20\n' + y + '\n30\n0\n11\n' + len + '\n21\n' + y + '\n31\n0\n';

    // Cota (linha + texto)
    dxf += '0\nLINE\n8\nCOTAS\n10\n0\n20\n' + (y - 40) + '\n30\n0\n11\n' + len + '\n21\n' + (y - 40) + '\n31\n0\n';
    dxf += '0\nTEXT\n8\nTEXTO\n10\n' + (len / 2) + '\n20\n' + (y - 55) + '\n30\n0\n40\n12\n1\n' + len.toFixed(0) + ' mm\n50\n0\n72\n1\n11\n' + (len/2) + '\n21\n' + (y-55) + '\n';

    // Label do tipo à esquerda
    dxf += '0\nTEXT\n8\nTEXTO\n10\n-80\n20\n' + y + '\n30\n0\n40\n16\n1\n' + g.label + ' (x' + g.count + ')\n50\n0\n';

    // Texto à direita (especificação)
    dxf += '0\nTEXT\n8\nTEXTO\n10\n' + (len + 50) + '\n20\n' + y + '\n30\n0\n40\n10\n1\nchord ' + g.chord.toFixed(4) + ' · total ' + (g.length * g.count).toFixed(2) + 'm\n50\n0\n';

    y -= rowSpacing;
  }

  // Quadro técnico
  const titleY = 200;
  dxf += '0\nTEXT\n8\nTEXTO\n10\n0\n20\n' + titleY + '\n30\n0\n40\n24\n1\nCUT LIST · ' + state.forma.freq + 'V · ' + state.forma.diametro.toFixed(2) + 'm Diametro\n50\n0\n';
  dxf += '0\nTEXT\n8\nTEXTO\n10\n0\n20\n' + (titleY - 30) + '\n30\n0\n40\n12\n1\nMaterial: ' + material.nome + '\n50\n0\n';
  dxf += '0\nTEXT\n8\nTEXTO\n10\n0\n20\n' + (titleY - 50) + '\n30\n0\n40\n10\n1\nTotal: ' + dome.edges.length + ' barras  ' + dome.totalLinear.toFixed(2) + 'm lineares\n50\n0\n';
  dxf += '0\nTEXT\n8\nTEXTO\n10\n0\n20\n' + (titleY - 70) + '\n30\n0\n40\n8\n1\nTolerancia: +- 1 mm · escala 1:1 mm · gerador de domos\n50\n0\n';

  dxf += '0\nENDSEC\n0\nEOF\n';

  return dxf;
}

// ─── CSV (cut list pra planilha) ───────────────────────────────────────────
export function exportCSV(dome, state, material) {
  let csv = 'tipo;quantidade;chord_factor;comprimento_mm;total_linear_m;observacao\n';
  for (const g of dome.struts) {
    csv += `${g.label};${g.count};${g.chord.toFixed(6)};${(g.length * 1000).toFixed(0)};${(g.length * g.count).toFixed(2)};${material.diametro ? 'Ø ' + material.diametro + ' mm' : material.secao || ''}\n`;
  }
  csv += `\nResumo;;;;;\n`;
  csv += `Total de barras;${dome.edges.length};;;${dome.totalLinear.toFixed(2)};\n`;
  csv += `Diametro;${state.forma.diametro};;;;\n`;
  csv += `Frequencia;${state.forma.freq}V;;;;\n`;
  csv += `Truncamento;${state.forma.truncamento};;;;\n`;
  csv += `Material;${material.nome};;;;\n`;
  return csv;
}

// ─── OBJ (3D malha do domo) ────────────────────────────────────────────────
export function exportOBJ(dome, state) {
  let obj = `# Domo ${state.forma.freq}V Ø${state.forma.diametro.toFixed(2)}m\n# ${dome.verts.length} vertices · ${dome.faces.length} faces\n`;
  const r = state.forma.diametro / 2;
  const minY = Math.min(...[...dome.used].map((i) => dome.verts[i][2] * r));
  // vertices (apenas os usados)
  const indexMap = new Map();
  let n = 1;
  for (const i of dome.used) {
    const v = dome.verts[i];
    obj += `v ${(v[0]*r).toFixed(4)} ${(v[2]*r - minY).toFixed(4)} ${(-v[1]*r).toFixed(4)}\n`;
    indexMap.set(i, n++);
  }
  for (const f of dome.faces) {
    obj += `f ${indexMap.get(f[0])} ${indexMap.get(f[1])} ${indexMap.get(f[2])}\n`;
  }
  return obj;
}

// ─── Hubs como SVG (gabaritos para furação) ───────────────────────────────
export function exportHubsSVG(dome, connector) {
  const valences = [...new Set(dome.hubs.map((h) => h.valence))].sort((a,b) => b-a);
  const size = 200; // mm
  const margin = 20;
  const cols = Math.min(valences.length, 3);
  const rows = Math.ceil(valences.length / cols);
  const w = cols * (size + 30) + margin * 2;
  const h = rows * (size + 50) + margin * 2 + 40;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}" font-family="IBM Plex Mono, monospace">
<style>
  .frame{fill:none;stroke:#1c1209;stroke-width:0.3}
  .gabarito{fill:#fff8e8;stroke:#1c1209;stroke-width:0.5}
  .strut{stroke:#1c1209;stroke-width:1.2}
  .hole{fill:#1c1209}
  .label{font-size:6px;fill:#1c1209;font-weight:600}
  .meta{font-size:4px;fill:#4a3a2a}
  .ang{font-size:3.5px;fill:#b4742a}
</style>
<rect class="frame" x="2" y="2" width="${w-4}" height="${h-4}"/>
<text class="label" x="${margin}" y="${margin+8}" font-size="9">GABARITOS DE HUBS · ${connector.nome}</text>
<text class="meta" x="${margin}" y="${margin+18}">escala 1:1 — imprima em A4 e use como gabarito para furação</text>
`;

  valences.forEach((v, idx) => {
    const count = dome.hubs.filter((h) => h.valence === v).length;
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const cx = margin + col * (size + 30) + size / 2;
    const cy = margin + 40 + row * (size + 50) + size / 2;
    const r = size / 2 - 20;

    // Anel de referência
    svg += `<circle class="gabarito" cx="${cx}" cy="${cy}" r="${r}"/>`;

    for (let i = 0; i < v; i++) {
      const a = (i / v) * 2 * Math.PI - Math.PI / 2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      svg += `<line class="strut" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>`;
      svg += `<circle class="hole" cx="${x}" cy="${y}" r="2"/>`;
    }
    // Hub central
    svg += `<circle class="hole" cx="${cx}" cy="${cy}" r="3" fill="#b4742a" stroke="#1c1209"/>`;

    // Label
    svg += `<text class="label" x="${cx}" y="${cy + r + 12}" text-anchor="middle">hub ${v}-edge · × ${count}</text>`;
    svg += `<text class="meta" x="${cx}" y="${cy + r + 20}" text-anchor="middle">ângulo plano: ${(360/v).toFixed(1)}°</text>`;
  });

  svg += '</svg>';
  return svg;
}

function truncLabel(v) {
  if (v === 0.5) return '½ esfera';
  if (v === 0.625) return '⅝ domo';
  if (v === 0.75) return '¾ domo';
  return 'esfera';
}

// ─── Trigger download ─────────────────────────────────────────────────────
export function downloadFile(name, content, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
}
