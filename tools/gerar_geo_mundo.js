const fs = require('fs');
// Uso: node tools/gerar_geo_mundo.js <countries-110m.json do pacote world-atlas@2.0.2>
// Gera cadeira-v3-geomundo.js: todos os países (Natural Earth 1:110m, domínio público), arredondados a 0,5°.
const topo = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const [sx, sy] = topo.transform.scale, [tx, ty] = topo.transform.translate;
const arcs = topo.arcs.map(a => { let x = 0, y = 0; return a.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; }); });
const arc = i => i >= 0 ? arcs[i] : arcs[~i].slice().reverse();
const ring = r => { let o = []; r.forEach((i, k) => { const a = arc(i); o = o.concat(k ? a.slice(1) : a); }); return o; };
const R = 0.5, out = {};
topo.objects.countries.geometries.forEach(g => {
  if (!g.arcs || g.properties.name === 'Antarctica') return;
  const ps = g.type === 'Polygon' ? [g.arcs] : g.arcs;
  const polys = ps.map(p => { const q = []; let last = null; ring(p[0]).forEach(([x, y]) => { const r = [+(Math.round(x / R) * R).toFixed(1), +(Math.round(y / R) * R).toFixed(1)]; if (!last || r[0] !== last[0] || r[1] !== last[1]) q.push(r); last = r; }); return q.map(p => p.join(',')).join(' '); }).filter(s => s.split(' ').length >= 4);
  if (polys.length) out[g.id || g.properties.name] = [g.properties.name, polys];
});
const js = "/* Países do mundo (Natural Earth 1:110m via world-atlas 2.0.2, domínio público). Gerado por tools/gerar_geo_mundo.js. */\nwindow.V3MUNDO = " + JSON.stringify(out) + ";\n";
fs.writeFileSync('cadeira-v3-geomundo.js', js);
console.log(Object.keys(out).length, js.length);
