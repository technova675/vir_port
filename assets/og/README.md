# OG card fonts

Build inputs for `src/app/opengraph-image.tsx`. Two things about Satori (what
`ImageResponse` renders with) force this directory to exist:

1. It parses only `ttf`, `otf`, and `woff` — **not** `woff2`. Every face in
   `src/fonts/` is woff2.
2. It cannot read **variable** fonts. `Geist-Regular.woff2` is one, and handing
   it over fails the build with `TypeError: Cannot read properties of undefined
   (reading '256')` — an unhelpful message from deep inside its font parser.

So Aeonik is simply re-wrapped, and Geist is pinned to a static instance at
`wght 300` — the weight `.matter-hero-copy h1` actually asks for.

Regenerate after replacing a font (needs `fonttools` and `brotli`):

```python
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

# Static faces: drop the woff2 wrapper, outlines untouched.
for src, dst in [
    ("src/fonts/geist/Geist-SemiBold.woff2", "assets/og/Geist-SemiBold.ttf"),
    ("src/fonts/aeonik-medium.woff2", "assets/og/Aeonik-Medium.ttf"),
]:
    f = TTFont(src)
    f.flavor = None
    f.save(dst)

# Variable face: freeze the weight axis, which also strips fvar/gvar.
f = TTFont("src/fonts/geist/Geist-Regular.woff2")
f.flavor = None
instancer.instantiateVariableFont(
    f, {"wght": 300}, inplace=True, updateFontNames=True
).save("assets/og/Geist-Light.ttf")
```

Not in `public/` on purpose — these are read from disk at build time, and
serving them would just be a second copy of fonts the site already ships.

## yc-wordmark.png

`public/pODjxfbYdMq28sA448CZNeUw4.{jpg,webp,avif}` are the hero's Y Combinator
wordmark. The JPEG has no alpha channel, so on the card's white pill it renders
the logo's transparent ground as a black box. This is the webp decoded back to
RGBA and downscaled to 2x its placed size (150x43):

```python
from PIL import Image

im = Image.open("public/pODjxfbYdMq28sA448CZNeUw4.webp").convert("RGBA")
im.resize((300, 86), Image.LANCZOS).save("assets/og/yc-wordmark.png")
```
