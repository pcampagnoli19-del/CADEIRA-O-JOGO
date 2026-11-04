/* =============================================================================
   CADEIRA v3 — Noite eleitoral na TV (gerado por tools/gerar_tv.py)
   Camada de APRESENTAÇÃO por cima da apuração existente (#apurMapa):
   - não recalcula nada: lê window._apMapa (mesmo relógio AP.pct, mesmas
     listas nacionais/estaduais/municipais, mesmos eleitos e parciais);
   - a apuração clássica continua rodando por baixo e é quem grava o resultado;
   - o jogador escolhe a emissora (TV Globo, CNN Brasil, Band); cada uma tem
     estúdio, equipe, cores, organização e estilo próprios;
   - o programa avança em momentos (abertura → candidatos → primeiros
     resultados → comparação → mapa → comentaristas → estados/municípios →
     confirmação e encerramento) conforme a porcentagem de urnas apuradas.
   Novas emissoras: acrescente em CANAIS. Novos momentos: em ROTEIRO.
   ============================================================================= */
(function () {
  "use strict";
  if (window.V3TV) return;
  var IMG = __IMAGENS__;
  var TV = (window.V3TV = {});
  function esc_(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ok(f, d) { try { var v = f(); return v === undefined ? d : v; } catch (e) { return d; } }
  function A() { return window._apMapa; }
  function fmtV(n) { return Math.round(n || 0).toLocaleString("pt-BR"); }
  function fmtP(x) { return (x || 0).toFixed(2).replace(".", ","); }
  function hash(s) { var h = 0; s = String(s); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
  function img(k) { return IMG[k] || ok(function () { return window.V3DEB.IMG[k]; }, "") || ok(function () { return window.V3MARCAS.logo(k); }, ""); }
  function npcPorNome(n) { return ok(function () { return bancoDeNPCs.find(function (x) { return x.nome === n; }); }, null); }
  function fotoNome(n) { var x = npcPorNome(n); return x ? ok(function () { return obterFotoPolitico(x); }, "") : ""; }
  function limpaNome(n) { return String(n || "").replace(/\s*\((vice|suplentes?):.*$/i, "").trim(); }
  function vice(n) { var m = /\((vice|suplentes?):\s*([^)]*)\)/i.exec(n || ""); return m ? (m[1].toLowerCase() === "vice" ? "vice: " : "suplentes: ") + m[2] : ""; }

  /* ================================================================ emissoras */
  // equipe: só personagens que já existem no jogo (NPCs/figuras ou mediadores dos debates);
  // "img" aponta para imagem já embutida; sem img, usa a foto do banco de políticos/figuras.
  var CANAIS = {
    globo: { nome: "TV Globo", programa: "ELEIÇÕES 2026 • APURAÇÃO AO VIVO", logo: "logo_globo", estudio: "estudio_globo", tema: "globo",
      ancoras: [{ nome: "César Tralli", img: "med_cesar_tralli", papel: "apresentador" }, { nome: "Renata Lo Prete", img: "med_renata_lo_prete", papel: "apresentadora" }],
      abertura: { nome: "William Bonner", papel: "abertura da cobertura" },
      comentaristas: [{ nome: "Andréia Sadi", papel: "bastidores da política" }, { nome: "Merval Pereira", papel: "comentarista político" }, { nome: "Miriam Leitão", papel: "economia" }, { nome: "Vera Magalhães", papel: "análise política" }, { nome: "Guga Chacra", papel: "repercussão internacional" }] },
    cnn: { nome: "CNN Brasil", programa: "CNN ELEIÇÕES • CENTRAL DE APURAÇÃO", logo: "cnn", estudio: "estudio_cnn", tema: "cnn",
      ancoras: [{ nome: "William Waack", papel: "apresentador" }],
      comentaristas: [{ nome: "Gabriela Prioli", papel: "comentarista" }, { nome: "Caio Coppola", papel: "comentarista" }, { nome: "Alexandre Garcia", papel: "analista político" }] },
    band: { nome: "Band", programa: "BAND ELEIÇÕES • APURAÇÃO", logo: "logo_band", estudio: "estudio_band", tema: "band",
      ancoras: [{ nome: "Adriana Araújo", img: "med_adriana_araujo", papel: "apresentadora" }, { nome: "Eduardo Oinegue", img: "med_eduardo_oinegue", papel: "apresentador" }],
      comentaristas: [{ nome: "Reinaldo Azevedo", papel: "comentarista da BandNews" }] }
  };
  TV.CANAIS = CANAIS;

  // Roteiro: momento por faixa de urnas apuradas (%)
  var ROTEIRO = [
    { ate: 3, id: "abertura", t: "Abertura" }, { ate: 12, id: "candidatos", t: "Os candidatos" }, { ate: 32, id: "primeiros", t: "Primeiros resultados" },
    { ate: 50, id: "comparacao", t: "Cabeça a cabeça" }, { ate: 66, id: "mapa", t: "Mapa da apuração" }, { ate: 80, id: "analise", t: "Análise" },
    { ate: 99.9, id: "regioes", t: "Pelo país" }, { ate: 101, id: "final", t: "Resultado" }
  ];

  /* ================================================================ dados (somente leitura) */
  function municipal() { return ok(function () { return tipoEleicao(dt().ano) === "MUNICIPAL"; }, false); }
  function pct() { return ok(function () { return A().AP.pct; }, 0) || 0; }
  function turno2() { return ok(function () { return M().eleicao.noite.turno === 2; }, false); }
  // Cada corrida devolve {titulo, sub, lista (parcial), f, status, run, vagas}
  function corridaPres() {
    var N = A().nac(), lista0 = N.pres || []; if (!lista0.length) return null;
    if (A().presEncerrado()) { var b = A().basePrimeiroPres(N); return { id: "pres", titulo: "Presidente da República", sub: "Brasil", lista: b, f: 1, fim: true, run: false, eleito1: true }; }
    var f = pct() / 100, l = A().parcialCands(lista0, f);
    var run = (N.presRodada === "2" && pct() < 100) || (lista0.length > 1 && (lista0[0].share || 0) <= 50);
    return { id: "pres", titulo: "Presidente da República", sub: "Brasil", lista: l, f: f, fim: f >= 1, run: run };
  }
  function corridaGov(uf) {
    var p = A().painel(uf); if (!p || !(p.gov || []).length) return null;
    if (A().govEncerradoUF(uf)) return { id: "gov", titulo: "Governador", sub: A().UF_NOME[uf] || uf, lista: A().basePrimeiroGov(p), f: 1, fim: true, run: false, eleito1: true };
    var f = A().fracUF(uf), l = A().parcialCands(p.gov, f);
    var run = (p.rodadaGov === "2" && f < 1) || (p.gov.length > 1 && (p.gov[0].share || 0) <= 50);
    return { id: "gov", titulo: "Governador", sub: A().UF_NOME[uf] || uf, lista: l, f: f, fim: f >= 1, run: run };
  }
  function corridaSen(uf) {
    var p = A().painel(uf); if (!p || !(p.sen || []).length) return null;
    var f = A().fracUF(uf); return { id: "sen", titulo: "Senado", sub: A().UF_NOME[uf] || uf, lista: A().parcialCands(p.sen, f), f: f, fim: f >= 1, run: false, vagas: p.vagas || 1 };
  }
  function corridaPref() {
    var N = A().nac(), l0 = N.pref || []; if (!l0.length) return null;
    var f = pct() / 100, l = A().parcialCands(l0, f);
    var run = (N.prefRodada === "2" && f < 1) || (l0.length > 1 && (l0[0].share || 0) <= 50);
    return { id: "pref", titulo: "Prefeito de Mauá", sub: "Mauá", lista: l, f: f, fim: f >= 1, run: run };
  }
  function principal() { return municipal() ? corridaPref() : (corridaPres() || corridaGov("SP")); }
  function minhaDisputa() {
    return ok(function () { var d = dt(); return (CAR().eleicoes || []).filter(function (e) { return e.ano === d.ano; }).slice(-1)[0] || null; }, null);
  }
  function statusDe(c) {
    if (!c) return { txt: "", cls: "" };
    if (c.fim || c.f >= 1) {
      if (c.vagas) return { txt: "ELEITOS", cls: "eleito" };
      if (c.run && c.lista.length > 1) return { txt: "2º TURNO", cls: "segundo" };
      return { txt: "ELEITO", cls: "eleito" };
    }
    if (c.f > 0.9 && c.lista[0] && (c.lista[0].share || 0) > 50 && !c.run) return { txt: "TENDÊNCIA DE VITÓRIA", cls: "quase" };
    return { txt: "EM APURAÇÃO", cls: "apurando" };
  }
  var GRADE = [["RR", 0, 2], ["AP", 0, 4], ["AM", 1, 1], ["PA", 1, 3], ["MA", 1, 4], ["CE", 1, 5], ["RN", 1, 6], ["AC", 2, 0], ["RO", 2, 1], ["TO", 2, 3], ["PI", 2, 4], ["PE", 2, 5], ["PB", 2, 6],
    ["MT", 3, 2], ["GO", 3, 3], ["BA", 3, 4], ["SE", 3, 5], ["AL", 3, 6], ["MS", 4, 2], ["DF", 4, 3], ["MG", 4, 4], ["ES", 4, 5], ["SP", 5, 3], ["RJ", 5, 4], ["PR", 6, 2], ["SC", 7, 2], ["RS", 8, 2]];

  /* ================================================================ estado da sessão */
  var st = { canal: null, aberto: false, oculto: false, uf: null, chave: null, ultSeg: null, quem: 0, timer: 0 };
  function pref() { try { return localStorage.getItem("cadeira_tv_canal") || ""; } catch (e) { return ""; } }

  /* ================================================================ textos dos momentos (a partir dos dados) */
  function lider(c) { return c && c.lista[0]; }
  function seg(c) { return c && c.lista[1]; }
  function falaDoMomento(id, c, ch) {
    var a = lider(c), b = seg(c), p = Math.round(pct()), turnoTxt = turno2() ? "segundo turno" : "primeiro turno";
    var j = ok(function () { return J().nome; }, "");
    if (!c) return "Boa noite. Estamos aguardando os primeiros boletins do Tribunal Superior Eleitoral.";
    switch (id) {
      case "abertura": return "Boa noite. Começa agora a cobertura da " + ch.nome + " da apuração do " + turnoTxt + ". Os primeiros boletins de urna começam a chegar ao TSE e vamos acompanhar voto a voto a disputa por " + c.titulo.toLowerCase() + (c.sub && c.id !== "pres" ? " em " + c.sub : "") + ".";
      case "candidatos": return c.lista.length + " candidatos disputam " + c.titulo.toLowerCase() + ". Os principais nomes são " + c.lista.slice(0, 3).map(function (x) { return limpaNome(x.nome) + " (" + x.partido + ")"; }).join(", ") + ".";
      case "primeiros": return "Com " + p + "% das urnas apuradas, " + limpaNome(a.nome) + " aparece na frente, com " + fmtP(a.share) + "% dos votos válidos" + (b ? ", seguido de " + limpaNome(b.nome) + ", com " + fmtP(b.share) + "%." : ".");
      case "comparacao": return b ? "A diferença entre " + limpaNome(a.nome) + " e " + limpaNome(b.nome) + " é de " + fmtP(a.share - b.share) + " pontos, ou " + fmtV(a.votos - b.votos) + " votos, com " + p + "% apurado." : limpaNome(a.nome) + " lidera com folga.";
      case "mapa": var n = contaUFs(c); return n ? limpaNome(a.nome) + " lidera em " + n + " das 27 unidades da federação neste momento. Toque em um estado no mapa para ver a votação local." : "Veja no mapa a apuração nos estados.";
      case "analise": return c.run ? "Pelos números, a tendência é de segundo turno: nenhum candidato passa de 50% dos válidos." : ((a.share || 0) > 50 ? limpaNome(a.nome) + " tem mais da metade dos votos válidos e caminha para vencer já no " + turnoTxt + "." : "A disputa segue aberta.");
      case "regioes": return municipal() ? "Enquanto isso, a Câmara de Mauá começa a ganhar forma com os votos para vereador." : "Vamos aos estados: a apuração dos governos estaduais e do Senado avança em ritmos diferentes pelo país.";
      case "final":
        var s = statusDe(c);
        if (s.cls === "segundo") return "Está confirmado: haverá segundo turno entre " + limpaNome(a.nome) + " e " + limpaNome(b.nome) + ".";
        return "Está confirmado: " + limpaNome(a.nome) + " (" + a.partido + ") é " + (c.vagas ? "eleito" : "eleito " + (c.titulo.indexOf("Presidente") >= 0 ? "presidente da República" : c.titulo.toLowerCase())) + ", com " + fmtP(a.share) + "% dos votos válidos." + (j ? " Daqui a pouco, a situação de " + j + "." : "");
    }
    return "";
  }
  function comentario(id, c, ch, k) {
    var a = lider(c), b = seg(c); if (!a) return "";
    var nome = ch.comentaristas[k % ch.comentaristas.length];
    var linhas = {
      comparacao: b ? "Atenção para a distância: " + fmtP(a.share - b.share) + " pontos ainda podem mudar conforme entram os votos das regiões mais populosas." : "",
      mapa: "O desenho do mapa mostra onde cada campanha foi mais forte. Os estados que apuram mais tarde costumam mexer no placar.",
      analise: c.run ? "Para o segundo turno, as alianças com quem ficou de fora vão decidir. " + limpaNome(a.nome) + " sai na frente, mas a eleição recomeça do zero." : limpaNome(a.nome) + " consolidou a vantagem. A oposição terá de se reorganizar.",
      regioes: "Nas disputas estaduais, há surpresas: candidatos que vinham atrás nas pesquisas aparecem competitivos.",
      final: "É um resultado que vai pautar a política nos próximos anos. Os primeiros discursos devem sair em instantes."
    };
    return linhas[id] ? { quem: nome, txt: linhas[id] } : null;
  }
  function contaUFs(c) {
    if (!c || c.id !== "pres") return 0; var a = lider(c); if (!a) return 0;
    return GRADE.filter(function (g) { var l = ok(function () { return A().lider("pres", g[0]); }, null); return l && l.id === a.id; }).length;
  }

  /* ================================================================ peças visuais */
  function fotoCand(c) { var f = ok(function () { var n = c.id && c.id !== "JOGADOR" ? bancoDeNPCs.find(function (x) { return x.id === c.id; }) : null; return n ? obterFotoPolitico(n) : (c.jogador ? (J().foto || "") : ""); }, ""); return f ? '<img src="' + esc_(f) + '" alt="">' : '<span class="tv-ini">' + esc_(limpaNome(c.nome).charAt(0)) + "</span>"; }
  function barras(c, max) {
    var s = statusDe(c), top = c.lista.slice(0, max || 4), vencedores = c.vagas ? c.vagas : (s.cls === "segundo" ? 2 : 1);
    return '<div class="tv-cands">' + top.map(function (x, i) {
      var cor = ok(function () { return A().corDe(x.partido, i); }, "#64748b"), marca = (c.fim && i < vencedores) ? '<em class="tv-selo ' + s.cls + '">' + (s.cls === "segundo" ? "2º TURNO" : "ELEITO") + "</em>" : "";
      return '<div class="tv-cand' + (x.jogador ? " eu" : "") + '"><div class="tv-cfoto" style="border-color:' + cor + '">' + fotoCand(x) + '</div><div class="tv-cinfo"><b>' + esc_(limpaNome(x.nome)) + "</b> " + marca + "<small>" + esc_(x.partido) + (vice(x.nome) ? " • " + esc_(vice(x.nome)) : "") + '</small><div class="tv-barra"><i style="width:' + Math.min(100, x.share || 0) + "%;background:" + cor + '"></i></div></div><div class="tv-cnum"><b>' + fmtP(x.share) + '%</b><small>' + fmtV(x.votos) + " votos</small></div></div>";
    }).join("") + "</div>";
  }
  function urnas(c) { var f = c ? c.f : pct() / 100; return '<div class="tv-urnas"><b>' + fmtP(f * 100) + '%</b><small>urnas apuradas' + (c && c.sub ? " • " + esc_(c.sub) : "") + '</small><div class="tv-urnas-b"><i style="width:' + Math.min(100, f * 100) + '%"></i></div></div>'; }
  function mapa(c) {
    if (municipal()) return '<p class="tv-nota">Eleição municipal: a apuração é de Mauá.</p>';
    var h = '<div class="tv-mapa">';
    GRADE.forEach(function (g) {
      var uf = g[0], l = ok(function () { return A().lider("pres", uf); }, null), f = ok(function () { return A().fracUF(uf); }, 0);
      var cor = l ? ok(function () { return A().corDe(l.partido, 0); }, "#475569") : "#334155";
      h += '<button type="button" class="tv-uf' + (st.uf === uf ? " on" : "") + '" data-tv="uf" data-id="' + uf + '" style="grid-row:' + (g[1] + 1) + ";grid-column:" + (g[2] + 1) + ";background:" + cor + ";opacity:" + (0.35 + 0.65 * f).toFixed(2) + '" title="' + esc_(A().UF_NOME[uf] || uf) + '">' + uf + "</button>";
    });
    h += "</div>";
    if (st.uf) {
      var loc = ok(function () { return A().parcialCands(A().presLocal(st.uf), A().fracUF(st.uf)); }, []), g2 = corridaGov(st.uf);
      h += '<div class="tv-ufdet"><b>' + esc_(A().UF_NOME[st.uf] || st.uf) + "</b> • " + fmtP(A().fracUF(st.uf) * 100) + "% apurado<br>Presidente: " + loc.slice(0, 2).map(function (x) { return esc_(limpaNome(x.nome)) + " " + fmtP(x.share) + "%"; }).join(" × ") +
        (g2 && g2.lista[0] ? "<br>Governo: " + esc_(limpaNome(g2.lista[0].nome)) + " " + fmtP(g2.lista[0].share) + "% " + statusDe(g2).txt.toLowerCase() : "") + "</div>";
    }
    return h;
  }
  function regioes() {
    if (municipal()) {
      var ver = ok(function () { return A().eleitosDe("VER"); }, []);
      if (!ver.length || pct() < 100) return '<p class="tv-nota">Os vereadores eleitos aparecem ao fim da apuração.</p>';
      return '<div class="tv-lista">' + ver.slice(0, 12).map(function (x) { return "<span" + (x.jogador ? ' class="eu"' : "") + ">" + esc_(x.nome) + " <small>" + esc_(x.partido) + " • " + fmtV(x.votos) + "</small></span>"; }).join("") + "</div>";
    }
    var ufs = ["SP", "MG", "RJ", "BA", "RS", "PR", "PE", "CE"];
    return '<div class="tv-estados">' + ufs.map(function (uf) {
      var g = corridaGov(uf); if (!g || !g.lista[0]) return "";
      var s = statusDe(g);
      return '<div class="tv-est"><b>' + uf + "</b><span>" + esc_(limpaNome(g.lista[0].nome)) + " <small>" + esc_(g.lista[0].partido) + " " + fmtP(g.lista[0].share) + '%</small></span><em class="tv-selo ' + s.cls + '">' + s.txt + "</em></div>";
    }).join("") + "</div>";
  }
  function suaDisputa() {
    var e = minhaDisputa(); if (!e) return "";
    if (pct() < 100) return '<div class="tv-sua"><b>Sua disputa</b><small>' + esc_(e.cargo) + " • resultado ao fim da apuração</small></div>";
    return '<div class="tv-sua ' + (/Eleit/.test(e.resultado) ? "ok" : "nao") + '"><b>Sua disputa: ' + esc_(e.resultado) + "</b><small>" + esc_(e.cargo) + (e.votos ? " • " + fmtV(e.votos) + " votos" : "") + "</small></div>";
  }

  /* ================================================================ tela */
  function pessoa(p) {
    var f = p.img ? img(p.img) : fotoNome(p.nome);
    return { nome: p.nome, papel: p.papel, foto: f };
  }
  function ticker(c) {
    var it = [];
    if (!municipal()) ["MG", "RJ", "BA", "RS", "PR", "PE"].forEach(function (uf) { var g = corridaGov(uf); if (g && g.lista[0]) it.push("GOV " + uf + ": " + limpaNome(g.lista[0].nome) + " " + fmtP(g.lista[0].share) + "%"); });
    var s = corridaSen("SP"); if (s && s.lista[0]) it.push("SENADO SP: " + s.lista.slice(0, s.vagas).map(function (x) { return limpaNome(x.nome) + " " + fmtP(x.share) + "%"; }).join(" • "));
    var e = minhaDisputa(); if (e && pct() >= 100) it.push(e.cargo.toUpperCase() + ": " + e.resultado);
    it.push("ATUALIZADO ÀS " + ok(function () { return A().horaApuracao(); }, ""));
    return it.join("   •   ");
  }
  function telaCanal() {
    var ch = CANAIS[st.canal], c = principal(), p = pct();
    var momento = ROTEIRO.filter(function (r) { return p < r.ate; })[0] || ROTEIRO[ROTEIRO.length - 1];
    if (momento.id !== st.ultSeg) { st.ultSeg = momento.id; st.quem++; }
    // quem fala: âncoras se revezam; comentarista entra nos momentos de análise
    var anc = ch.ancoras.map(pessoa), fala = { p: anc[st.quem % anc.length], txt: falaDoMomento(momento.id, c, ch) };
    if (momento.id === "abertura" && ch.abertura) fala.p = pessoa(ch.abertura);
    var com = (["comparacao", "mapa", "analise", "regioes", "final"].indexOf(momento.id) >= 0) ? comentario(momento.id, c, ch, st.quem) : null;
    var painel = "";
    if (!c) painel = '<p class="tv-nota">Aguardando os dados da apuração.</p>';
    else if (momento.id === "abertura" || momento.id === "candidatos") painel = '<h3>' + esc_(c.titulo) + "</h3>" + barras(c, 6);
    else if (momento.id === "mapa") painel = '<h3>Mapa da apuração • Presidente</h3>' + mapa(c);
    else if (momento.id === "regioes") painel = "<h3>" + (municipal() ? "Câmara Municipal de Mauá" : "Governos estaduais") + "</h3>" + regioes();
    else if (momento.id === "comparacao" && seg(c)) painel = "<h3>" + esc_(c.titulo) + "</h3>" + barras(c, 2) + '<p class="tv-dif">Diferença: <b>' + fmtV(lider(c).votos - seg(c).votos) + " votos</b> (" + fmtP(lider(c).share - seg(c).share) + " p.p.)</p>";
    else painel = "<h3>" + esc_(c.titulo) + '</h3>' + barras(c, 4) + '<p class="tv-st"><em class="tv-selo ' + statusDe(c).cls + '">' + statusDe(c).txt + "</em></p>";
    var h = '<div class="tv tv-' + ch.tema + '" style="--bg:url(' + img(ch.estudio) + ')"><div class="tv-fundo"></div><div class="tv-tela">';
    h += '<header class="tv-top"><img class="tv-logo" src="' + img(ch.logo) + '" alt=""><div class="tv-prog"><b>' + esc_(ch.programa) + "</b><small>" + (turno2() ? "2º turno" : "1º turno") + " • " + esc_(ok(function () { return A().horaApuracao(); }, "")) + '</small></div><span class="tv-vivo">● AO VIVO</span>' + urnas(c) + "</header>";
    h += '<div class="tv-meio"><section class="tv-telao"><div class="tv-mom">' + esc_(momento.t) + "</div>" + painel + suaDisputa() + "</section>";
    h += '<aside class="tv-bancada">' + quemHtml(fala) + (com ? quemHtml({ p: pessoa(com.quem), txt: com.txt, coment: true }) : "") + "</aside></div>";
    h += '<div class="tv-ticker"><span class="tv-tk-rot">' + (st.canal === "cnn" ? "ÚLTIMAS" : "APURAÇÃO") + '</span><div class="tv-tk"><span>' + esc_(ticker(c)) + "</span></div></div>";
    var AP_ = ok(function () { return A().AP; }, {});
    h += '<nav class="tv-ctrl"><button type="button" data-tv="play">' + (AP_.play ? "⏸ Pausar" : "▶ Continuar") + "</button>" + [1, 2, 4].map(function (v) { return '<button type="button" data-tv="vel" data-id="' + v + '" class="' + (AP_.vel === v ? "on" : "") + '">' + v + "x</button>"; }).join("") +
      '<button type="button" data-tv="trocar">📺 Trocar canal</button><button type="button" data-tv="classica">Tela clássica</button>' + (p >= 100 ? '<button type="button" class="fim" data-tv="encerrar">Encerrar apuração</button>' : "") + "</nav>";
    return h + "</div></div>";
  }
  function quemHtml(f) {
    var p = f.p; if (!p) return "";
    var foto = p.foto ? '<img src="' + esc_(p.foto) + '" alt="">' : '<span class="tv-ini">' + esc_(p.nome.charAt(0)) + "</span>";
    return '<div class="tv-quem' + (f.coment ? " coment" : "") + '"><div class="tv-gc">' + foto + "<div><b>" + esc_(p.nome) + "</b><small>" + esc_(p.papel) + '</small></div></div><p>' + esc_(f.txt) + "</p></div>";
  }
  function telaEscolha() {
    var ult = pref();
    return '<div class="tv-esc"><h2>Noite eleitoral</h2><p>Escolha por onde acompanhar a apuração. Os números são os mesmos em todos os canais.</p><div class="tv-esc-grade">' +
      Object.keys(CANAIS).map(function (k) { var ch = CANAIS[k]; return '<button type="button" class="tv-esc-c tv-' + ch.tema + (ult === k ? " ult" : "") + '" data-tv="canal" data-id="' + k + '" style="--bg:url(' + img(ch.estudio) + ')"><img src="' + img(ch.logo) + '" alt=""><b>' + esc_(ch.nome) + "</b><small>" + esc_(ch.ancoras.map(function (a) { return a.nome; }).join(" e ")) + "</small></button>"; }).join("") +
      '</div><button type="button" class="tv-classica" data-tv="classica">Ver só a tela de resultados (sem TV)</button></div>';
  }
  function desenhar() {
    var el = document.getElementById("v3tv");
    var ap = document.getElementById("apurMapa");
    if (!ap) { if (el) el.remove(); st.aberto = false; st.chave = null; return; }
    // botão para voltar à TV a partir da tela clássica
    if (!ap.querySelector(".tv-voltar")) { var b = document.createElement("button"); b.className = "tv-voltar"; b.type = "button"; b.setAttribute("data-tv", "voltar"); b.textContent = "📺 Ver na TV"; ap.appendChild(b); }
    if (st.oculto) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement("div"); el.id = "v3tv"; document.body.appendChild(el); }
    var html = st.canal ? telaCanal() : telaEscolha(), chave = st.canal || "escolha";
    // primeira vez ou troca de canal: monta tudo; depois só troca as partes que mudaram
    if (el.getAttribute("data-k") !== chave) { el.innerHTML = html; el.setAttribute("data-k", chave); st.tickT = Date.now(); return; }
    if (!st.canal) { if (el.innerHTML !== html) el.innerHTML = html; return; }
    var tmp = document.createElement("div"); tmp.innerHTML = html;
    [".tv-top", ".tv-meio", ".tv-ctrl"].forEach(function (sel) {
      var a = el.querySelector(sel), b2 = tmp.querySelector(sel);
      if (a && b2 && a.innerHTML !== b2.innerHTML) a.innerHTML = b2.innerHTML;
    });
    // letreiro: só troca de texto a cada 25 s, para dar tempo de rolar
    var tk = el.querySelector(".tv-tk span"), tk2 = tmp.querySelector(".tv-tk span");
    if (tk && tk2 && tk.textContent !== tk2.textContent && Date.now() - (st.tickT || 0) > 25000) { tk.textContent = tk2.textContent; st.tickT = Date.now(); }
  }
  TV.desenhar = desenhar;
  function loop() {
    var ap = document.getElementById("apurMapa");
    if (ap && !st.aberto) { st.aberto = true; st.oculto = false; st.canal = null; st.uf = null; st.ultSeg = null; }
    if (ap || document.getElementById("v3tv")) desenhar();
  }
  setInterval(function () { try { loop(); } catch (e) { console.warn("v3tv", e); } }, 450);

  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-tv]"); if (!b) return;
    var k = b.getAttribute("data-tv"), id = b.getAttribute("data-id"), AP_ = ok(function () { return A().AP; }, null);
    e.preventDefault(); e.stopPropagation();
    if (k === "canal") { st.canal = id; st.ultSeg = null; try { localStorage.setItem("cadeira_tv_canal", id); } catch (er) {} }
    else if (k === "trocar") st.canal = null;
    else if (k === "classica") st.oculto = true;
    else if (k === "voltar") st.oculto = false;
    else if (k === "play" && AP_) { AP_.play = !AP_.play; AP_.last = performance.now(); }
    else if (k === "vel" && AP_) AP_.vel = +id;
    else if (k === "uf") st.uf = st.uf === id ? null : id;
    else if (k === "encerrar") { var t = document.getElementById("v3tv"); if (t) t.remove(); st.aberto = false; ok(function () { A().fechar(); }); return; }
    desenhar();
  }, true);
})();
