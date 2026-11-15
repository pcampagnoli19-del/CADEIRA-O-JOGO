#!/usr/bin/env python3
"""Gera cadeira-v3-estatais.js embutindo dados/estatais/*.webp (logos das estatais)."""
import base64, json
from pathlib import Path
RAIZ = Path(__file__).resolve().parent.parent
logos = {f.stem: "data:image/webp;base64," + base64.b64encode(f.read_bytes()).decode() for f in sorted((RAIZ / "dados" / "estatais").glob("*.webp"))}
js = (RAIZ / "tools" / "estatais_modelo.js").read_text(encoding="utf-8").replace("__LOGOS__", json.dumps(logos, separators=(",", ":")))
(RAIZ / "cadeira-v3-estatais.js").write_text(js, encoding="utf-8")
print(len(logos), "logos")
