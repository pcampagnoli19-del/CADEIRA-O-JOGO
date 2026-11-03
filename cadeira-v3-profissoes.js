/* =============================================================================
   CADEIRA v3 — Profissões reais dos políticos
   Antes, quem não estava no mapa manual recebia uma profissão sorteada pelo
   nome. Aqui: (1) mapa com a profissão de origem real de centenas de políticos,
   (2) títulos no nome (Delegado, Coronel, Pastor, Dr., Professora…),
   (3) pistas na base/papel. Corrige também saves já existentes.
   ============================================================================= */
(function () {
  "use strict";
  if (window.V3PROF) return;
  var K = { A: "Advogado(a)", E: "Economista", M: "Médico(a)", P: "Professor(a)", G: "Agricultor(a)", PM: "Policial/Militar", EM: "Empresário(a)", L: "Líder Comunitário", J: "Jornalista", EN: "Engenheiro(a)", C: "Cientista Político", R: "Líder Religioso" };
  var T = {
    A: "Márcio França;Jorge Messias;Rodrigo Cunha;Veneziano Vital do Rêgo;Efraim Filho;Ibaneis Rocha;Eduardo Paes;Bruno Reis;Sebastião Melo;Eduardo Braide;Paulo Teixeira;André de Paula;Dario Durigan;Mateus Simões;Daniel Vilela;ACM Neto;João Roma;Fábio Trad;Rodrigo Garcia;Luciana Genro;Roberto Requião;José Dirceu;Bruno Araújo;Antonio Rueda;Renata Abreu;José Maria Eymael;Roberto Freire;Jorge Bornhausen;Tarso Genro;Marcelo Ramos;Pedro Ruas;Gabriel Azevedo;Jarbas Vasconcelos;Ricardo Salles;André Janones;Filipe Barros;Marcos Pollon;Caroline de Toni;Odair Cunha;Natália Bonavides;Glauber Braga;Duarte Jr;Afonso Motta;Rosângela Moro;Fausto Pinato;Gilson Marques;Paulo Abi-Ackel;Hugo Leal;Pedro Cunha Lima;Chris Tonietto;Pompeo de Mattos;Arthur Maia;Emídio de Souza;Barros Munhoz;Campos Machado;Renato Roseno;Esperidião Amin",
    E: "Renan Filho;Izalci Lucas;Rogério Marinho;Esther Dweck;Fuad Noman;Fernando Collor;José Serra;Eduardo Suplicy;Aloizio Mercadante;Marcio Pochmann;Elias Jabbour;Sofia Manzano;Paulo Câmara;Marina Helena;Pedro Paulo;Reginaldo Lopes;Carlos Zarattini;Mauro Benevides Filho",
    M: "Alexandre Padilha;André Fufuca;Osmar Terra;Nelsinho Trad;Marcelo Castro;Zenaide Maia;Hiran Gonçalves;Rogério Carvalho;Sílvio Mendes;Antonio Furlan;Dário Saadi;Arlindo Chinaglia;Dr. Pessoa;José Auricchio Júnior;Luiz Henrique Mandetta;Antonio Palocci;Roberto Cláudio;Jandira Feghali;Jorge Solla;Henrique Fontana;Mário Heringer;Dr. Luizinho;Adriana Ventura;Vitor Lippi;Daniel Soranz;Zacharias Calil;Luciano Ducci;Fernando Máximo;Dr. Luiz Ovando;Dr. Jaziel;Dr. Frederico;Dr. Francisco;Dr. Victor Linhalis;Dr. Jorge do Carmo;Dr. Elton",
    P: "Chico Alencar;Ivan Valente;Anielle Franco;Macaé Evaristo;Margarida Salomão;Álvaro Dias;Juliano Medeiros;Cristovam Buarque;Mauro Iasi;Nabil Bonduki;Douglas Belchior;Edmilson Rodrigues;José Genoino;Gabriel Chalita;Gustavo Gayer;Pedro Uczai;Maria do Rosário;Tarcísio Motta;Duda Salabert;Carol Dartora;Professor Alcides;Professora Goreth;Valéria Bolsonaro;Professora Bebel;Professora Luciene Cavalcante;Beatriz Cerqueira;Sofia Cavedon;Luciane Carminatti;Bia de Lima;Flávio Serafini;Ana Campagnolo;Professor Wendel Mesquita;Silvia Ferraro;Toninho Vespoli;Celso Giannazi;Carlos Minc;Professor Tito",
    G: "Carlos Fávaro;Tião Bocalom;Jayme Campos;Nelson Barbudo;Marcon;Alceu Moreira;Frederico d'Ávila",
    PM: "Alexandre Silveira;Styvenson Valentim;Cabo Daciolo;Lorenzo Pazolini;Major Vitor Hugo;Carlos Moisés;Silvia Waiãpi;Coronel Meira;General Pazuello;Capitão Augusto;Da Cunha;Delegado Bilynskyj;Delegado Paulo Bilynskyj;Coronel Chrisóstomo;Cabo Gilberto Silva;Alberto Fraga;José Medeiros;Hélio Lopes;Capitão Alden;Delegado Éder Mauro;Coronel Ulysses;Gilvan da Federal;Sargento Fahur;Capitão Wagner;Delegado Palumbo;Coronel Fernanda;Sargento Gonçalves;Coronel Tadeu;Capitão Alberto Neto;Delegada Katarina;General Girão;Ubiratan Sanderson;Adriana Accorsi;Delegado Caveira;Delegado Ramagem;Delegado Matheus Laiola;Delegado Marcelo Freitas;Pedro Aihara;Coronel Armando;Tenente Coimbra;Sargento Neri;Danilo Balas;Sargento Reginauro;Leonel Radde;Delegada Graciela;Sargento Rodrigues;Martha Rocha;Fabiano Contarato",
    EM: "Jader Filho;Silvio Costa Filho;Vanderlan Cardoso;Cleitinho Azevedo;Lucas Barreto;Ângelo Coronel;Wilder Morais;Margareth Buzetti;Jaime Bagattoli;Laércio Oliveira;Alexandre Giordano;Antonio Denarium;Sandro Mabel;Paulinho Freire;Abílio Brunini;Rodrigo Manga;Luiz do Carmo;Arthur do Val (MamãeFalei);Carlos Pignatari (Carlão);Carlão Pignatari;Paulo Skaf;Vinicius Poit;Gilson Machado;André Marinho;Washington Reis;Flávio Roscoe;Jair Renan Bolsonaro;João Doria;Tasso Jereissati;Milton Leite;Andrea Matarazzo;Luiz Philippe de Orleans e Bragança;Luciano Bivar;Newton Cardoso Jr;Tiago Mitraud;Chiquinho Brazão;Eunício Oliveira;Tomé Abduch",
    L: "Luiza Erundina;Luiz Marinho;Sonia Guajajara;Fábio Felix;Leonardo Péricles;Vera Lúcia;Zé Maria;Thiago Ávila;Olívio Dutra;João Pedro Stedile;Kelli Mafort;Zeca do PT;Preta Ferreira;Carmen Silva;Jussara Basso;Célia Xakriabá;Zé Trovão;Valmir Assunção;Erika Kokay;Vicentinho;Orlando Silva;Paulinho da Força;Benedita da Silva;Ediane Maria;Teonilio Barba;Luiz Claudio Marcolino;Marina do MST;Matheus Gomes",
    J: "Alan Rick;Plínio Valério;Eliziane Gama;Carlos Viana;Álvaro Damião;Sidônio Palmeira;Anthony Garotinho;Fernando Gabeira;Sergio Cabral;Felipe Moura Brasil;Kim Paim;Allan dos Santos;Manuela d'Ávila;Ana Amélia Lemos;Celso Russomanno;Bibo Nunes;Julia Zanatta;Luizianne Lins;Rosana Valle;Paulo Martins;Amaro Neto;Renata Souza;Mauro Tramonte;Adrilles Jorge",
    EN: "Camilo Santana;Luciana Santos;José Múcio Monteiro;João Campos;Axel Grael;Axel Schmidt Grael;Alexandre Kalil;José Roberto Arruda;José Agripino Maia;Ricardo Barros;Beto Richa;Eduardo Braga",
    C: "Mauro Vieira;Celso Amorim;Marcelo Calero;Heni Ozi Cukier",
    R: "Marcos Pereira;Sóstenes Cavalcante;Otoni de Paula;Pastor Eurico;Eli Borges;Cezinha de Madureira;Marco Feliciano;Pastor Henrique Vieira;Marcelo Crivella;Missionário José Olímpio;Pastor Sargento Isidório;Silas Câmara;Pastor Gerson;Pastor Silas"
  };
  var MAPA = {};
  Object.keys(T).forEach(function (k) { T[k].split(";").forEach(function (n) { if (n) MAPA[n.trim()] = K[k]; }); });
  var TITULOS = [
    [/^(Pastor|Pastora|Missionári[oa]|Bispo|Bispa|Padre|Frei|Apóstol[oa]|Irmão|Irmã|Reverendo)\b/i, K.R],
    [/^(Delegad[oa]|Coronel|Capitão|Capitã|Cabo|Sargento|Soldado|Tenente|Major|General|Comandante|Subtenente|Inspetor|Agente)\b/i, K.PM],
    [/^(Professor|Professora|Prof\.|Profª)\b/i, K.P],
    [/^(Dr\.|Dra\.|Doutor|Doutora|Enfermeir[oa])(\s|$)/i, K.M]
  ];
  var V3PROF = (window.V3PROF = { mapa: MAPA });
  V3PROF.de = function (n) {
    if (!n || !n.nome) return null;
    if (MAPA[n.nome]) return MAPA[n.nome];
    for (var i = 0; i < TITULOS.length; i++) if (TITULOS[i][0].test(n.nome)) return TITULOS[i][1];
    return null;
  };
  function corrigir() {
    var b = null; try { b = bancoDeNPCs; } catch (e) {} if (!b || !b.length) return;
    if (b.__v3prof === b.length) return;
    for (var i = 0; i < b.length; i++) { var p = V3PROF.de(b[i]); if (p) b[i].profissao = p; }
    try { b.__v3prof = b.length; } catch (e) {}
  }
  function instalar() {
    try {
      if (typeof PROF_NPC_MAP !== "undefined") { Object.keys(MAPA).forEach(function (k) { PROF_NPC_MAP[k] = MAPA[k]; }); }
      if (typeof obterProfissaoNPC === "function" && !obterProfissaoNPC.__v3) {
        var o = obterProfissaoNPC;
        var nf = function (n) { var p = V3PROF.de(n); return p || o.apply(this, arguments); };
        nf.__v3 = true; window.obterProfissaoNPC = nf; try { obterProfissaoNPC = nf; } catch (e) {}
      }
    } catch (e) {}
    corrigir();
    if (typeof window.render === "function" && !window.render.__v3prof) {
      var r = window.render;
      var n = function () { try { corrigir(); } catch (e) {} return r.apply(this, arguments); };
      for (var k in r) { try { n[k] = r[k]; } catch (e) {} }
      n.__v3prof = true; window.render = n; try { render = n; } catch (e) {}
    }
  }
  instalar();
  document.addEventListener("DOMContentLoaded", function () { setTimeout(instalar, 0); });
  window.addEventListener("load", function () { setTimeout(instalar, 0); });
})();
