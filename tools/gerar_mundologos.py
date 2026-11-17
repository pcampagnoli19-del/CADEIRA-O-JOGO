#!/usr/bin/env python3
"""Gera cadeira-v3-mundologos.js com as logos das cúpulas (dados/eventos/*.webp)."""
import base64, json
from pathlib import Path
RAIZ = Path(__file__).resolve().parent.parent
logos = {f.stem: "data:image/webp;base64," + base64.b64encode(f.read_bytes()).decode() for f in sorted((RAIZ / "dados" / "eventos").glob("*.webp"))}
(RAIZ / "cadeira-v3-mundologos.js").write_text("/* Logos das cúpulas internacionais. Gerado por tools/gerar_mundologos.py. */\nwindow.V3MUNDO_LOGOS = " + json.dumps(logos, separators=(",", ":")) + ";\n", encoding="utf-8")
print(len(logos), "logos")
