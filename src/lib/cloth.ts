// ─────────────────────────────────────────────────────────────────────────────
// Cotton-canvas cloth generator.
//
// Instead of a flat colour + faint grid, the whole experience now sits on a
// procedurally woven piece of unbleached cotton canvas:
//   · an over/under basket weave (warp × weft) with per-thread shade jitter
//   · cotton fibre specks and slubs (the little irregularities of handloom yarn)
//   · everything generated once into a seamless 256px tile and reused as a
//     CSS background (page backdrop, cards, sheets, dialogs) via
//     the `--tanabana-weave` CSS variable.
//
// The tile is transparent apart from the weave itself, so it composites
// naturally over both the page cream (#F6F1E7) and card ivory (#FFFDF7).
// ─────────────────────────────────────────────────────────────────────────────

let cachedUrl: string | null = null;

/** Seeded, deterministic RNG so the cloth is identical on every visit. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const CLOTH_TILE_SIZE = 256;

/**
 * Build (once) and return a data-URL of the seamless cotton weave tile.
 * Returns "" on the server / when canvas is unavailable — callers must treat
 * the cloth as an enhancement over the plain cream background.
 */
export function clothTileUrl(): string {
  if (cachedUrl) return cachedUrl;
  if (typeof document === "undefined") return "";

  const TILE = CLOTH_TILE_SIZE;
  const dpr = Math.min(2, (typeof window !== "undefined" && window.devicePixelRatio) || 1);
  const S = Math.round(TILE * dpr);
  const P = Math.max(3, Math.round(4 * dpr)); // thread pitch in device px
  const n = Math.round(S / P); // threads per axis (even → perfect wrap)

  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const g = c.getContext("2d");
  if (!g) return "";
  g.clearRect(0, 0, S, S);

  const rnd = mulberry32(20261008);

  // Per-thread shade jitter — indexed modulo n so the tile wraps seamlessly.
  const shade = new Float32Array(n);
  for (let i = 0; i < n; i++) shade[i] = rnd();

  // ── 1. the weave: over/under cells with soft seams ─────────────────────────
  for (let r = 0; r < n; r++) {
    const y = r * P;
    const rowShift = r % 2;
    for (let col = 0; col < n; col++) {
      const x = col * P;
      const over = (col + rowShift) % 2 === 0;
      const j = (shade[r] + shade[col]) / 2; // 0..1 local shade
      if (over) {
        // warp thread catching the light
        const a = 0.13 + j * 0.11;
        g.fillStyle = `rgba(255,255,250,${a.toFixed(3)})`;
        g.fillRect(x, y, P - dpr * 0.5, P - dpr * 0.5);
        // gentle shading at the cell's lower edge (rounded yarn feel)
        g.fillStyle = `rgba(140,116,84,${(0.035 + j * 0.03).toFixed(3)})`;
        g.fillRect(x, y + P - dpr * 0.75, P - dpr * 0.5, dpr * 0.75);
      } else {
        // weft passing under — a touch darker
        const a = 0.075 + j * 0.075;
        g.fillStyle = `rgba(128,104,74,${a.toFixed(3)})`;
        g.fillRect(x, y, P, P);
      }
      // seam between cells (thread separation)
      g.fillStyle = `rgba(110,88,60,${(0.05 + j * 0.035).toFixed(3)})`;
      g.fillRect(x + P - dpr * 0.4, y, dpr * 0.4, P);
    }
    // horizontal seam under the row
    g.fillStyle = "rgba(110,88,60,0.045)";
    g.fillRect(0, y + P - dpr * 0.4, S, dpr * 0.4);
  }

  // ── 2. slubs — short lighter streaks where the yarn thins ──────────────────
  for (let i = 0; i < 14; i++) {
    const x = Math.floor(rnd() * n) * P;
    const y = Math.floor(rnd() * n) * P + P * 0.25;
    const w = P * (2 + Math.floor(rnd() * 5));
    g.fillStyle = `rgba(255,255,250,${(0.16 + rnd() * 0.14).toFixed(3)})`;
    g.fillRect(x, y, Math.min(w, S - x), Math.max(1, dpr * 0.6));
  }

  // ── 3. fibre specks — the dust of cotton ────────────────────────────────────
  const specks = Math.round(720 * dpr * dpr);
  for (let i = 0; i < specks; i++) {
    const x = rnd() * S;
    const y = rnd() * S;
    const dark = rnd() < 0.55;
    g.fillStyle = dark
      ? `rgba(112,90,62,${(0.05 + rnd() * 0.09).toFixed(3)})`
      : `rgba(255,255,252,${(0.08 + rnd() * 0.12).toFixed(3)})`;
    // draw wrapped so specks near edges still tile seamlessly
    const px = x > S - 2 ? x - S : x;
    const py = y > S - 2 ? y - S : y;
    g.fillRect(px, py, dpr * 0.7, dpr * 0.7);
  }

  // ── 4. the odd cotton burr — a tiny dark fleck of the raw plant ────────────
  for (let i = 0; i < 9; i++) {
    const x = rnd() * S;
    const y = rnd() * S;
    g.fillStyle = `rgba(96,76,50,${(0.10 + rnd() * 0.08).toFixed(3)})`;
    g.fillRect(x, y, dpr * 1.1, dpr * 1.1);
  }

  cachedUrl = c.toDataURL("image/png");
  return cachedUrl;
}
