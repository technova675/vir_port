# assets/

Source masters. **Not** served — only `public/` is published, and these are far
too heavy to ship (the two hero PNGs are 10 MB and 30 MB). They live here so a
re-export is possible without keeping 40 MB on the CDN.

## hero/

`hero_section.png` (landscape, desktop) and `hero_section_mobile.png`
(portrait). What the browser actually downloads is the encoded set in
`public/hero/` — roughly 66 KB and 95 KB of AVIF at typical sizes.

After replacing a master, regenerate that set:

```
node scripts/generate-hero-images.mjs
```

It writes `public/hero/*.{avif,webp,jpg}` and prints the two base64
placeholders to paste into `.hero-pan` in `src/app/globals.css` (desktop rule
and the `max-width: 900px` rule). Commit the output.
