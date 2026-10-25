/* Vetores do Anexo B e as travas da cobertura. */
var assert = require("assert");
var F = require("./telejornal-falas.js");
var T = require("./telejornal.js");
var Q = require("./quociente.js");

function r1(x) { return Math.round(x * 10) / 10; }
function r2(x) { return Math.round(x * 100) / 100; }
function quase(a, b, eps) {
  if (Math.abs(a - b) > (eps == null ? 1e-4 : eps)) {
    throw new Error(a + " != " + b);
  }
}

function imprimirMarco(rotulo, m) {
  console.log(
    rotulo +
    " A " + r1(m.A * 100).toFixed(1) +
    "% B " + r1(m.B * 100).toFixed(1) +
    "% pVit " + r2(m.pVitoria).toFixed(2) +
    " mat " + m.matematico +
    " lider " + m.lider +
    " t " + m.t.toFixed(2)
  );
}

var b1 = T.cenarioAnexoB("B1");
var soma1 = T.somasMatriz(b1);
Object.keys(b1.totais).forEach(function (p) {
  quase(soma1.colunas[p], b1.totais[p], 1e-4);
});
soma1.linhas.forEach(function (linha, i) {
  quase(linha, b1.blocos[i].votos, 1e-4);
});
var snaps1 = T.linhaDoTempo(b1);
var ultimo1 = snaps1[snaps1.length - 1];
quase(ultimo1.pct_apurado, 1, 1e-9);
assert.strictEqual(snaps1.some(function (s) { return s.virada; }), false, "B1 não pode ter virada");

var alvos = [0.10, 0.30, 0.50, 0.70, 0.90, 0.99];
var marcos1 = alvos.map(function (p) { return T.marcoPct(snaps1, p, 1000000); });
console.log("--- B1 ---");
marcos1.forEach(function (m) { imprimirMarco((m.pct * 100) + "%", m); });

assert.strictEqual(r1(marcos1[0].A * 100), 57.1);
assert.strictEqual(r1(marcos1[0].B * 100), 34.1);
assert.strictEqual(r2(marcos1[0].pVitoria), 0.53);
assert.strictEqual(r1(marcos1[1].A * 100), 56.8);
assert.strictEqual(r1(marcos1[1].B * 100), 34.4);
assert.strictEqual(r2(marcos1[1].pVitoria), 0.62);
assert.strictEqual(r1(marcos1[2].A * 100), 56.5);
assert.strictEqual(r1(marcos1[2].B * 100), 34.8);
assert.strictEqual(r2(marcos1[2].pVitoria), 0.75);
assert.strictEqual(r1(marcos1[3].A * 100), 53.4);
assert.strictEqual(r1(marcos1[3].B * 100), 38.2);
assert.strictEqual(r2(marcos1[3].pVitoria), 0.87);
assert.strictEqual(r1(marcos1[4].A * 100), 49.5);
assert.strictEqual(r1(marcos1[4].B * 100), 42.4);
assert.strictEqual(r2(marcos1[4].pVitoria), 0.99);
assert.strictEqual(r1(marcos1[5].A * 100), 48.0);
assert.strictEqual(r1(marcos1[5].B * 100), 44.0);
assert.strictEqual(marcos1[5].matematico, true);
marcos1.slice(0, 5).forEach(function (m) { assert.strictEqual(m.matematico, false); assert.strictEqual(m.lider, "A"); });

var b2 = T.cenarioAnexoB("B2");
var soma2 = T.somasMatriz(b2);
Object.keys(b2.totais).forEach(function (p) { quase(soma2.colunas[p], b2.totais[p], 1e-4); });
var snaps2 = T.linhaDoTempo(b2);
quase(snaps2[snaps2.length - 1].pct_apurado, 1, 1e-9);
var lider50 = T.marcoPct(snaps2, 0.5, 1000000);
assert.strictEqual(lider50.lider, "A");
var vira = T.primeiraVirada(snaps2);
assert.ok(vira, "B2 precisa virar");
console.log("--- B2 ---");
console.log("virada t=" + vira.t.toFixed(1) + " pct=" + (vira.pct_apurado * 100).toFixed(1) + "% lider=" + vira.lider);
assert.ok(Math.abs(vira.t - 63.333333) < 0.05, "t da virada");
assert.ok(Math.abs(vira.pct_apurado - 0.95) < 0.015, "pct da virada");
assert.strictEqual(vira.lider, "B");
assert.strictEqual(snaps2[snaps2.length - 1].lider, "B");
quase(snaps2[snaps2.length - 1].parcial.A, 450000, 1e-3);
quase(snaps2[snaps2.length - 1].parcial.B, 470000, 1e-3);
quase(snaps2[snaps2.length - 1].parcial.C, 80000, 1e-3);

