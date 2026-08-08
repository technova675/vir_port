"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { FILM_CARDS } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger);

type FilmCardData = (typeof FILM_CARDS)[number];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Seconds between one roll finishing and the next starting. */
const ROLL_INTERVAL = 5;
/** How long a single letter takes to travel its line-box. */
const ROLL_DURATION = 0.62;
/** Widest head start any one letter can get, in seconds. */
const ROLL_SPREAD = 0.3;

/**
 * Per-letter head start, in seconds.
 *
 * Math.random() would desync between the server and client renders and blow
 * up hydration, so the "randomness" is a cheap FNV-style hash of the card key
 * plus the letter's index — stable across renders, still visually scattered.
 *
 * A plain even stagger reads as a wave rolling left to right; the scatter is
 * what makes it read like the reference, where letters break ranks.
 */
function rollDelay(seed: string, index: number) {
  let h = 2166136261;
  const input = `${seed}:${index}`;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // >>> 0 forces the unsigned range; Math.imul leaves h signed.
  const unit = ((h >>> 0) % 1000) / 1000;
  return Number((unit * ROLL_SPREAD).toFixed(3));
}

export default function FilmCard({ data }: { data: FilmCardData }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState({ current: 0, duration: 0 });

  useEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    if (!section || !card) return;

    const ctx = gsap.context(() => {
      // Layered parallax, matching the reference's `data-parallax` depths:
      // each inner element is offset vertically by depth * a factor that
      // sweeps from + to - as the card travels through the viewport, so
      // deeper elements drift further and settle as the card centers.
      const layers = Array.from(
        card.querySelectorAll<HTMLElement>("[data-parallax]"),
      );

      // Split-rollover title letters, on a timer rather than the scroll.
      // Each letter travels exactly one line-box: its clone sits one box
      // below, so at -100% the clone lands precisely where the letter
      // started. That makes the snap back to 0 invisible and lets the roll
      // repeat forever without ever accumulating an offset.
      const letters = Array.from(
        card.querySelectorAll<HTMLElement>(".film-title-char"),
      );
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (letters.length && !reduceMotion) {
        const roll = gsap
          .timeline({ repeat: -1, repeatDelay: ROLL_INTERVAL, paused: true })
          .to(letters, {
            yPercent: -100,
            duration: ROLL_DURATION,
            ease: "power3.inOut",
            // Function-based stagger: each letter's offset comes from its own
            // hashed delay rather than an even step, so they break ranks.
            stagger: (_i, el: HTMLElement) => Number(el.dataset.delay) || 0,
          })
          // Instant reset, not a tween — the clone is already sitting in the
          // slot, so this is a no-op visually and re-arms the next cycle.
          .set(letters, { yPercent: 0 });

        // Only run while the card is actually on screen. Eight cards each
        // ticking a timeline in the background is wasted work, and offscreen
        // cycles would leave every title out of phase with what's visible.
        ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => {
            if (self.isActive) {
              roll.play();
            } else {
              roll.pause(0);
              gsap.set(letters, { yPercent: 0 });
            }
          },
        });
      }

      // On phones/tablets the per-frame work has to come down hard. An
      // animated `filter: blur()` on a full-bleed card forces the compositor
      // to re-rasterise it every frame — with several cards live that alone
      // is enough to drop scrolling below 60fps on mid-range hardware. The
      // layer parallax goes too; the scale falloff is a cheap transform and
      // carries the same depth read on its own.
      const lowPower = window.matchMedia(
        "(max-width: 900px), (pointer: coarse)",
      ).matches;

      // quickSetter skips GSAP's property parsing on every call — the values
      // are written straight to the transform, which matters when this runs
      // once per frame per card.
      const setCard = gsap.quickSetter(card, "scale") as (v: number) => void;
      const setLayer = layers.map(
        (el) => gsap.quickSetter(el, "yPercent", "%") as (v: number) => void,
      );
      const setBlur = gsap.quickSetter(card, "filter") as (v: string) => void;

      let lastBlur = -1;

      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          // -1 (entering from below) -> 0 (centered) -> 1 (leaving above)
          const k = (self.progress - 0.5) * 2;
          const away = Math.abs(k);

          if (!lowPower) {
            for (let i = 0; i < layers.length; i++) {
              const depth = Number(layers[i].dataset.parallax) || 0;
              setLayer[i](-k * depth * 2.2);
            }
            // Quantised to whole pixels: a blur radius change of 0.1px is
            // invisible but still costs a full re-rasterise.
            const blur = Math.round((away > 0.55 ? away - 0.55 : 0) * 12);
            if (blur !== lastBlur) {
              setBlur(blur ? `blur(${blur}px)` : "none");
              lastBlur = blur;
            }
          }

          setCard(1 - away * 0.06);
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const play = () => {
    setStarted(true);
    setPlaying(true);
  };

  const exitPlayer = () => {
    const v = videoRef.current;
    if (v) v.pause();
    setPlaying(false);
    setStarted(false);
    setIsPaused(true);
    setProgress(0);
    setTime({ current: 0, duration: 0 });
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
    } else {
      v.pause();
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    const v = videoRef.current;
    if (v) {
      v.volume = val / 100;
      v.muted = val === 0;
      setMuted(val === 0);
    }
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const pct = Number(e.target.value);
    v.currentTime = (pct / 100) * v.duration;
    setProgress(pct);
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
    setTime({ current: v.currentTime, duration: v.duration });
  };

  // Fullscreen the *container*, not the <video>. Fullscreening the video
  // element itself hands the browser control of the surface and it draws
  // its own native play/pause chrome over ours; fullscreening the wrapper
  // keeps our controls (which are children) on top and shows no native UI.
  const toggleFullscreen = () => {
    const host = playerRef.current;
    if (!host) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      host.requestFullscreen?.();
    }
  };

  // Right-click on a <video> offers "Save video as…" / "Open video in new
  // tab" / "Copy video address". Suppressing the menu removes that path.
  const blockContextMenu = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div className="film-card-section" ref={sectionRef}>
      <div
        className={`film-card${playing ? " is-playing" : ""}`}
        ref={cardRef}
      >
        {started ? (
          <div
            className="film-player"
            ref={playerRef}
            onContextMenu={blockContextMenu}
          >
            <video
              className="film-card-video"
              ref={videoRef}
              src={data.video}
              autoPlay
              playsInline
              // No `controls` attribute, so the ⋮ overflow menu (which is
              // where Chrome puts Download) never renders. controlsList is
              // belt-and-braces for the fullscreen/PiP surfaces.
              controlsList="nodownload noplaybackrate noremoteplayback"
              disablePictureInPicture
              disableRemotePlayback
              onContextMenu={blockContextMenu}
              onTimeUpdate={onTimeUpdate}
              onPlay={() => setIsPaused(false)}
              onPause={() => setIsPaused(true)}
              onEnded={exitPlayer}
              onClick={togglePlay}
            />

            <button
              type="button"
              className="film-player-back"
              onClick={exitPlayer}
              aria-label="Back to portfolio"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="reel-controls film-player-controls">
              <button
                type="button"
                className="reel-btn"
                onClick={togglePlay}
                aria-label={isPaused ? "Play" : "Pause"}
              >
                {isPaused ? (
                  <svg viewBox="0 0 24 24" className="reel-play-icon">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="reel-pause-icon">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                )}
              </button>

              <div className="reel-progress-container">
                <div className="reel-progress-bar">
                  <div
                    className="reel-progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <input
                  type="range"
                  className="reel-progress-input"
                  min={0}
                  max={100}
                  value={progress}
                  onChange={onSeek}
                />
              </div>

              <div className="reel-time">
                {formatTime(time.current)} / {formatTime(time.duration)}
              </div>

              <div className="reel-volume-control">
                <button
                  type="button"
                  className="reel-btn"
                  onClick={toggleMute}
                  aria-label={muted ? "Unmute" : "Mute"}
                >
                  {muted ? (
                    <svg viewBox="0 0 24 24" className="reel-muted-icon">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="reel-volume-icon">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                    </svg>
                  )}
                </button>
                <input
                  type="range"
                  className="reel-volume-slider"
                  min={0}
                  max={100}
                  value={volume}
                  onChange={onVolumeChange}
                />
              </div>

              <button
                type="button"
                className="reel-btn"
                title="Fullscreen"
                onClick={toggleFullscreen}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="film-card-media-trigger"
            onClick={play}
            aria-label={`Play ${data.title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="film-card-image"
              src={data.image}
              alt={data.title}
            />
            <span className="film-card-play-prompt">Click</span>
          </button>
        )}
        {!started && <div className="film-card-scrim" />}

        {!started && (
          <div className="film-card-overlay">
            <div className="film-card-row film-card-row-top">
              <div className="film-index" data-reveal data-parallax="12">
                <span className="film-index-num">{data.index}</span>
                <span className="film-index-rule" aria-hidden="true" />
                <span className="film-index-tag">{data.eyebrow}</span>
              </div>

              <div className="film-stats">
                {data.stats.map((s, si) => (
                  <div
                    className="film-stat"
                    key={s.label}
                    data-reveal
                    data-parallax={15 + si * 8}
                  >
                    <div className="film-stat-value">{s.value}</div>
                    <div className="film-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="film-card-row film-card-row-bottom">
              <div className="film-info" data-reveal data-parallax="15">
                {/* Split-rollover title. Each letter sits in its own
                    one-line-tall mask holding the letter plus a clone parked
                    exactly one line below it; as scroll drives the letter up
                    and out of the mask, the clone arrives to fill the slot,
                    so the word never shows a hole. Mirrors the reference's
                    split-rollover / originalText2 / cloneText2 structure.

                    The letters are aria-hidden and the heading carries the
                    plain string as its label, so assistive tech reads
                    "Agnost" instead of spelling it out one span at a time. */}
                <div className="film-title-wrap">
                  <h2 className="film-title" aria-label={data.title}>
                    <span className="film-title-letters" aria-hidden="true">
                      {Array.from(data.title).map((char, i) =>
                        char === " " ? (
                          <span className="film-title-space" key={i}>
                            &nbsp;
                          </span>
                        ) : (
                          <span className="film-title-roll" key={i}>
                            <span
                              className="film-title-char"
                              data-delay={rollDelay(data.key, i)}
                            >
                              {char}
                            </span>
                            {/* The clone — the ghost is now per-letter
                                rather than one echo behind the whole word. */}
                            <span
                              className="film-title-char film-title-ghost"
                              data-delay={rollDelay(data.key, i)}
                            >
                              {char}
                            </span>
                          </span>
                        ),
                      )}
                    </span>
                  </h2>
                </div>
                {/* <div className="film-eyebrow">{data.eyebrow}</div>

                <p className="film-summary">{data.summary}</p>

                <div className="film-meta">
                  <div className="film-meta-row">
                    <span className="film-meta-label">Client</span>
                    <span className="film-meta-value">{data.meta.client}</span>
                  </div>
                  <div className="film-meta-row">
                    <span className="film-meta-label">Format</span>
                    <span className="film-meta-value">
                      {data.meta.category}
                    </span>
                  </div>
                  <div className="film-meta-row">
                    <span className="film-meta-label">Reach</span>
                    <span className="film-meta-value">{data.meta.reach}</span>
                  </div>
                </div> */}
              </div>

              <a
                className="film-explore"
                href={data.exploreHref}
                target="_blank"
                rel="noopener noreferrer"
                data-reveal
                data-parallax="24"
              >
                <svg viewBox="0 0 142 44" className="film-explore-outline">
                  <path
                    stroke="currentColor"
                    fill="none"
                    d="M5 1h90c0 1 .6 3 3 3s3-2 3-3h36c0 3.2 2.667 4.144 4 4.216V39c-3.2 0-4 2.667-4 4h-35c0-1.333-.8-4-4-4s-4 2.667-4 4H5c0-3.6-2.667-4.167-4-4V5c3.2 0 4-2.667 4-4Z"
                  />
                  <path
                    stroke="currentColor"
                    strokeDasharray="4"
                    d="M98 4.5v34"
                  />
                </svg>
                <span className="film-explore-text">Visit</span>
                <svg viewBox="0 0 11 10" className="film-explore-arrow">
                  <path d="M4.481.005a6.65 6.65 0 0 1 6.46 4.659c.078.229.08.479-.003.706C10.302 7.105 8.318 10 4.48 10V8.39c.941.127 2.922-.257 4.442-2.603H0V4.208h8.938c-.756-1.229-2.216-2.78-4.457-2.78V.006Z" />
                </svg>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
