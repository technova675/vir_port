"use client";

import { scrollToSelector } from "./SmoothScroll";

export default function BookCallButton() {
  return (
    <button
      type="button"
      className="book-call-button"
      onClick={() => scrollToSelector("#contact")}
    >
      Book a call <span aria-hidden="true">&rarr;</span>
    </button>
  );
}