var outra = T.linhaDoTempo(b2);
assert.strictEqual(JSON.stringify(snaps2), JSON.stringify(outra), "mesma semente");

function noite(seed, canal, totais) {
  return T.montarCobertura({
    totais: totais || b1.totais,
    blocos: T.blocosAnexoB(),
    vies: T.viesAnexoB(),
    seed: seed,
    canal: canal || "V4",
    modo: "padrao",
    ano: 2026,
    cargo: "Presidente",
    cargoId: "PRES",
    circunscricao: "o Brasil",
    vagas: "1",
    nomes: { A: "Chapa Azul", B: "Chapa Ocre", C: "Chapa Verde" }
  });
}

var n1 = noite(7, "V4");
var n1b = noite(7, "V4");
assert.strictEqual(JSON.stringify(n1.roteiro.map(function (s) { return s.texto; })), JSON.stringify(n1b.roteiro.map(function (s) { return s.texto; })));
var spoil = T.auditarSpoilers(n1);
assert.deepStrictEqual(spoil, [], JSON.stringify(spoil));
var rep = T.repeticao(n1);
console.log("repeticao mesma noite", rep.taxa.toFixed(3), "falas", rep.total, "blocos", F.contar().blocos);
assert.ok(rep.taxa < 0.05, "repetição dentro da noite");
assert.ok(F.contar().blocos >= 300, "blocos de fala");

var textos = {};
[11, 12, 13].forEach(function (seed) {
  noite(seed, "V4").roteiro.forEach(function (s) { textos[seed] = textos[seed] || []; textos[seed].push(s.texto); });
});
function overlap(a, b) {
  var sb = {};
  b.forEach(function (t) { sb[t] = 1; });
  var inter = a.filter(function (t) { return sb[t]; }).length;
  return inter / Math.max(1, a.length);
}
var o12 = overlap(textos[11], textos[12]);
var o13 = overlap(textos[11], textos[13]);
console.log("overlap noites", o12.toFixed(3), o13.toFixed(3));
assert.ok(o12 < 0.15 && o13 < 0.15, "repetição entre noites");

n1.roteiro.forEach(function (seg) {
  if (/\beleitos?\b|\beleitas?\b/i.test(seg.texto)) {
    assert.ok(seg.confirmado || seg.canal_chamou_errado, seg.texto);
    if (seg.confirmado) {
      var st = T.estadoNoTempo(n1, seg.t_ini);
      assert.ok(st.sit.matematico || seg.t_curva >= n1.snaps[n1.snaps.length - 1].t - 1e-6);
    }
  }
});
var evMat = n1.eventos.filter(function (e) { return e.tipo === "vitoria_matematica"; })[0];
assert.ok(evMat, "precisa haver chamada matemática em B1");
var snapMat = n1.snaps.filter(function (s) { return s.t >= evMat.t - 1e-9; })[0];
var sitMat = T.situacaoMajoritaria(snapMat, n1.total);
assert.ok(sitMat.vantagem > sitMat.restante);

var nOp = noite(7, "V7", b2.totais);
var erradas = nOp.roteiro.filter(function (s) { return s.canal_chamou_errado; });
console.log("chamadas erradas opiniao+", erradas.length);
erradas.forEach(function (s) {
  assert.strictEqual(s.confirmado, false);
  assert.ok(/\beleito\b/i.test(s.texto));
});
assert.deepStrictEqual(T.auditarSpoilers(nOp), []);

var partidos = [
  { id: "A", votos_legenda: 0, candidatos: [{ id: "a1", nome: "Ana Leme", votos: 460000, idade: 50 }, { id: "a2", nome: "Caio Dutra", votos: 30000, idade: 40 }] },
  { id: "B", votos_legenda: 0, candidatos: [{ id: "b1", nome: "Bia Kessel", votos: 220000, idade: 45 }, { id: "b2", nome: "Davi Mol", votos: 40000, idade: 38 }] },
  { id: "C", votos_legenda: 0, candidatos: [{ id: "c1", nome: "Iara Linhares", votos: 20000, idade: 33 }, { id: "c2", nome: "Otto Prates", votos: 10000, idade: 29 }, { id: "c3", nome: "Luma Foques", votos: 8000, idade: 31 }, { id: "c4", nome: "Nara Varejao", votos: 5000, idade: 36 }] }
];
var oficial = Q.apurarProporcional({ vagas: 3, partidos: partidos });
var fimSnap = {
  t: 80,
  pct_apurado: 1,
  parcial: Object.fromEntries(Object.keys(oficial.por_partido).map(function (id) {
    return [id, oficial.por_partido[id].votos];
  }))
};
var meta = {
  vagas: 3,
  apurar: Q.apurarProporcional,
  total: Object.keys(fimSnap.parcial).reduce(function (s, k) { return s + fimSnap.parcial[k]; }, 0),
  partidos: partidos,
  resultadoOficial: oficial
};
console.log("proporcional eleitos", oficial.eleitos.map(function (e) { return e.candidato + ":" + e.fase; }).join(","));
assert.strictEqual(T.confirmavel("a1", fimSnap, meta), true);
assert.strictEqual(T.confirmavel("c2", fimSnap, meta), false);
var cedo = { t: 1, pct_apurado: 0.08, parcial: { A: 40000, B: 28000, C: 12000 } };
assert.strictEqual(T.confirmavel("a1", cedo, meta), false);
var quaseFim = { t: 70, pct_apurado: 0.92, parcial: { A: 450000, B: 180000, C: 20000 } };
assert.strictEqual(T.confirmavel("a1", quaseFim, meta), true);

