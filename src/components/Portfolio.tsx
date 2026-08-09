"use client";

import { useRef } from "react";
import { FILM_CARDS } from "@/lib/site";
import FilmCard from "./FilmCard";

export default function Portfolio() {
  const listRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    dragging: boolean;
    lastY: number;
    id: number;
  } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    // Mouse only. On touch, the browser's own scrolling is better than
    // anything this handler emulates, and capturing the pointer here stole
    // the gesture from it — leaving the page unable to scroll at all.
    if (e.pointerType !== "mouse") return;

    // Don't hijack drags that start on interactive controls (video, links,
    // buttons) — only the empty card chrome should act as a scroll handle.
    const target = e.target as HTMLElement;
    if (target.closest("a, button, video, input")) return;

    dragState.current = { dragging: true, lastY: e.clientY, id: e.pointerId };
    // Capture on the list, not e.target: the card swaps its <img> for a
    // <video> on play, and capture held by a removed node is never
    // released, which wedges every later pointer event.
    listRef.current?.setPointerCapture(e.pointerId);
    listRef.current?.classList.add("grabbing");
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const state = dragState.current;
    if (!state?.dragging || e.pointerType !== "mouse") return;
    const delta = e.clientY - state.lastY;
    state.lastY = e.clientY;
    window.scrollBy(0, -delta);
  };

  const endDrag = () => {
    const state = dragState.current;
    if (state?.id !== undefined) {
      // hasPointerCapture guards against releasing an id we never captured.
      if (listRef.current?.hasPointerCapture(state.id)) {
        listRef.current.releasePointerCapture(state.id);
      }
    }
    dragState.current = null;
    listRef.current?.classList.remove("grabbing");
  };

  return (
    // Extra wrapper scopes the "premium" treatment (grain overlay, colour
    // and type tokens) to the portfolio only — nothing else on the page
    // inherits it.
    <div className="portfolio-premium">
      {/* Also acts as the gap between the hero pin and the first card —
          without it the card butts straight up against the hero image. */}
      <header className="portfolio-intro">
        <h2 className="portfolio-heading">Selected Works</h2>
      </header>

      <div
        id="portfolio-section"
        className="portfolio-list"
        ref={listRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        {FILM_CARDS.map((card) => (
          <FilmCard data={card} key={card.key} />
        ))}
      </div>
    </div>
  );
}
