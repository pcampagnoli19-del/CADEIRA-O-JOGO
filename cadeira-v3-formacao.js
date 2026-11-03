/* =============================================================================
   CADEIRA v3 — Formação acadêmica + votos na Wiki
   1. Na criação: graduação (curso e instituição), pós/MBA, mestrado e
      doutorado, cada um "concluído" ou "cursando", coerente com a idade.
   2. Durante o jogo: cursos em andamento avançam e geram formatura
      (manchete, diário, bônus de atributos). No Perfil, card "Formação
      acadêmica" para iniciar novos cursos.
   3. Wiki do personagem: usa a formação escolhida (j.formacao) e ganha uma
      lista detalhada na seção 1.
   4. Correção: a Wiki perdia os votos a partir da 2ª eleição (dependia de
      uma manchete que o motor novo não publica). Agora os votos vêm do texto
      do resultado; a porcentagem errada (barreira de 10%) e o "2º turno"
      marcado em toda eleição também foram corrigidos, inclusive em saves.
   Estado em J().formacao3.
   ============================================================================= */
(function () {
  "use strict";
  if (window.FORM3) return;
  var F3 = (window.FORM3 = {});
  function esc_(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pj(a) { return esc_(JSON.stringify(a)); }
  function ok(f, d) { try { var v = f(); return v === undefined ? d : v; } catch (e) { return d; } }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function dataJ() { return ok(function () { return dt(); }, { ano: 2026, mes: 1 }); }
  function toast_(m, t) { try { toast(m, t || "ok"); } catch (e) {} }

  var CURSOS = [
    ["Direito", 5], ["Administração", 4], ["Economia", 4], ["Ciência Política", 4], ["Ciências Sociais", 4], ["Relações Internacionais", 4],
    ["Jornalismo", 4], ["Pedagogia", 4], ["Medicina", 6], ["Enfermagem", 5], ["Engenharia Civil", 5], ["Engenharia de Produção", 5],
    ["Arquitetura e Urbanismo", 5], ["Ciências Contábeis", 4], ["Serviço Social", 4], ["Psicologia", 5], ["Agronomia", 5], ["Teologia", 4],
    ["Educação Física", 4], ["Gestão Pública", 4], ["História", 4], ["Publicidade e Propaganda", 4]
  ];
  var INST = ["USP", "Unicamp", "Unesp", "UFABC", "Unifesp", "PUC-SP", "Mackenzie", "FGV", "Fundação Santo André (FSA)", "Universidade Metodista (São Bernardo)",
    "Faculdade de Direito de São Bernardo", "Centro Universitário FEI", "Universidade São Judas", "UNIP", "Anhanguera", "FMU", "Uninove", "Universidade Municipal de São Caetano (USCS)"];
  var PRIVADA = { "PUC-SP": 3500, "Mackenzie": 3200, "FGV": 5200, "Centro Universitário FEI": 3000, "Universidade Metodista (São Bernardo)": 1800, "Faculdade de Direito de São Bernardo": 1500, "Universidade São Judas": 1400, "UNIP": 900, "Anhanguera": 700, "FMU": 1100, "Uninove": 800, "Fundação Santo André (FSA)": 900, "Universidade Municipal de São Caetano (USCS)": 1000 };
  var POS = ["Gestão Pública", "Direito Eleitoral", "Marketing Político", "Políticas Públicas", "MBA em Gestão", "Direito Constitucional", "Saúde Pública", "Segurança Pública", "Planejamento Urbano", "Comunicação Política"];
  var NIVEIS = [["grad", "Graduação"], ["pos", "Pós-graduação / MBA"], ["mest", "Mestrado"], ["dout", "Doutorado"]];
  var DUR = { pos: 2, mest: 2, dout: 4 };
  function durGrad(curso) { var c = CURSOS.filter(function (x) { return x[0] === curso; })[0]; return c ? c[1] : 4; }
  var BONUS = { grad: { inteligencia: 3 }, pos: { inteligencia: 2, influencia: 1 }, mest: { inteligencia: 4, retorica: 1 }, dout: { inteligencia: 6, retorica: 2 } };
  var TITULO = { grad: "Graduação", pos: "Pós-graduação", mest: "Mestrado", dout: "Doutorado" };

  /* ---------------------------------------------------------------- regras de idade */
  // idade mínima para ter CONCLUÍDO cada nível (entra na faculdade aos 18)
  function idadeMin(f, nivel) {
    var g = 18 + durGrad(f.grad && f.grad.curso);
    if (nivel === "grad") return g;
    if (nivel === "pos") return g + DUR.pos;
    if (nivel === "mest") return g + DUR.mest;
    if (nivel === "dout") return g + DUR.mest + DUR.dout;
    return 99;
  }
  function validar(f, idade) {
    var avisos = [];
    if (!f.grad || !f.grad.curso) { ["pos", "mest", "dout"].forEach(function (k) { f[k] = null; }); return avisos; }
    if (idade < 18) { f.grad = null; avisos.push("Com menos de 18 anos não dá para estar na faculdade."); return avisos; }
    if (f.grad.status === "concluido" && idade < idadeMin(f, "grad")) { f.grad.status = "cursando"; avisos.push(f.grad.curso + " dura " + durGrad(f.grad.curso) + " anos: com " + idade + " anos, você ainda está cursando."); }
    var gradOk = f.grad.status === "concluido";
    ["pos", "mest"].forEach(function (k) {
      if (!f[k]) return;
      if (!gradOk) { f[k] = null; avisos.push(TITULO[k] + " exige a graduação concluída."); return; }
      if (f[k].status === "concluido" && idade < idadeMin(f, k)) { f[k].status = "cursando"; avisos.push(TITULO[k] + " concluído só a partir dos " + idadeMin(f, k) + " anos: ficou como cursando."); }
    });
    if (f.dout) {
      if (!f.mest || f.mest.status !== "concluido") { f.dout = null; avisos.push("Doutorado exige mestrado concluído."); }
      else if (f.dout.status === "concluido" && idade < idadeMin(f, "dout")) { f.dout.status = "cursando"; avisos.push("Doutorado concluído só a partir dos " + idadeMin(f, "dout") + " anos: ficou como cursando."); }
    }
    return avisos;
  }

  /* ---------------------------------------------------------------- criação do personagem */
  function cfgForm() {
    var c = ok(function () { return S.cfg; }, null); if (!c) return null;
    if (!c.v3form) c.v3form = { grad: { curso: "", inst: "USP", status: "concluido" }, pos: null, mest: null, dout: null, _aberto: false };
    return c.v3form;
  }
  function sugerirDaProfissao() {
    var c = S.cfg, f = cfgForm(); if (!f || f.grad.curso) return;
    var p = String(c.profissao || "") + " " + ok(function () { return (PROFISSOES.filter(function (x) { return x.id === c.profissao; })[0] || {}).titulo; }, "");
    var mapa = [[/Advog|Jurist/, "Direito"], [/Médic/, "Medicina"], [/Professor/, "Pedagogia"], [/Engenh/, "Engenharia Civil"], [/Empresár/, "Administração"], [/Jornal|Comunic/, "Jornalismo"], [/Econom/, "Economia"], [/Enferm/, "Enfermagem"], [/Pastor|Religios/, "Teologia"], [/Policial|Militar|Delegad/, "Direito"], [/Contad/, "Ciências Contábeis"], [/Assistente social/, "Serviço Social"], [/Agr/, "Agronomia"], [/Arquitet/, "Arquitetura e Urbanismo"]];
    for (var i = 0; i < mapa.length; i++) if (new RegExp(mapa[i][0].source, "i").test(p)) { f.grad.curso = mapa[i][1]; return; }
  }
  function sel(campo, valor, opcoes, vazio) {
    return '<select data-v3f="' + campo + '">' + (vazio ? '<option value="">' + vazio + "</option>" : "") + opcoes.map(function (o) { var v = Array.isArray(o) ? o[0] : o, t = Array.isArray(o) ? o[1] : o; return '<option value="' + esc_(v) + '"' + (v === valor ? " selected" : "") + ">" + esc_(t) + "</option>"; }).join("") + "</select>";
  }
  function htmlSetup() {
    var f = cfgForm(); if (!f) return "";
    var idade = +S.cfg.idade || 32;
    var avisos = validar(f, idade);
    var h = '<div class="v3f-box"><h4>Formação acadêmica</h4><p class="v3f-sub">Escolha o que o seu personagem já estudou. Com ' + idade + " anos, o que não couber na idade fica como <b>cursando</b> e você se forma durante o jogo.</p>";
    h += '<div class="v3f-linha"><b>Graduação</b>' + sel("grad.curso", f.grad ? f.grad.curso : "", CURSOS.map(function (c) { return [c[0], c[0] + " (" + c[1] + " anos)"]; }), "Sem graduação") +
      (f.grad && f.grad.curso ? sel("grad.inst", f.grad.inst, INST) + sel("grad.status", f.grad.status, [["concluido", "Concluída"], ["cursando", "Cursando"]]) : "") + "</div>";
    var gradOk = f.grad && f.grad.curso && f.grad.status === "concluido";
    [["pos", "Pós / MBA", POS], ["mest", "Mestrado", POS.concat(CURSOS.map(function (c) { return c[0]; }))], ["dout", "Doutorado", POS.concat(CURSOS.map(function (c) { return c[0]; }))]].forEach(function (n) {
      var k = n[0], v = f[k], pode = k === "dout" ? f.mest && f.mest.status === "concluido" : gradOk;
      h += '<div class="v3f-linha' + (pode ? "" : " off") + '"><b>' + n[1] + "</b>" + (pode ? sel(k + ".area", v ? v.area : "", n[2], "Não fez") + (v && v.area ? sel(k + ".inst", v.inst, INST) + sel(k + ".status", v.status, [["concluido", "Concluído"], ["cursando", "Cursando"]]) : "") : '<small>' + (k === "dout" ? "exige mestrado concluído" : "exige graduação concluída") + "</small>") + "</div>";
    });
    if (avisos.length) h += '<div class="v3f-aviso">' + avisos.map(esc_).join("<br>") + "</div>";
    return h + "</div>";
  }
  function setupPosRender() {
    var ini = document.querySelector("#app .inicio"); if (!ini || ini.querySelector(".v3f-box")) return;
    sugerirDaProfissao();
    var alvo = ini.querySelector('select[data-k="profissao"]');
    if (!alvo) return;
    var lab = alvo.closest("label"), box = lab && lab.parentNode && lab.parentNode !== ini ? lab.parentNode : lab;
    if (!box) return;
    var div = document.createElement("div"); div.innerHTML = htmlSetup();
    box.insertAdjacentElement("afterend", div.firstElementChild);
  }
  document.addEventListener("change", function (e) {
    var t = e.target, campo = t && t.getAttribute && t.getAttribute("data-v3f"); if (!campo) return;
    var f = cfgForm(); if (!f) return;
    var k = campo.split(".")[0], prop = campo.split(".")[1];
    if (k === "grad") { f.grad = f.grad || { curso: "", inst: "USP", status: "concluido" }; f.grad[prop] = t.value; if (prop === "curso" && !t.value) { f.pos = f.mest = f.dout = null; } }
    else { if (prop === "area" && !t.value) f[k] = null; else { f[k] = f[k] || { area: "", inst: "USP", status: "concluido" }; f[k][prop] = t.value; } }
    try { render(); } catch (err) {}
  });


  /* ---------------------------------------------------------------- data de nascimento */
  var INICIO = { ano: 2026, mes: 1 };
  function idadeEm(n, ref) { return ref.ano - n.ano - ((ref.mes < n.mes || (ref.mes === n.mes && (ref.dia || 1) < n.dia)) ? 1 : 0); }
  function nascSetup() {
    var c = S.cfg, ini = document.querySelector("#app .inicio"); if (!c || !ini || ini.querySelector(".v3n-nasc")) return;
    var sel_ = ini.querySelector('select[data-k="idade"]'); if (!sel_) return;
    var n = c.v3nasc;
    if (n) {
      c.idade = idadeEm(n, INICIO);
      if (![].some.call(sel_.options, function (o) { return +(o.value || o.textContent) === c.idade; })) { var op = document.createElement("option"); op.textContent = c.idade; sel_.appendChild(op); }
      [].forEach.call(sel_.options, function (o) { o.selected = +(o.value || o.textContent) === c.idade; });
    }
    var max = (INICIO.ano - 18) + "-12-31", min = (INICIO.ano - 90) + "-01-01";
    var v = n ? n.ano + "-" + String(n.mes).padStart(2, "0") + "-" + String(n.dia).padStart(2, "0") : "";
    var lab = document.createElement("label"); lab.className = "f v3n-nasc";
    lab.innerHTML = 'Data de nascimento <input type="date" data-v3nasc="1" min="' + min + '" max="' + max + '" value="' + v + '"><small>' + (n ? "Em janeiro de " + INICIO.ano + " terá " + c.idade + " anos." : "Opcional: escolha o dia exato (a idade se ajusta sozinha).") + "</small>";
    var alvo = sel_.closest("label"); (alvo && alvo.parentNode && alvo.parentNode.classList.contains("grid2") ? alvo.parentNode : alvo).insertAdjacentElement("afterend", lab);
  }
  document.addEventListener("change", function (e) {
    var t = e.target; if (!t || !t.getAttribute) return;
    if (t.getAttribute("data-k") === "idade" && t.getAttribute("data-i") === "cfg") { try { S.cfg.v3nasc = null; } catch (err) {} return; }
    if (!t.getAttribute("data-v3nasc")) return;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t.value || "");
    try {
      if (!m) S.cfg.v3nasc = null;
      else {
        var n = { ano: +m[1], mes: +m[2], dia: +m[3] }, id = idadeEm(n, INICIO);
        if (id < 18 || id > 90) { toast_("A idade precisa ficar entre 18 e 90 anos.", "err"); }
        else { S.cfg.v3nasc = n; S.cfg.idade = id; }
      }
      render();
    } catch (err) {}
  });
  function aplicarNasc(j) {
    if (j._v3nasc) return; j._v3nasc = true;
    var n = ok(function () { return S.cfg && S.cfg.v3nasc; }, null); if (!n) return;
    j.nascimento = { dia: n.dia, mes: n.mes, ano: n.ano };
    var d = dataJ(); j.idade = idadeEm(n, { ano: d.ano, mes: d.mes, dia: 1 });
  }

  /* ---------------------------------------------------------------- no jogo */
  function mesIdx() { var d = dataJ(); return d.ano * 12 + d.mes - 1; }
  function estado() { var j = ok(function () { return J(); }, null); if (!j) return null; return j.formacao3 || null; }
  function nomeItem(it) { return it.nivel === "grad" ? it.curso : (it.nivel === "pos" ? "Pós-graduação em " : it.nivel === "mest" ? "Mestrado em " : "Doutorado em ") + it.area; }
  function texto(f) {
    var ok_ = f.itens.filter(function (x) { return x.status === "concluido"; }), cur = f.itens.filter(function (x) { return x.status === "cursando"; });
    if (!f.itens.length) return "Ensino médio completo";
    var t = ok_.map(function (x) { return (x.nivel === "grad" ? "Bacharelado em " + x.curso : nomeItem(x)) + " — " + x.inst + (x.ano ? " (" + x.ano + ")" : ""); }).join("; ");
    if (cur.length) t += (t ? "; " : "") + cur.map(function (x) { return (x.nivel === "grad" ? x.curso : nomeItem(x)) + " — " + x.inst + " (em curso)"; }).join("; ");
    return t;
  }
  function aplicarTexto(j, f) { j.formacao = texto(f); }
  function criarDoSetup(j) {
    var c = ok(function () { return S.cfg.v3form; }, null);
    var f = { itens: [] }, idade = j.idade || 32, ano = dataJ().ano, m = mesIdx();
    if (c && c.grad && c.grad.curso) {
      validar(c, idade);
      var dg = durGrad(c.grad.curso);
      var push = function (nivel, o, dur) {
        if (!o) return;
        var nome = nivel === "grad" ? o.curso : o.area; if (!nome) return;
        var it = { nivel: nivel, curso: nivel === "grad" ? o.curso : null, area: nivel === "grad" ? null : o.area, inst: o.inst || "USP", status: o.status };
        if (o.status === "concluido") {
          var anosAtras = nivel === "grad" ? idade - (18 + dg) : nivel === "dout" ? idade - (18 + dg + DUR.mest + DUR.dout) : idade - (18 + dg + dur);
          it.ano = ano - Math.max(0, Math.min(anosAtras, 8));
        } else {
          var feitos = nivel === "grad" ? clamp(idade - 18, 0, dur - 1) : 0;
          it.fimIdx = m + Math.max(6, Math.round((dur - feitos) * 12));
          it.inicioIdx = m - feitos * 12;
        }
        f.itens.push(it);
      };
      push("grad", c.grad, dg); push("pos", c.pos, DUR.pos); push("mest", c.mest, DUR.mest); push("dout", c.dout, DUR.dout);
      f.itens.filter(function (x) { return x.status === "concluido"; }).forEach(function (x) { bonus(j, x.nivel, 0.5); });
    }
    j.formacao3 = f;
    if (f.itens.length) aplicarTexto(j, f);
  }
  function bonus(j, nivel, mult) {
    var b = BONUS[nivel] || {}; Object.keys(b).forEach(function (k) { if (j.atributos && typeof j.atributos[k] === "number") j.atributos[k] = clamp(j.atributos[k] + Math.round(b[k] * (mult || 1)), 0, 100); });
  }
  F3.mensal = function () {
    var j = ok(function () { return J(); }, null); if (!j) return;
    var f = j.formacao3; if (!f) return;
    var m = mesIdx();
    f.itens.forEach(function (it) {
      if (it.status !== "cursando") return;
      var mens = PRIVADA[it.inst] || 0;
      if (mens) { var pago = ok(function () { return gastar(mens * (it.nivel === "grad" ? 1 : 1.4), 1); }, true); if (pago === false) { it.status = "trancado"; toast_("Sem dinheiro para a mensalidade: você trancou " + nomeItem(it) + ".", "err"); aplicarTexto(j, f); return; } }
      if (m >= it.fimIdx) {
        it.status = "concluido"; it.ano = dataJ().ano; bonus(j, it.nivel, 1);
        var tit = it.nivel === "dout" ? "Dr(a). " : "";
        ok(function () { manchete(tit + j.nome + " conclui " + (it.nivel === "grad" ? "a graduação em " + it.curso : nomeItem(it).charAt(0).toLowerCase() + nomeItem(it).slice(1)) + " pela " + it.inst + ".", "agenda"); });
        ok(function () { diario("Formatura: " + nomeItem(it) + " (" + it.inst + ")."); });
        toast_("Formatura! Você concluiu " + nomeItem(it) + ".", "ok");
        aplicarTexto(j, f);
      }
    });
  };
  function iniciar(nivel, area, inst) {
    var j = J(); j.formacao3 = j.formacao3 || { itens: [] }; var f = j.formacao3;
    var tem = function (n, st) { return f.itens.some(function (x) { return x.nivel === n && (!st || x.status === st); }); };
    if (f.itens.some(function (x) { return x.status === "cursando"; })) { toast_("Termine o curso atual antes de começar outro.", "err"); return; }
    if (nivel !== "grad" && !tem("grad", "concluido")) { toast_("Precisa da graduação concluída.", "err"); return; }
    if (nivel === "dout" && !tem("mest", "concluido")) { toast_("Doutorado exige mestrado concluído.", "err"); return; }
    if (!area) { toast_("Escolha o curso.", "err"); return; }
    if (typeof gastarEnergia === "function" && !gastarEnergia(10)) return;
    var dur = nivel === "grad" ? durGrad(area) : DUR[nivel];
    f.itens.push({ nivel: nivel, curso: nivel === "grad" ? area : null, area: nivel === "grad" ? null : area, inst: inst || "USP", status: "cursando", inicioIdx: mesIdx(), fimIdx: mesIdx() + dur * 12 });
    aplicarTexto(j, f);
    ok(function () { manchete(j.nome + " começa " + (nivel === "grad" ? "a faculdade de " + area : TITULO[nivel].toLowerCase() + " em " + area) + " na " + (inst || "USP") + ".", "agenda"); });
    toast_("Matrícula feita: " + (nivel === "grad" ? area : TITULO[nivel] + " em " + area) + " (" + dur + " anos).", "ok");
  }
  function cardPerfil() {
    var j = ok(function () { return J(); }, null); if (!j) return "";
    var f = j.formacao3 || { itens: [] }, m = mesIdx();
    var h = '<section class="card v3f-card"><h3>🎓 Formação acadêmica</h3>';
    if (!f.itens.length) h += '<p class="txt">Sem curso superior registrado.</p>';
    h += '<ul class="v3f-lista">' + f.itens.map(function (it) {
      var prog = it.status === "cursando" ? clamp(Math.round((m - (it.inicioIdx || m)) / Math.max(1, it.fimIdx - (it.inicioIdx || m)) * 100), 0, 99) : 100;
      var falta = it.status === "cursando" ? Math.max(0, it.fimIdx - m) : 0;
      return '<li class="' + it.status + '"><b>' + esc_(nomeItem(it)) + "</b><small>" + esc_(TITULO[it.nivel]) + " · " + esc_(it.inst) + " · " + (it.status === "concluido" ? "concluído" + (it.ano ? " em " + it.ano : "") : it.status === "trancado" ? "trancado" : "cursando, faltam " + falta + " meses" + (PRIVADA[it.inst] ? " · mensalidade R$ " + Math.round(PRIVADA[it.inst] * (it.nivel === "grad" ? 1 : 1.4)).toLocaleString("pt-BR") : "")) + "</small>" + (it.status === "cursando" ? '<div class="v3f-bar"><i style="width:' + prog + '%"></i></div>' : "") + "</li>";
    }).join("") + "</ul>";
    var cursando = f.itens.some(function (x) { return x.status === "cursando"; });
    if (!cursando) {
      var temG = f.itens.some(function (x) { return x.nivel === "grad" && x.status === "concluido"; }), temM = f.itens.some(function (x) { return x.nivel === "mest" && x.status === "concluido"; });
      var opts = [["grad", "Graduação"]].concat(temG ? [["pos", "Pós / MBA"], ["mest", "Mestrado"]] : []).concat(temM ? [["dout", "Doutorado"]] : []);
      var nv = ok(function () { return S.v3fNivel; }, "") || opts[opts.length > 1 ? 1 : 0][0];
      if (!opts.some(function (o) { return o[0] === nv; })) nv = opts[0][0];
      var lista = nv === "grad" ? CURSOS.map(function (c) { return c[0]; }) : POS.concat(CURSOS.map(function (c) { return c[0]; }));
      h += '<div class="v3f-novo"><b>Começar um curso</b><div class="row">' +
        '<select data-v3fj="nivel">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === nv ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select>" +
        '<select data-v3fj="area">' + lista.map(function (x) { return "<option>" + esc_(x) + "</option>"; }).join("") + "</select>" +
        '<select data-v3fj="inst">' + INST.map(function (x) { return "<option>" + esc_(x) + "</option>"; }).join("") + "</select>" +
        '<button type="button" class="b mini confirma" data-v3fgo="1">Matricular (−10 energia)</button></div><small>Instituições privadas cobram mensalidade do seu caixa pessoal. Ao se formar, você ganha atributos e a notícia sai no jornal.</small></div>';
    }
    return h + "</section>";
  }
  document.addEventListener("change", function (e) { var t = e.target; if (t && t.getAttribute && t.getAttribute("data-v3fj") === "nivel") { try { S.v3fNivel = t.value; render(); } catch (err) {} } });
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-v3fgo]"); if (!b) return;
    var box = b.closest(".v3f-novo"); var v = function (k) { var s = box.querySelector('[data-v3fj="' + k + '"]'); return s ? s.value : ""; };
    iniciar(v("nivel"), v("area"), v("inst")); try { render(); } catch (err) {}
  });


  function cardNasc() {
    var j = ok(function () { return J(); }, null); if (!j) return "";
    var n = ok(function () { return nasc(); }, j.nascimento) || { dia: 1, mes: 1, ano: 1990 };
    var MES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    var dias = ""; for (var i = 1; i <= 31; i++) dias += "<option" + (i === n.dia ? " selected" : "") + ">" + i + "</option>";
    return '<section class="card v3n-card"><h3>🎂 Aniversário</h3><p class="txt">Nascido(a) em <b>' + n.dia + " de " + MES[n.mes - 1] + " de " + n.ano + "</b> · " + j.idade + ' anos.</p><div class="row v3n-row"><select data-v3nd="dia">' + dias + '</select><select data-v3nd="mes">' + MES.map(function (m, k) { return '<option value="' + (k + 1) + '"' + (k + 1 === n.mes ? " selected" : "") + ">" + m + "</option>"; }).join("") + '</select><button type="button" class="b mini confirma" data-v3ngo="1">Salvar data</button></div><small>O ano é definido pela sua idade atual. Para escolher o ano, use a data de nascimento ao criar um personagem novo.</small></section>';
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-v3ngo]"); if (!b) return;
    var box = b.closest(".v3n-card"), g = function (k) { return +box.querySelector('[data-v3nd="' + k + '"]').value; };
    try {
      var j = J(), d = dataJ(), dia = g("dia"), mes = g("mes");
      var lim_ = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mes - 1]; if (dia > lim_) dia = lim_;
      j.nascimento = { dia: dia, mes: mes, ano: d.ano - j.idade - (mes > d.mes ? 1 : 0) };
      toast_("Data de nascimento salva.", "ok"); render();
    } catch (err) {}
  });

  /* ---------------------------------------------------------------- Wiki */
  function wiki() {
    var j = ok(function () { return J(); }, null); var f = j && j.formacao3; if (!f || !f.itens.length) return;
    var h2 = document.getElementById("wiki-origens"); if (!h2 || h2.parentNode.querySelector(".v3f-wiki")) return;
    var ps = h2.parentNode.querySelectorAll("p"), alvo = null;
    for (var i = 0; i < ps.length; i++) if (/âmbito acadêmico|formação compreende/.test(ps[i].textContent)) { alvo = ps[i]; break; }
    var ul = '<ul class="v3f-wiki" style="margin:0 0 14px 18px;padding:0">' + f.itens.map(function (it) {
      return "<li style=\"margin:3px 0\"><b>" + esc_(TITULO[it.nivel]) + ":</b> " + esc_(it.curso || it.area) + ", " + esc_(it.inst) + " — " + (it.status === "concluido" ? "concluído" + (it.ano ? " em " + it.ano : "") : it.status === "trancado" ? "trancado" : "em andamento") + "</li>";
    }).join("") + "</ul>";
    if (alvo) alvo.insertAdjacentHTML("afterend", ul);
  }

  /* ---------------------------------------------------------------- votos na Wiki */
  function consertarEleicoes() {
    var c = ok(function () { return CAR(); }, null); if (!c || !c.eleicoes) return;
    c.eleicoes.forEach(function (e) {
      var t = String(e.texto || "");
      if (e.segundo_turno && /^(DEPE|DEPF|VER|SEN)$|Deputad|Vereador|Senad/i.test(String(e.cargo || "")) && !/2º turno|segundo turno/i.test(t)) e.segundo_turno = false;
      if (e._v3) return;
      var mv = t.match(/(?:você teve|com|obteve)\s+([\d.]{3,})\s+votos/i) || t.match(/([\d.]{4,})\s+votos/);
      if ((e.votos == null || e.votos === 0) && mv) e.votos = +mv[1].replace(/\./g, "");
      if (e.pct && /barreira de\s*\d+%/.test(t) && !new RegExp("você[^.]*" + String(e.pct).replace(".", "\\.") + "%").test(t)) e.pct = null;
      var mp = t.match(/você[^.]*?\(([\d.,]+)%\)|você[^.]*?com\s+([\d.,]+)%/i);
      if (!e.pct && mp) e.pct = mp[1] || mp[2];
      e._v3 = true;
    });
  }
  function hookApuracao() {
    ["apurarEleicao", "apurarSegundoTurno"].forEach(function (nm) {
      var o = window[nm]; if (typeof o !== "function" || o.__v3f) return;
      var n = function () { var r = o.apply(this, arguments); try { consertarEleicoes(); } catch (e) {} return r; };
      for (var k in o) { try { n[k] = o[k]; } catch (e) {} } n.__v3f = true; window[nm] = n;
      try { if (nm === "apurarEleicao") apurarEleicao = n; else apurarSegundoTurno = n; } catch (e) {}
    });
  }

  /* ---------------------------------------------------------------- instalação */
  function aposRender() {
    try {
      var jogo = ok(function () { return !!gameState; }, false);
      if (!jogo) { nascSetup(); setupPosRender(); return; }
      var j = J();
      aplicarNasc(j);
      if (!j.formacao3) criarDoSetup(j);
      consertarEleicoes();
      if (S.tab === "eu") {
        var main = document.getElementById("main");
        if (main && !main.querySelector(".v3f-card")) { var d = document.createElement("div"); d.innerHTML = cardPerfil(); var w = main.querySelector(".wiki-wrap"); if (w) w.insertAdjacentElement("afterend", d.firstElementChild); else main.appendChild(d.firstElementChild); }
        if (main && !main.querySelector(".v3n-card")) { var d2 = document.createElement("div"); d2.innerHTML = cardNasc(); var c3 = main.querySelector(".v3f-card"); if (c3) c3.insertAdjacentElement("afterend", d2.firstElementChild); else main.appendChild(d2.firstElementChild); }
        wiki();
      }
    } catch (e) { console.warn("formacao", e); }
  }
  function instalar() {
    hookApuracao();
    if (typeof window.render === "function" && !window.render.__v3form) {
      var o = window.render;
      var n = function () { var r = o.apply(this, arguments); aposRender(); return r; };
      for (var k in o) { try { n[k] = o[k]; } catch (e) {} }
      n.__v3form = true; window.render = n; try { render = n; } catch (e) {}
    }
    if (typeof window.avancarMes === "function" && !window.avancarMes.__v3form) {
      var a = window.avancarMes, ult = null;
      var na = function () { var r = a.apply(this, arguments); try { var mm = mesIdx(); if (ult !== mm) { ult = mm; F3.mensal(); } } catch (e) {} return r; };
      for (var k2 in a) { try { na[k2] = a[k2]; } catch (e) {} } na.__v3form = true; window.avancarMes = na; try { avancarMes = na; } catch (e) {}
    }
  }
  instalar();
  document.addEventListener("DOMContentLoaded", function () { setTimeout(instalar, 0); });
  window.addEventListener("load", function () { setTimeout(instalar, 0); });
})();
