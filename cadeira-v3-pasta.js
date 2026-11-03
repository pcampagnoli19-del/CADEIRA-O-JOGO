/* =============================================================================
   CADEIRA v3 — Gabinete da pasta (ministro / secretário)
   Dá vida a quem ocupa uma pasta (J().pasta), sem tirar as ações táticas que
   já existiam:
   - Indicadores da área (3 por pasta) que sobem e descem com o trabalho.
   - Despachos: decisões que chegam à mesa todo mês (crise, pedido de deputado,
     convocação, TCU, greve, imprensa...) com escolhas e efeito real.
   - Relação com o chefe (Presidente/Governador/Prefeito): confiança, despacho
     mensal, cobrança e risco de demissão.
   - Equipe: secretário(a)-executivo(a) e assessoria de imprensa, com perfis.
   - Agenda: visitar unidade/obra, coletiva, audiência no Legislativo.
   - Programa-vitrine da pasta: lançamento com efeito mensal e manchete.
   Estado em J().pasta.v3. Tela: Poder › Minha pasta.
   ============================================================================= */
(function () {
  "use strict";
  if (window.PASTA3) return;
  var P3 = (window.PASTA3 = {});

  function esc_(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pj(a) { return esc_(JSON.stringify(a)); }
  function ok(f, d) { try { var v = f(); return v === undefined ? d : v; } catch (e) { return d; } }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function dataJ() { return ok(function () { return dt(); }, { ano: 2026, mes: 1 }); }
  function agora() { var d = dataJ(); return d.ano * 12 + d.mes - 1; }
  function toast_(m, t) { try { toast(m, t || "ok"); } catch (e) {} }
  function manchete_(t, k) { try { manchete(t, k || "posse"); } catch (e) {} }
  function fmtR(v) { v = Math.round(v); if (Math.abs(v) >= 1e9) return "R$ " + (v / 1e9).toFixed(1).replace(".", ",") + " bi"; if (Math.abs(v) >= 1e6) return "R$ " + (v / 1e6).toFixed(1).replace(".", ",") + " mi"; if (Math.abs(v) >= 1e3) return "R$ " + Math.round(v / 1e3) + " mil"; return "R$ " + v; }
  var POOL = { M: 6e6, E: 220e6, F: 2.5e9 };
  var CHEFE_CARGO = { M: "Prefeito de Mauá", E: "Governador de SP", F: "Presidente da República" };
  var CHEFE_TIT = { M: "o prefeito", E: "o governador", F: "o presidente" };
  var CASA = { M: "Câmara de Mauá", E: "Assembleia (Alesp)", F: "Câmara dos Deputados" };
  var TERR = { M: "Mauá", E: "o estado", F: "o país" };

  /* ---------------------------------------------------------------- áreas */
  function area(p) {
    var id = String(p.id || "").toLowerCase(), nm = String(p.nome || "").toLowerCase();
    if (id === "saude" || /saúde|saude/.test(nm)) return "SAUDE";
    if (id === "educ" || /educa/.test(nm)) return "EDUC";
    if (id === "fazenda" || /fazenda|economia|planejamento/.test(nm)) return "FAZ";
    if (["seguranca", "gcm", "justica"].indexOf(id) >= 0 || /segurança|gcm|justiça|polícia/.test(nm)) return "SEG";
    if (["obras", "saneamento", "emtu", "emtu_sp", "sabesp", "petrobras", "codevasf"].indexOf(id) >= 0 || /obras|transporte|estatal|dnit|saneamento/.test(nm)) return "INFRA";
    if (["gov", "casacivil"].indexOf(id) >= 0 || /governo|casa civil/.test(nm)) return "ART";
    if (["agri", "agricultura"].indexOf(id) >= 0 || /agri/.test(nm)) return "AGRO";
    if (["social", "cidadania", "trabalho"].indexOf(id) >= 0 || /social|cidadania|trabalho/.test(nm)) return "SOC";
    return "GEN";
  }
  // [nome, unidade, valor bom, valor ruim, casas] — o valor mostrado é interpolado pela qualidade (0–100)
  var KPI = {
    SAUDE: [["Fila de cirurgias eletivas", "mil pessoas", 4, 60, 0], ["Cobertura vacinal", "%", 96, 62, 0], ["Satisfação com o atendimento", "%", 78, 28, 0]],
    EDUC: [["Nota na avaliação da educação", "pts", 6.8, 4.1, 1], ["Evasão escolar", "%", 1.5, 9, 1], ["Escolas com reforma em dia", "%", 85, 30, 0]],
    FAZ: [["Arrecadação vs. meta", "%", 104, 88, 0], ["Dívida sobre a receita", "%", 45, 120, 0], ["Investimento público", "% da receita", 12, 3, 0]],
    SEG: [["Homicídios", "por 100 mil", 7, 30, 1], ["Roubos registrados", "mil/mês", 4, 18, 1], ["Sensação de segurança", "%", 62, 18, 0]],
    INFRA: [["Obras no prazo", "%", 85, 30, 0], ["Vias em bom estado", "%", 80, 35, 0], ["Atraso médio das obras", "meses", 1, 14, 0]],
    ART: [["Votos da base no plenário", "%", 82, 45, 0], ["Projetos do governo aprovados", "%", 78, 30, 0], ["Aliados insatisfeitos", "", 3, 28, 0]],
    AGRO: [["Safra vs. ano anterior", "%", 108, 92, 0], ["Crédito rural liberado", "% da meta", 100, 55, 0], ["Conflitos no campo", "/ano", 5, 40, 0]],
    SOC: [["Famílias atendidas", "% da meta", 98, 60, 0], ["Cadastro atualizado", "%", 92, 55, 0], ["Fila de benefícios", "mil pedidos", 8, 120, 0]],
    GEN: [["Metas cumpridas", "%", 90, 35, 0], ["Prazo médio de resposta", "dias", 5, 45, 0], ["Satisfação dos servidores", "%", 75, 30, 0]]
  };
  var PROGRAMAS = {
    SAUDE: [["Mais Especialistas", "Mutirões de consultas com especialistas nos bairros"], ["Farmácia em Casa", "Entrega de remédios de uso contínuo"], ["Saúde Digital", "Prontuário e agendamento pelo celular"]],
    EDUC: [["Escola em Tempo Integral", "Amplia a jornada nas escolas da rede"], ["Professor Conectado", "Formação e tablets para professores"], ["Merenda Nota 10", "Cardápio com produtor local"]],
    FAZ: [["Nota Fiscal Premiada", "Sorteio para quem pede nota fiscal"], ["Desenrola Local", "Renegociação de dívidas de pequenos negócios"], ["Investe Mais", "Fundo de investimento em infraestrutura"]],
    SEG: [["Muralha Digital", "Câmeras com leitura de placas"], ["Bairro Seguro", "Bases comunitárias nos pontos críticos"], ["Patrulha Maria da Penha", "Proteção às vítimas de violência"]],
    INFRA: [["Asfalto Novo", "Recapeamento em larga escala"], ["Água Para Todos", "Rede de saneamento nas áreas irregulares"], ["Corredor Expresso", "Faixas e terminais de ônibus"]],
    ART: [["Pacto pela Governabilidade", "Acordo de pautas com os partidos da base"], ["Governo Itinerante", "Reuniões do governo nas regiões"], ["Balcão do Prefeito/Governador", "Atendimento a lideranças locais"]],
    AGRO: [["Safra Forte", "Crédito barato para pequenos produtores"], ["Terra Legal", "Titulação de propriedades"], ["Agro Verde", "Recuperação de pastagens degradadas"]],
    SOC: [["Busca Ativa", "Equipes que encontram famílias fora do cadastro"], ["Primeiro Emprego", "Qualificação e vaga para jovens"], ["Cozinha Solidária", "Refeições a preço popular"]],
    GEN: [["Governo Sem Papel", "Processos 100% digitais"], ["Meta Pública", "Painel online com as metas da pasta"], ["Servidor Nota 10", "Bônus por desempenho"]]
  };

  /* ---------------------------------------------------------------- despachos */
  // efx: idx (desempenho), kpi (qualidade), ap (aprovação), cap (capital político),
  // chefe (confiança), esc (escândalo), verba (× reposição mensal), partido, rel (base parlamentar)
  var DESP = {
    SAUDE: [
      { t: "Surto de dengue", x: "Casos explodem em três regiões. Os hospitais pedem reforço.", ops: [["Mutirão de agentes e fumacê", { kpi: 3, ap: .5, verba: -.3, idx: 2 }, "Os casos começam a cair em três semanas."], ["Pedir verba extra " + "ao chefe", { verba: .4, chefe: -4 }, "A verba sai, mas o chefe reclama do improviso."], ["Minimizar: é sazonal", { kpi: -4, ap: -.8, esc: 2 }, "A imprensa mostra filas nos prontos-socorros."]] },
      { t: "Falta de remédios", x: "Unidades estão sem insulina e antibióticos.", ops: [["Compra emergencial sem licitação", { kpi: 3, verba: -.25, esc: 2, mp: 20 }, "Os remédios chegam; o MP pede os contratos."], ["Remanejar estoque entre unidades", { kpi: 1, idx: 1 }, "Solução parcial, mas sem polêmica."], ["Culpar o fornecedor", { kpi: -2, ap: -.3 }, "Ninguém acredita muito."]] },
      { t: "Médicos ameaçam greve", x: "O sindicato pede reajuste e melhores condições.", ops: [["Negociar reajuste escalonado", { verba: -.2, kpi: 1, idx: 1 }, "Greve evitada."], ["Endurecer e cortar o ponto", { kpi: -3, ap: -.5, chefe: 2 }, "A greve começa; o chefe aprova a firmeza."]] }
    ],
    EDUC: [
      { t: "Escola com teto desabando", x: "Vídeo de sala interditada viraliza.", ops: [["Obra emergencial e visita ao local", { kpi: 2, ap: .6, verba: -.2 }, "Você aparece com capacete na TV."], ["Transferir os alunos e prometer obra", { kpi: -1, ap: -.2 }, "Pais reclamam do deslocamento."]] },
      { t: "Professores param", x: "A rede para por piso salarial.", ops: [["Mesa de negociação com proposta", { verba: -.3, kpi: 2, idx: 2 }, "Acordo assinado; aulas voltam."], ["Contratar temporários", { kpi: -2, esc: 1, chefe: 1 }, "A greve se arrasta e a qualidade cai."]] },
      { t: "Resultado da avaliação nacional", x: "A rede caiu no ranking.", ops: [["Assumir e lançar plano de recuperação", { idx: 2, ap: .2, cap: -3 }, "Postura elogiada por especialistas."], ["Questionar a metodologia", { ap: -.4, kpi: -1 }, "Soa como desculpa."]] }
    ],
    FAZ: [
      { t: "Rombo nas contas", x: "A arrecadação veio abaixo da meta.", ops: [["Contingenciar gastos", { kpi: 3, ap: -.4, rel: -2 }, "Contas em ordem, aliados irritados."], ["Antecipar receitas (pedalada)", { kpi: 1, esc: 3, mp: 25 }, "Fecha o mês; o tribunal de contas anota."], ["Pedir socorro ao chefe", { chefe: -5, verba: .3 }, "O chefe libera, mas cobra resultado."]] },
      { t: "Pedido de isenção fiscal", x: "Uma grande empresa promete empregos em troca de isenção.", ops: [["Conceder com contrapartidas", { kpi: -1, ap: .4, cap: 3 }, "Fábrica anunciada."], ["Recusar", { kpi: 1, chefe: -2 }, "A empresa ameaça ir para o vizinho."]] },
      { t: "Agência rebaixa a nota", x: "A nota de crédito cai um degrau.", ops: [["Anunciar pacote de ajuste", { kpi: 2, ap: -.5, idx: 1 }, "Mercado reage bem; servidores, mal."], ["Dizer que a agência erra", { kpi: -2, ap: .1 }, "Juros sobem."]] }
    ],
    SEG: [
      { t: "Chacina na periferia", x: "Cinco mortos numa noite. A cobrança é imediata.", ops: [["Operação e força-tarefa", { kpi: 3, ap: .5, verba: -.2, esc: 1 }, "Suspeitos presos; denúncias de abuso."], ["Ir ao local e ouvir as famílias", { ap: .7, kpi: 1, cap: -2 }, "Gesto bem recebido."], ["Dizer que é briga de facção", { ap: -.9 }, "A frase vira manchete negativa."]] },
      { t: "Policiais pedem aumento", x: "Associações ameaçam operação-padrão.", ops: [["Reajuste parcial", { verba: -.3, kpi: 1 }, "Tropa acalma."], ["Negar", { kpi: -3, chefe: 2 }, "Operação-padrão trava o trânsito."]] },
      { t: "Vídeo de abuso policial", x: "Imagens de agressão circulam nas redes.", ops: [["Afastar os agentes e abrir apuração", { ap: .4, kpi: -1, partido: -1 }, "Parte da tropa reclama."], ["Defender a corporação", { ap: -.6, esc: 2, partido: 1 }, "Movimentos sociais protestam."]] }
    ],
    INFRA: [
      { t: "Obra parada", x: "A empreiteira abandonou a obra por falta de pagamento.", ops: [["Pagar e retomar", { verba: -.35, kpi: 3, ap: .4 }, "Máquinas voltam ao canteiro."], ["Romper o contrato e relicitar", { kpi: -1, idx: 1, esc: -1 }, "Atrasa, mas sai mais barato."]] },
      { t: "Cratera na avenida", x: "Um carro caiu num buraco na via principal.", ops: [["Operação tapa-buraco imediata", { kpi: 2, ap: .5, verba: -.15 }, "Problema resolvido em 48h."], ["Culpar a gestão anterior", { ap: -.4 }, "Não cola."]] },
      { t: "Aditivo milionário", x: "A empreiteira pede um aditivo de 25% no contrato.", ops: [["Aprovar o aditivo", { kpi: 2, esc: 3, mp: 20 }, "A obra anda; o TCE abre análise."], ["Negar e renegociar", { kpi: -1, idx: 2, esc: -1 }, "Prazo estica, imagem de rigor."]] }
    ],
    ART: [
      { t: "Base ameaça rebelião", x: "Partidos da base querem cargos e emendas.", ops: [["Liberar emendas", { verba: -.3, rel: 4, kpi: 3, esc: 1 }, "Votação garantida."], ["Ceder cargos de 2º escalão", { rel: 3, kpi: 2, partido: -1 }, "Base volta; seu partido reclama."], ["Segurar e negociar caso a caso", { kpi: -2, cap: 3 }, "Derrota numa votação."]] },
      { t: "Votação decisiva", x: "O projeto principal do governo vai a plenário.", ops: [["Virar a noite ao telefone", { kpi: 3, chefe: 4, cap: -4 }, "Aprovado por margem apertada."], ["Adiar a votação", { kpi: -1, chefe: -3 }, "O chefe não gosta."]] }
    ],
    AGRO: [
      { t: "Seca castiga lavouras", x: "Produtores pedem renegociação de dívidas.", ops: [["Renegociar e prorrogar", { verba: -.25, kpi: 2, ap: .4 }, "Alívio no campo."], ["Esperar a próxima safra", { kpi: -3, ap: -.4 }, "Tratoraço na capital."]] },
      { t: "Embargo sanitário", x: "Um país suspende compras de carne.", ops: [["Missão técnica e auditoria", { kpi: 2, idx: 2, cap: -2 }, "Embargo cai em um mês."], ["Retaliação comercial", { kpi: -2, chefe: -2 }, "Crise escala."]] }
    ],
    SOC: [
      { t: "Fraude no cadastro", x: "Reportagem mostra benefícios pagos a mortos.", ops: [["Pente-fino imediato", { kpi: 2, esc: -2, ap: .2 }, "Milhares de cadastros cancelados."], ["Dizer que é exceção", { esc: 2, ap: -.4 }, "Novas denúncias aparecem."]] },
      { t: "Fila de benefícios", x: "Meio milhão esperando análise.", ops: [["Mutirão com hora extra", { verba: -.2, kpi: 3, ap: .5 }, "Fila cai pela metade."], ["Automatizar a análise", { kpi: 1, idx: 2, cap: -2 }, "Resultado aparece no médio prazo."]] }
    ],
    GEN: [
      { t: "Sistema da pasta fora do ar", x: "Atendimento parado há dois dias.", ops: [["Contratação emergencial", { kpi: 2, verba: -.15, esc: 1 }, "Volta no dia seguinte."], ["Equipe interna resolve", { kpi: 1, idx: 1 }, "Volta em uma semana."]] }
    ],
    GERAL: [
      { t: "Deputado pede nomeação", x: "{dep} quer emplacar um afilhado num cargo da pasta.", ops: [["Nomear", { rel: 3, esc: 1, kpi: -1 }, "{dep} vira aliado."], ["Recusar com elegância", { rel: -2, idx: 1 }, "{dep} fica magoado."]] },
      { t: "Convocação na {casa}", x: "A oposição aprovou sua convocação para explicar a pasta.", ops: [["Ir preparado(a), com números", { ap: .4, cap: 3, kpi: 0 }, "Você sai fortalecido(a)."], ["Mandar o secretário-executivo", { ap: -.3, cap: -2 }, "A oposição fala em fuga."], ["Partir para o confronto", { ap: .2, rel: -3, partido: 2 }, "Viraliza nos dois lados."]] },
      { t: "Tribunal de contas questiona contrato", x: "Há indício de sobrepreço num contrato herdado.", ops: [["Suspender e auditar", { esc: -2, kpi: -1, idx: 1 }, "Imagem de rigor."], ["Defender o contrato", { esc: 2, mp: 15 }, "O caso vai ao Ministério Público."]] },
      { t: "Entrevista em rede nacional", x: "Um telejornal quer você ao vivo amanhã.", ops: [["Aceitar e defender as entregas", { ap: .5, cap: 2, kpi: 0 }, "Boa repercussão."], ["Recusar", { ap: -.1 }, "Ninguém nota."]] },
      { t: "Empresário oferece 'ajuda'", x: "Um fornecedor oferece doação para a sua campanha futura.", ops: [["Recusar e registrar", { esc: -1, idx: 1 }, "Ficou de bem com o compliance."], ["Aceitar por fora", { caixa2: 1, esc: 3 }, "Dinheiro entra; o risco também."]] },
      { t: "{chefe} cobra resultado", x: "O chefe quer uma entrega para anunciar este mês.", ops: [["Antecipar uma entrega", { chefe: 5, kpi: -1, verba: -.15 }, "Anúncio feito; a qualidade sofre."], ["Pedir prazo e mostrar o plano", { chefe: -2, idx: 2 }, "Cobrança adiada."]] }
    ]
  };

  /* ---------------------------------------------------------------- estado */
  function pasta() { return ok(function () { return J().pasta; }, null); }
  function V3(p) {
    p = p || pasta(); if (!p) return null;
    if (!p.v3) {
      var a = area(p), q = clamp(Math.round((p.idx || 55) - 5 + (Math.random() * 10 - 5)), 20, 80);
      p.v3 = { inicio: agora(), area: a, kpi: KPI[a].map(function () { return clamp(q + Math.round(Math.random() * 16 - 8), 10, 90); }), kpiH: [], conf: 55, desp: [], despMes: -1, hist: [], equipe: { exec: null, imprensa: null }, agenda: {}, prog: null, avisoDem: false };
    }
    return p.v3;
  }
  function chefe(p) { var id = p.execId; var n = id ? ok(function () { return npcPorId(id); }, null) : null; if (!n || !n.vivo) n = ok(function () { return bancoDeNPCs.find(function (x) { return x.vivo && x.cargo === CHEFE_CARGO[p.nivel]; }); }, null); return n; }
  function nomeChefe(p) { var n = chefe(p); return n ? n.nome : CHEFE_TIT[p.nivel]; }
  function base(p) { return POOL[p.nivel] || POOL.M; }
  function deputado() { var l = ok(function () { return bancoDeNPCs.filter(function (n) { return n.vivo && /Deputad|Vereador/.test(n.cargo || ""); }); }, []); return l.length ? pick(l) : null; }
  function texto(s, p, extra) { return String(s).replace("{chefe}", nomeChefe(p)).replace("{casa}", CASA[p.nivel]).replace(/\{dep\}/g, (extra && extra.dep) || "Um deputado"); }

  function aplicar(efx, p, rot) {
    var v = V3(p), j = J(), out = [];
    Object.keys(efx || {}).forEach(function (k) {
      var x = efx[k]; if (!x) return;
      if (k === "idx") { p.idx = clamp((p.idx || 50) + x, 5, 98); out.push(["Desempenho", x]); }
      else if (k === "kpi") { v.kpi = v.kpi.map(function (q) { return clamp(q + x + (Math.random() - 0.5), 5, 95); }); out.push(["Indicadores", x]); }
      else if (k === "ap") { ok(function () { mudarAprovTodos(x); }); out.push(["Aprovação", x]); }
      else if (k === "cap") { j.capPol = clamp((typeof j.capPol === "number" ? j.capPol : 55) + x, 0, 100); out.push(["Capital político", x]); }
      else if (k === "chefe") { v.conf = clamp(v.conf + x, 0, 100); var c = chefe(p); if (c) ok(function () { relNPC(c, x / 2); }); out.push(["Confiança do chefe", x]); }
      else if (k === "esc") { ok(function () { addEscandalo(x); }); out.push(["Escândalo", x]); }
      else if (k === "verba") { p.orcPool = Math.max(0, (typeof p.orcPool === "number" ? p.orcPool : base(p) * 1.5) + base(p) * x); out.push(["Orçamento da pasta", x * base(p), "R$"]); }
      else if (k === "partido") { ok(function () { relPartido(x); }); out.push(["Relação com o partido", x]); }
      else if (k === "rel") { ok(function () { bancoDeNPCs.filter(function (n) { return n.vivo && /Deputad|Vereador|Senador/.test(n.cargo || "") && (n.relacao_com_jogador || 0) > -20; }).slice(0, 30).forEach(function (n) { relNPC(n, x); }); }); out.push(["Base parlamentar", x]); }
      else if (k === "caixa2") { ok(function () { j.financas.caixa2 = (j.financas.caixa2 || 0) + 50000 * x; }); out.push(["Caixa 2", 50000 * x, "R$"]); }
      else if (k === "mp") { ok(function () { if (typeof processoMP === "function") processoMP("Representação ao MP (" + rot + ")", x); else addEscandalo(Math.round(x / 10)); }); out.push(["Risco no Ministério Público", 1]); }
    });
    return out;
  }

  /* ---------------------------------------------------------------- mês */
  function gerarDespachos(p) {
    var v = V3(p), pool = (DESP[v.area] || []).concat(DESP.GERAL);
    var n = 2 + (Math.random() < 0.5 ? 1 : 0), usados = {};
    v.desp = [];
    for (var i = 0; i < n && i < 8; i++) {
      var d = pick(pool), k = pool.indexOf(d);
      if (usados[k]) { i--; if (Object.keys(usados).length >= pool.length) break; continue; }
      usados[k] = 1;
      var dep = deputado();
      v.desp.push({ k: k, t: texto(d.t, p), x: texto(d.x, p, { dep: dep && dep.nome }), dep: dep && dep.nome, ops: d.ops.map(function (o) { return [texto(o[0], p), o[1], texto(o[2], p, { dep: dep && dep.nome })]; }), feito: null });
    }
    v.despMes = agora();
  }
  P3.mensal = function () {
    var p = pasta(); if (!p) return;
    var v = V3(p), j = J();
    // despachos não resolvidos custam
    var pend = v.desp.filter(function (d) { return !d.feito; }).length;
    if (pend) { p.idx = clamp(p.idx - pend * 1, 5, 98); v.conf = clamp(v.conf - pend * 1.5, 0, 100); v.hist.unshift({ m: agora(), t: pend + " despacho(s) ficaram sem resposta: o chefe notou.", tipo: "ruim" }); }
    // indicadores andam rumo ao desempenho
    v.kpiH.push(Math.round(v.kpi.reduce(function (s, q) { return s + q; }, 0) / v.kpi.length)); if (v.kpiH.length > 12) v.kpiH.shift();
    v.kpi = v.kpi.map(function (q) { return clamp(q + (p.idx - q) * 0.08 + (Math.random() * 4 - 2), 5, 95); });
    // equipe
    var eq = v.equipe;
    if (eq.exec === "tecnico") p.idx = clamp(p.idx + 0.8, 5, 98);
    if (eq.exec === "politico") j.capPol = clamp((j.capPol || 55) + 2, 0, 100);
    if (eq.exec === "apadrinhado") { ok(function () { relPartido(1.5); }); if (Math.random() < 0.08) { ok(function () { addEscandalo(4); }); manchete_("Indicado(a) político(a) na pasta de " + j.nome + " é alvo de denúncia.", "imprensa"); } }
    if (eq.imprensa === "boa") ok(function () { mudarAprovTodos(0.12); });
    if (eq.imprensa === "agressiva") { ok(function () { mudarAprovTodos(Math.random() < 0.6 ? 0.25 : -0.3); }); }
    // programa-vitrine
    if (v.prog) { v.kpi = v.kpi.map(function (q) { return clamp(q + 0.9, 5, 95); }); ok(function () { mudarAprovTodos(0.1); }); p.orcPool = Math.max(0, (p.orcPool || 0) - base(p) * 0.12); }
    // chefe: confiança acompanha o desempenho
    v.conf = clamp(v.conf + (p.idx - 50) / 25 + (50 - v.conf) * 0.05 + (Math.random() * 2 - 1), 0, 100);
    var noCargo = agora() - (v.inicio != null ? v.inicio : agora());
    if (noCargo >= 3 && (v.conf < 18 || p.idx < 15) && Math.random() < 0.25) {
      var c = nomeChefe(p);
      manchete_(c + " demite " + j.nome + " da pasta (" + p.nome + ") após " + (v.conf < 22 ? "perda de confiança" : "resultados ruins") + ".", "posse");
      ok(function () { sairPasta("demitido(a) por " + c); });
      return;
    }
    v.avisoDem = v.conf < 28 || p.idx < 25;
    v.agenda = {};
    gerarDespachos(p);
  };

  /* ---------------------------------------------------------------- ações */
  function instalarAcoes() {
    if (typeof A === "undefined" || A.p3Desp) return;
    A.p3Desp = function (i, o) {
      var p = pasta(); if (!p) return; var v = V3(p), d = v.desp[i]; if (!d || d.feito) return;
      var op = d.ops[o]; if (!op) return;
      var ef = aplicar(op[1], p, d.t);
      d.feito = { o: o, res: op[2], ef: ef };
      v.hist.unshift({ m: agora(), t: d.t + ": " + op[0] + ". " + op[2], tipo: (op[1].idx || 0) + (op[1].kpi || 0) + (op[1].ap || 0) * 4 >= 0 ? "bom" : "ruim" });
      v.hist = v.hist.slice(0, 12);
      if (Math.random() < 0.3) manchete_(J().nome + " (" + p.nome + "): " + d.t.toLowerCase() + ", a decisão foi " + op[0].charAt(0).toLowerCase() + op[0].slice(1) + ".", "posse");
    };
    A.p3Chefe = function (tipo) {
      var p = pasta(); if (!p) return; var v = V3(p);
      if (v.agenda.chefe) { toast_("Você já despachou com " + CHEFE_TIT[p.nivel] + " neste mês.", "err"); return; }
      if (!gastarEnergia(5)) return;
      v.agenda.chefe = 1;
      var c = nomeChefe(p), r;
      if (tipo === "resultados") { var d = Math.round((p.idx - 50) / 4 + (Math.random() * 4 - 2)); aplicar({ chefe: d }, p); r = d >= 0 ? c + " elogia os números (+" + d + " de confiança)." : c + " não se convence (" + d + " de confiança)."; }
      else if (tipo === "verba") { var okv = v.conf > 40 + Math.random() * 30; if (okv) { aplicar({ verba: 0.6, chefe: -4 }, p); r = c + " libera reforço de " + fmtR(base(p) * 0.6) + " para a pasta."; } else { aplicar({ chefe: -6 }, p); r = c + " nega a verba e reclama do pedido."; } }
      else { aplicar({ cap: 6, chefe: -3 }, p); r = c + " topa apoiar a sua pauta junto à base (+6 de capital político)."; }
      v.hist.unshift({ m: agora(), t: "Despacho com " + c + ": " + r, tipo: "info" }); v.hist = v.hist.slice(0, 12);
      toast_(r, "ok");
    };
    A.p3Agenda = function (tipo) {
      var p = pasta(); if (!p) return; var v = V3(p);
      if (v.agenda[tipo]) { toast_("Essa agenda já foi feita neste mês.", "err"); return; }
      var custo = { visita: 8, coletiva: 4, audiencia: 7 }[tipo] || 5;
      if (!gastarEnergia(custo)) return;
      v.agenda[tipo] = 1;
      var r, e;
      if (tipo === "visita") { var gafe = Math.random() < 0.12; e = gafe ? { ap: -0.4, esc: 1 } : { ap: 0.6, kpi: 1, idx: 1 }; r = gafe ? "Gafe na visita: um vídeo seu reclamando do calor viraliza." : "Visita a uma unidade da pasta em " + TERR[p.nivel] + ": fotos e elogios dos servidores."; }
      else if (tipo === "coletiva") { var bom = p.idx >= 50; e = bom ? { ap: 0.4, cap: 2 } : { ap: -0.3 }; r = bom ? "Coletiva com balanço positivo da pasta." : "Coletiva tensa: perguntas sobre os indicadores ruins."; }
      else { var b2 = Math.random() < 0.5 + (p.idx - 50) / 200; e = b2 ? { rel: 2, cap: 3 } : { rel: -1, ap: -0.2 }; r = b2 ? "Audiência na " + CASA[p.nivel] + ": você convence a comissão." : "Audiência na " + CASA[p.nivel] + ": a oposição encurrala você."; }
      aplicar(e, p, tipo);
      v.hist.unshift({ m: agora(), t: r, tipo: (e.ap || 0) >= 0 ? "bom" : "ruim" }); v.hist = v.hist.slice(0, 12);
      toast_(r, (e.ap || 0) >= 0 ? "ok" : "err");
    };
    A.p3Equipe = function (cargo, perfil) {
      var p = pasta(); if (!p) return; var v = V3(p);
      if (v.equipe[cargo] === perfil) return;
      if (!gastarEnergia(3)) return;
      v.equipe[cargo] = perfil;
      var nomes = { tecnico: "um quadro técnico de carreira", politico: "um operador político experiente", apadrinhado: "um indicado do seu partido", boa: "uma assessoria de imprensa profissional", agressiva: "um marqueteiro de redes agressivo", discreta: "uma assessoria discreta" };
      if (perfil === "apadrinhado") ok(function () { relPartido(4); });
      toast_("Você nomeia " + (nomes[perfil] || perfil) + ".", "ok");
    };
    A.p3Programa = function (i) {
      var p = pasta(); if (!p) return; var v = V3(p);
      if (v.prog) { toast_("A pasta já tem um programa-vitrine: " + v.prog.nome + ".", "err"); return; }
      var lista = PROGRAMAS[v.area] || PROGRAMAS.GEN, pr = lista[i]; if (!pr) return;
      var j = J(), custo = base(p) * 0.8;
      if ((j.capPol || 55) < 15) { toast_("Capital político insuficiente (precisa de 15).", "err"); return; }
      if ((p.orcPool || 0) < custo) { toast_("Orçamento insuficiente: o lançamento custa " + fmtR(custo) + ".", "err"); return; }
      if (!gastarEnergia(12)) return;
      j.capPol -= 15; p.orcPool -= custo;
      v.prog = { nome: pr[0], desc: pr[1], desde: agora() };
      aplicar({ ap: 1, idx: 4 }, p);
      manchete_(j.nome + " lança o programa “" + pr[0] + "”: " + pr[1].charAt(0).toLowerCase() + pr[1].slice(1) + ".", "posse");
      v.hist.unshift({ m: agora(), t: "Programa lançado: " + pr[0] + ".", tipo: "bom" });
    };
    // ação tática antiga também move os indicadores
    if (A.pastaTatica && !A.pastaTatica.__p3) {
      var _t = A.pastaTatica;
      A.pastaTatica = function () {
        var p = pasta(), i0 = p ? p.idx : 0;
        var r = _t.apply(this, arguments);
        try { if (p && p.idx !== i0) { var d = p.idx - i0; V3(p).kpi = V3(p).kpi.map(function (q) { return clamp(q + d * 0.8, 5, 95); }); } } catch (e) {}
        return r;
      };
      A.pastaTatica.__p3 = true;
    }
  }

  /* ---------------------------------------------------------------- tela */
  function kpiValor(def, q) { var v = def[3] + (def[2] - def[3]) * q / 100; return v.toFixed(def[4]).replace(".", ","); }
  function corQ(q) { return q >= 62 ? "bom" : q >= 40 ? "medio" : "ruim"; }
  function view() {
    var j = ok(function () { return J(); }, null); if (!j) return "";
    var p = j.pasta;
    if (!p) return '<div class="p3-vazio"><h2>Você não comanda uma pasta</h2><p>Secretarias e ministérios se conquistam por convite ou articulação. Vá em <b>Poder › Executivo &amp; pastas</b> e use "Articular uma pasta".</p><button type="button" class="b confirma" data-a="tab" data-p="' + pj(["poder"]) + '">Ir para Executivo &amp; pastas</button></div>';
    var v = V3(p);
    if (v.despMes !== agora()) gerarDespachos(p);
    var c = chefe(p), meses = Math.max(0, agora() - (v.inicio != null ? v.inicio : agora()));
    var h = '<div class="p3">';
    // cabeçalho
    h += '<header class="p3-cab"><div class="p3-cab-t"><span class="p3-niv">' + esc_({ M: "Prefeitura de Mauá", E: "Governo de São Paulo", F: "Governo federal" }[p.nivel] || "") + "</span><h2>" + esc_(p.nome) + "</h2><p>" + esc_(j.nome) + " · " + (meses ? "há " + meses + " " + (meses === 1 ? "mês" : "meses") + " no cargo" : "assumiu este mês") + " · orçamento " + fmtR(p.orcPool || 0) + " · capital político " + Math.round(j.capPol || 55) + "</p></div>" +
      '<div class="p3-cab-n"><div><small>Desempenho</small><b class="' + corQ(p.idx) + '">' + Math.round(p.idx) + "</b></div><div><small>Confiança d" + CHEFE_TIT[p.nivel].slice(0, 1) + " " + CHEFE_TIT[p.nivel].slice(2) + "</small><b class=\"" + corQ(v.conf) + '">' + Math.round(v.conf) + "</b></div></div></header>";
    if (v.avisoDem) h += '<div class="p3-alerta">⚠ ' + esc_(c ? c.nome : "O chefe") + " está insatisfeito(a). Com desempenho ou confiança baixos, você pode ser demitido(a) no próximo mês.</div>";
    // indicadores
    h += '<section class="p3-sec"><h3>Indicadores da área</h3><div class="p3-kpis">' + KPI[v.area].map(function (def, i) { var q = v.kpi[i]; return '<div class="p3-kpi ' + corQ(q) + '"><small>' + esc_(def[0]) + "</small><b>" + kpiValor(def, q) + " <i>" + esc_(def[1]) + '</i></b><div class="p3-kbar"><span style="width:' + Math.round(q) + '%"></span></div></div>'; }).join("") + "</div></section>";
    // despachos
    var pend = v.desp.filter(function (d) { return !d.feito; }).length;
    h += '<section class="p3-sec"><h3>Na sua mesa' + (pend ? ' <span class="p3-badge">' + pend + " pendente" + (pend > 1 ? "s" : "") + "</span>" : "") + '</h3><p class="p3-sub">Despachos do mês. O que ficar sem resposta pesa no desempenho e na confiança do chefe.</p><div class="p3-desp">';
    v.desp.forEach(function (d, i) {
      h += '<article class="p3-d' + (d.feito ? " feito" : "") + '"><b>' + esc_(d.t) + "</b><p>" + esc_(d.x) + "</p>";
      if (d.feito) h += '<div class="p3-res"><span>Você decidiu: ' + esc_(d.ops[d.feito.o][0]) + "</span><small>" + esc_(d.feito.res) + "</small>" + (d.feito.ef || []).map(function (e) { var val = e[2] === "R$" ? fmtR(e[1]) : (e[1] > 0 ? "+" : "") + (Math.round(e[1] * 10) / 10).toString().replace(".", ","); var bom = /Escândalo|Risco|Caixa 2/.test(e[0]) ? e[1] < 0 : e[1] > 0; return '<em class="' + (bom ? "bom" : "ruim") + '">' + esc_(e[0]) + " " + val + "</em>"; }).join("") + "</div>";
      else h += '<div class="p3-ops">' + d.ops.map(function (o, k) { return '<button type="button" class="b mini' + (k === 0 ? " confirma" : " branco") + '" data-a="p3Desp" data-p="' + pj([i, k]) + '">' + esc_(o[0]) + "</button>"; }).join("") + "</div>";
      h += "</article>";
    });
    h += "</div></section>";
    // chefe + agenda
    h += '<div class="p3-duo"><section class="p3-sec"><h3>Despachar com ' + esc_(c ? c.nome : CHEFE_TIT[p.nivel]) + "</h3><p class=\"p3-sub\">Uma reunião por mês. A confiança do chefe segura você no cargo.</p><div class=\"p3-col\">" +
      (v.agenda.chefe ? '<p class="p3-feito">Reunião deste mês já feita.</p>' :
        '<button type="button" class="p3-op" data-a="p3Chefe" data-p="' + pj(["resultados"]) + '"><b>Mostrar resultados</b><small>Confiança sobe se o desempenho estiver bom</small></button>' +
        '<button type="button" class="p3-op" data-a="p3Chefe" data-p="' + pj(["verba"]) + '"><b>Pedir mais verba</b><small>' + fmtR(base(p) * 0.6) + " se ele(a) confiar em você</small></button>" +
        '<button type="button" class="p3-op" data-a="p3Chefe" data-p="' + pj(["pauta"]) + '"><b>Pedir apoio à sua pauta</b><small>+6 de capital político, −3 de confiança</small></button>') + "</div></section>";
    h += '<section class="p3-sec"><h3>Agenda pública</h3><p class="p3-sub">Uma de cada por mês.</p><div class="p3-col">' +
      [["visita", "Visitar unidade ou obra", "−8 energia · aprovação e indicadores (risco de gafe)"], ["coletiva", "Coletiva de imprensa", "−4 energia · bom só se o desempenho estiver bom"], ["audiencia", "Audiência na " + CASA[p.nivel], "−7 energia · ganha ou perde a base"]].map(function (a) {
        return v.agenda[a[0]] ? '<p class="p3-feito">' + esc_(a[1]) + ": feito este mês.</p>" : '<button type="button" class="p3-op" data-a="p3Agenda" data-p="' + pj([a[0]]) + '"><b>' + esc_(a[1]) + "</b><small>" + esc_(a[2]) + "</small></button>";
      }).join("") + "</div></section></div>";
    // equipe + programa
    var eq = v.equipe;
    var bt = function (cargo, perfil, rot, dsc) { return '<button type="button" class="p3-chip' + (eq[cargo] === perfil ? " on" : "") + '" data-a="p3Equipe" data-p="' + pj([cargo, perfil]) + '"><b>' + rot + "</b><small>" + dsc + "</small></button>"; };
    h += '<div class="p3-duo"><section class="p3-sec"><h3>Sua equipe</h3><p class="p3-sub">Quem você nomeia muda o mês a mês da pasta.</p><h4>Secretário(a)-executivo(a)</h4><div class="p3-chips">' +
      bt("exec", "tecnico", "Técnico(a) de carreira", "+desempenho todo mês") + bt("exec", "politico", "Operador(a) político(a)", "+capital político") + bt("exec", "apadrinhado", "Indicado(a) do partido", "+partido, risco de denúncia") +
      '</div><h4>Assessoria de imprensa</h4><div class="p3-chips">' + bt("imprensa", "boa", "Profissional", "+aprovação estável") + bt("imprensa", "agressiva", "Agressiva nas redes", "oscila mais") + bt("imprensa", "discreta", "Discreta", "sem efeito") + "</div></section>";
    var progs = PROGRAMAS[v.area] || PROGRAMAS.GEN;
    h += '<section class="p3-sec"><h3>Programa-vitrine</h3>' + (v.prog ? '<div class="p3-prog"><b>“' + esc_(v.prog.nome) + "”</b><span>" + esc_(v.prog.desc) + "</span><small>Em vigor há " + (agora() - v.prog.desde) + " mês(es): melhora os indicadores e a aprovação todo mês, e consome parte do orçamento.</small></div>" :
      '<p class="p3-sub">A marca da sua gestão. Custa ' + fmtR(base(p) * 0.8) + " e 15 de capital político; depois rende todo mês.</p><div class=\"p3-col\">" + progs.map(function (pr, i) { return '<button type="button" class="p3-op" data-a="p3Programa" data-p="' + pj([i]) + '"><b>' + esc_(pr[0]) + "</b><small>" + esc_(pr[1]) + "</small></button>"; }).join("") + "</div>") + "</section></div>";
    // histórico
    if (v.hist.length) h += '<section class="p3-sec"><h3>Diário da pasta</h3><ul class="p3-hist">' + v.hist.slice(0, 8).map(function (x) { return '<li class="' + x.tipo + '">' + esc_(x.t) + "</li>"; }).join("") + "</ul></section>";
    // ações táticas antigas (mantidas)
    var tat = ok(function () { return cardPastaTopo(); }, "");
    if (tat) h += '<details class="p3-sec p3-tat"><summary><b>Ações táticas da pasta</b><small>operações, compras, auditorias, convênios e deixar o cargo</small></summary>' + tat + "</details>";
    return h + "</div>";
  }

  /* ---------------------------------------------------------------- instalação */
  function instalar() {
    instalarAcoes();
    if (typeof VIEWS !== "undefined" && !VIEWS.pasta) VIEWS.pasta = function () { return view(); };
    try { if (!TABS.some(function (t) { return t[0] === "pasta"; })) TABS.push(["pasta", "Minha pasta"]); } catch (e) {}
    var N = window.NAVH;
    if (N && N.HUBS && !N.__v3pasta) {
      N.__v3pasta = true;
      N.HUBS.forEach(function (h) { if (h.id === "poder" && !h.subs.some(function (s) { return s[0] === "pasta"; })) h.subs.unshift(["pasta", "Minha pasta"]); });
    }
    if (typeof window.avancarMes === "function" && !window.avancarMes.__v3pasta) {
      var o = window.avancarMes, ult = null;
      var nv = function () { var r = o.apply(this, arguments); try { var m = agora(); if (ult !== m) { ult = m; P3.mensal(); } } catch (e) { console.warn("pasta mensal", e); } return r; };
      for (var k in o) { try { nv[k] = o[k]; } catch (e) {} }
      nv.__v3pasta = true; window.avancarMes = nv; try { avancarMes = nv; } catch (e) {}
    }
    // quem não tem pasta cai em "Executivo & pastas" ao clicar em Poder
    if (typeof A !== "undefined" && A.hub && !A.hub.__p3) {
      var _h = A.hub;
      A.hub = function (id) { var r = _h.apply(this, arguments); try { if (id === "poder") { S.tab = pasta() ? "pasta" : "poder"; } } catch (e) {} return r; };
      A.hub.__p3 = true;
    }
    window.V3ALERTA = window.V3ALERTA || {};
    window.V3ALERTA.poder = function () { var p = pasta(); if (!p || !p.v3) return false; return p.v3.desp.some(function (d) { return !d.feito; }); };
  }
  instalar();
  document.addEventListener("DOMContentLoaded", function () { setTimeout(instalar, 0); });
  window.addEventListener("load", function () { setTimeout(instalar, 0); });
})();
