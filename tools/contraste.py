"""Confere o contraste (WCAG) das cores de texto do tema contra o fundo do editor.

Uso: python contraste.py [../themes/occhio-color-theme.json]
Cores com transparencia sao misturadas ao fundo antes do calculo.
Sai com codigo 1 se alguma cor de texto ficar abaixo de 4,5:1.
"""
import json
import sys
from pathlib import Path

MINIMO = 4.5


def rgb(hexa, fundo=None):
    h = hexa.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    if len(h) == 8 and fundo:
        a = int(h[6:8], 16) / 255
        r, g, b = (round(c * a + f * (1 - a)) for c, f in zip((r, g, b), fundo))
    return r, g, b


def luminancia(c):
    def canal(v):
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = (canal(v) for v in c)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contraste(a, b):
    la, lb = sorted((luminancia(a), luminancia(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def main():
    arq = Path(sys.argv[1] if len(sys.argv) > 1 else Path(__file__).parent.parent / "themes" / "occhio-color-theme.json")
    tema = json.loads(arq.read_text(encoding="utf-8"))
    fundo = rgb(tema["colors"]["editor.background"])
    cores = {}
    for regra in tema["tokenColors"]:
        cor = regra["settings"].get("foreground")
        if cor:
            cores.setdefault(cor.lower(), []).append(regra.get("name", "?"))
    for nome, val in tema.get("semanticTokenColors", {}).items():
        cor = val if isinstance(val, str) else val.get("foreground")
        if cor:
            cores.setdefault(cor.lower(), []).append("semantico " + nome)
    falhas = 0
    for cor, usos in sorted(cores.items(), key=lambda x: contraste(rgb(x[0], fundo), fundo)):
        c = contraste(rgb(cor, fundo), fundo)
        marca = "OK  " if c >= MINIMO else "BAIXO"
        falhas += c < MINIMO
        print(f"{marca} {c:5.2f}:1  {cor:10} {len(usos):3} usos  ex.: {usos[0]}")
    print(f"\n{len(cores)} cores de texto, {falhas} abaixo de {MINIMO}:1")
    sys.exit(1 if falhas else 0)


if __name__ == "__main__":
    main()
