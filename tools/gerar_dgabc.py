#!/usr/bin/env python3
"""Gera cadeira-v3-dgabc.js embutindo dados/dgabc/*.webp (estúdio e jornalistas da cobertura municipal)."""
import base64, json
from pathlib import Path
RAIZ = Path(__file__).resolve().parent.parent
img = {f.stem: "data:image/webp;base64," + base64.b64encode(f.read_bytes()).decode() for f in sorted((RAIZ / "dados" / "dgabc").glob("*.webp"))}
js = (RAIZ / "tools" / "dgabc_modelo.js").read_text(encoding="utf-8").replace("__IMAGENS__", json.dumps(img, separators=(",", ":")))
(RAIZ / "cadeira-v3-dgabc.js").write_text(js, encoding="utf-8")
print(len(img), "imagens embutidas")
