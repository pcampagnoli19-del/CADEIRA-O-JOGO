#!/usr/bin/env python3
"""Gera cadeira-v3-imprensaext.js com as logos da imprensa estrangeira (dados/imprensa_ext/*.webp)."""
import base64, json
from pathlib import Path
RAIZ = Path(__file__).resolve().parent.parent
logos = {f.stem: "data:image/webp;base64," + base64.b64encode(f.read_bytes()).decode() for f in sorted((RAIZ / "dados" / "imprensa_ext").glob("*.webp"))}
(RAIZ / "cadeira-v3-imprensaext.js").write_text("/* Logos da imprensa estrangeira. Gerado por tools/gerar_imprensaext.py. */\nwindow.V3IMPRENSA_EXT = " + json.dumps(logos, separators=(",", ":")) + ";\n", encoding="utf-8")
print(len(logos), "logos")
