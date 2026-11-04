#!/usr/bin/env python3
"""Gera cadeira-v3-elenco.js a partir de dados/politicos-novos.json e dados/fotos-extras.tsv.

fotos-extras.tsv: nome<TAB>url (vale para políticos novos e para os que já existiam sem foto).
"""
import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DADOS = RAIZ / "dados" / "politicos-novos.json"
FOTOS = RAIZ / "dados" / "fotos-extras.tsv"
SAIDA = RAIZ / "cadeira-v3-elenco.js"
MODELO = RAIZ / "tools" / "elenco_modelo.js"

pol = json.loads(DADOS.read_text(encoding="utf-8"))["politicos"]
COMP = RAIZ / "dados" / "abc-complemento.json"
ajustes = {}
if COMP.exists():
    comp = json.loads(COMP.read_text(encoding="utf-8"))
    pol += comp.get("politicos", [])
    ajustes = comp.get("ajustes", {})
fotos = {}
if FOTOS.exists():
    for linha in FOTOS.read_text(encoding="utf-8").splitlines():
        if "\t" in linha and not linha.startswith("#"):
            n, u = linha.split("\t", 1)
            if u.strip().startswith(("https://", "data:image/")):
                fotos[n.strip()] = u.strip()
lista = []
for p in pol:
    lista.append([p["id"], p["nome"], p["cargo"], p["papel"], p["partido"], p["uf"], p.get("municipio") or "",
                  p.get("profissao") or "", p.get("profissao_detalhe") or "", p.get("grupo") or ""])
dados = json.dumps(lista, ensure_ascii=False, separators=(",", ":"))
fj = json.dumps(fotos, ensure_ascii=False, separators=(",", ":"))
aj = json.dumps(ajustes, ensure_ascii=False, separators=(",", ":"))
js = MODELO.read_text(encoding="utf-8").replace("__DADOS__", dados).replace("__FOTOS__", fj).replace("__AJUSTES__", aj)
if "</script" in js:
    raise SystemExit("fechamento de tag nos dados")
SAIDA.write_text(js, encoding="utf-8")
print(f"{len(lista)} políticos, {len(fotos)} fotos -> {SAIDA.name}")
