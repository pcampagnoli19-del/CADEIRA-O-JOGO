// Converte TopoJSON (land-110m do pacote world-atlas@2.0.2) em polígonos compactos.
// Uso: node tools/gerar_geo_land.js <land-110m.json> <passo em graus, ex. 0.5> <saida.json>
// O resultado (junto com gerar_geo_paises.js) vira cadeira-v3-geo.js.
const fs = require('fs');
const topo = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const [sx, sy] = topo.transform.scale, [tx, ty] = topo.transform.translate;
const arcs = topo.arcs.map(a => { let x = 0, y = 0; return a.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; }); });
function arc(i) { const a = i >= 0 ? arcs[i] : arcs[~i].slice().reverse(); return a; }
function ring(r) { let out = []; r.forEach((i, k) => { const a = arc(i); out = out.concat(k ? a.slice(1) : a); }); return out; }
const geom = topo.objects.land.geometries || [topo.objects.land];
const polys = [];
geom.forEach(g => { const ps = g.type === 'Polygon' ? [g.arcs] : g.arcs; ps.forEach(p => polys.push(ring(p[0]))); });
const R = +(process.argv[3] || 1); // passo de arredondamento em graus
const out = polys.map(p => { const q = []; let last = null; p.forEach(([x, y]) => { const r = [Math.round(x / R) * R, Math.round(y / R) * R].map(v => +v.toFixed(2)); if (!last || r[0] !== last[0] || r[1] !== last[1]) q.push(r); last = r; }); return q; }).filter(q => q.length >= 4);
const flat = out.map(q => q.map(p => p.join(',')).join(' '));
fs.writeFileSync(process.argv[4], JSON.stringify(flat));
console.log('poligonos', out.length, 'pontos', out.reduce((s, q) => s + q.length, 0), 'bytes', fs.statSync(process.argv[4]).size);
