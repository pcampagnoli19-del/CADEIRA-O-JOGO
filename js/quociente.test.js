"use strict";
const q = require("./quociente.js");

function harm(id, total) {
  const legenda = Math.round(total * 0.1);
  const nominal = total - legenda;
  const pesos = [1, 1 / 2, 1 / 3, 1 / 4, 1 / 5, 1 / 6, 1 / 7, 1 / 8];
  const H = pesos.reduce((s, p) => s + p, 0);
  const votos = pesos.map((p) => Math.floor((nominal * p) / H));
  let resto = nominal - votos.reduce((s, v) => s + v, 0);
  for (let i = 0; i < resto; i++) votos[i % votos.length]++;
  return {
    id,
    votos_legenda: legenda,
    candidatos: votos.map((v, i) => ({ id: id + (i + 1), votos: v, idade: 40 + i }))
  };
}

function cadeiras(r) {
  const o = {};
  Object.keys(r.por_partido).forEach((id) => { o[id] = r.por_partido[id].total; });
  return o;
}

function igual(a, b) {
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => a[k] === b[k]);
}

const falhas = [];
function ok(nome, cond, extra) {
  if (!cond) falhas.push(nome + (extra ? " :: " + extra : ""));
}

const B1v = { A: 420000, B: 310000, C: 150000, D: 90000, E: 30000 };
const B3v = { A: 420000, B: 311000, C: 150000, D: 79000, E: 40000 };
function chapa(votos) {
  return Object.keys(votos).map((id) => harm(id, votos[id]));
}

const b1 = q.apurarProporcional({ vagas: 10, partidos: chapa(B1v) });
ok("B1 QE", b1.QE === 100000, String(b1.QE));
ok("B1 cadeiras", igual(cadeiras(b1), { A: 5, B: 3, C: 1, D: 1, E: 0 }), JSON.stringify(cadeiras(b1)));
ok("B1 sobras D depois A", b1.passos.filter((p) => p.fase === "sobra").map((p) => p.vencedor).join(",") === "D,A");

const b2 = q.apurarProporcional({
  vagas: 10,
  partidos: chapa(B1v),
  regras: { modo_sobras: "lei14211_80_20", barreira_partido_sobras: 0.8, barreira_candidato_sobras: 0.2 }
});
ok("B2 QE", b2.QE === 100000);
ok("B2 cadeiras", igual(cadeiras(b2), { A: 5, B: 3, C: 1, D: 1, E: 0 }), JSON.stringify(cadeiras(b2)));

const b3a = q.apurarProporcional({ vagas: 10, partidos: chapa(B3v), regras: { modo_sobras: "stf2024" } });
ok("B3a QE", b3a.QE === 100000);
ok("B3a cadeiras", igual(cadeiras(b3a), { A: 5, B: 3, C: 1, D: 1, E: 0 }), JSON.stringify(cadeiras(b3a)));

const b3b = q.apurarProporcional({
  vagas: 10,
  partidos: chapa(B3v),
  regras: { modo_sobras: "lei14211_80_20", barreira_partido_sobras: 0.8, barreira_candidato_sobras: 0.2 }
});
ok("B3b QE", b3b.QE === 100000);
ok("B3b cadeiras", igual(cadeiras(b3b), { A: 5, B: 4, C: 1, D: 0, E: 0 }), JSON.stringify(cadeiras(b3b)));

q.REGRAS_ELEITORAIS.modo_sobras = "lei14211_80_20";
const b3modo = q.apurarProporcional({ vagas: 10, partidos: chapa(B3v) });
ok("modo_sobras alterna B3", igual(cadeiras(b3modo), { A: 5, B: 4, C: 1, D: 0, E: 0 }), JSON.stringify(cadeiras(b3modo)));
q.REGRAS_ELEITORAIS.modo_sobras = "stf2024";

const votosB4 = [33333, 31667, 30000, 28333, 26667, 25000, 23333, 21667, 20000, 18333];
const b4 = q.apurarProporcional({
  vagas: 5,
  partidos: votosB4.map((v, i) => harm("P" + i, v)),
  regras: { modo_sobras: "stf2024", regra_sem_qe: "dhondt_todos" }
});
ok("B4 QE", b4.QE === 51667, String(b4.QE));
const espB4 = {};
for (let i = 0; i < 10; i++) espB4["P" + i] = i < 5 ? 1 : 0;
ok("B4 cadeiras", igual(cadeiras(b4), espB4), JSON.stringify(cadeiras(b4)));

ok("B5 1004", q.qeArredondado(1004, 10) === 100);
ok("B5 1005", q.qeArredondado(1005, 10) === 100);
ok("B5 1006", q.qeArredondado(1006, 10) === 101);

