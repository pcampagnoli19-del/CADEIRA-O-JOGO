#!/usr/bin/env python3
"""Gera cadeira-v3-marcas.js embutindo os logos de dados/marcas/*.webp (ou .png)."""
import base64, json
from pathlib import Path
RAIZ = Path(__file__).resolve().parent.parent
logos = {}
for f in sorted((RAIZ / "dados" / "marcas").glob("*")):
    if f.suffix.lower() in (".webp", ".png"):
        mime = "image/webp" if f.suffix.lower() == ".webp" else "image/png"
        logos[f.stem] = "data:%s;base64,%s" % (mime, base64.b64encode(f.read_bytes()).decode())
js = (RAIZ / "tools" / "marcas_modelo.js").read_text(encoding="utf-8").replace("__LOGOS__", json.dumps(logos, separators=(",", ":")))
(RAIZ / "cadeira-v3-marcas.js").write_text(js, encoding="utf-8")
print(len(logos), "logos")
