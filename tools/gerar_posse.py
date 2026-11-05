#!/usr/bin/env python3
"""Gera cadeira-v3-posse.js embutindo dados/posse/*.webp (edifícios) e dados/lideres/*.webp (líderes mundiais)."""
import base64, json
from pathlib import Path
RAIZ = Path(__file__).resolve().parent.parent
def mapa(pasta):
    return {f.stem: "data:image/webp;base64," + base64.b64encode(f.read_bytes()).decode() for f in sorted((RAIZ / "dados" / pasta).glob("*.webp"))}
img, lid = mapa("posse"), mapa("lideres")
js = (RAIZ / "tools" / "posse_modelo.js").read_text(encoding="utf-8")
js = js.replace("__IMG__", json.dumps(img, separators=(",", ":"))).replace("__LIDERES__", json.dumps(lid, ensure_ascii=False, separators=(",", ":")))
(RAIZ / "cadeira-v3-posse.js").write_text(js, encoding="utf-8")
print(len(img), "edifícios,", len(lid), "líderes")
