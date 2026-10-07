// ─────────────────────────────────────────────────────────────────────────────
// Thread engine — layout coordinates + organic path generation for the loom.
// The map is a piece of cloth: faint warp threads run vertically; the mind-map
// threads (weft) are hand-placed so they read like a woven tapestry.
// ─────────────────────────────────────────────────────────────────────────────

import { CATEGORY_ORDER, NODES, type CategoryId } from "@/data/mindmap";

// World / canvas size of the map in SVG units.
export const MAP_W = 2080;
export const MAP_H = 1240;

export interface Pt {
  x: number;
  y: number;
}

// ── Node positions ───────────────────────────────────────────────────────────

export const ROOT_POS: Pt = { x: MAP_W / 2, y: MAP_H / 2 }; // 1040, 620

// Category spine columns — a clean 2×2: types & applications up top,
// capabilities & energy below, root at the centre.
const LEFT_X = 620;
const RIGHT_X = MAP_W - LEFT_X; // 1460

export const CATEGORY_POS: Record<CategoryId, Pt> = {
  types: { x: LEFT_X, y: 240 },
  applications: { x: RIGHT_X, y: 240 },
  capabilities: { x: LEFT_X, y: 1000 },
  energy: { x: RIGHT_X, y: 1000 },
};

// Leaf columns.
const LEAF_LEFT_X = 290;
const LEAF_RIGHT_X = MAP_W - LEAF_LEFT_X; // 1790

export const LEAF_X: Record<CategoryId, number> = {
  types: LEAF_LEFT_X,
  capabilities: LEAF_LEFT_X,
  applications: LEAF_RIGHT_X,
  energy: LEAF_RIGHT_X,
};

/**
 * Leaves of a category fan out vertically around the category's Y.
 * Deterministic layout, no randomness — hand-tuned rhythm.
 */
export function leafPos(nodeId: string): Pt {
  const node = NODES.find((n) => n.id === nodeId);
  if (!node || node.kind !== "leaf") return ROOT_POS;
  const cat = node.category;
  const siblings = NODES.filter(
    (n) => n.category === cat && n.kind === "leaf"
  );
  const idx = siblings.findIndex((n) => n.id === nodeId);
  const count = siblings.length;
  const gap = count >= 6 ? 62 : 74;
  const span = gap * (count - 1);
  const cy = CATEGORY_POS[cat].y;
  const y = cy - span / 2 + idx * gap;
  return { x: LEAF_X[cat], y };
}

export function nodePos(id: string): Pt {
  if (id === "root") return ROOT_POS;
  if (id.startsWith("cat-")) {
    const cat = id.slice(4) as CategoryId;
    return CATEGORY_POS[cat] ?? ROOT_POS;
  }
  return leafPos(id);
}

// ── Seeded randomness (deterministic thread wiggle) ─────────────────────────

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ── Thread path generation ──────────────────────────────────────────────────
//
// A thread is a cubic bezier from A to B with a perpendicular "sag", then
// resampled with a tiny seeded sine wiggle so it reads as spun fibre, not a
// laser beam. Returns an SVG path `d` string.

function cubicAt(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const mt = 1 - t;
  const a = mt * mt * mt;
  const b = 3 * mt * mt * t;
  const c = 3 * mt * t * t;
  const d = t * t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
}

export interface ThreadOpts {
  sag?: number; // perpendicular bow of the thread (px, signed)
  wiggle?: number; // amplitude of fibre noise (px)
  seed?: string;
  startTangentLen?: number; // horizontal pull-out before curving
}

