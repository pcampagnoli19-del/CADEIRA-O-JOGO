/* =============================================================================
   CADEIRA v3 — Debates eleitorais (gerado por tools/gerar_debates.py)
   Substitui o debate "aperta o botão" por eventos de calendário:
   - Agenda por cargo e turno (Band → SBT → Globo para Presidente e Governador;
     g1 → Diário do Grande ABC para Prefeito de Mauá). Na semana do debate o
     convite aparece; se a semana passar sem você, é "cadeira vazia".
   - Cada emissora tem estúdio, mediadores, vinheta e formato de blocos próprios.
   - Momentos: pergunta de mediador/jornalista/eleitor, confronto direto (você
     pergunta e é perguntado), resposta, réplica, tréplica, direito de resposta,
     considerações finais. Opções contextualizadas pelo tema e pelo nível
     (nacional, estadual, municipal); posições são lembradas e contradições pesam.
   - Repercussão: pesquisa relâmpago de quem venceu, popularidade sua e dos
     rivais (pesquisas), escândalo por gafe, manchetes no jornal e no feed.
   Escalável: novas emissoras em EMISSORAS, novos formatos em FORMATOS, novas
   datas em CALENDARIO, novas perguntas em BANCO.
   ============================================================================= */
(function () {
  "use strict";
  if (window.V3DEB) return;
  var IMG = __IMAGENS__;
  var DB = (window.V3DEB = {});
  DB.IMG = IMG; // reaproveitado pela transmissão da apuração (mediadores e logos)
  function esc_(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ok(f, d) { try { var v = f(); return v === undefined ? d : v; } catch (e) { return d; } }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function embaralha(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function data() { return ok(function () { return dt(); }, { ano: 2026, mes: 1, semana: 1 }); }
  function toast_(m, t) { try { toast(m, t || "ok"); } catch (e) {} }
  function nota(t, tipo) { try { manchete(t, tipo || "eleicao"); } catch (e) {} }
  var MESES_ = ["", "janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

  /* ================================================================ emissoras */
  var EMISSORAS = {
    band: { nome: "Band", titulo: "BAND ELEIÇÕES", logo: "logo_band", vinheta: "Debate Band", audiencia: 1.0, tema: "band",
      estudio: { PRES: "estudio_band_pres", GOV: "estudio_band_gov" },
      mediadores: [{ nome: "Adriana Araújo", img: "med_adriana_araujo" }, { nome: "Eduardo Oinegue", img: "med_eduardo_oinegue" }],
      convidados: ["jornalista da BandNews", "comentarista do Jornal da Band", "repórter da Rádio Bandeirantes"], formato: "band" },
    sbt: { nome: "SBT", titulo: "DEBATE SBT", logo: "logo_sbt", vinheta: "Debate SBT", audiencia: 0.9, tema: "sbt",
      estudio: { PRES: "estudio_sbt_pres", GOV: "estudio_sbt_gov" },
      mediadores: [{ nome: "Celso Freitas", img: "med_celso_freitas" }, { nome: "Mariana Demori", img: "med_mariana_demori" }],
      convidados: ["jornalista do SBT News", "colunista convidado", "repórter de política do SBT"], formato: "sbt" },
    globo: { nome: "TV Globo", titulo: "ELEIÇÕES • DEBATE NA GLOBO", logo: "logo_globo", vinheta: "Debate na Globo", audiencia: 1.35, tema: "globo",
      estudio: { PRES: "estudio_globo_pres", GOV: "estudio_globo_gov" },
      mediadores: [{ nome: "César Tralli", img: "med_cesar_tralli" }, { nome: "Renata Lo Prete", img: "med_renata_lo_prete" }],
      convidados: [], formato: "globo" },
    g1: { nome: "g1", titulo: "DEBATE g1 • PREFEITURA DE MAUÁ", logo: "g1", logoMarca: true, vinheta: "Debate g1", audiencia: 0.8, tema: "g1",
      estudio: { PREF: "estudio_g1" },
      mediadores: [{ nome: "Carol Prado", img: "med_carol_prado" }, { nome: "Luiza Tenente", img: "med_luiza_tenente" }],
      convidados: ["leitora do g1 no Jardim Zaíra", "leitor do g1 no Parque São Vicente", "leitora do g1 no Centro"], formato: "g1" },
    dgabc: { nome: "Diário do Grande ABC", titulo: "DEBATE DIÁRIO DO GRANDE ABC", logo: "dgabc", logoMarca: true, vinheta: "Debate Diário", audiencia: 0.75, tema: "dgabc",
      estudio: { PREF: "estudio_dgabc" },
      mediadores: [{ nome: "Inácio Siqueira", img: "med_inacio_siqueira" }],
      convidados: ["editor de política do Diário", "repórter de cidades do Diário", "eleitor de Mauá ouvido pelo Diário"], formato: "dgabc" }
  };
  DB.EMISSORAS = EMISSORAS;

  // Formatos: sequência de blocos e de momentos (pm = pergunta de mediador; pj = jornalista convidado; pe = eleitor;
  // cl = confronto com tema livre; ct = confronto com tema sorteado; cf = considerações finais)
  var FORMATOS = {
    band: [{ t: "1º BLOCO • PERGUNTAS DOS MEDIADORES", m: ["pm", "pm"] }, { t: "2º BLOCO • CONFRONTO DIRETO", m: ["cl", "cl"] }, { t: "3º BLOCO • PERGUNTAS DE JORNALISTAS", m: ["pj", "ct"] }, { t: "4º BLOCO • CONSIDERAÇÕES FINAIS", m: ["cf"] }],
    sbt: [{ t: "1º BLOCO • CONFRONTO COM TEMA SORTEADO", m: ["ct", "ct"] }, { t: "2º BLOCO • PERGUNTAS DE JORNALISTAS", m: ["pj", "pm"] }, { t: "3º BLOCO • CONFRONTO LIVRE", m: ["cl", "cl"] }, { t: "4º BLOCO • CONSIDERAÇÕES FINAIS", m: ["cf"] }],
    globo: [{ t: "1º BLOCO • TEMA LIVRE", m: ["cl", "cl"] }, { t: "2º BLOCO • TEMAS DETERMINADOS", m: ["ct", "ct"] }, { t: "3º BLOCO • TEMA LIVRE", m: ["cl", "cl"] }, { t: "4º BLOCO • CONSIDERAÇÕES FINAIS", m: ["cf"] }],
    g1: [{ t: "1º BLOCO • PERGUNTAS DAS MEDIADORAS", m: ["pm", "pm"] }, { t: "2º BLOCO • PERGUNTAS DOS LEITORES", m: ["pe", "pe"] }, { t: "3º BLOCO • CONFRONTO DIRETO", m: ["cl", "ct"] }, { t: "4º BLOCO • CONSIDERAÇÕES FINAIS", m: ["cf"] }],
    dgabc: [{ t: "1º BLOCO • PERGUNTAS DO DIÁRIO", m: ["pm", "pj"] }, { t: "2º BLOCO • CONFRONTO DIRETO", m: ["cl", "cl"] }, { t: "3º BLOCO • O ELEITOR PERGUNTA", m: ["pe", "ct"] }, { t: "4º BLOCO • CONSIDERAÇÕES FINAIS", m: ["cf"] }]
  };
  DB.FORMATOS = FORMATOS;

  // Calendário (mês, semana da campanha). 1º turno é apurado ao avançar a semana 1 de outubro; 2º turno, a semana 4.
  var CALENDARIO = {
    PRES: { 1: [{ e: "band", m: 8, s: 2 }, { e: "sbt", m: 9, s: 3 }, { e: "globo", m: 10, s: 1 }], 2: [{ e: "band", m: 10, s: 2 }, { e: "globo", m: 10, s: 4 }] },
    GOV: { 1: [{ e: "band", m: 8, s: 2 }, { e: "sbt", m: 9, s: 3 }, { e: "globo", m: 10, s: 1 }], 2: [{ e: "band", m: 10, s: 2 }, { e: "globo", m: 10, s: 4 }] },
    PREF: { 1: [{ e: "g1", m: 9, s: 3 }, { e: "dgabc", m: 10, s: 1 }], 2: [{ e: "dgabc", m: 10, s: 3 }] }
  };
  DB.CALENDARIO = CALENDARIO;
  var NOME_CARGO = { PRES: "Presidente da República", GOV: "Governador de São Paulo", PREF: "Prefeito de Mauá" };
  var NIVEL = { PRES: "nac", GOV: "est", PREF: "mun" };
  var CARGO_TXT = { PRES: "presidente da República", GOV: "governador de São Paulo", PREF: "prefeito de Mauá" };
  function curto(nome) { var t = String(nome).split(" ").filter(function (x) { return !/^(de|da|do|dos|das|e)$/i.test(x); }); return t.length > 2 ? t[0] + " " + t[t.length - 1] : t.join(" "); }
  function por_(x) { return String(x).replace(/^(as|os|a|o) /, function (m, art) { return { a: "pela ", o: "pelo ", as: "pelas ", os: "pelos " }[art]; }).replace(/^(?!pel)/, "por "); }
  function trat(c) { return c && c.sexo === "F" ? "a senhora" : "o senhor"; }

  /* ================================================================ banco de temas
     Cada tema: perguntas (do mediador), posições (a/b) com propostas e o que o adversário critica. */
  var BANCO = {
    nac: {
      economia: { nome: "Economia e emprego", perg: ["Os juros altos travam o crédito e o emprego. Como o senhor pretende baixar o custo do dinheiro sem descontrolar a inflação?", "O brasileiro sente o preço da comida no supermercado. O que muda no primeiro ano do seu governo?"],
        pos: { a: { r: "responsabilidade fiscal", p: "Vou cumprir a meta fiscal, cortar gasto ineficiente e dar previsibilidade para os juros caírem de forma sustentável." }, b: { r: "investimento público", p: "Vou retomar obras paradas e o crédito dos bancos públicos para gerar emprego já, porque crescimento também equilibra as contas." } },
        ataque: "a política econômica que deixou o país com juros entre os mais altos do mundo" },
      seguranca: { nome: "Segurança pública", perg: ["As facções criminosas avançam sobre o comércio, os portos e até o setor de combustíveis. Qual é o seu plano concreto?", "O governo federal deve ter um papel maior na segurança, que hoje é dos estados?"],
        pos: { a: { r: "linha dura", p: "Vou integrar as polícias, endurecer a progressão de pena para líderes de facção e asfixiar o dinheiro do crime com a Receita e o Coaf." }, b: { r: "inteligência e prevenção", p: "Vou criar um sistema único de segurança com inteligência integrada, rastrear o dinheiro do crime e ocupar os territórios com políticas sociais." } },
        ataque: "a explosão do crime organizado sem nenhuma resposta firme" },
      saude: { nome: "Saúde", perg: ["A fila de cirurgias eletivas no SUS passa de um milhão de pessoas. Como zerar essa espera?", "Faltam médicos no interior e nas periferias. O que o senhor vai fazer?"],
        pos: { a: { r: "parceria com o setor privado", p: "Vou comprar cirurgias da rede privada e filantrópica com tabela atualizada e zerar a fila em dois anos." }, b: { r: "fortalecer o SUS público", p: "Vou ampliar o Mais Médicos, reajustar a tabela do SUS e abrir policlínicas regionais para especialistas." } },
        ataque: "as filas do SUS que só aumentaram" },
      educacao: { nome: "Educação", perg: ["Metade das crianças não está alfabetizada na idade certa. Qual é a sua prioridade?", "O novo ensino médio virou motivo de briga. O que o senhor faria?"],
        pos: { a: { r: "gestão e metas", p: "Vou premiar escolas por resultado, garantir alfabetização até os 7 anos com avaliação anual e ampliar o ensino técnico." }, b: { r: "investimento e valorização", p: "Vou ampliar o tempo integral, pagar o piso aos professores e levar internet de qualidade a todas as escolas." } },
        ataque: "o apagão da educação nos últimos anos" },
      externa: { nome: "Política externa", perg: ["Os Estados Unidos impuseram tarifas a produtos brasileiros. Como o senhor negociaria?", "Qual deve ser a posição do Brasil entre os Estados Unidos e a China?"],
        pos: { a: { r: "alinhamento com o Ocidente", p: "Vou reaproximar o Brasil dos Estados Unidos e da Europa, destravar o acordo com a União Europeia e atrair investimento." }, b: { r: "multilateralismo", p: "Vou negociar com todos sem alinhamento automático: fortalecer o Mercosul e os BRICS e diversificar mercados." } },
        ataque: "a diplomacia que isolou o Brasil" },
      ambiente: { nome: "Meio ambiente", perg: ["O desmatamento e as queimadas voltaram ao noticiário. Como conciliar agronegócio e preservação?", "O senhor é a favor de explorar petróleo na foz do Amazonas?"],
        pos: { a: { r: "produção com regra clara", p: "Vou dar segurança jurídica ao produtor, punir o desmatamento ilegal e explorar nossas riquezas com licenciamento rápido." }, b: { r: "transição verde", p: "Vou zerar o desmatamento ilegal, pagar por serviço ambiental e fazer do Brasil potência em energia limpa." } },
        ataque: "o descaso com a Amazônia" },
      etica: { nome: "Ética e combate à corrupção", perg: ["O eleitor desconfia da classe política. Por que deveria confiar no senhor?", "O orçamento secreto e as emendas sem transparência devem acabar?"],
        pos: { a: { r: "transparência total", p: "Vou publicar todas as emendas em tempo real e apoiar o fim do foro privilegiado para crimes comuns." }, b: { r: "reforma do sistema", p: "Vou propor reforma política com fim das emendas impositivas e controle do Tribunal de Contas." } },
        ataque: "os escândalos de corrupção que nunca foram explicados" }
    },
    est: {
      seguranca: { nome: "Segurança pública", perg: ["Roubos de celular e golpes digitais explodiram na capital. Qual é o seu plano para a polícia de São Paulo?", "O senhor manteria as câmeras corporais nos uniformes da PM?"],
        pos: { a: { r: "polícia mais ostensiva", p: "Vou contratar mais policiais, ampliar o policiamento nas ruas e dar retaguarda jurídica a quem combate o crime." }, b: { r: "câmeras e inteligência", p: "Vou manter e ampliar as câmeras corporais e criar uma central de inteligência contra o roubo de celular e o golpe digital." } },
        ataque: "a violência policial e a insegurança que cresceram juntas" },
      transporte: { nome: "Transporte metropolitano", perg: ["As linhas da CPTM concedidas à iniciativa privada tiveram falhas em série. O senhor faria novas concessões?", "Quando o morador da Grande São Paulo vai ter Metrô perto de casa?"],
        pos: { a: { r: "ampliar concessões", p: "Vou conceder mais linhas com contrato rígido e multa pesada por falha, e usar o dinheiro para expandir o Metrô." }, b: { r: "transporte público estatal", p: "Vou suspender novas concessões, reforçar a manutenção da CPTM e acelerar as obras das linhas do Metrô." } },
        ataque: "o caos nos trens metropolitanos" },
      saude: { nome: "Saúde estadual", perg: ["Pacientes esperam meses por cirurgia nos hospitais estaduais. O que muda?", "Faltam leitos de UTI no interior. Qual é o plano?"],
        pos: { a: { r: "parcerias com OSs", p: "Vou ampliar a gestão por organizações sociais com metas e abrir mutirões de cirurgia nos fins de semana." }, b: { r: "rede estadual própria", p: "Vou abrir novos hospitais regionais com gestão pública e contratar médicos por concurso." } },
        ataque: "as filas de cirurgia na rede estadual" },
      educacao: { nome: "Educação", perg: ["As escolas estaduais trocaram parte do livro didático por plataformas digitais. O senhor manteria?", "Como valorizar o professor da rede estadual?"],
        pos: { a: { r: "tecnologia e metas", p: "Vou manter as plataformas com conteúdo revisado, ampliar o ensino integral e pagar bônus por resultado." }, b: { r: "professor no centro", p: "Vou recompor o salário dos professores, devolver o livro didático e reduzir o número de alunos por sala." } },
        ataque: "o desmonte da escola pública paulista" },
      saneamento: { nome: "Saneamento e Sabesp", perg: ["Depois da privatização da Sabesp, as tarifas e as falhas no abastecimento viraram tema. O senhor revisaria o contrato?", "Quando os rios e córregos da Grande São Paulo vão ser despoluídos?"],
        pos: { a: { r: "a favor da privatização", p: "Vou cobrar as metas de universalização do contrato da Sabesp e acelerar a despoluição com o investimento privado." }, b: { r: "contra a privatização", p: "Vou rever o contrato da Sabesp, proteger a tarifa social e retomar o controle público do saneamento." } },
        ataque: "a privatização da Sabesp, que aumentou a conta de água" },
      habitacao: { nome: "Habitação", perg: ["Milhares de famílias vivem em área de risco na Grande São Paulo. Qual é a solução?"],
        pos: { a: { r: "parceria com construtoras", p: "Vou fazer parceria público-privada para construir moradia popular perto do emprego e regularizar os terrenos." }, b: { r: "moradia como direito", p: "Vou retomar a CDHU com força, urbanizar favelas e usar prédios vazios do centro para moradia." } },
        ataque: "o abandono das famílias em área de risco" },
      economia: { nome: "Economia e emprego", perg: ["A indústria paulista perde espaço. Como gerar emprego de qualidade no estado?"],
        pos: { a: { r: "menos impostos", p: "Vou simplificar o ICMS, cortar burocracia e atrair investimento com segurança jurídica." }, b: { r: "indústria e inovação", p: "Vou criar um fundo estadual de inovação e apoiar a reindustrialização das regiões que perderam fábricas." } },
        ataque: "o fechamento de fábricas e empregos em São Paulo" }
    },
    mun: {
      saude: { nome: "Saúde em Mauá", perg: ["O Hospital Nardini vive superlotado e a espera por especialista passa de meses. O que o senhor faz já em janeiro?", "As UBSs fecham cedo e o morador recorre à UPA. Como mudar isso?"],
        pos: { a: { r: "convênios e mutirões", p: "Vou contratar consultas e exames em clínicas parceiras e fazer mutirões no Nardini para zerar a fila de especialistas." }, b: { r: "rede própria", p: "Vou abrir UBSs até as 22h, contratar médicos por concurso e ampliar o Nardini com recursos do Estado e da União." } },
        ataque: "as filas e a superlotação do Nardini" },
      mobilidade: { nome: "Mobilidade e transporte", perg: ["Quem pega ônibus em Mauá perde horas no trânsito até a estação da Linha 10. Qual é o plano?", "A Avenida Barão de Mauá trava todos os dias. O que fazer?"],
        pos: { a: { r: "nova concessão do transporte", p: "Vou refazer a licitação dos ônibus com metas de horário, ônibus novos e integração tarifária com a CPTM." }, b: { r: "corredores e tarifa", p: "Vou criar corredores exclusivos até a estação, congelar a tarifa e cobrar do Estado a modernização da Linha 10." } },
        ataque: "o transporte caro e lotado de Mauá" },
      enchentes: { nome: "Enchentes e saneamento", perg: ["A cada chuva forte, famílias perdem tudo nas margens dos córregos. Como acabar com as enchentes?", "Bairros inteiros ainda não têm esgoto tratado. Qual é a sua meta?"],
        pos: { a: { r: "obras de drenagem", p: "Vou construir piscinões e canalizar os pontos críticos com recursos estaduais e federais já em 2027." }, b: { r: "prevenção e moradia", p: "Vou tirar as famílias das áreas de risco com moradia digna, limpar os córregos todo mês e cobrar a Sabesp pelo esgoto." } },
        ataque: "as enchentes que voltam todo verão" },
      habitacao: { nome: "Habitação", perg: ["Há famílias no Jardim Zaíra e em outras áreas morando em encostas. O que o senhor propõe?"],
        pos: { a: { r: "regularização fundiária", p: "Vou regularizar os lotes, dar escritura para as famílias e atrair construtoras para moradia popular." }, b: { r: "moradia popular pública", p: "Vou construir conjuntos habitacionais em parceria com o Minha Casa, Minha Vida e urbanizar os núcleos." } },
        ataque: "o abandono das famílias das encostas" },
      educacao: { nome: "Educação", perg: ["Faltam vagas em creche em vários bairros de Mauá. Quando a fila acaba?"],
        pos: { a: { r: "creches conveniadas", p: "Vou ampliar os convênios com creches comunitárias e zerar a fila em dois anos." }, b: { r: "creches municipais", p: "Vou construir creches municipais e contratar professores concursados para garantir qualidade." } },
        ataque: "a fila de creche que não anda" },
      economia: { nome: "Emprego e desenvolvimento", perg: ["O Polo Petroquímico perdeu vagas e o comércio do centro está fechando. Como gerar emprego em Mauá?"],
        pos: { a: { r: "atrair empresas", p: "Vou reduzir o ISS para empresas novas, criar um distrito logístico e trazer indústrias para o Sertãozinho." }, b: { r: "qualificação e pequeno negócio", p: "Vou abrir escolas técnicas com o Polo Petroquímico e criar crédito municipal para o pequeno comerciante." } },
        ataque: "o desemprego e as lojas fechadas no centro" },
      seguranca: { nome: "Segurança e zeladoria", perg: ["Moradores reclamam de ruas escuras e de assaltos nos pontos de ônibus. O que a prefeitura pode fazer?"],
        pos: { a: { r: "Guarda armada", p: "Vou armar e ampliar a Guarda Civil Municipal e espalhar câmeras com leitura de placas pela cidade." }, b: { r: "iluminação e prevenção", p: "Vou trocar toda a iluminação por LED, colocar câmeras nos pontos de ônibus e abrir centros esportivos nos bairros." } },
        ataque: "as ruas escuras e a insegurança nos bairros" }
    }
  };
  DB.BANCO = BANCO;

  /* ================================================================ estado e calendário */
  function st() { var m = ok(function () { return M(); }, null); if (!m) return null; if (!m.v3deb) m.v3deb = { agenda: [], ativo: null, posicoes: {}, hist: [] }; return m.v3deb; }
  function cargoJog() { return ok(function () { return cargoIdPorNome(J().campanha.cargo_alvo); }, null); }
  function candidato() { return ok(function () { return !!J().campanha.candidatura_ativa; }, false); }
  function tipoAno() { return ok(function () { return tipoEleicao(data().ano); }, null); }
  function noSegundo() { return ok(function () { var s = M().eleicao.segundo_turno; return !!(s && s.candidatos && s.candidatos.some(function (c) { return c.jogador; })); }, false); }
  function idx(m, s) { return m * 10 + s; }
  function agora() { var d = data(); return idx(d.mes, d.semana || 1); }
  function montarAgenda() {
    var S_ = st(); if (!S_) return;
    var d = data(), c = cargoJog(), t = tipoAno();
    if (!c || !CALENDARIO[c] || !candidato() || !t) return;
    if ((c === "PREF") !== (t === "MUNICIPAL")) return;
    var turnos = [1].concat(noSegundo() ? [2] : []);
    turnos.forEach(function (tu) {
      CALENDARIO[c][tu].forEach(function (x) {
        var id = d.ano + "-" + c + "-" + x.e + "-" + tu;
        if (S_.agenda.some(function (a) { return a.id === id; })) return;
        var passou = idx(x.m, x.s) < agora() && d.mes >= 8;
        S_.agenda.push({ id: id, ano: d.ano, cargo: c, e: x.e, m: x.m, s: x.s, turno: tu, status: passou ? "antes" : "agendado" });
        if (!passou) nota("Calendário eleitoral: " + EMISSORAS[x.e].nome + " confirma debate entre os candidatos a " + CARGO_TXT[c] + " na " + x.s + "ª semana de " + MESES_[x.m] + (tu === 2 ? " (2º turno)" : "") + ".");
      });
    });
  }
  function eventoDaSemana() {
    var S_ = st(); if (!S_) return null; var d = data();
    return S_.agenda.filter(function (a) { return a.ano === d.ano && a.m === d.mes && a.s === (d.semana || 1) && (a.status === "agendado" || a.status === "hoje"); })[0] || null;
  }
  DB.eventoDaSemana = eventoDaSemana;
  function ausencia(ev) {
    ev.status = "ausente";
    var j = J(), E = EMISSORAS[ev.e];
    var perda = 1.6 * E.audiencia;
    j.popularidade = clamp(j.popularidade - perda, 0, 100);
    try { mudarAprovTodos(-perda * 0.6); } catch (e) {}
    nota("Cadeira vazia: " + j.nome + " falta ao debate da " + E.nome + " e vira alvo dos adversários ao vivo.", "imprensa");
    toast_("Você faltou ao debate da " + E.nome + ": −" + perda.toFixed(1) + " de popularidade.", "err");
  }

  /* ================================================================ candidatos */
  function seed(s) { var h = 0; s = String(s); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
  function atrNpc(n, k) { var b = n[k] != null ? n[k] : null; if (b != null) return b; var s = seed(n.id + k); return clamp(Math.round((n.carisma || 55) * 0.4 + 30 + (s % 30)), 35, 92); }
  function estiloDe(c) { return c.ret >= c.int && c.ret >= c.car ? "agressivo" : c.int >= c.car ? "técnico" : "populista"; }
  function fotoNpc(n) { return ok(function () { return obterFotoPolitico(n); }, "") || n.foto || ""; }
  function candidatosDebate(cargo, turno) {
    var j = J(), lista = [];
    lista.push({ id: "JOGADOR", nome: j.nome, sexo: j.sexo, partido: j.partido_atual, foto: ok(function () { return j.foto || ""; }, ""), jog: true,
      car: j.atributos.carisma, ret: j.atributos.retorica, int: j.atributos.inteligencia, itg: j.atributos.integridade, esc: j.escandalo || 0, pop: j.popularidade });
    var npcs = [];
    if (turno === 2) {
      var s2 = ok(function () { return M().eleicao.segundo_turno.candidatos; }, []) || [];
      s2.filter(function (c) { return !c.jogador; }).forEach(function (c) { var n = bancoDeNPCs.find(function (x) { return x.id === c.id || x.nome === c.nome; }); if (n) npcs.push(n); });
    } else {
      npcs = ok(function () { return candidatosMajoritarios(cargo).map(function (c) { return c.npc; }); }, []).filter(Boolean).slice(0, cargo === "PREF" ? 3 : 4);
    }
    npcs.forEach(function (n) {
      var c = { id: n.id, nome: n.nome, sexo: n.sexo, partido: n.partido || n.partidoBase || "", foto: fotoNpc(n), jog: false, npc: n.id,
        car: atrNpc(n, "carisma"), ret: atrNpc(n, "retorica"), int: atrNpc(n, "inteligencia"), itg: atrNpc(n, "integridade"), esc: n.escandalo || n.corrupcao_oculta / 3 || 0, pop: n.popularidade || 30,
        inc: /Prefeito de Mauá|Governador de SP|Presidente da República/.test(n.cargo) };
      c.estilo = estiloDe(c); lista.push(c);
    });
    return lista;
  }
  function lado(partido) { return ok(function () { return (PARTIDOS[partido] || {}).e; }, "C") || "C"; }

  /* ================================================================ sessão */
  function temasDo(nivel) { return Object.keys(BANCO[nivel]); }
  function iniciar(evId) {
    var S_ = st(); var ev = S_.agenda.filter(function (a) { return a.id === evId; })[0];
    if (!ev || ev.status === "feito" || ev.status === "ausente") return;
    var hoje = eventoDaSemana();
    if (!hoje || hoje.id !== ev.id) { toast_("Esse debate não é nesta semana. Confira a agenda.", "err"); return; }
    var E = EMISSORAS[ev.e], nivel = NIVEL[ev.cargo];
    var cands = candidatosDebate(ev.cargo, ev.turno);
    if (cands.length < 2) { toast_("Não há adversários confirmados para este debate.", "err"); return; }
    var fila = [];
    FORMATOS[E.formato].forEach(function (b, bi) { b.m.forEach(function (tipo, mi) { fila.push({ bloco: bi, titulo: b.t, tipo: tipo, primeiro: mi === 0 }); }); });
    var temas = embaralha(temasDo(nivel));
    S_.ativo = { ev: ev.id, e: ev.e, cargo: ev.cargo, turno: ev.turno, nivel: nivel, cands: cands, fila: fila, i: -1, temas: temas, ti: 0,
      pts: {}, plateia: 50, redes: 30, log: [], destaques: [], gafes: [], fase: "abertura", cena: null, posAqui: {}, fim: false, avisos: 0 };
    cands.forEach(function (c) { S_.ativo.pts[c.id] = { arg: 0, prop: 0, ataque: 0, defesa: 0, gafe: 0, postura: 0 }; });
    ev.status = "hoje";
    var pre = ok(function () { return preShow(); }, []);
    S_.ativo.cena = pre.length ? pre.shift() : cenaAbertura();
    S_.ativo.fila_cenas = pre.length ? pre.concat([cenaAbertura()]) : [];
    render_();
  }
  DB.iniciar = iniciar;
  function render_() { try { render(); } catch (e) {} }
  function A_() { return st().ativo; }
  function med(i) { var E = EMISSORAS[A_().e]; return E.mediadores[(i == null ? A_().i + 1 : i) % E.mediadores.length]; }
  function proxTema() { var a = A_(); var t = a.temas[a.ti % a.temas.length]; a.ti++; return t; }
  function cJ() { return A_().cands[0]; }
  function rivais() { return A_().cands.slice(1); }
  function nomeC(c) { return c.jog ? "você" : c.nome; }
  function soma(id) { var p = A_().pts[id]; return p.arg + p.prop + p.ataque + p.defesa + p.postura - p.gafe; }

  function cenaAbertura() {
    var a = A_(), E = EMISSORAS[a.e], m = E.mediadores[0];
    return { tipo: "fala", rot: "ABERTURA OFICIAL", quem: { med: m }, txt: "Boa noite. Está no ar o " + E.vinheta + " entre os candidatos a " + CARGO_TXT[a.cargo] + (a.turno === 2 ? " no segundo turno" : "") + ". Participam " + a.cands.map(function (c) { return c.nome; }).join(", ") + ". As regras: cada candidato tem tempo para responder, a quem perguntou cabe a réplica e a quem respondeu, a tréplica. A plateia não pode se manifestar. A ordem dos blocos foi definida em sorteio com as assessorias. Vamos ao primeiro bloco.", botao: "Começar o debate" };
  }
  /* ---------- pré-debate: vinheta, apresentação, chegada e entrevistas ---------- */
  function reporterDeb(e) {
    var tv = ok(function () { return window.V3TV.IMG; }, {}) || {}, dg = ok(function () { return window.V3DGABC.IMG; }, {}) || {};
    return { globo: { nome: "Maju Coutinho", foto: tv.rep_globo_se }, band: { nome: "Cynthia Martins", foto: tv.rep_band_se }, dgabc: { nome: "Mariana Gutierrez", foto: dg.mariana } }[e] || { nome: "Reportagem " + EMISSORAS[e].nome, foto: "" };
  }
  function preShow() {
    var a = A_(), E = EMISSORAS[a.e], m = E.mediadores[0], rep = reporterDeb(a.e), l = [];
    var tot = a.cands.reduce(function (s2, c) { return s2 + Math.max(5, c.pop || 20); }, 0) || 1;
    var base = a.cands.map(function (c) { return { id: c.id, nome: c.nome, partido: c.partido, share: Math.max(5, c.pop || 20) / tot * 90 }; });
    var pq = ok(function () { return window.V3COB.pesquisa(a.cargo, base, "deb" + a.ev); }, null);
    var pos = 1, pct = 0, lider = "";
    if (pq) { pos = pq.itens.length + 1; pq.itens.forEach(function (x, i) { if (x.jogador || x.nome === J().nome) { pos = i + 1; pct = x.pct; } }); lider = (pq.itens.filter(function (x) { return !x.jogador && x.nome !== J().nome; })[0] || {}).nome || ""; }
    l.push({ tipo: "pvinheta", rot: "AO VIVO" });
    l.push({ tipo: "papres", rot: "APRESENTAÇÃO", pq: pq, txt: "Boa noite. Em instantes, o " + E.vinheta + ". " + (a.turno === 2 ? "É o confronto final entre os dois candidatos que disputam o segundo turno para " + CARGO_TXT[a.cargo] + "." : a.cands.length + " candidatos disputam " + CARGO_TXT[a.cargo] + ".") + (pq && pq.itens[0] ? " Na última pesquisa " + pq.instituto + ", " + pq.itens[0].nome + " aparece à frente, com " + Math.round(pq.itens[0].pct) + "%." : "") + " Os temas que mais preocupam o eleitor, segundo as pesquisas, são saúde, segurança e emprego.", quem: { med: m } });
    a.cands.slice(1).concat([a.cands[0]]).forEach(function (c) {
      l.push({ tipo: "pchegada", rot: "CHEGADA DOS CANDIDATOS", cand: c.id, rep: rep, txt: c.jog ? "Você chega ao estúdio. Assessores, militantes e câmeras na porta." : ok(function () { return window.V3COB.falaNpc({ id: c.npc || c.id, nome: c.nome, partido: c.partido }, "chegada"); }, c.nome + " chega ao estúdio.") });
    });
    a.cands.slice(1).sort(function (x, y) { return (y.pop || 0) - (x.pop || 0); }).slice(0, 2).forEach(function (c) {
      var q = c.inc ? "O senhor chega como quem governa. Vai defender a gestão ou propor mudanças?" : c.esc > 20 ? "Seu nome está no noticiário pelas investigações. Vai ser cobrado hoje?" : c.estilo === "agressivo" ? "Dá para esperar um debate duro da sua parte?" : "Qual é a sua estratégia para esta noite?";
      if (c.sexo === "F") q = q.replace("O senhor", "A senhora");
      l.push({ tipo: "pentNpc", rot: "ENTREVISTAS", cand: c.id, rep: rep, q: q, txt: ok(function () { return window.V3COB.falaNpc({ id: c.npc || c.id, nome: c.nome, partido: c.partido }, "pre"); }, "") });
    });
    var temAliados = ok(function () { var co = J().campanha.coligacao; return co && co.length ? co.slice(0, 2).join(" e ") : ""; }, "");
    var Q = ok(function () { return window.V3COB.perguntasPreDebate({ pos: pos, pct: pct, lider: lider, cargoTxt: CARGO_TXT[a.cargo], temAliados: temAliados }); }, []);
    Q.forEach(function (x) { l.push({ tipo: "pentJog", rot: "ENTREVISTAS", rep: rep, q: x.q, ops: x.ops }); });
    l.push({ tipo: "ptransicao", rot: "VAI COMEÇAR" });
    return l;
  }
  function responderPre(opId) {
    var a = A_(), c = a.cena; if (!c || c.tipo !== "pentJog") return;
    var op = c.ops.filter(function (o) { return o.id === opId; })[0]; if (!op) return;
    var r = ok(function () { return window.V3COB.aplicarResposta(op, { canal: EMISSORAS[a.e].nome, rivalId: (rivais()[0] || {}).npc }); }, { delta: 0 });
    a.plateia = clamp(a.plateia + (r.azar ? -6 : (r.delta || 0) * 4), 5, 95); a.redes = clamp(a.redes + (op.ef && op.ef.base ? 6 : 2) + (r.azar ? 8 : 0), 0, 100);
    a.cena = { tipo: "pfala", rot: c.rot, quem: { cand: "JOGADOR" }, txt: op.fala, extra: r.azar ? "A frase repercute mal nos bastidores." : (r.delta || 0) > 0.4 ? "Boa repercussão entre os jornalistas." : "Os adversários anotam a resposta." };
    render_();
  }

  /* ---------- opções de resposta (contextualizadas) ---------- */
  function opcoesResposta(tema, alvoAtaque, contexto) {
    var a = A_(), B = BANCO[a.nivel][tema], j = cJ(), ops = [];
    var prev = st().posicoes[a.cargo + ":" + tema];
    ["a", "b"].forEach(function (k) {
      var contra = prev && prev !== k;
      ops.push({ id: "prop_" + k, ic: "📋", rot: "Proposta: " + B.pos[k].r, fala: B.pos[k].p, risco: contra ? "Contradição!" : "Baixo", pos: k, tipo: "prop" });
    });
    var temCargo = ok(function () { return J().cargo_atual && !/Cidad|Sem cargo/i.test(J().cargo_atual); }, false);
    if (temCargo) ops.push({ id: "defesa", ic: "🛡️", rot: "Defender seu histórico", fala: "No meu mandato eu enfrentei " + B.nome.toLowerCase() + " com trabalho: quem acompanha sabe o que entreguei.", risco: j.esc > 30 ? "Alto" : "Médio", tipo: "defesa" });
    if (alvoAtaque) ops.push({ id: "ataque", ic: "🎯", rot: "Atacar " + alvoAtaque.nome.split(" ")[0], fala: alvoAtaque.nome + " vem falar de " + B.nome.toLowerCase() + ", mas quem responde " + por_(B.ataque) + " é o grupo político de " + curto(alvoAtaque.nome) + ".", risco: alvoAtaque.esc > 15 ? "Médio" : "Alto", tipo: "ataque", alvo: alvoAtaque.id });
    ops.push({ id: "efeito", ic: "🔥", rot: "Frase de efeito", fala: pick(["O povo não come promessa, come resultado. E resultado eu tenho.", "Quem fala muito em " + B.nome.toLowerCase() + " na TV nunca pisou no bairro de quem sofre com isso.", "Enquanto eles discutem, a população espera. Eu vim para resolver."]), risco: "Alto", tipo: "efeito" });
    if (contexto !== "replica") ops.push({ id: "evasiva", ic: "🌫️", rot: "Fugir do assunto", fala: "Antes de responder, quero falar do que realmente importa para a população...", risco: "Médio", tipo: "evasiva" });
    return ops;
  }
  function opcoesConfronto(alvo, tema) {
    var B = BANCO[A_().nivel][tema];
    return [
      { id: "q_cobra", ic: "📌", rot: "Cobrar " + (alvo.inc ? "a gestão" : "o histórico"), fala: alvo.nome + ", a população quer saber: o que " + (alvo.inc ? "a sua gestão" : "o seu grupo") + " fez sobre " + B.ataque + "?", risco: "Médio", tipo: "ataque", alvo: alvo.id },
      { id: "q_prop", ic: "🧠", rot: "Pergunta sobre proposta", fala: alvo.nome + ", qual é a sua proposta concreta para " + B.nome.toLowerCase() + "? E de onde sai o dinheiro?", risco: "Baixo", tipo: "prop", alvo: alvo.id },
      { id: "q_arm", ic: "🪤", rot: "Pergunta armadilha", fala: alvo.nome + ", " + trat(alvo) + " é a favor ou contra " + B.pos.a.r + "? Responda sim ou não.", risco: alvo.int > 70 ? "Alto" : "Médio", tipo: "armadilha", alvo: alvo.id },
      { id: "q_esc", ic: "💣", rot: "Levantar escândalo", fala: alvo.nome + ", antes de falar de " + B.nome.toLowerCase() + ", explique ao eleitor as denúncias contra o seu grupo.", risco: alvo.esc > 20 ? "Médio" : "Muito alto", tipo: "escandalo", alvo: alvo.id }
    ];
  }
  function opcoesFinais() {
    return [
      { id: "f_prop", ic: "📋", rot: "Resumo das propostas", fala: "Apresentei aqui propostas concretas e com custo. Peço seu voto para colocar tudo isso em prática.", risco: "Baixo", tipo: "prop" },
      { id: "f_emo", ic: "❤️", rot: "Apelo emocional", fala: "Eu conheço a dor de quem acorda às quatro da manhã para trabalhar. É por essa gente que eu estou aqui.", risco: "Médio", tipo: "efeito" },
      { id: "f_ata", ic: "🎯", rot: "Último ataque", fala: "O eleitor viu hoje quem tem projeto e quem só tem desculpa. Não dá para repetir o erro.", risco: "Alto", tipo: "ataque" },
      { id: "f_uni", ic: "🕊️", rot: "Tom conciliador", fala: "Não vim aqui para brigar. Vim apresentar um caminho para unir a cidade e o país. Conto com você.", risco: "Baixo", tipo: "concilia" }
    ];
  }

  /* ---------- motor de avaliação ---------- */
  // Retorna {nota, gafe, txt} e aplica pontos ao autor.
  function avaliar(autor, op, alvo, tema, papel) {
    var a = A_(), P = a.pts[autor.id], r = rnd(-12, 12), nota = 0, gafe = null;
    var lad = lado(autor.partido);
    if (op.tipo === "prop") {
      nota = autor.int * 0.6 + autor.ret * 0.4 + r - 50;
      if (op.pos) {
        var chave = a.cargo + ":" + tema, prev = autor.jog ? st().posicoes[chave] : a.posAqui[autor.id + chave];
        if (prev && prev !== op.pos) { gafe = "contradição"; nota -= 30; }
        if (autor.jog) st().posicoes[chave] = op.pos; else a.posAqui[autor.id + chave] = op.pos;
        var esq = /estatal|público|direito|investimento|SUS|valoriz|contra a priva|prevenção|rede própria|municipais|verde|multilateral|reforma|professor|corredores|creches municipais|moradia popular|qualificação|iluminação/i.test(op.rot + " " + op.fala);
        if ((lad === "D" && esq) || (lad === "E" && !esq)) nota -= 4; // destoa da base
      }
      P.prop += Math.max(0, nota / 4); P.arg += nota / 6;
    } else if (op.tipo === "defesa") {
      nota = autor.itg * 0.5 + autor.ret * 0.5 + r - 52 - (autor.esc > 30 ? 18 : 0);
      if (autor.esc > 30 && Math.random() < 0.4) gafe = "histórico contestado";
      P.defesa += nota / 4;
    } else if (op.tipo === "ataque" || op.tipo === "armadilha" || op.tipo === "escandalo") {
      var vul = alvo ? (op.tipo === "armadilha" ? 70 - alvo.int : op.tipo === "escandalo" ? alvo.esc * 1.6 - 18 : alvo.esc * 0.8) : 0;
      nota = autor.ret * 0.6 + autor.car * 0.4 + r - 55 + vul / 2;
      if (op.tipo === "escandalo" && alvo && alvo.esc < 15) { gafe = "acusação sem prova"; nota -= 18; P.postura -= 6; }
      P.ataque += nota / 4; if (alvo) a.pts[alvo.id].defesa -= nota / 8;
      if (nota < -8) P.postura -= 4;
    } else if (op.tipo === "efeito") {
      var sorte = Math.random() + autor.car / 180;
      if (sorte > 0.78) { nota = 22; a.redes = clamp(a.redes + 14, 0, 100); if (autor.jog) a.destaques.push("Sua frase \"" + op.fala.slice(0, 60) + "…\" viralizou."); }
      else if (sorte < 0.42) { nota = -16; gafe = "frase virou meme"; a.redes = clamp(a.redes + 8, 0, 100); }
      else nota = 4;
      P.arg += nota / 4;
    } else if (op.tipo === "evasiva") {
      nota = -6 + r / 2; P.arg += nota / 4;
      if (Math.random() < 0.55) gafe = "não respondeu à pergunta";
    } else if (op.tipo === "concilia") {
      nota = autor.itg * 0.5 + autor.car * 0.5 + r - 48; P.postura += nota / 4;
    }
    if (gafe) { P.gafe += 12; if (autor.jog) a.gafes.push(gafe); }
    if (autor.jog) a.plateia = clamp(a.plateia + nota / 12, 5, 95);
    if (nota > 14 && autor.jog && !gafe && a.destaques.indexOf(op.rot + " (" + (BANCO[a.nivel][tema] ? BANCO[a.nivel][tema].nome : "considerações") + ")") < 0) a.destaques.push(op.rot + " (" + (BANCO[a.nivel][tema] ? BANCO[a.nivel][tema].nome : "considerações") + ")");
    return { nota: Math.round(nota), gafe: gafe };
  }
  function npcEscolhe(autor, ops) {
    var pesos = ops.map(function (o) {
      var w = 1;
      if (autor.estilo === "agressivo" && /ataque|escandalo|armadilha/.test(o.tipo)) w = 3;
      if (autor.estilo === "técnico" && o.tipo === "prop") w = 3;
      if (autor.estilo === "populista" && (o.tipo === "efeito" || o.tipo === "prop")) w = 2.5;
      if (o.tipo === "evasiva") w = 0.4;
      return w;
    });
    var t = pesos.reduce(function (x, y) { return x + y; }, 0), r = Math.random() * t;
    for (var i = 0; i < ops.length; i++) { r -= pesos[i]; if (r <= 0) return ops[i]; }
    return ops[0];
  }
  function falaNpc(c, op) { return op.fala.replace(/^No meu mandato/, c.inc ? "Na minha gestão" : "Na minha trajetória"); }
  function quemAtacaVoce() { var r = rivais().slice().sort(function (x, y) { return (y.estilo === "agressivo") - (x.estilo === "agressivo") || y.pop - x.pop; }); return r[0]; }
  function alvoPadrao() { var r = rivais().slice().sort(function (x, y) { return (y.inc ? 1 : 0) - (x.inc ? 1 : 0) || y.pop - x.pop; }); return r[0]; }

  /* ---------- roteiro: cada momento é uma sequência de cenas ---------- */
  function proximoMomento() {
    var a = A_(); a.i++;
    if (a.i >= a.fila.length) return encerrar();
    var mo = a.fila[a.i], cenas = [];
    if (mo.primeiro) cenas.push({ tipo: "vinheta", txt: mo.titulo });
    var tema = mo.tipo === "cf" ? null : proxTema(), B = tema ? BANCO[a.nivel][tema] : null;
    var E = EMISSORAS[a.e];
    if (mo.tipo === "pm" || mo.tipo === "pj" || mo.tipo === "pe") {
      var quem = mo.tipo === "pm" ? { med: med() } : { conv: pick(E.convidados.length ? E.convidados : ["jornalista convidado"]) };
      var pref = mo.tipo === "pe" ? "Tenho uma pergunta para " + cJ().nome + ": " : mo.tipo === "pj" ? cJ().nome + ", " : "Candidat" + (J().sexo === "F" ? "a " : "o ") + cJ().nome + ", o tema é " + B.nome.toLowerCase() + ". ";
      cenas.push({ tipo: "fala", quem: quem, txt: pref + pick(B.perg) });
      cenas.push({ tipo: "escolha", papel: "resposta", tema: tema, ops: opcoesResposta(tema, alvoPadrao(), "resposta") });
      var com = quemAtacaVoce();
      cenas.push({ tipo: "npcComenta", autor: com.id, tema: tema });
      cenas.push({ tipo: "escolha", papel: "replica", tema: tema, ops: opcoesResposta(tema, com, "replica") });
    } else if (mo.tipo === "cl" || mo.tipo === "ct") {
      if (mo.tipo === "ct") cenas.push({ tipo: "fala", quem: { med: med() }, txt: "Tema sorteado na urna: " + B.nome.toLowerCase() + "." });
      else cenas.push({ tipo: "fala", quem: { med: med() }, txt: "Confronto direto, tema livre. " + cJ().nome + ", escolha a quem vai perguntar." });
      cenas.push({ tipo: "escolheAlvo", tema: tema });
      cenas.push({ tipo: "escolha", papel: "pergunta", tema: tema, ops: null }); // preenchida após o alvo
      cenas.push({ tipo: "npcResponde", tema: tema });
      cenas.push({ tipo: "escolha", papel: "replica", tema: tema, ops: null });
      cenas.push({ tipo: "npcTreplica", tema: tema });
      // depois um rival pergunta para você
      var t2 = proxTema();
      cenas.push({ tipo: "npcPergunta", tema: t2 });
      cenas.push({ tipo: "escolha", papel: "resposta", tema: t2, ops: null });
      cenas.push({ tipo: "npcReplica", tema: t2 });
      cenas.push({ tipo: "escolha", papel: "treplica", tema: t2, ops: null });
      cenas.push({ tipo: "bastidor" });
    } else if (mo.tipo === "cf") {
      cenas.push({ tipo: "fala", quem: { med: med() }, txt: "Chegamos às considerações finais. A ordem foi definida por sorteio." });
      cenas.push({ tipo: "finaisNpcs" });
      cenas.push({ tipo: "escolha", papel: "final", tema: null, ops: opcoesFinais() });
    }
    a.roteiro = cenas; a.ci = -1;
    return proxCena();
  }
  function proxCena() {
    var a = A_(); a.ci++;
    if (!a.roteiro || a.ci >= a.roteiro.length) return proximoMomento();
    var c = a.roteiro[a.ci];
    if (c.tipo === "npcComenta") {
      var autor = byId(c.autor), ops = opcoesResposta(c.tema, cJ(), "replica").filter(function (o) { return o.tipo !== "defesa"; }), op = npcEscolhe(autor, ops), r = avaliar(autor, op, cJ(), c.tema, "comenta");
      a.cena = { tipo: "fala", quem: { cand: autor.id }, txt: "(comentário) " + falaNpc(autor, op), nota: r }; a.ultimoAtaque = op.tipo === "ataque" || op.tipo === "escandalo" ? { autor: autor.id, op: op } : null;
      return render_();
    }
    if (c.tipo === "escolheAlvo") { a.cena = { tipo: "alvo", tema: c.tema }; return render_(); }
    if (c.tipo === "npcResponde") {
      var al = byId(a.alvo), ops2 = opcoesResposta(c.tema, cJ(), "resposta").filter(function (o) { return o.tipo !== "defesa"; }), op2 = npcEscolhe(al, ops2); var r2 = avaliar(al, op2, cJ(), c.tema, "resposta");
      var txt2 = falaNpc(al, op2); if (a.perguntaTipo === "armadilha" && r2.nota < 0) txt2 = "Veja bem, não é tão simples assim... " + txt2;
      a.cena = { tipo: "fala", quem: { cand: al.id }, txt: txt2, nota: r2 }; return render_();
    }
    if (c.tipo === "npcTreplica" || c.tipo === "npcReplica") {
      var au = byId(c.tipo === "npcTreplica" ? a.alvo : a.perguntador), ops3 = opcoesResposta(c.tema, cJ(), "replica").filter(function (o) { return o.tipo !== "defesa"; }), op3 = npcEscolhe(au, ops3), r3 = avaliar(au, op3, cJ(), c.tema, "tre");
      a.cena = { tipo: "fala", quem: { cand: au.id }, txt: (c.tipo === "npcTreplica" ? "(tréplica) " : "(réplica) ") + falaNpc(au, op3), nota: r3 };
      if (op3.tipo === "escandalo" || op3.tipo === "ataque") a.ultimoAtaque = { autor: au.id, op: op3 };
      return render_();
    }
    if (c.tipo === "npcPergunta") {
      var pg = quemAtacaVoce(); a.perguntador = pg.id;
      var opsQ = opcoesConfronto(cJ(), c.tema).map(function (o) { o = Object.assign({}, o); o.fala = o.fala.replace(cJ().nome, cJ().nome); return o; }), opQ = npcEscolhe(pg, opsQ);
      avaliar(pg, opQ, cJ(), c.tema, "pergunta");
      a.cena = { tipo: "fala", quem: { cand: pg.id }, txt: opQ.fala.replace(/o senhor/g, J().sexo === "F" ? "a senhora" : "o senhor"), nota: null };
      a.ultimoAtaque = /escandalo|ataque/.test(opQ.tipo) ? { autor: pg.id, op: opQ } : null;
      return render_();
    }
    if (c.tipo === "bastidor") {
      // confronto entre rivais, narrado
      var rv = rivais(); if (rv.length >= 2) {
        var x = rv[Math.floor(Math.random() * rv.length)], y = rv.filter(function (k) { return k !== x; })[0], t = proxTema(), opx = npcEscolhe(x, opcoesConfronto(y, t));
        var rx = avaliar(x, opx, y, t, "pergunta"), ry = avaliar(y, npcEscolhe(y, opcoesResposta(t, x, "resposta").filter(function (o) { return o.tipo !== "defesa"; })), x, t, "resposta");
        a.cena = { tipo: "fala", quem: { med: med() }, txt: "Enquanto isso, " + x.nome + " e " + y.nome + " trocam farpas sobre " + BANCO[a.nivel][t].nome.toLowerCase() + ". " + (rx.nota > ry.nota ? x.nome + " leva a melhor." : y.nome + " se sai melhor na resposta.") };
        return render_();
      }
      return proxCena();
    }
    if (c.tipo === "finaisNpcs") {
      rivais().forEach(function (r) { avaliar(r, npcEscolhe(r, opcoesFinais()), null, null, "final"); });
      a.cena = { tipo: "fala", quem: { med: med() }, txt: "Os adversários já fizeram suas considerações finais. " + cJ().nome + ", o tempo é seu." };
      return render_();
    }
    if (c.tipo === "escolha") {
      var ops4 = c.ops;
      if (!ops4) {
        if (c.papel === "pergunta") ops4 = opcoesConfronto(byId(a.alvo), c.tema);
        else if (c.papel === "replica") ops4 = opcoesResposta(c.tema, byId(a.alvo), "replica");
        else ops4 = opcoesResposta(c.tema, byId(a.perguntador), c.papel === "treplica" ? "replica" : "resposta");
      }
      // direito de resposta: ataque pessoal sem base contra quem tem ficha limpa
      if ((c.papel === "replica" || c.papel === "treplica" || c.papel === "resposta") && a.ultimoAtaque && a.ultimoAtaque.op.tipo === "escandalo" && cJ().esc < 15)
        ops4 = [{ id: "direito", ic: "⚖️", rot: "Pedir direito de resposta", fala: "Peço direito de resposta: fui acusado sem prova, em rede nacional.", risco: "Baixo", tipo: "direito" }].concat(ops4);
      a.cena = { tipo: "escolha", papel: c.papel, tema: c.tema, ops: ops4 };
      return render_();
    }
    a.cena = c; return render_();
  }
  function byId(id) { return A_().cands.filter(function (c) { return c.id === id; })[0]; }

  function escolher(opId) {
    var a = A_(); if (!a || !a.cena || a.cena.tipo !== "escolha") return;
    var op = a.cena.ops.filter(function (o) { return o.id === opId; })[0]; if (!op) return;
    var j = cJ(), tema = a.cena.tema, papel = a.cena.papel;
    if (op.tipo === "direito") {
      var ok_ = cJ().esc < 15; a.pts[j.id].defesa += ok_ ? 6 : -3; a.plateia = clamp(a.plateia + (ok_ ? 5 : -3), 5, 95);
      if (a.ultimoAtaque) a.pts[a.ultimoAtaque.autor].postura -= 5;
      a.cena = { tipo: "fala", quem: { med: med() }, txt: ok_ ? "A organização concede o direito de resposta. Trinta segundos, " + j.nome + "." : "Direito de resposta negado: a menção foi considerada política, não ofensa pessoal." };
      a.ultimoAtaque = null; a.ci--; // volta para a mesma escolha sem a opção
      a.roteiro[a.ci + 1] = Object.assign({}, a.roteiro[a.ci + 1], { ops: (a.roteiro[a.ci + 1].ops || null) });
      return render_();
    }
    var alvo = op.alvo ? byId(op.alvo) : (papel === "replica" ? byId(a.alvo) : null);
    if (papel === "pergunta") a.perguntaTipo = op.tipo;
    var r = avaliar(j, op, alvo, tema, papel);
    var txt = op.fala;
    // tempo: respostas longas e o mediador corta
    var corte = (op.tipo === "prop" && j.ret < 50 && Math.random() < 0.25) || (op.tipo === "evasiva" && Math.random() < 0.4);
    a.log.push({ papel: papel, rot: op.rot, nota: r.nota, gafe: r.gafe });
    var seq = [{ tipo: "fala", quem: { cand: j.id }, txt: txt, nota: r }];
    if (corte) { a.pts[j.id].postura -= 2; seq.push({ tipo: "fala", quem: { med: med() }, txt: "Tempo esgotado, " + j.nome + ". Microfone cortado." }); }
    else if (r.gafe === "não respondeu à pergunta") seq.push({ tipo: "fala", quem: { med: med() }, txt: j.nome + ", com todo respeito, " + (J().sexo === "F" ? "a senhora" : "o senhor") + " não respondeu à pergunta." });
    else if (r.gafe === "contradição") seq.push({ tipo: "fala", quem: { med: med() }, txt: (J().sexo === "F" ? "Candidata, em outro momento a senhora" : "Candidato, em outro momento o senhor") + " defendeu o contrário sobre esse tema." });
    else if (r.gafe === "acusação sem prova") { a.avisos++; seq.push({ tipo: "fala", quem: { med: med() }, txt: "Peço aos candidatos que mantenham o debate no campo das propostas. " + (a.avisos > 1 ? "Segunda advertência." : "") }); }
    if (op.tipo === "ataque" && alvo) a.ultimoAtaque = null;
    a.fila_cenas = seq.slice(1);
    a.cena = seq[0];
    render_();
  }
  function continuar() {
    var a = A_(); if (!a) return;
    if (a.cena && a.cena.tipo === "fim") return;
    if (a.fila_cenas && a.fila_cenas.length) { a.cena = a.fila_cenas.shift(); return render_(); }
    if (a.cena && a.cena.tipo === "fala" && a.i < 0) return proximoMomento();
    proxCena();
  }
  function escolherAlvo(id) { var a = A_(); a.alvo = id; proxCena(); }

  /* ---------- resultado e repercussão ---------- */
  function encerrar() {
    var a = A_(), S_ = st(), ev = S_.agenda.filter(function (x) { return x.id === a.ev; })[0], E = EMISSORAS[a.e], j = J();
    var tot = a.cands.map(function (c) { return { c: c, s: soma(c.id) + rnd(-4, 4) + (c.jog ? (a.plateia - 50) / 4 - a.gafes.length * 8 : 0) }; });
    var mx = Math.max.apply(null, tot.map(function (x) { return x.s; }));
    var mn = Math.min.apply(null, tot.map(function (x) { return x.s; })), temp = Math.max(10, (mx - mn) / 2.2);
    var ex = tot.map(function (x) { return Math.exp((x.s - mx) / temp); }), sx = ex.reduce(function (p, q) { return p + q; }, 0);
    tot.forEach(function (x, i) { x.share = Math.max(2, Math.round(ex[i] / sx * 100)); });
    var soma100 = tot.reduce(function (p, x) { return p + x.share; }, 0); tot.forEach(function (x) { x.share = Math.round(x.share * 100 / soma100); });
    tot.sort(function (x, y) { return y.share - x.share; });
    var eu = tot.filter(function (x) { return x.c.jog; })[0], pos = tot.indexOf(eu) + 1, n = tot.length;
    var media = 100 / n, peso = E.audiencia * (a.turno === 2 ? 1.3 : 1);
    var delta = clamp((eu.share - media) / 8 * peso, -4.5, 4.5) - a.gafes.length * 0.4;
    j.popularidade = clamp(j.popularidade + delta, 0, 100);
    ok(function () { var ts = territoriosDoCargo(a.cargo), gr = {}; ts.forEach(function (t) { gr[t.grupo] = 1; }); Object.keys(gr).forEach(function (g) { mudarAprovGrupo(g, delta * 0.8); }); });
    if (a.gafes.length >= 2) ok(function () { addEscandalo(2 + a.gafes.length); }); else if (pos === 1) ok(function () { addEscandalo(-2); });
    tot.forEach(function (x) { if (x.c.jog) return; var nn = bancoDeNPCs.find(function (k) { return k.id === x.c.npc; }); if (nn) nn.popularidade = clamp((nn.popularidade || 30) + clamp((x.share - media) / 10 * peso, -3, 3), 3, 95); });
    var venc = tot[0].c, bomMomento = a.destaques[a.destaques.length - 1], gafe = a.gafes[0];
    nota(E.vinheta + ": " + (venc.jog ? j.nome + " vence o debate, aponta levantamento relâmpago com espectadores (" + eu.share + "%)." : venc.nome + " se destaca no debate; " + j.nome + " fica em " + pos + "º no levantamento relâmpago (" + eu.share + "%)."));
    if (gafe) nota("Gafe no " + E.vinheta + ": " + j.nome + " é " + (j.sexo === "F" ? "criticada" : "criticado") + " por " + gafe + " e o trecho circula nas redes.", "imprensa");
    else if (bomMomento) nota("Melhor momento do " + E.vinheta + ": " + j.nome + " — " + bomMomento.toLowerCase() + ".", "eleicao");
    if (a.redes > 60) nota("Cortes do " + E.vinheta + " dominam as redes; a hashtag do debate fica entre as mais comentadas do país.", "imprensa");
    var res = { share: eu.share, pos: pos, n: n, delta: Math.round(delta * 10) / 10, venc: venc.nome, gafes: a.gafes.slice(), destaques: a.destaques.slice(-3), ranking: tot.map(function (x) { return { nome: x.c.nome, share: x.share, jog: x.c.jog }; }) };
    if (ev) { ev.status = "feito"; ev.res = res; }
    S_.hist.unshift({ ev: a.ev, e: a.e, res: res }); S_.hist = S_.hist.slice(0, 12);
    a.fim = true; a.cena = { tipo: "fim", res: res };
    render_();
  }
  function sair() { var S_ = st(); S_.ativo = null; render_(); }

  /* ================================================================ telas */
  function imgUrl(k) { return IMG[k] || (ok(function () { return window.V3MARCAS.logo(k); }, "")); }
  function fotoHtml(c, cls) { var f = c.foto; return f ? '<img class="' + cls + '" src="' + esc_(f) + '" alt="">' : '<span class="' + cls + ' v3d-ini">' + esc_(c.nome.charAt(0)) + "</span>"; }
  function placar(a) {
    return '<div class="v3d-palco">' + a.cands.map(function (c) {
      var s = soma(c.id), fala = a.cena && a.cena.quem && a.cena.quem.cand === c.id;
      return '<div class="v3d-pulp' + (c.jog ? " eu" : "") + (fala ? " fala" : "") + '">' + fotoHtml(c, "v3d-foto") + '<b>' + esc_(c.jog ? "Você" : curto(c.nome)) + "</b><small>" + esc_(c.partido) + '</small><i class="v3d-term" style="--v:' + clamp(50 + s * 1.5, 5, 95) + '%"></i></div>';
    }).join("") + "</div>";
  }
  function quemHtml(q) {
    var a = A_();
    if (!q) return "";
    if (q.med) return '<div class="v3d-gc med"><img src="' + imgUrl(q.med.img) + '" alt=""><div><b>' + esc_(q.med.nome) + "</b><small>Mediação • " + esc_(EMISSORAS[a.e].nome) + "</small></div></div>";
    if (q.conv) return '<div class="v3d-gc conv"><span class="v3d-ini big">🎤</span><div><b>Pergunta</b><small>' + esc_(q.conv) + "</small></div></div>";
    var c = byId(q.cand); return '<div class="v3d-gc cand">' + fotoHtml(c, "v3d-foto") + "<div><b>" + esc_(c.nome) + "</b><small>" + esc_(c.partido) + " • candidato" + (c.jog ? " (você)" : "") + "</small></div></div>";
  }
  function telaDebate() {
    var a = A_(); if (!a) return "";
    var E = EMISSORAS[a.e], bg = imgUrl(E.estudio[a.cargo] || E.estudio.PRES || E.estudio.PREF), logo = imgUrl(E.logo);
    var mo = a.fila[Math.max(0, a.i)] || {};
    var h = '<div class="v3d v3d-' + E.tema + '" style="--bg:url(' + bg + ')"><div class="v3d-fundo"></div><div class="v3d-tela">';
    h += '<header class="v3d-top"><img class="v3d-logo" src="' + logo + '" alt=""><div class="v3d-tit"><b>' + esc_(E.titulo) + "</b><small>" + esc_(NOME_CARGO[a.cargo]) + (a.turno === 2 ? " • 2º TURNO" : "") + '</small></div><span class="v3d-vivo">● AO VIVO</span></header>';
    h += '<div class="v3d-bloco">' + esc_(a.i < 0 ? ((a.cena && a.cena.rot) || "ABERTURA") : mo.titulo || "") + "</div>";
    h += placar(a);
    var c = a.cena || {};
    h += '<div class="v3d-cena">';
    if (c.tipo === "pvinheta") h += '<div class="v3d-abert"><img src="' + logo + '" alt=""><b>' + esc_(E.titulo) + "</b><small>" + esc_(NOME_CARGO[a.cargo]) + (a.turno === 2 ? " • 2º turno" : "") + " • " + esc_(data().ano) + '</small><span>AO VIVO</span></div><button type="button" class="b confirma v3d-go" data-v3d="cont">Entrar na transmissão</button>';
    else if (c.tipo === "papres") {
      h += quemHtml(c.quem) + '<p class="v3d-fala">' + esc_(c.txt) + "</p>";
      if (c.pq) h += '<div class="v3d-pq"><small>' + esc_(c.pq.instituto) + " • margem ±" + c.pq.margem + " pontos</small>" + c.pq.itens.map(function (x) { return '<div class="v3d-barra' + (x.jogador || x.nome === J().nome ? " eu" : "") + '"><span>' + esc_(x.jogador || x.nome === J().nome ? "Você" : x.nome) + '</span><i style="width:' + Math.min(100, x.pct * 1.5) + '%"></i><b>' + Math.round(x.pct) + "%</b></div>"; }).join("") + "</div>";
      h += '<button type="button" class="b confirma v3d-go" data-v3d="cont">Continuar</button>';
    } else if (c.tipo === "pchegada" || c.tipo === "pentNpc") {
      var cc = byId(c.cand);
      h += '<div class="v3d-gc rep">' + (c.rep.foto ? '<img src="' + esc_(c.rep.foto) + '" alt="">' : '<span class="v3d-ini big">🎤</span>') + "<div><b>" + esc_(c.rep.nome) + "</b><small>repórter • na porta do estúdio</small></div></div>";
      if (c.tipo === "pchegada") h += '<div class="v3d-chega">' + fotoHtml(cc, "v3d-foto") + "<div><b>" + esc_(cc.jog ? "Você" : cc.nome) + "</b><small>" + esc_(cc.partido) + '</small></div></div><p class="v3d-fala">' + esc_(c.txt) + "</p>";
      else h += '<p class="v3d-fala"><b>' + esc_(c.rep.nome) + ":</b> " + esc_(c.q) + "</p>" + quemHtml({ cand: c.cand }) + '<p class="v3d-fala">' + esc_(c.txt) + "</p>";
      h += '<button type="button" class="b confirma v3d-go" data-v3d="cont">Continuar</button>';
    } else if (c.tipo === "pentJog") {
      h += '<div class="v3d-gc rep">' + (c.rep.foto ? '<img src="' + esc_(c.rep.foto) + '" alt="">' : '<span class="v3d-ini big">🎤</span>') + "<div><b>" + esc_(c.rep.nome) + '</b><small>entrevista antes do debate</small></div></div><p class="v3d-fala">' + esc_(c.q) + '</p><p class="v3d-vez">🎙️ Sua resposta</p><div class="v3d-ops">' + c.ops.map(function (o) { return '<button type="button" class="v3d-op" data-v3d="preop" data-id="' + esc_(o.id) + '"><b>' + esc_(o.rot) + '</b><em>"' + esc_(o.fala) + '"</em></button>'; }).join("") + "</div>";
    } else if (c.tipo === "pfala") {
      h += quemHtml(c.quem) + '<p class="v3d-fala">' + esc_(c.txt) + "</p>" + (c.extra ? '<p class="v3d-tag ' + (/mal/.test(c.extra) ? "ruim" : "bom") + '">' + esc_(c.extra) + "</p>" : "") + '<button type="button" class="b confirma v3d-go" data-v3d="cont">Continuar</button>';
    } else if (c.tipo === "ptransicao") h += '<div class="v3d-vinheta v3d-trans">O DEBATE VAI COMEÇAR</div><button type="button" class="b confirma v3d-go" data-v3d="cont">Ao vivo</button>';
    else if (c.tipo === "vinheta") h += '<div class="v3d-vinheta">' + esc_(c.txt) + '</div><button type="button" class="b confirma v3d-go" data-v3d="cont">Continuar</button>';
    else if (c.tipo === "fala") {
      h += quemHtml(c.quem) + '<p class="v3d-fala">' + esc_(c.txt) + "</p>";
      if (c.nota && c.nota.gafe) h += '<p class="v3d-tag ruim">⚠️ ' + esc_(c.nota.gafe) + "</p>";
      else if (c.nota && c.nota.nota > 12) h += '<p class="v3d-tag bom">👏 boa reação da plateia</p>';
      h += '<button type="button" class="b confirma v3d-go" data-v3d="cont">' + esc_(c.botao || "Continuar") + "</button>";
    } else if (c.tipo === "alvo") {
      h += '<p class="v3d-fala">Escolha quem você vai confrontar' + (c.tema ? " sobre " + esc_(BANCO[a.nivel][c.tema].nome.toLowerCase()) : "") + ":</p><div class=\"v3d-alvos\">" +
        rivais().map(function (r) { return '<button type="button" class="v3d-alvo" data-v3d="alvo" data-id="' + esc_(r.id) + '">' + fotoHtml(r, "v3d-foto") + "<b>" + esc_(r.nome) + "</b><small>" + esc_(r.partido) + " • " + esc_(r.estilo) + (r.esc > 20 ? " • tem telhado de vidro" : "") + (r.inc ? " • no cargo" : "") + "</small></button>"; }).join("") + "</div>";
    } else if (c.tipo === "escolha") {
      var rot = { resposta: "Sua resposta", replica: "Sua réplica", treplica: "Sua tréplica", pergunta: "Sua pergunta", final: "Suas considerações finais" }[c.papel] || "Sua vez";
      h += '<p class="v3d-vez">🎙️ ' + rot + (c.tema ? " • " + esc_(BANCO[a.nivel][c.tema].nome) : "") + '</p><div class="v3d-ops">' + c.ops.map(function (o) {
        return '<button type="button" class="v3d-op" data-v3d="op" data-id="' + o.id + '"><span class="ic">' + o.ic + "</span><b>" + esc_(o.rot) + '</b><em>"' + esc_(o.fala) + '"</em><small class="r ' + (/Alto|Contradi/.test(o.risco) ? "alto" : o.risco === "Médio" ? "medio" : "baixo") + '">risco: ' + esc_(o.risco) + "</small></button>";
      }).join("") + "</div>";
    } else if (c.tipo === "fim") {
      var r = c.res;
      h += '<div class="v3d-res"><h3>' + (r.pos === 1 ? "🏆 Você venceu o debate" : r.pos === r.n ? "📉 Noite difícil" : "📊 Resultado do debate") + '</h3><p class="v3d-fala">Levantamento relâmpago com espectadores: quem se saiu melhor?</p>' +
        r.ranking.map(function (x) { return '<div class="v3d-barra' + (x.jog ? " eu" : "") + '"><span>' + esc_(x.jog ? "Você" : x.nome) + '</span><i style="width:' + x.share + '%"></i><b>' + x.share + "%</b></div>"; }).join("") +
        '<p class="txt">Popularidade: <b>' + (r.delta >= 0 ? "+" : "") + r.delta + "</b>" + (r.gafes.length ? " • gafes: " + esc_(r.gafes.join(", ")) : " • sem gafes") + "</p>" +
        (r.destaques.length ? '<p class="txt">Destaques: ' + esc_(r.destaques.join("; ")) + "</p>" : "") +
        '<p class="txt">A repercussão já está no jornal e no feed.</p><button type="button" class="b confirma v3d-go" data-v3d="sair">Sair do estúdio</button></div>';
    }
    h += "</div>";
    h += '<footer class="v3d-rodape"><span>Plateia ' + Math.round(a.plateia) + '%</span><span>Redes ' + Math.round(a.redes) + "%</span><span>#" + esc_(E.vinheta.replace(/\s+/g, "")) + "</span></footer>";
    return h + "</div></div>";
  }
  function convite(ev) {
    var E = EMISSORAS[ev.e];
    return '<div class="v3d-conv v3d-' + E.tema + '"><img src="' + imgUrl(E.logo) + '" alt=""><div><b>Hoje tem ' + esc_(E.vinheta) + "</b><small>" + esc_(NOME_CARGO[ev.cargo]) + (ev.turno === 2 ? " • 2º turno" : "") + " • mediação de " + esc_(E.mediadores.map(function (m) { return m.nome; }).join(" e ")) + '</small></div><button type="button" class="b confirma" data-v3d="entrar" data-id="' + ev.id + '">Entrar no estúdio</button></div>';
  }
  function cardAgenda() {
    var S_ = st(); if (!S_) return "";
    var d = data(), lista = S_.agenda.filter(function (a) { return a.ano === d.ano; });
    if (!lista.length) {
      var c = cargoJog();
      if (!c || !CALENDARIO[c]) return "";
      return '<section class="card v3d-agenda"><h3>📺 Debates na TV</h3><p class="txt">Os debates entram na agenda quando a sua candidatura a ' + esc_(NOME_CARGO[c].toLowerCase()) + " for registrada, no ano da eleição. As emissoras definem as datas: você não pode marcar debate por conta própria.</p></section>";
    }
    var hoje = eventoDaSemana();
    var h = '<section class="card v3d-agenda"><h3>📺 Calendário de debates</h3>' + (hoje ? convite(hoje) : "") + '<ol class="v3d-cal">';
    lista.sort(function (x, y) { return idx(x.m, x.s) - idx(y.m, y.s); }).forEach(function (a) {
      var E = EMISSORAS[a.e];
      var st_ = { agendado: "agendado", hoje: "é nesta semana", feito: "participou", ausente: "faltou", antes: "antes da candidatura" }[a.status] || a.status;
      h += '<li class="' + a.status + '"><img src="' + imgUrl(E.logo) + '" alt=""><div><b>' + esc_(E.vinheta) + (a.turno === 2 ? " • 2º turno" : "") + "</b><small>" + a.s + "ª semana de " + MESES_[a.m] + " • " + st_ + (a.res ? " • " + a.res.pos + "º lugar (" + a.res.share + "%)" : "") + "</small></div></li>";
    });
    return h + "</ol></section>";
  }

  /* ================================================================ eventos e integração */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-v3d]"); if (!b) return;
    var k = b.getAttribute("data-v3d"), id = b.getAttribute("data-id");
    e.preventDefault();
    if (k === "entrar") iniciar(id);
    else if (k === "cont") continuar();
    else if (k === "preop") responderPre(id);
    else if (k === "op") escolher(id);
    else if (k === "alvo") escolherAlvo(id);
    else if (k === "sair") sair();
    else if (k === "agenda") { S.tab = "camp"; render_(); }
  });
  function aposRender() {
    var S_ = st(); if (!S_) return;
    montarAgenda();
    var hoje = eventoDaSemana(); if (hoje && hoje.status === "agendado") { hoje.status = "hoje"; toast_("Hoje tem " + EMISSORAS[hoje.e].vinheta + ": entre no estúdio pela aba Campanha.", "ok"); }
    var app = document.getElementById("app"); if (!app) return;
    var velho = document.getElementById("v3d-overlay"); if (velho) velho.remove();
    if (S_.ativo) { var div = document.createElement("div"); div.id = "v3d-overlay"; div.innerHTML = telaDebate(); app.appendChild(div); document.body.classList.add("v3d-aberto"); }
    else document.body.classList.remove("v3d-aberto");
    var main = document.getElementById("main"); if (!main) return;
    var tab = ok(function () { return S.tab; }, "");
    if ((tab === "camp" || tab === "ele") && !main.querySelector(".v3d-agenda")) { var x = cardAgenda(); if (x) main.insertAdjacentHTML("afterbegin", x); }
    if (tab === "mes" && hoje && !main.querySelector(".v3d-conv")) main.insertAdjacentHTML("afterbegin", convite(hoje));
    // botão antigo de debate: vira atalho da agenda
    Array.prototype.forEach.call(document.querySelectorAll('[data-a="camp"]'), function (bt) {
      if ((bt.getAttribute("data-p") || "").indexOf('"debate"') < 0) return;
      bt.removeAttribute("data-a"); bt.setAttribute("data-v3d", hoje ? "entrar" : "agenda"); if (hoje) bt.setAttribute("data-id", hoje.id); bt.disabled = false;
      bt.textContent = hoje ? "📺 Entrar no " + EMISSORAS[hoje.e].vinheta : "📺 Ver calendário de debates";
    });
  }
  function instalar() {
    // o debate livre antigo deixa de existir: tudo passa pelo calendário
    if (typeof iniciarDebate === "function" && !iniciarDebate.__v3d) {
      var nv = function () { var h = eventoDaSemana(); if (h) iniciar(h.id); else toast_("Debates seguem o calendário das emissoras. Veja a agenda na aba Campanha.", "err"); };
      nv.__v3d = true; window.iniciarDebate = nv; try { iniciarDebate = nv; } catch (e) {}
    }
    if (typeof window.render === "function" && !window.render.__v3deb) {
      var o = window.render;
      var n = function () { var r = o.apply(this, arguments); try { aposRender(); } catch (e) { console.warn("v3deb", e); } return r; };
      for (var k in o) { try { n[k] = o[k]; } catch (e) {} }
      n.__v3deb = true; window.render = n; try { render = n; } catch (e) {}
    }
    if (typeof window.avancarMes === "function" && !window.avancarMes.__v3deb) {
      var a = window.avancarMes;
      var na = function () {
        try {
          var S_ = st();
          if (S_ && S_.ativo) { toast_("Termine o debate antes de avançar a semana.", "err"); return; }
          var h = eventoDaSemana(); if (h) ausencia(h);
        } catch (e) { console.warn("v3deb", e); }
        var r = a.apply(this, arguments);
        try { montarAgenda(); } catch (e) {}
        return r;
      };
      for (var k2 in a) { try { na[k2] = a[k2]; } catch (e) {} } na.__v3deb = true; window.avancarMes = na; try { avancarMes = na; } catch (e) {}
    }
  }
  DB.cardAgenda = cardAgenda;
  instalar();
  document.addEventListener("DOMContentLoaded", function () { setTimeout(instalar, 0); });
  window.addEventListener("load", function () { setTimeout(instalar, 0); });
})();
