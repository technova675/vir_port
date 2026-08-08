import { FRAMES, frameUrl } from "./site";

type ProgressFn = (loaded: number, total: number) => void;

/**
 * Progressive image-sequence loader.
 *
 * Load order is deliberate:
 *   1. the first frame           -> something to paint immediately
 *   2. every Nth frame           -> scrubbing works end-to-end, just chunky
 *   3. everything else           -> backfill smooths it out
 *
 * `nearest()` never returns null once step 1 is done, so the canvas can
 * always draw *something* rather than flashing empty.
 */
export class FrameSequence {
  readonly total: number;
  private images: (HTMLImageElement | null)[];
  private loadedFlags: boolean[];
  private loadedCount = 0;
  private queue: number[] = [];
  private active = 0;
  private disposed = false;
  private onProgress?: ProgressFn;

  constructor(onProgress?: ProgressFn) {
    this.total = FRAMES.count;
    this.images = new Array(this.total).fill(null);
    this.loadedFlags = new Array(this.total).fill(false);
    this.onProgress = onProgress;
  }

  /** Resolves once the first frame is painted-ready. */
  async start(): Promise<void> {
    await this.load(0).catch(() => {});

    const coarse: number[] = [];
    for (let i = FRAMES.stride; i < this.total; i += FRAMES.stride) {
      coarse.push(i);
    }
    const rest: number[] = [];
    for (let i = 1; i < this.total; i += 1) {
      if (i % FRAMES.stride !== 0) rest.push(i);
    }

    this.queue = [...coarse, ...rest];
    for (let i = 0; i < FRAMES.concurrency; i += 1) this.pump();
  }

  private pump() {
    if (this.disposed) return;
    if (this.active >= FRAMES.concurrency) return;
    const next = this.queue.shift();
    if (next === undefined) return;

    this.active += 1;
    this.load(next)
      .catch(() => {})
      .finally(() => {
        this.active -= 1;
        this.pump();
      });
  }

  private load(index: number): Promise<void> {
    if (this.loadedFlags[index]) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.src = frameUrl(FRAMES.first + index);

      const done = () => {
        if (this.disposed) return resolve();
        this.images[index] = img;
        this.loadedFlags[index] = true;
        this.loadedCount += 1;
        this.onProgress?.(this.loadedCount, this.total);
        resolve();
      };

      img.onload = () => {
        // decode() keeps the first paint off the main thread; if it is
        // unsupported or rejects, the image is still usable.
        if (typeof img.decode === "function") {
          img.decode().then(done, done);
        } else {
          done();
        }
      };
      img.onerror = () => reject(new Error(`frame ${index} failed`));
    });
  }

  /** Closest decoded frame to `index`, searching outward. */
  nearest(index: number): HTMLImageElement | null {
    const i = Math.max(0, Math.min(this.total - 1, Math.round(index)));
    if (this.loadedFlags[i]) return this.images[i];

    for (let d = 1; d < this.total; d += 1) {
      const lo = i - d;
      const hi = i + d;
      if (lo >= 0 && this.loadedFlags[lo]) return this.images[lo];
      if (hi < this.total && this.loadedFlags[hi]) return this.images[hi];
    }
    return null;
  }

  get progress(): number {
    return this.total === 0 ? 1 : this.loadedCount / this.total;
  }

  dispose() {
    this.disposed = true;
    this.queue = [];
    this.images = [];
    this.loadedFlags = [];
  }
}
