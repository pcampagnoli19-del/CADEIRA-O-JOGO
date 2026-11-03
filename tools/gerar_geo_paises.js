const fs = require('fs');
// Uso: node tools/gerar_geo_paises.js <countries-110m.json do pacote world-atlas@2.0.2> <saida.json>
const topo = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const [sx, sy] = topo.transform.scale, [tx, ty] = topo.transform.translate;
const arcs = topo.arcs.map(a => { let x = 0, y = 0; return a.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; }); });
const arc = i => i >= 0 ? arcs[i] : arcs[~i].slice().reverse();
const ring = r => { let o = []; r.forEach((i, k) => { const a = arc(i); o = o.concat(k ? a.slice(1) : a); }); return o; };
const want = { "076": "BRA", "840": "USA", "156": "CHN", "643": "RUS", "250": "FRA", "276": "DEU", "356": "IND", "032": "ARG", "484": "MEX", "170": "COL", "862": "VEN", "682": "SAU", "792": "TUR", "392": "JPN", "056": "BEL", "756": "CHE" };
const R = 0.5, out = {};
topo.objects.countries.geometries.forEach(g => {
  const k = want[g.id]; if (!k) return;
  const ps = g.type === 'Polygon' ? [g.arcs] : g.arcs;
  out[k] = ps.map(p => { const q = []; let last = null; ring(p[0]).forEach(([x, y]) => { const r = [+(Math.round(x / R) * R).toFixed(1), +(Math.round(y / R) * R).toFixed(1)]; if (!last || r[0] !== last[0] || r[1] !== last[1]) q.push(r); last = r; }); return q.map(p => p.join(',')).join(' '); }).filter(s => s.split(' ').length >= 4);
});
fs.writeFileSync(process.argv[3], JSON.stringify(out));
console.log(Object.keys(out).length, fs.statSync(process.argv[3]).size);
