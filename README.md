# Portfolio

Next.js 16 · Tailwind v4 · GSAP ScrollTrigger · Motion · Lenis

```bash
npm run dev     # http://localhost:3000
npm run build
```

## Where things live

| Path | Purpose |
| --- | --- |
| `src/lib/site.ts` | Content, links — **edit this first** |
| `src/components/SmoothScroll.tsx` | Lenis ↔ ScrollTrigger wiring |
| `src/components/Hero.tsx` | Hero image + text timeline |
| `src/components/Chrome.tsx` | Fixed nav, contact, burger, scroll rail |
| `src/components/Preloader.tsx` | VHS cassette loader |
| `src/app/globals.css` | Design tokens + layout styles |
| `src/app/vhs.css` | Cassette styles |
| `_reference/` | Source captures — not shipped |

## Animation split

- **GSAP + ScrollTrigger** — anything driven by scroll position
- **Motion** — mount/state transitions (installed, used as sections are built)
- **Lenis** — smooth scroll; drives ScrollTrigger's update loop

Lenis is disabled under `prefers-reduced-motion`.
