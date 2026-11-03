#!/usr/bin/env python3
"""Aplica a camada visual v3 e otimiza as imagens embutidas do CADEIRA.

Uso:
    python3 tools/aplicar_tema.py            # só tema (CSS + fontes + script do cabeçalho)
    python3 tools/aplicar_tema.py --imagens  # tema + recompressão das imagens embutidas

Edita index.html e copia o resultado para CADEIRA_O_Jogo_25.html (os dois
precisam continuar idênticos). É idempotente: rodar de novo só troca o bloco
entre os marcadores CADEIRA_V3_INICIO / CADEIRA_V3_FIM.
"""
import base64
import io
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
HTML = RAIZ / "index.html"
COPIA = RAIZ / "CADEIRA_O_Jogo_25.html"
CSS = RAIZ / "cadeira-v3.css"

INI = "<!-- CADEIRA_V3_INICIO -->"
FIM = "<!-- CADEIRA_V3_FIM -->"

FONTES = (
    '<link href="https://fonts.googleapis.com/css2?'
    "family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700"
    "&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400"
    '&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet">'
)

# Mede o cabeçalho fixo e passa a altura para o CSS (as abas grudam logo abaixo).
SCRIPT = """<script>
(function(){
  var raf=0, ro=null, atual=null;
  function medir(){
    raf=0;
    var h=document.querySelector('#app > header.lcd');
    if(h!==atual){ if(ro){ro.disconnect();} atual=h; if(h&&window.ResizeObserver){ ro=new ResizeObserver(agendar); ro.observe(h);} }
    var alt=h?Math.round(h.getBoundingClientRect().height):0;
    document.documentElement.style.setProperty('--v3-hdr-h', alt+'px');
  }
  function agendar(){ if(!raf) raf=requestAnimationFrame(medir); }
  function iniciar(){
    var app=document.getElementById('app'); if(!app) return;
    new MutationObserver(agendar).observe(app,{childList:true});
    window.addEventListener('resize',agendar,{passive:true});
    agendar();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',iniciar); else iniciar();
})();
</script>"""


# Camadas extras, embutidas nesta ordem depois do tema.
EXTRAS_CSS = [RAIZ / "cadeira-v3-nav.css", RAIZ / "cadeira-v3-midia.css", RAIZ / "cadeira-v3-diplomacia.css", RAIZ / "cadeira-v3-pre.css"]
EXTRAS_JS = [RAIZ / "cadeira-v3-nav.js", RAIZ / "cadeira-v3-midia.js", RAIZ / "cadeira-v3-geo.js", RAIZ / "cadeira-v3-diplomacia.js", RAIZ / "cadeira-v3-pre.js"]


def bloco_tema() -> str:
    css = CSS.read_text(encoding="utf-8")
    if "</style" in css:
        raise SystemExit("fechamento de tag dentro do CSS embutido")
    partes = [INI, f'<style id="cadeira-v3">\n{css}\n</style>']
    for arq in EXTRAS_CSS:
        if arq.exists():
            txt = arq.read_text(encoding="utf-8")
            if "</style" in txt:
                raise SystemExit(f"fechamento de tag dentro de {arq.name}")
            partes.append(f'<style id="{arq.stem}">\n{txt}\n</style>')
    partes.append(SCRIPT)
    for arq in EXTRAS_JS:
        if arq.exists():
            txt = arq.read_text(encoding="utf-8")
            if "</script" in txt:
                raise SystemExit(f"fechamento de tag dentro de {arq.name}")
            partes.append(f'<script id="{arq.stem}-js">\n{txt}\n</script>')
    partes.append(FIM)
    return "\n".join(partes)


def aplicar_tema(html: str) -> str:
    html = re.sub(
        r'<link href="https://fonts\.googleapis\.com/css2\?[^"]*" rel="stylesheet">',
        FONTES,
        html,
        count=1,
    )
    bloco = bloco_tema()
    if INI in html:
        i = html.index(INI)
        f = html.index(FIM, i) + len(FIM)
        return html[:i] + bloco + html[f:]
    corpo = html.rfind("</body>")
    if corpo < 0:
        raise SystemExit("</body> não encontrado")
    return html[:corpo] + bloco + "\n" + html[corpo:]


# ---------------------------------------------------------------- imagens
def _webp(dados: bytes, larg_max: int, qualidade: int):
    from PIL import Image

    im = Image.open(io.BytesIO(dados))
    im.load()
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGBA" if "transparency" in im.info or im.mode in ("LA", "P") else "RGB")
    if im.width > larg_max:
        alt = round(im.height * larg_max / im.width)
        im = im.resize((larg_max, alt), Image.LANCZOS)
    out = io.BytesIO()
    im.save(out, "WEBP", quality=qualidade, method=6)
    return out.getvalue()


def otimizar_uri(uri: str, larg_max: int, qualidade: int) -> str:
    if not uri.startswith("data:image/") or ";base64," not in uri:
        return uri
    if uri.startswith("data:image/svg"):
        return uri
    cab, b64 = uri.split(",", 1)
    try:
        dados = base64.b64decode(b64)
        novo = _webp(dados, larg_max, qualidade)
    except Exception:
        return uri
    if len(novo) >= len(dados):
        return uri
    return "data:image/webp;base64," + base64.b64encode(novo).decode("ascii")


def otimizar_json_script(html: str, ident: str, larg_max: int, qualidade: int) -> str:
    abre = re.search(r'<script id="%s" type="application/json">' % re.escape(ident), html)
    if not abre:
        print(f"  (sem bloco {ident})")
        return html
    ini = abre.end()
    fim = html.index("</script>", ini)
    texto = html[ini:fim]
    lead = texto[: len(texto) - len(texto.lstrip())]
    trail = texto[len(texto.rstrip()):]
    dados = json.loads(texto)

    def andar(v):
        if isinstance(v, dict):
            return {k: andar(x) for k, x in v.items()}
        if isinstance(v, list):
            return [andar(x) for x in v]
        if isinstance(v, str):
            return otimizar_uri(v, larg_max, qualidade)
        return v

    novo = json.dumps(andar(dados), ensure_ascii=False, separators=(",", ":"))
    print(f"  {ident}: {len(texto)/1e6:.2f} MB -> {len(novo)/1e6:.2f} MB")
    return html[:ini] + lead + novo + trail + html[fim:]


def otimizar_literais(html: str, larg_max: int, qualidade: int) -> str:
    """data URIs soltas no código (ex.: logo: "data:image/jpeg;base64,...")."""
    antes = len(html)
    padrao = re.compile(r'"(data:image/(?:jpeg|png);base64,[A-Za-z0-9+/=]{2000,})"')
    html = padrao.sub(lambda m: '"' + otimizar_uri(m.group(1), larg_max, qualidade) + '"', html)
    print(f"  literais no código: {(antes-len(html))/1e6:.2f} MB a menos")
    return html


def main():
    html = HTML.read_text(encoding="utf-8")
    if "--imagens" in sys.argv:
        print("Otimizando imagens embutidas:")
        html = otimizar_json_script(html, "fotos-embutidas", 240, 74)
        html = otimizar_json_script(html, "logos-partidos", 240, 86)
        html = otimizar_literais(html, 240, 80)
    html = aplicar_tema(html)
    HTML.write_text(html, encoding="utf-8")
    COPIA.write_text(html, encoding="utf-8")
    print(f"index.html: {len(html.encode('utf-8'))/1e6:.2f} MB (cópia sincronizada)")


if __name__ == "__main__":
    main()
