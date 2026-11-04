/* =============================================================================
   CADEIRA v3 — Elenco ampliado + fotos buscadas nas APIs públicas
   (arquivo gerado por tools/gerar_elenco.py — edite o modelo e os dados, não este)
   1. Acrescenta os políticos reais de dados/politicos-novos.json (vereadores e
      secretariados do ABC, vereadores de SP e do Rio, ALESP, deputados,
      senadores e governadores eleitos em 2026, ministros e cotados).
   2. Corrige vereadores de outras cidades que estavam como "Vereador de Mauá".
   3. Fotos: para quem não tem foto, o navegador consulta a API da Câmara
      (deputados federais) e a da Wikipédia (miniatura do artigo, só quando a
      descrição indica político/figura pública brasileira). O resultado fica
      em cache no navegador; nada é buscado de novo por 15 dias.
   ============================================================================= */
(function () {
  "use strict";
  if (window.V3ELENCO) return;
  var EL = (window.V3ELENCO = {});
  var DADOS = __DADOS__;
  var FOTOS = __FOTOS__;
  var PRIORIDADE = __PRIORIDADE__; // fotos escolhidas à mão: substituem a foto anterior
  var AJUSTES = __AJUSTES__; // cargos e papéis conferidos nos sites oficiais (aplicados uma vez por save)
  var NAO_BUSCAR = { "Jorge Araújo": 1, "Cicinho": 1, "Bruno Farias": 1, "Mazinho": 1 }; // homônimos na Wikipédia
  var PROFS = ["Advogado(a)", "Economista", "Médico(a)", "Professor(a)", "Agricultor(a)", "Policial/Militar", "Empresário(a)", "Líder Comunitário", "Jornalista", "Engenheiro(a)", "Cientista Político", "Líder Religioso"];
  // vereadores de outras cidades que estavam marcados como de Mauá
  var OUTRAS = { "Cris Monteiro": "São Paulo", "Luana Alves": "São Paulo", "Silvia Ferraro": "São Paulo", "Toninho Vespoli": "São Paulo", "Celso Giannazi": "São Paulo", "Keit Lima": "São Paulo", "Zoe Martínez": "São Paulo", "Adrilles Jorge": "São Paulo", "Sonaira Fernandes": "São Paulo", "Mônica Benício": "Rio de Janeiro", "Thais Ferreira": "Rio de Janeiro", "William Siri": "Rio de Janeiro", "Carlo Caiado": "Rio de Janeiro", "Leniel Borel": "Rio de Janeiro", "Mariana Conti": "Campinas", "Débora Camilo": "Santos", "Karen Santos": "Porto Alegre" };
  var UF_CID = { "São Paulo": "SP", "Rio de Janeiro": "RJ", "Campinas": "SP", "Santos": "SP", "Porto Alegre": "RS" };

  function norm(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s*\([^)]*\)\s*/g, " ").replace(/[^a-zA-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim().toLowerCase(); }
  function nk(s) { try { return typeof normKey === "function" ? normKey(s) : norm(s); } catch (e) { return norm(s); } }
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
  function banco() { try { return bancoDeNPCs; } catch (e) { return null; } }
  function temFoto(n) { try { return !!String(obterFotoPolitico(n) || "").trim(); } catch (e) { return !!n.foto; } }

  /* ---------------------------------------------------------------- elenco */
  function aplicar() {
    var b = banco(); if (!b || !b.length) return;
    try { if (!gameState) return; } catch (e) { return; }
    if (b.__v3el === b.length) return;
    var ex = {}; b.forEach(function (n) { ex[nk(n.nome)] = n; });
    var novos = 0, depf = 0;
    DADOS.forEach(function (d) {
      var id = d[0], nome = d[1], cargo = d[2], papel = d[3], partido = d[4], uf = d[5], mun = d[6], prof = d[7], det = d[8], grupo = d[9];
      if (ex[nk(nome)]) return;
      if (cargo === "Ministro") { papel = papel + " (no cargo a partir de abr/2026)"; cargo = "Liderança / Ex-Titular"; }
      var r = { id: id, nome: nome, idade: 34 + hash(nome) % 31, partido: partido, cargo: cargo, papel: papel, base: grupo, uf: uf || "SP", mun: mun || null };
      var n; try { n = montarNPCReal2(r); } catch (e) { return; }
      n.id = id; if (mun) n.municipio_domicilio = mun;
      if (PROFS.indexOf(prof) >= 0) n.profissao = prof;
      if (det) n.profissao_detalhe = det;
      n.grupo_v3 = grupo;
      if (FOTOS[nome]) n.foto = FOTOS[nome];
      b.push(n); ex[nk(nome)] = n; novos++;
      if (cargo === "Deputado Federal") depf++;
    });
    // mantém 513 deputados: cada deputado real novo ocupa a vaga de um fictício
    if (depf) b.filter(function (n) { return n.vivo && !n.real && n.cargo === "Deputado Federal"; }).slice(0, depf).forEach(function (n) { n.cargo = "Liderança / Ex-Titular"; n.papel = "Ex-deputado(a)"; });
    // vereadores de outras cidades
    Object.keys(OUTRAS).forEach(function (nome) {
      var n = ex[nk(nome)]; if (!n || n.cargo !== "Vereador de Mauá") return;
      var cid = OUTRAS[nome]; n.cargo = "Liderança / Ex-Titular"; n.papel = (n.sexo === "F" ? "Vereadora" : "Vereador") + " de " + cid; n.municipio_domicilio = cid; n.uf = UF_CID[cid] || n.uf; n.esfera = "MUNICIPAL";
    });
    try {
      var m = M(); if ((m.v3ajustes || 0) < 3) {
        Object.keys(AJUSTES).forEach(function (nome) {
          var n = ex[nk(nome)], a = AJUSTES[nome]; if (!n) return;
          if (a.cargo) n.cargo = a.cargo; if (a.papel) n.papel = a.papel; if (a.mun) n.municipio_domicilio = a.mun; if (a.uf) n.uf = a.uf;
          if (a.partido) { n.partido = a.partido; try { n.partidoBase = normPartido(a.partido); } catch (e) {} }
          if (a.cargo === "Prefeito") { n.esfera = "MUNICIPAL"; n.mandato_fim = 2028; }
        });
        m.v3ajustes = 3;
      }
    } catch (e) {}
    // mesma pessoa cadastrada com dois nomes: fica uma só
    var FUNDIR = { "Carlos Pignatari (Carlão)": ["Carlão Pignatari"], "Delegado Bilynskyj": ["Delegado Paulo Bilynskyj"], "Zé Medeiros": ["José Medeiros", "Deputado Federal (MT) / Senador eleito em 2026"],
      "Mauro Filho": ["Mauro Benevides Filho"], "Axel Schmidt Grael": ["Axel Grael"] };
    Object.keys(FUNDIR).forEach(function (dup) {
      var d = ex[nk(dup)], k = ex[nk(FUNDIR[dup][0])]; if (!d || !k || d === k || d.jogador) return;
      if (!k.foto && d.foto) k.foto = d.foto;
      if (FUNDIR[dup][1]) k.papel = FUNDIR[dup][1];
      var i = b.indexOf(d); if (i >= 0) b.splice(i, 1); delete ex[nk(dup)];
    });
    // Câmara de Mauá: os 23 vereadores da legislatura 2025-2028 (site oficial da Câmara)
    var MAUA = ["Alessandro Martins", "Alexandre Vieira", "Danilo do Teco", "Denis Caporal", "Mazinho", "Engenheiro Felipe do MSTU", "Juninho Getúlio", "Tchacabum", "Jotão", "José Afonso Madeira", "Zé Carlos Nova Era", "Zé Luiz Cassimiro", "Wellington da Saúde", "Zeinha Silva", "Leonardo Alves", "Luiz Alfredo Simão", "Rangel Souza", "Renan Pessoa", "Ricardinho da Enfermagem", "Doutor Tioki", "Vaguinho do Zaíra", "Neycar", "Wagner Rubinelli"];
    var naCamara = {}; MAUA.forEach(function (x) { naCamara[nk(x)] = 1; });
    b.forEach(function (n) {
      if (n.vivo === false) return;
      var dentro = !!naCamara[nk(n.nome)];
      if (n.cargo === "Vereador de Mauá" && !dentro && n.real) { n.cargo = "Liderança / Ex-Titular"; n.papel = (n.sexo === "F" ? "Ex-vereadora" : "Ex-vereador") + " de Mauá"; }
      else if (dentro && n.real && n.cargo !== "Vereador de Mauá" && n.cargo !== "Prefeito de Mauá") { n.cargo = "Vereador de Mauá"; n.papel = (n.sexo === "F" ? "Vereadora" : "Vereador") + " de Mauá"; n.municipio_domicilio = "Mauá"; n.uf = "SP"; n.esfera = "MUNICIPAL"; }
    });
    // fotos conhecidas (geradas) e as do cache das APIs
    var cache = lerCache();
    b.forEach(function (n) {
      if (!n.real) return;
      if (FOTOS[n.nome] && (PRIORIDADE[n.nome] || !temFoto(n) || naCamara[nk(n.nome)])) { n.foto = FOTOS[n.nome]; return; }
      if (temFoto(n)) return;
      var c = cache[norm(n.nome)]; if (c && c.u) n.foto = c.u;
    });
    try { b.__v3el = b.length; } catch (e) {}
    if (novos) { try { aviso("elenco3", "Novos políticos reais", novos + " políticos reais foram adicionados: vereadores e secretários do ABC, vereadores de São Paulo e do Rio, deputados, senadores e governadores eleitos em 2026, ministros e cotados."); } catch (e) {} }
    agendarBusca();
  }
  EL.aplicar = aplicar;

  /* ---------------------------------------------------------------- fotos via API */
  var CK = "cadeira_fotos_api_v1", DIAS = 15 * 864e5;
  function lerCache() { try { return JSON.parse(localStorage.getItem(CK) || "{}") || {}; } catch (e) { return {}; } }
  function gravarCache(c) { try { localStorage.setItem(CK, JSON.stringify(c)); } catch (e) {} }
  var rodando = false, agendado = 0, achou = 0;
  function agendarBusca() { if (agendado || rodando) return; agendado = setTimeout(function () { agendado = 0; buscar(); }, 2500); }
  var POL = /pol[ií]tic|deputad|vereador|senador|prefeit|ministr|secret[aá]ri|governad|sindicalist|ativista|advogad|jornalist|delegad|militar|policial|economista|m[eé]dic|juiz|ju[ií]za|procurador|magistrad|servidor|engenheir|professor|empres[aá]ri|pastor|apresentador|diplomata|cientista/i;
  function candidatos() {
    var b = banco() || [], c = lerCache(), agora = Date.now();
    return b.filter(function (n) {
      if (!n.real || n.vivo === false || temFoto(n) || NAO_BUSCAR[n.nome]) return false;
      var k = c[norm(n.nome)]; return !(k && (k.u || agora - k.t < DIAS));
    });
  }
  function aplicarFoto(nome, url) { (banco() || []).forEach(function (n) { if (n.nome === nome && !temFoto(n)) n.foto = url; }); }
  function camara(n) {
    var q = n.nome.replace(/\s*\([^)]*\)/g, "").trim();
    return fetch("https://dadosabertos.camara.leg.br/api/v2/deputados?itens=15&nome=" + encodeURIComponent(q), { headers: { Accept: "application/json" } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        var l = (j && j.dados) || [], alvo = norm(q);
        var hit = l.filter(function (d) { return norm(d.nome) === alvo && (!n.uf || !d.siglaUf || d.siglaUf === n.uf); })[0];
        return hit && hit.urlFoto ? hit.urlFoto : "";
      }).catch(function () { return null; });
  }
  function wiki(lote) {
    // nomes com desambiguação no jogo ("Wellington Dias (RJ)") não vão para a Wikipédia
    var titulos = lote.map(function (n) { return n.nome.trim(); });
    var url = "https://pt.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages|pageterms&piprop=thumbnail&pithumbsize=330&wbptterms=description&titles=" + encodeURIComponent(titulos.join("|"));
    return fetch(url).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (!j || !j.query) return null;
      var mapa = {}; titulos.forEach(function (t) { mapa[t] = t; });
      (j.query.normalized || []).forEach(function (x) { Object.keys(mapa).forEach(function (k) { if (mapa[k] === x.from) mapa[k] = x.to; }); });
      (j.query.redirects || []).forEach(function (x) { Object.keys(mapa).forEach(function (k) { if (mapa[k] === x.from) mapa[k] = x.to; }); });
      var pags = {}; Object.keys(j.query.pages || {}).forEach(function (id) { var p = j.query.pages[id]; pags[p.title] = p; });
      var out = {};
      titulos.forEach(function (t) {
        var p = pags[mapa[t]]; if (!p || p.missing !== undefined) { out[t] = ""; return; }
        var desc = (p.terms && p.terms.description && p.terms.description[0]) || "";
        var ok = p.thumbnail && p.thumbnail.source && POL.test(desc) && /brasil/i.test(desc);
        // vereador local: recusa se a Wikipédia diz que é vereador de outra cidade
        var nn = lote.filter(function (x) { return x.nome.trim() === t; })[0];
        var cid = nn && /Vereador(?:a)? de (.+)/.exec(nn.papel || ""), vd = /vereador[a]?(?: do município)? de ([^,;]+)/i.exec(desc);
        if (ok && cid && vd && norm(vd[1]).indexOf(norm(cid[1]).split(" ")[0]) < 0) ok = false;
        out[t] = ok ? p.thumbnail.source : "";
      });
      return out;
    }).catch(function () { return null; });
  }
  function buscar() {
    if (rodando || typeof fetch !== "function") return;
    var lista = candidatos(); if (!lista.length) return;
    rodando = true; achou = 0;
    var cache = lerCache();
    var deps = lista.filter(function (n) { return n.cargo === "Deputado Federal" || /Deputad[oa] Federal/i.test(n.papel || ""); }).slice(0, 40);
    var wk = lista.filter(function (n) { return !/\(/.test(n.nome) && deps.indexOf(n) < 0; });
    var fila = [];
    deps.forEach(function (n) { fila.push(function () { return camara(n).then(function (u) { if (u === null) { if (!/\(/.test(n.nome)) wk.push(n); return; } if (u) { aplicarFoto(n.nome, u); achou++; } cache[norm(n.nome)] = { u: u || "", t: Date.now() }; if (!u) wk.push(n); }); }); });
    fila.push(function () {
      var lotes = []; for (var i = 0; i < wk.length && lotes.length < 14; i += 50) lotes.push(wk.slice(i, i + 50));
      return lotes.reduce(function (p, lote) {
        return p.then(function () { return wiki(lote).then(function (res) {
          if (!res) return;
          lote.forEach(function (n) { var u = res[n.nome.trim()] || ""; if (u) { aplicarFoto(n.nome, u); achou++; } cache[norm(n.nome)] = { u: u, t: Date.now() }; });
        }); }).then(function () { return new Promise(function (r) { setTimeout(r, 400); }); });
      }, Promise.resolve());
    });
    fila.reduce(function (p, f) { return p.then(f).then(function () { return new Promise(function (r) { setTimeout(r, 250); }); }); }, Promise.resolve())
      .then(function () {
        gravarCache(cache); rodando = false;
        if (achou) { try { if (gameState && !(S.modal && S.modal.tipo === "sessao_leg")) render(); } catch (e) {} }
        EL.ultimaBusca = { achou: achou, total: lista.length };
      });
  }
  EL.buscar = buscar;

  function instalar() {
    if (typeof window.render === "function" && !window.render.__v3elenco) {
      var o = window.render;
      var n = function () { try { aplicar(); } catch (e) { console.warn("v3elenco", e); } return o.apply(this, arguments); };
      for (var k in o) { try { n[k] = o[k]; } catch (e) {} }
      n.__v3elenco = true; window.render = n; try { render = n; } catch (e) {}
    }
  }
  instalar();
  document.addEventListener("DOMContentLoaded", function () { setTimeout(instalar, 0); });
  window.addEventListener("load", function () { setTimeout(instalar, 0); });
})();