export function threadPath(a: Pt, b: Pt, opts: ThreadOpts = {}): string {
  const sag = opts.sag ?? 0;
  const wiggle = opts.wiggle ?? 1.6;
  const seed = opts.seed ?? "thread";
  const tangent = opts.startTangentLen ?? Math.max(60, Math.abs(b.x - a.x) * 0.45);

  // Perpendicular unit vector (points "below" the a→b line).
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;

  const c1 = { x: a.x + Math.sign(dx || 1) * tangent, y: a.y };
  const c2 = { x: b.x - Math.sign(dx || 1) * tangent, y: b.y };

  // Apply sag to control points so the whole belly shifts.
  c1.x += nx * sag * 0.6;
  c1.y += ny * sag * 0.6;
  c2.x += nx * sag;
  c2.y += ny * sag;

  // Resample with fibre wiggle.
  const rnd = mulberry32(hashStr(seed));
  const phase = rnd() * Math.PI * 2;
  const freq = 2.2 + rnd() * 1.6;
  const N = 26;
  let d = "";
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p = cubicAt(a, c1, c2, b, t);
    const env = Math.sin(Math.PI * t); // clamp ends
    const off =
      Math.sin(phase + t * Math.PI * 2 * freq) * wiggle * env +
      Math.sin(phase * 2.7 + t * Math.PI * 2 * freq * 2.3) * wiggle * 0.35 * env;
    const x = p.x + nx * off;
    const y = p.y + ny * off;
    d += i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

// Root → category threads: generous sag alternating up/down like a loom beat.
export function rootThreadPath(cat: CategoryId): string {
  const a = ROOT_POS;
  const b = CATEGORY_POS[cat];
  const dir = b.x < a.x ? -1 : 1;
  const sag = (dir < 0 ? 1 : -1) * (46 + (hashStr(cat) % 5) * 8) * (b.y < a.y ? 1 : -1);
  return threadPath(a, b, {
    sag,
    wiggle: 2.2,
    seed: `root-${cat}`,
    startTangentLen: 130,
  });
}

// Root → category while the bobbin is being pulled: the thread straightens
// and tautens as `taut` goes 0 → 1.
export function rootThreadPathTo(cat: CategoryId, pos: Pt, taut: number): string {
  const a = ROOT_POS;
  const rest = CATEGORY_POS[cat];
  const restSag =
    (rest.x < a.x ? 1 : -1) * (46 + (hashStr(cat) % 5) * 8) * (rest.y < a.y ? 1 : -1);
  const sag = restSag * (1 - taut) * 0.85;
  return threadPath(a, pos, {
    sag,
    wiggle: 2.2 * (1 - taut * 0.7),
    seed: `root-${cat}`,
    startTangentLen: 130 * (1 - taut * 0.8),
  });
}

// Category → leaf threads: short, lively.
export function leafThreadPath(leafId: string): string {
  const node = NODES.find((n) => n.id === leafId);
  if (!node) return "";
  const a = nodePos(`cat-${node.category}`);
  const b = nodePos(leafId);
  const i = Math.abs(hashStr(leafId)) % 3;
  const sag = [-18, 14, -8][i];
  return threadPath(a, b, {
    sag,
    wiggle: 1.4,
    seed: `leaf-${leafId}`,
    startTangentLen: 70,
  });
}

// Category → leaf while the knot is dragged: sag vanishes as tension rises.
export function leafThreadPathTo(leafId: string, pos: Pt, taut: number): string {
  const node = NODES.find((n) => n.id === leafId);
  if (!node) return "";
  const a = nodePos(`cat-${node.category}`);
  const i = Math.abs(hashStr(leafId)) % 3;
  const restSag = [-18, 14, -8][i];
  return threadPath(a, pos, {
    sag: restSag * (1 - taut) * 0.8,
    wiggle: 1.4 * (1 - taut * 0.6),
    seed: `leaf-${leafId}`,
    startTangentLen: 70 * (1 - taut * 0.75),
  });
}

// ── Visitor fringe — short strands hanging at the selvedge ──────────────────
export function fringeStrand(x: number, yTop: number, len: number, seed: string): string {
  const rnd = mulberry32(hashStr(seed));
  const bend = (rnd() - 0.5) * 14;
  const endX = x + bend + (rnd() - 0.5) * 5;
  const c1x = x + bend * 0.2;
  const c2x = x + bend * 0.8;
  return `M ${x} ${yTop} C ${c1x} ${yTop + len * 0.35}, ${c2x} ${yTop + len * 0.7}, ${endX} ${yTop + len}`;
}

// Cross-links: long dashed "tangle" threads arcing across the cloth.
export function crossLinkPath(aId: string, bId: string): string {
  const a = nodePos(aId);
  const b = nodePos(bId);
  // Arc above the centre line if both ends are high, below if low.
  const midY = (a.y + b.y) / 2;
  const above = midY < ROOT_POS.y;
  const sag = above ? -120 : 120;
  return threadPath(a, b, {
    sag,
    wiggle: 2.6,
    seed: `x-${aId}-${bId}`,
    startTangentLen: 90,
  });
}

// ── Warp background ─────────────────────────────────────────────────────────

export interface WarpLine {
  x: number;
  w: number;
  o: number;
}

export function warpLines(): WarpLine[] {
  const lines: WarpLine[] = [];
  const rnd = mulberry32(20261008);
  let x = 14;
  while (x < MAP_W - 6) {
    const w = 0.6 + rnd() * 0.9;
    const o = 0.028 + rnd() * 0.034;
    lines.push({ x: Math.round(x * 10) / 10, w: Math.round(w * 100) / 100, o: Math.round(o * 1000) / 1000 });
    x += 26 + rnd() * 30;
  }
  return lines;
}

export function weftGhosts(): { y: number; o: number }[] {
  const rnd = mulberry32(777);
  const out: { y: number; o: number }[] = [];
  let y = 60;
  while (y < MAP_H - 20) {
    out.push({ y: Math.round(y), o: 0.02 + rnd() * 0.02 });
    y += 90 + rnd() * 70;
  }
  return out;
}

// Corner squiggles — loose decorative threads resting on the cloth.
export function looseThread(seed: string, startX: number, startY: number, len: number, flip: boolean): string {
  const rnd = mulberry32(hashStr(seed));
  let d = `M ${startX} ${startY}`;
  let x = startX;
  let y = startY;
  const dir = flip ? -1 : 1;
  const steps = 7;
  for (let i = 0; i < steps; i++) {
    const nx = x + (len / steps) * (0.7 + rnd() * 0.6) * dir;
    const ny = y + (rnd() - 0.5) * 34;
    d += ` Q ${((x + nx) / 2).toFixed(1)} ${(y + (rnd() - 0.5) * 46).toFixed(1)} ${nx.toFixed(1)} ${ny.toFixed(1)}`;
    x = nx;
    y = ny;
  }
  return d;
}

// ── Colors ───────────────────────────────────────────────────────────────────

export function mixHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const r = Math.round((((pa >> 16) & 255) * (1 - t) + ((pb >> 16) & 255) * t));
  const g = Math.round((((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t));
  const bl = Math.round(((pa & 255) * (1 - t) + (pb & 255) * t));
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, "0")}`;
}
