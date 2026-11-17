#!/usr/bin/env python3
"""Recorta os mosaicos de rostos (gerados por IA pelo dono do jogo) em fotos individuais.
Uso: python3 tools/recortar_rostos.py <pasta_dos_mosaicos> <saida>
A grade (colunas x linhas) de cada mosaico é informada em GRADES; as divisões de cada
linha são ajustadas pela borda mais forte perto da posição esperada (os mosaicos do STF
têm colunas desalinhadas entre as linhas)."""
import sys, json
import numpy as np
from pathlib import Path
from PIL import Image
# arquivo (relativo à pasta) -> (colunas, linhas, grupo, faixa, sexo)
GRADES = {
  "18 - 24/HOMENS 1.0.webp": (10, 8, "pol", "19-24", "H"), "18 - 24/HOMENS 2.0.png": (10, 5, "pol", "19-24", "H"), "18 - 24/HOMENS 3.0.png": (10, 6, "pol", "19-24", "H"),
  "18 - 24/MULHERES 2.0.webp": (11, 6, "pol", "19-24", "M"), "18 - 24/MULHERES.webp": (10, 7, "pol", "19-24", "M"),
  "60 - 80/HOMENS 1.0.webp": (12, 7, "pol", "60-80", "H"), "60 - 80/homens 2.0.webp": (10, 6, "pol", "60-80", "H"),
  "60 - 80/MULHERES 1.0.webp": (12, 8, "pol", "60-80", "M"), "60 - 80/MULHERES 2.0.webp": (11, 7, "pol", "60-80", "M"),
  "25 - 34/homens  1.0.png": (10, 6, "pol", "25-34", "H"), "25 - 34/homens  2.0.png": (12, 7, "pol", "25-34", "H"),
  "25 - 34/mulheres 1.0.png": (10, 6, "pol", "25-34", "M"), "25 - 34/mulheres 2.0.png": (12, 5, "pol", "25-34", "M"),
  "35 - 59/HOMENS 1.0.webp": (10, 6, "pol", "35-59", "H"), "35 - 59/HOMENS 2.0.webp": (7, 9, "pol", "35-59", "H"), "35 - 59/HOMENS 3.0.webp": (10, 6, "pol", "35-59", "H"),
  "35 - 59/MULHERES 1.0.webp": (12, 7, "pol", "35-59", "M"), "35 - 59/MULHERES 2.0.webp": (8, 9, "pol", "35-59", "M"), "35 - 59/MULHERES 3.0.webp": (10, 7, "pol", "35-59", "M"),
  "MINISTROS(AS) DO STF/35 - 50 (F).webp": (5, 4, "stf", "35-50", "M"), "MINISTROS(AS) DO STF/35 - 50.webp": (7, 4, "stf", "35-50", "H"),
  "MINISTROS(AS) DO STF/51 - 65 (F).webp": (5, 4, "stf", "51-65", "M"), "MINISTROS(AS) DO STF/51 - 65 (M).webp": (5, 4, "stf", "51-65", "H"),
  "MINISTROS(AS) DO STF/66 - 75 (M).webp": (5, 4, "stf", "66-75", "H"), "MINISTROS(AS) DO STF/66 - 75 (f).webp": (5, 4, "stf", "66-75", "M"),
}
# rostos muito parecidos com políticos reais (Lula, Bolsonaro, Alckmin, Dilma) ficam de fora;
# a numeração é a do recorte antes da exclusão
EXCLUI = {("pol", "60-80", "H"): {75, 76, 87, 89, 97, 98}, ("pol", "60-80", "M"): {4, 23, 99, 108, 112, 114, 131, 165}}
W, H = 128, 160
def bordas(perfil, n, k):
    passo = n / k; out = [0]
    for i in range(1, k):
        x0 = n * i / k; a, b = int(max(1, x0 - passo * 0.22)), int(min(n - 2, x0 + passo * 0.22))
        out.append(a + int(np.argmax(perfil[a:b + 1])))
    out.append(n); return out
def recorta(img, c, r):
    a = np.asarray(img.convert("RGB")).astype(float); h, w = a.shape[:2]
    ph = np.abs(np.diff(a, axis=0)).mean(axis=2).mean(axis=1); ph = np.concatenate([ph, [0]])
    ys = bordas(ph, h, r); tiles = []
    for j in range(r):
        y0, y1 = ys[j], ys[j + 1]; faixa = a[y0:y1]
        pv = np.abs(np.diff(faixa, axis=1)).mean(axis=2).mean(axis=0); pv = np.concatenate([pv, [0]])
        xs = bordas(pv, w, c)
        for i in range(c):
            x0, x1 = xs[i] + 2, xs[i + 1] - 1; t = img.crop((x0, y0 + 2, x1, y1 - 1))
            tw, th = t.size; alvo = W / H
            if tw / th > alvo: nw = int(th * alvo); t = t.crop(((tw - nw) // 2, 0, (tw - nw) // 2 + nw, th))
            else: nh = int(tw / alvo); t = t.crop((0, 0, tw, nh))  # mantém o topo (cabeça)
            tiles.append(t.resize((W, H), Image.LANCZOS))
    return tiles
def main(pasta, saida):
    pasta, saida = Path(pasta), Path(saida); cont = {}
    for nome, (c, r, g, fx, sx) in GRADES.items():
        arq = next((p for p in pasta.rglob("*") if p.as_posix().endswith(nome)), None)
        if not arq: print("faltou", nome); continue
        d = saida / g / fx / sx; d.mkdir(parents=True, exist_ok=True)
        k0, bruto = cont.get((g, fx, sx), (0, 0))
        for t in recorta(Image.open(arq), c, r):
            bruto += 1
            if bruto in EXCLUI.get((g, fx, sx), ()): continue
            k0 += 1; t.convert("RGB").save(d / f"{k0:03d}.webp", "WEBP", quality=74)
        cont[(g, fx, sx)] = (k0, bruto); print(nome, c * r)
    man = {f"{g}/{fx}/{sx}": n[0] for (g, fx, sx), n in sorted(cont.items())}
    (saida / "manifesto.json").write_text(json.dumps(man, indent=1)); print(man)
if __name__ == "__main__": main(sys.argv[1], sys.argv[2])