ok("assembleia SP", q.vagasAssembleia(70) === 94);
ok("assembleia 8", q.vagasAssembleia(8) === 24);
ok("vereadores 10 mil", q.vagasCamaraMunicipal(10000) === 9);
ok("vereadores 400 mil", q.vagasCamaraMunicipal(400000) === 23);
ok("vereadores 9 milhoes", q.vagasCamaraMunicipal(9000000) === 55);
ok("limite", q.limiteCandidatos(10) === 11);
ok("cota ok", q.cotaGeneroOk([{ genero: "F" }, { genero: "F" }, { genero: "M" }, { genero: "M" }]));
ok("cota falha", !q.cotaGeneroOk([{ genero: "M" }, { genero: "M" }, { genero: "M" }, { genero: "F" }]));

const mais = q.apurarProporcional({
  vagas: 2,
  partidos: [
    { id: "A", votos_legenda: 0, candidatos: [{ id: "a1", votos: 30, idade: 40 }, { id: "a2", votos: 28, idade: 41 }] },
    { id: "B", votos_legenda: 0, candidatos: [{ id: "b1", votos: 15, idade: 50 }, { id: "b2", votos: 15, idade: 49 }, { id: "b3", votos: 15, idade: 48 }, { id: "b4", votos: 15, idade: 47 }] },
    { id: "C", votos_legenda: 0, candidatos: [{ id: "c1", votos: 10, idade: 60 }] }
  ],
  regras: { regra_sem_qe: "mais_votados" }
});
ok("mais_votados", mais.QE === 64 && mais.eleitos.map((e) => e.candidato).join(",") === "a1,a2", JSON.stringify({ QE: mais.QE, eleitos: mais.eleitos }));

ok("clausula voto", q.clausulaOk({ pct_nacional: 3, ufs_com_minimo: 9, deputados: 0, ufs_com_deputado: 0 }, 2026).ok);
ok("clausula cadeira", q.clausulaOk({ pct_nacional: 0.4, ufs_com_minimo: 0, deputados: 13, ufs_com_deputado: 9 }, 2026).ok);
ok("clausula fora", !q.clausulaOk({ pct_nacional: 2.4, ufs_com_minimo: 9, deputados: 12, ufs_com_deputado: 9 }, 2026).ok);

let propFalhas = 0;
for (let n = 0; n < 1000; n++) {
  const vagas = 1 + (n % 70);
  const nPart = 2 + (n % 12);
  const partidos = [];
  for (let p = 0; p < nPart; p++) {
    const nc = 1 + ((n + p) % 8);
    const candidatos = [];
    for (let c = 0; c < nc; c++) candidatos.push({ id: "P" + p + "C" + c, votos: ((n * 17 + p * 13 + c * 3) % 5000) + (c === 0 ? 80 : 0), idade: 30 + c, genero: c % 2 ? "F" : "M" });
    partidos.push({ id: "P" + p, votos_legenda: (n * 3 + p) % 200, candidatos });
  }
  const r1 = q.apurarProporcional({ vagas, partidos });
  const r2 = q.apurarProporcional({ vagas, partidos });
  const soma = Object.values(r1.por_partido).reduce((s, x) => s + x.total, 0);
  const diretasDemais = Object.values(r1.por_partido).some((x) => x.diretas > Math.floor(x.votos / (r1.QE || 1)));
  const barreira = r1.eleitos.filter((e) => e.fase === "direta").some((e) => e.votos + 1e-6 < 0.1 * r1.QE);
  if (soma !== r1.eleitos.length || soma > vagas || (soma < vagas && r1.vagas_nao_preenchidas !== vagas - soma) || diretasDemais || barreira || JSON.stringify(r1) !== JSON.stringify(r2)) propFalhas++;
}
ok("1000 apurações", propFalhas === 0, String(propFalhas));

const rec = q.recalcular({ vagas: 10, partidos: chapa(B1v) }, { cassado: "A1", motivo: "cassação" });
ok("recálculo zera o cassado", rec.eleitos.every((e) => e.candidato !== "A1"));
ok("determinismo B1", JSON.stringify(b1) === JSON.stringify(q.apurarProporcional({ vagas: 10, partidos: chapa(B1v) })));

if (falhas.length) {
  console.error("FALHAS\n" + falhas.join("\n"));
  process.exit(1);
}
console.log("ANEXO_B_OK");
console.log(JSON.stringify({
  B1: { QE: b1.QE, cadeiras: cadeiras(b1) },
  B2: { QE: b2.QE, cadeiras: cadeiras(b2) },
  B3a: { QE: b3a.QE, cadeiras: cadeiras(b3a) },
  B3b: { QE: b3b.QE, cadeiras: cadeiras(b3b) },
  B4: { QE: b4.QE, cadeiras: cadeiras(b4) },
  B5: [q.qeArredondado(1004, 10), q.qeArredondado(1005, 10), q.qeArredondado(1006, 10)]
}, null, 2));
