#!/usr/bin/env python3
"""Gera cadeira-v3-paisesdados.js a partir de dados/paises/banco_mundial.json
(PIB em US$ correntes e população do Banco Mundial, nomes em português)."""
import json
from pathlib import Path
RAIZ = Path(__file__).resolve().parent.parent
BR = {"Polónia": "Polônia", "Vietname": "Vietnã", "Roménia": "Romênia", "Chéquia": "Tchéquia", "Irão": "Irã", "Qatar": "Catar", "Koweit": "Kuwait", "Quénia": "Quênia",
      "República Popular do Congo": "República do Congo", "Mianmar (Birmânia)": "Mianmar", "Eslovénia": "Eslovênia", "Turquemenistão": "Turcomenistão", "Letónia": "Letônia",
      "Estónia": "Estônia", "Arménia": "Armênia", "Benim": "Benin", "Iémen": "Iêmen", "Madagáscar": "Madagascar", "Macedónia do Norte": "Macedônia do Norte",
      "Territórios palestinos": "Palestina", "Maurícia": "Maurício", "Maláui": "Malawi", "Mónaco": "Mônaco", "Nova Caledónia": "Nova Caledônia", "Ilhas Caimão": "Ilhas Cayman",
      "Ilhas Faroé": "Ilhas Faroe", "Gronelândia": "Groenlândia"}
ISO_NOME = {"COD": "República Democrática do Congo", "COG": "República do Congo", "MAF": "São Martinho (França)", "SXM": "São Martinho (Países Baixos)"}
REG = {"East Asia & Pacific": "asia", "Europe & Central Asia": "europa", "Latin America & Caribbean": "latam", "Middle East, North Africa, Afghanistan & Pakistan": "oriente", "Middle East & North Africa": "oriente",
       "North America": "nam", "South Asia": "sasia", "Sub-Saharan Africa": "africa"}
REN = {"High income": "A", "Upper middle income": "MA", "Lower middle income": "MB", "Low income": "B"}
d = json.loads((RAIZ / "dados/paises/banco_mundial.json").read_text(encoding="utf-8"))
rows = [[x["iso3"], x["num"], ISO_NOME.get(x["iso3"], BR.get(x["nome"], x["nome"])), x["flag"], round(x["pib"] / 1e12, 5), round((x["pop"] or 0) / 1e6, 3), REG.get(x["regiao"].strip(), "outro"), REN.get(x["renda"], "MA")] for x in d]
js = "/* Países do mundo: PIB (US$ correntes, " + d[0]["ano"] + ") e população do Banco Mundial (licença CC BY 4.0). Gerado por tools/gerar_paises.py. */\nwindow.V3PAISES = " + json.dumps(rows, ensure_ascii=False, separators=(",", ":")) + ";\n"
(RAIZ / "cadeira-v3-paisesdados.js").write_text(js, encoding="utf-8")
print(len(rows), "países,", len(js), "bytes")
