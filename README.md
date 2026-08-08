# Portfolio

Next.js 16 · Tailwind v4 · GSAP ScrollTrigger · Motion · Lenis

```bash
npm run dev     # http://localhost:3000
npm run build
```

## Hero

The hero is a **scroll-scrubbed image sequence** painted to a canvas — not a
`<video>` element. Video `currentTime` seeking is async and stutters badly on
Safari/iOS, so frames are pre-decoded and drawn on demand instead.

Loading is progressive (`src/lib/frameSequence.ts`):

1. frame 1 — paint something immediately
2. every 16th frame — scrubbing works end to end, just chunky
3. everything else — backfilled 8 at a time

`nearest()` falls back to the closest decoded frame, so the canvas never blanks.
The VHS preloader exists to mask steps 1–2.

### Swapping in your own footage

Currently pointing at a **placeholder sequence hosted on the reference site** so
the scrubber could be built before real footage existed. This must be replaced
before deploying.

```powershell
.\scripts\generate-frames.ps1 -Source .\_reference\my-video.mp4
```

Then update `FRAMES` in `src/lib/site.ts`:

```ts
baseUrl: "/sequence",
pattern: (n) => `frame_${String(n).padStart(4, "0")}.jpg`,
count: 450,   // whatever the script reports
```

## Where things live

| Path | Purpose |
| --- | --- |
| `src/lib/site.ts` | Content, links, frame config — **edit this first** |
| `src/lib/frameSequence.ts` | Progressive image loader |
| `src/components/SmoothScroll.tsx` | Lenis ↔ ScrollTrigger wiring |
| `src/components/Hero.tsx` | Canvas scrubber + hero text timeline |
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
