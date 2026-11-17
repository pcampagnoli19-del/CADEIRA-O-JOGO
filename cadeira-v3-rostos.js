/* =============================================================================
   CADEIRA v3 — Rostos dos políticos fictícios
   Troca os retratos de bancos públicos (randomuser/xsgames) pelos rostos gerados
   para o jogo, em dados/rostos/ (recortados por tools/recortar_rostos.py):
   - políticos: 19-24, 25-34, 35-59 e 60-80 anos, homens e mulheres;
   - ministros fictícios do STF (de toga): 35-50, 51-65 e 66-75 anos.
   Regras: o rosto segue a faixa de idade e o sexo de quando o personagem é
   criado e não muda depois; dois personagens vivos nunca dividem o mesmo rosto;
   o rosto de quem morreu volta a ficar disponível. Políticos reais não mudam.
   ============================================================================= */
(function () {
  "use strict";
  if (window.V3ROSTOS) return;
  var RO = (window.V3ROSTOS = {});
  var BASE = "dados/rostos/";
  var N = { "pol/19-24/H": 190, "pol/19-24/M": 136, "pol/25-34/H": 144, "pol/25-34/M": 120, "pol/35-59/H": 183, "pol/35-59/M": 226, "pol/60-80/H": 138, "pol/60-80/M": 165,
    "stf/35-50/H": 28, "stf/35-50/M": 20, "stf/51-65/H": 20, "stf/51-65/M": 20, "stf/66-75/H": 20, "stf/66-75/M": 20 };
  RO.N = N;
  function hash(s) { var h = 2166136261 >>> 0; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function url(k, i) { return BASE + k + "/" + ("00" + i).slice(-3) + ".webp"; }
  function eNosso(u) { return typeof u === "string" && u.indexOf(BASE) === 0; }
  RO.eNosso = eNosso;
  function feminino(n) {
    if (n.sexo === "F") return true; if (n.sexo === "M") return false;
    var pn = String(n.nome || "").trim().split(/\s+/)[0];
    try { if (typeof FEM !== "undefined" && Array.isArray(FEM) && FEM.indexOf(pn) >= 0) return true; } catch (e) {}
    return /a$/i.test(pn) && !/^(Luca|Nicola|Joshua|Elias|Isaías|Jonas|Andrea)$/i.test(pn);
  }
  function stf(n) { return /Ministro do STF/.test(n.cargo || "") || /Ministro\(a\) do STF/.test(n.papel || ""); }
  function chave(n) {
    var id = Number(n.idade) || 50, sx = feminino(n) ? "M" : "H";
    if (stf(n)) return "stf/" + (id <= 50 ? "35-50" : id <= 65 ? "51-65" : "66-75") + "/" + sx;
    return "pol/" + (id <= 24 ? "19-24" : id <= 34 ? "25-34" : id <= 59 ? "35-59" : "60-80") + "/" + sx;
  }
  RO.chave = chave;
  var VIZ = { "pol/19-24": ["pol/25-34"], "pol/25-34": ["pol/19-24", "pol/35-59"], "pol/35-59": ["pol/25-34", "pol/60-80"], "pol/60-80": ["pol/35-59"], "stf/35-50": ["stf/51-65", "pol/35-59"], "stf/51-65": ["stf/35-50", "stf/66-75", "pol/35-59"], "stf/66-75": ["stf/51-65", "pol/60-80"] };
  function sorteia(n, usadas) {
    var k = chave(n), sx = k.slice(-1), fx = k.slice(0, -2), h = hash(n.id || n.nome);
    var pools = [k].concat((VIZ[fx] || []).map(function (f) { return f + "/" + sx; }));
    for (var p = 0; p < pools.length; p++) {
      var tot = N[pools[p]] || 0;
      for (var i = 0; i < tot; i++) { var u = url(pools[p], ((h + i) % tot) + 1); if (!usadas[u]) return u; }
    }
    return url(k, (h % (N[k] || 1)) + 1); // banco esgotado: repete (raro)
  }
  // substitui a distribuição antiga (fotos de bancos públicos)
  function garantir() {
    if (typeof bancoDeNPCs === "undefined" || !Array.isArray(bancoDeNPCs)) return;
    var usadas = {}, fila = [];
    bancoDeNPCs.forEach(function (n) {
      if (!n || n.real || n.jogador || n.foto) return;
      if (eNosso(n._fotoProc) && n.vivo !== false) { if (usadas[n._fotoProc]) delete n._fotoProc; else usadas[n._fotoProc] = 1; }
    });
    bancoDeNPCs.forEach(function (n) {
      if (!n || n.real || n.jogador || n.foto) return;
      if (eNosso(n._fotoProc)) return;
      fila.push(n);
    });
    fila.sort(function (a, b) { return String(a.id || a.nome).localeCompare(String(b.id || b.nome)); });
    fila.forEach(function (n) { var u = sorteia(n, usadas); n._fotoProc = u; if (n.vivo !== false) usadas[u] = 1; });
  }
  RO.garantir = garantir;
  RO.rostoPara = function (pessoa) { var o = { id: pessoa.id || pessoa.nome, nome: pessoa.nome, idade: pessoa.idade || 40, sexo: pessoa.sexo }; return sorteia(o, {}); };
  function instalar() {
    if (typeof window.garantirFotosUnicasFicticios === "function" && !window.garantirFotosUnicasFicticios.__v3r) {
      var n = function () { return garantir(); }; n.__v3r = true;
      window.garantirFotosUnicasFicticios = n; try { garantirFotosUnicasFicticios = n; } catch (e) {}
    }
  }
  instalar();
  document.addEventListener("DOMContentLoaded", function () { setTimeout(instalar, 0); });
  window.addEventListener("load", function () { setTimeout(instalar, 200); });
})();