assert.strictEqual(n1.roteiro[0].tipo, "abertura");

var pres1 = T.montarCobertura(Object.assign({}, b1, {
  canal: "V4", modo: "padrao", ano: 2026, cargo: "Presidente", cargoId: "PRES",
  circunscricao: "o Brasil", vagas: "1",
  nomes: { A: "Chapa Azul", B: "Chapa Ocre", C: "Chapa Verde" },
  maioria: true, turno: 1, tipo: "majoritaria"
}));
assert.strictEqual(pres1.eventos.some(function (e) { return e.tipo === "vitoria_matematica"; }), false, "1º turno sem 50% não chama");
assert.strictEqual(pres1.roteiro.some(function (s) { return /\beleitos?\b|\beleitas?\b/i.test(s.texto); }), false);
assert.strictEqual(T.chamadaEleito(pres1.final, pres1.total, { maioria: true, turno: 1, tipo: "majoritaria" }), false);
assert.strictEqual(pres1.final.matematico, true, "B1 ainda fecha a conta FPTP");
console.log("portao 1o turno", "lider", pres1.final.lider, "votos", Math.round(pres1.final.liderVotos), "metade", pres1.total / 2, "chamada", false);

var duo = T.montarCobertura({
  totais: { A: 560000, B: 440000 },
  blocos: T.blocosAnexoB(),
  vies: { A: { urbano: 0.25 }, B: { rural: 0.35, periferia: 0.1 } },
  seed: 7, ruido: 0.15, passos: 6,
  canal: "V4", modo: "padrao", ano: 2026, cargo: "Presidente", cargoId: "PRES",
  circunscricao: "o Brasil", vagas: "1",
  nomes: { A: "Chapa Azul", B: "Chapa Ocre" },
  maioria: true, turno: 2, tipo: "majoritaria"
});
var evDuo = duo.eventos.filter(function (e) { return e.tipo === "vitoria_matematica"; })[0];
assert.ok(evDuo, "2º turno chama quando a vantagem passa do restante");
var snapDuo = duo.snaps.filter(function (s) { return s.t >= evDuo.t - 1e-9; })[0];
var sitDuo = T.situacaoMajoritaria(snapDuo, duo.total);
assert.ok(sitDuo.liderVotos > duo.total / 2);
assert.strictEqual(T.chamadaEleito(sitDuo, duo.total, { maioria: true, turno: 2 }), true);
console.log("2o turno chamada t", evDuo.t.toFixed(2), "lider", sitDuo.lider, "votos", Math.round(sitDuo.liderVotos));

var propNoite = T.montarCobertura({
  totais: { A: 490000, B: 260000, C: 250000 },
  blocos: T.blocosAnexoB(),
  vies: T.viesAnexoB(),
  seed: 7, canal: "V4", modo: "padrao",
  tipo: "proporcional", maioria: false, turno: 1,
  nomes: { A: "Sigla Alfa", B: "Sigla Beta", C: "Sigla Gama" },
  cargo: "Deputado federal", cargoId: "DEPF", ano: 2026
});
assert.strictEqual(propNoite.eventos.some(function (e) { return e.tipo === "vitoria_matematica"; }), false);
assert.strictEqual(propNoite.roteiro.some(function (s) { return /\beleitos?\b|\beleitas?\b/i.test(s.texto); }), false);
assert.strictEqual(T.chamadaEleito(propNoite.final, propNoite.total, { tipo: "proporcional" }), false);
assert.deepStrictEqual(T.auditarSpoilers(propNoite), []);
assert.strictEqual(propNoite.roteiro[0].tipo, "abertura");
console.log("proporcional sem chamada", "segmentos", propNoite.roteiro.length);

var dur = n1.duracao_s;
var fim = n1.roteiro[n1.roteiro.length - 1].t_fim;
assert.ok(Math.abs(fim - dur) / dur < 0.1, "duração");
console.log("duracao", dur, "fim", fim, "segmentos", n1.roteiro.length, "eventos", n1.eventos.length);
console.log("OK");
