"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CATEGORIES,
  CARD,
  CATEGORY_NODES,
  CATEGORY_ORDER,
  CROSS_LINKS,
  INK,
  MUTED,
  NODES,
  PAPER,
  ROOT,
  type CategoryId,
} from "@/data/mindmap";
import {
  CATEGORY_POS,
  LEAF_X,
  MAP_H,
  MAP_W,
  ROOT_POS,
  crossLinkPath,
  leafThreadPath,
  leafThreadPathTo,
  looseThread,
  mixHex,
  nodePos,
  rootThreadPath,
  rootThreadPathTo,
  warpLines,
  weftGhosts,
  type Pt,
} from "@/lib/threads";

export interface MapControls {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  flyTo: (id: string) => void;
  /** slow, wide camera drift used by attract mode */
  driftTo: (id: string) => void;
}

interface ThreadMapProps {
  entered: boolean;
  weaveKey: number;
  selectedId: string | null;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  onSelect: (id: string) => void;
  onBackgroundClick: () => void;
  focusCat: CategoryId | null;
  unraveled: Set<CategoryId>;
  onUnravel: (cat: CategoryId) => void;
  tourId: string | null;
  /** bumped every time the guided tour starts — the brain glints on it */
  tourSeq: number;
  /** attract mode is active — the room is empty, the map performs */
  attract: boolean;
  controlsRef: React.MutableRefObject<MapControls | null>;
}

interface View {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface PullInternal {
  kind: "cat" | "leaf";
  id: string;
  cat: CategoryId;
  base: Pt;
  startClient: Pt;
  maxR: number;
}

interface PullRender {
  id: string;
  base: Pt;
  pos: Pt;
  taut: number;
  moved: boolean;
}

const OVERSCAN = 320;

export function ThreadMap({
  entered,
  weaveKey,
  selectedId,
  hoveredId,
  setHoveredId,
  onSelect,
  onBackgroundClick,
  focusCat,
  unraveled,
  onUnravel,
  tourId,
  tourSeq,
  attract,
  controlsRef,
}: ThreadMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; id: string } | null>(null);
  const [pull, setPull] = useState<PullRender | null>(null);
  const pullRef = useRef<PullInternal | null>(null);
  const lastPullRender = useRef<PullRender | null>(null);
  const pulledAtRef = useRef(0);
  const fitRef = useRef<{ w: number; h: number } | null>(null);
  const aspectRef = useRef<number>(MAP_W / MAP_H);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const drag = useRef<{ last: { x: number; y: number } | null; moved: boolean }>({
    last: null,
    moved: false,
  });
  const pinch = useRef<{ dist: number; mid: { x: number; y: number } } | null>(null);
  const rafRef = useRef<number | null>(null);
  const reduced = useReducedMotion();

  // ── pan / zoom plumbing ────────────────────────────────────────────────────
  const clampView = useCallback((v: View): View => {
    const clampAxis = (pos: number, size: number, extent: number) => {
      const min = -OVERSCAN;
      const max = extent + OVERSCAN - size;
      if (max < min) return (extent - size) / 2;
      return Math.max(min, Math.min(max, pos));
    };
    return {
      ...v,
      x: clampAxis(v.x, v.w, MAP_W),
      y: clampAxis(v.y, v.h, MAP_H),
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const apply = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      if (!cw || !ch) return;
      const aspect = cw / ch;
      aspectRef.current = aspect;
      let w: number;
      let h: number;
      if (aspect < 1.15) {
        w = MAP_H * aspect;
        h = MAP_H;
      } else {
        w = MAP_W;
        h = MAP_W / aspect;
        if (h < MAP_H) {
          h = MAP_H;
          w = MAP_H * aspect;
        }
      }
      const prevFit = fitRef.current;
      fitRef.current = { w, h };
      setView((v) => {
        if (!v)
          return clampView({
            x: (MAP_W - w) / 2,
            y: -90,
            w,
            h,
          });
        const zoom = prevFit ? prevFit.w / v.w : 1;
        const nw = Math.max(w / 3.2, Math.min(w * 1.35, w / zoom));
        const nh = nw / aspect;
        const cx = v.x + v.w / 2;
        const cy = v.y + v.h / 2;
        return clampView({ x: cx - nw / 2, y: cy - nh / 2, w: nw, h: nh });
      });
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [clampView]);

  const screenToMap = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const el = containerRef.current;
      if (!el || !view) return null;
      const rect = el.getBoundingClientRect();
      return {
        x: view.x + ((clientX - rect.left) * view.w) / rect.width,
        y: view.y + ((clientY - rect.top) * view.h) / rect.height,
      };
    },
    [view]
  );

  const zoomAt = useCallback(
    (px: number, py: number, factor: number) => {
      setView((v) => {
        if (!v || !fitRef.current) return v;
        const fit = fitRef.current;
        const nw = Math.max(fit.w / 3.2, Math.min(fit.w * 1.35, v.w / factor));
        const k = nw / v.w;
        const cx = px - (px - v.x) * k;
        const cy = py - (py - v.y) * k;
        return clampView({
          x: cx - nw / 2,
          y: cy - nw / 2,
          w: nw,
          h: nw / aspectRef.current,
        });
      });
    },
    [clampView]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const p = screenToMap(e.clientX, e.clientY);
      if (p) zoomAt(p.x, p.y, Math.exp(-e.deltaY * 0.0016));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [screenToMap, zoomAt]);

  const animateViewTo = useCallback(
    (target: { cx: number; cy: number; w?: number }, dur = 650) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / dur);
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        setView((v) => {
          if (!v) return v;
          const w0 = target.w ?? v.w;
          const w = v.w + (w0 - v.w) * e;
          const cx = v.x + v.w / 2 + (target.cx - (v.x + v.w / 2)) * e;
          const cy = v.y + v.h / 2 + (target.cy - (v.y + v.h / 2)) * e;
          return clampView({ x: cx - w / 2, y: cy - w / aspectRef.current, w, h: w / aspectRef.current });
        });
        if (t < 1) rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [clampView]
  );

  useEffect(() => {
    controlsRef.current = {
      zoomIn: () => {
        if (view)
          zoomAt(view.x + view.w / 2, view.y + view.h / 2, 1.38);
      },
      zoomOut: () => {
        if (view)
          zoomAt(view.x + view.w / 2, view.y + view.h / 2, 1 / 1.38);
      },
      reset: () => {
        if (fitRef.current) {
          const f = fitRef.current;
          animateViewTo({ cx: MAP_W / 2, cy: -90 + f.h / 2, w: f.w });
        }
      },
      flyTo: (id: string) => {
        const p = nodePos(id);
        if (!fitRef.current) return;
        const targetW = Math.min(view?.w ?? fitRef.current.w, fitRef.current.w / 1.7);
        animateViewTo({ cx: p.x, cy: p.y, w: targetW });
      },
      driftTo: (id: string) => {
        const p = nodePos(id);
        if (!fitRef.current) return;
        // wider framing + a long, slow tween — the loom breathes, it doesn't snap
        const targetW = Math.min(view?.w ?? fitRef.current.w, fitRef.current.w / 1.3);
        animateViewTo({ cx: p.x, cy: p.y, w: targetW }, 2400);
      },
    };
  }, [controlsRef, view, zoomAt, animateViewTo]);

  // pointer events — cloth pan & pinch
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      drag.current = { last: { x: e.clientX, y: e.clientY }, moved: false };
    } else if (pointers.current.size === 2) {
      const pts = [...pointers.current.values()];
      pinch.current = {
        dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
        mid: { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 },
      };
    }
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!pointers.current.has(e.pointerId) || !view) return;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.current.size === 2 && pinch.current) {
        const pts = [...pointers.current.values()];
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const mid = {
          x: (pts[0].x + pts[1].x) / 2,
          y: (pts[0].y + pts[1].y) / 2,
        };
        const factor = pinch.current.dist > 0 ? dist / pinch.current.dist : 1;
        const p = screenToMap(mid.x, mid.y);
        if (p) zoomAt(p.x, p.y, factor);
        const dx = ((mid.x - pinch.current.mid.x) * view.w) / rect.width;
        const dy = ((mid.y - pinch.current.mid.y) * view.h) / rect.height;
        setView((v) => (v ? clampView({ ...v, x: v.x - dx, y: v.y - dy }) : v));
        pinch.current = { dist, mid };
        drag.current.moved = true;
        return;
      }

      if (drag.current.last) {
        const dx = e.clientX - drag.current.last.x;
        const dy = e.clientY - drag.current.last.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true;
        const mapDx = (dx * view.w) / rect.width;
        const mapDy = (dy * view.h) / rect.height;
        drag.current.last = { x: e.clientX, y: e.clientY };
        setView((v) => (v ? clampView({ ...v, x: v.x - mapDx, y: v.y - mapDy }) : v));
      }
    },
    [view, screenToMap, zoomAt, clampView]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      // only treat as a cloth click if the cloth itself saw the pointerdown
      const had = pointers.current.delete(e.pointerId);
      if (pointers.current.size < 2) pinch.current = null;
      if (had && pointers.current.size === 0) {
        const moved = drag.current.moved;
        drag.current = { last: null, moved: false };
        if (!moved) onBackgroundClick();
      }
      if (pointers.current.size === 1) {
        const remaining = [...pointers.current.values()][0];
        drag.current = { last: remaining, moved: true };
      }
    },
    [onBackgroundClick]
  );

  // ── pulling: balls of threads & knots ──────────────────────────────
  const startPull = useCallback(
    (kind: "cat" | "leaf", id: string, base: Pt, cat: CategoryId, e: React.PointerEvent) => {
      e.stopPropagation();
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      pullRef.current = {
        kind,
        id,
        cat,
        base,
        startClient: { x: e.clientX, y: e.clientY },
        maxR: kind === "cat" ? 95 : 140,
      };
      setPull({ id, base, pos: base, taut: 0, moved: false });
    },
    []
  );

  const movePull = useCallback(
    (e: React.PointerEvent) => {
      const pr = pullRef.current;
      if (!pr || !view) return;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dxMap = ((e.clientX - pr.startClient.x) * view.w) / rect.width;
      const dyMap = ((e.clientY - pr.startClient.y) * view.h) / rect.height;
      const len = Math.hypot(dxMap, dyMap);
      const clamped = Math.min(len, pr.maxR);
      const nx = len > 0 ? dxMap / len : 0;
      const ny = len > 0 ? dyMap / len : 0;
      const pos = { x: pr.base.x + nx * clamped, y: pr.base.y + ny * clamped };
      const taut = clamped / pr.maxR;
      const moved = Math.hypot(dxMap, dyMap) > 6;
      setPull({ id: pr.id, base: pr.base, pos, taut, moved });
      if (taut >= 1) navigator.vibrate?.(8);
    },
    [view]
  );

  const endPull = useCallback(() => {
    const pr = pullRef.current;
    if (!pr) return;
    pullRef.current = null;
    setPull(null); // spring back to rest
    // read the last gesture from the ref mirror
    const last = lastPullRender.current;
    lastPullRender.current = null;
    pulledAtRef.current = performance.now();
    const flick = last ? last.taut >= (pr.kind === "cat" ? 0.55 : 0.5) : false;
    const tap = last ? !last.moved : false;
    if (pr.kind === "cat") {
      if (flick || tap) {
        if (!unraveled.has(pr.cat)) {
          navigator.vibrate?.(14);
          onUnravel(pr.cat);
        } else {
          onSelect(pr.id);
        }
      }
    } else {
      if (flick || tap) {
        onSelect(pr.id);
      }
    }
  }, [onUnravel, onSelect, unraveled]);

  useEffect(() => {
    lastPullRender.current = pull;
  }, [pull]);

  // ── active highlight logic ─────────────────────────────────────────────────
  const { activeNodes, activeThreads } = useMemo(() => {
    const focusId = hoveredId ?? selectedId ?? tourId ?? pull?.id ?? null;
    if (!focusId && !focusCat) return { activeNodes: null, activeThreads: null };
    const nSet = new Set<string>(["root"]);
    const tSet = new Set<string>();
    const addBranch = (catId: CategoryId, includeLeaves: boolean) => {
      const catNodeId = `cat-${catId}`;
      nSet.add(catNodeId);
      tSet.add(`t:root:${catNodeId}`);
      if (includeLeaves) {
        for (const n of NODES) {
          if (n.kind === "leaf" && n.category === catId) {
            nSet.add(n.id);
            tSet.add(`t:${catNodeId}:${n.id}`);
          }
        }
      }
    };
    if (focusCat) addBranch(focusCat, true);
    if (focusId) {
      const node = focusId.startsWith("cat-")
        ? CATEGORY_NODES.find((c) => c.id === focusId)
        : NODES.find((n) => n.id === focusId);
      if (node) {
        addBranch(node.category, false);
        nSet.add(node.id);
        if (node.kind === "leaf") tSet.add(`t:cat-${node.category}:${node.id}`);
        if (node.kind === "category") addBranch(node.category, true);
        for (const cl of CROSS_LINKS) {
          if (cl.a === focusId || cl.b === focusId) {
            const other = cl.a === focusId ? cl.b : cl.a;
            const otherNode = other.startsWith("cat-")
              ? CATEGORY_NODES.find((c) => c.id === other)
              : NODES.find((n) => n.id === other);
            if (otherNode) {
              nSet.add(other);
              tSet.add(`x:${cl.a}:${cl.b}`);
            }
          }
        }
      }
    }
    return { activeNodes: nSet, activeThreads: tSet };
  }, [hoveredId, selectedId, tourId, pull, focusCat]);

  const threadState = useCallback(
    (key: string): "normal" | "hot" | "dim" => {
      if (!activeThreads) return "normal";
      return activeThreads.has(key) ? "hot" : "dim";
    },
    [activeThreads]
  );

  const nodeOpacity = useCallback(
    (id: string) => {
      if (!activeNodes) return 1;
      return activeNodes.has(id) ? 1 : 0.14;
    },
    [activeNodes]
  );

  const handleNodeEnter = useCallback(
    (id: string, e: React.MouseEvent) => {
      if (pullRef.current) return;
      setHoveredId(id);
      const el = containerRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const rawX = e.clientX - rect.left;
        setTooltip({
          x: Math.min(rawX + 18, Math.max(0, el.clientWidth - 350)),
          y: e.clientY - rect.top,
          id,
        });
      }
    },
    [setHoveredId]
  );

  const handleNodeLeave = useCallback(() => {
    if (pullRef.current) return;
    setHoveredId(null);
    setTooltip(null);
  }, [setHoveredId]);

  const handleNodeClick = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (pullRef.current) return;
      // a pull that just ended already dispatched the selection
      if (performance.now() - pulledAtRef.current < 350) return;
      onSelect(id);
    },
    [onSelect]
  );

  const tooltipNode = useMemo(() => {
    if (!tooltip) return null;
    if (tooltip.id === "root") return ROOT;
    if (tooltip.id.startsWith("cat-"))
      return CATEGORY_NODES.find((c) => c.id === tooltip.id);
    return NODES.find((n) => n.id === tooltip.id);
  }, [tooltip]);

  const shuttleD = useMemo(() => rootThreadPath("applications"), []);
  const warp = useMemo(() => warpLines(), []);
  const wefts = useMemo(() => weftGhosts(), []);

  // a knot is "present" once its branch has been unravelled
  const isPresent = useCallback(
    (id: string) => {
      if (id === "root" || id.startsWith("cat-")) return true;
      const n = NODES.find((x) => x.id === id);
      return n ? unraveled.has(n.category) : false;
    },
    [unraveled]
  );

  const anyUnraveled = unraveled.size > 0;

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full cursor-grab touch-none overflow-hidden active:cursor-grabbing"
      aria-label="Interactive woven mind map of artificial intelligence"
    >
      {view && (
        <svg
          className="absolute inset-0 h-full w-full select-none"
          viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
          preserveAspectRatio="none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          role="application"
        >
          <defs>
            <radialGradient id="latticeFade" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="0.85" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <mask id="latticeMask">
              <circle cx={ROOT_POS.x} cy={ROOT_POS.y} r={185} fill="url(#latticeFade)" />
            </mask>
            <pattern id="dhakaLattice" width="38" height="38" patternUnits="userSpaceOnUse">
              <path
                d="M19 2 L36 19 L19 36 L2 19 Z"
                fill="none"
                stroke={INK}
                strokeWidth="0.7"
                opacity="0.5"
              />
              <circle cx="19" cy="19" r="1.1" fill={INK} opacity="0.4" />
            </pattern>
            {/* soft shadow — threads and knots lie ON the cotton, so they cast */}
            <filter id="tb-soft" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="1.8" />
            </filter>
          </defs>

          <g key={weaveKey}>
            {/* ── cloth background — the warp fades in as the loom wakes ── */}
            <g aria-hidden>
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: entered ? 1 : 0 }}
                transition={{ duration: 1.8, delay: 0.3 }}
              >
                {warp.map((l, i) => (
                  <line
                    key={`w${i}`}
                    x1={l.x}
                    y1={0}
                    x2={l.x}
                    y2={MAP_H}
                    stroke={INK}
                    strokeWidth={l.w}
                    opacity={l.o}
                  />
                ))}
                {wefts.map((g, i) => (
                  <line
                    key={`f${i}`}
                    x1={0}
                    y1={g.y}
                    x2={MAP_W}
                    y2={g.y}
                    stroke={INK}
                    strokeWidth={0.8}
                    opacity={g.o}
                  />
                ))}
              </motion.g>
              <circle
                cx={ROOT_POS.x}
                cy={ROOT_POS.y}
                r={185}
                fill="url(#dhakaLattice)"
                mask="url(#latticeMask)"
                opacity={0.55}
              />
              <motion.path
                d={looseThread("bl", 60, MAP_H - 36, 280, false)}
                fill="none"
                stroke="#DD7A2E"
                strokeWidth={1.2}
                initial={false}
                animate={{ opacity: entered ? 0.2 : 0 }}
                transition={{ delay: 2.6, duration: 0.8 }}
              />
              <motion.path
                d={looseThread("br", MAP_W - 70, MAP_H - 60, 320, true)}
                fill="none"
                stroke="#7C4DA4"
                strokeWidth={1.2}
                initial={false}
                animate={{ opacity: entered ? 0.2 : 0 }}
                transition={{ delay: 2.55, duration: 0.8 }}
              />
            </g>

            {/* ── weft threads: root → categories (live while pulling) ── */}
            {CATEGORY_NODES.map((cat, i) => {
              const catId = cat.id.slice(4) as CategoryId;
              const live =
                pull?.id === cat.id && pull ? rootThreadPathTo(catId, pull.pos, pull.taut) : null;
              return (
                <Thread
                  key={`rt-${cat.id}`}
                  d={live ?? rootThreadPath(catId)}
                  color={CATEGORIES[cat.category].color}
                  state={threadState(`t:root:${cat.id}`)}
                  drawDelay={reduced ? 0 : 0.25 + i * 0.12}
                  entered={entered}
                  pluckable={!live}
                />
              );
            })}

            {/* ── weft threads: category → leaf (weave in on unravel) ── */}
            {CATEGORY_ORDER.map((cid) =>
              unraveled.has(cid)
                ? NODES.filter((n) => n.kind === "leaf" && n.category === cid).map((leaf) => {
                    const live =
                      pull?.id === leaf.id && pull
                        ? leafThreadPathTo(leaf.id, pull.pos, pull.taut)
                        : null;
                    const idx = NODES.filter(
                      (n) => n.kind === "leaf" && n.category === cid
                    ).findIndex((n) => n.id === leaf.id);
                    return (
                      <Thread
                        key={`lt-${leaf.id}`}
                        d={live ?? leafThreadPath(leaf.id)}
                        color={CATEGORIES[cid].color}
                        state={threadState(`t:cat-${cid}:${leaf.id}`)}
                        drawDelay={reduced ? 0 : 0.12 + idx * 0.07}
                        entered={true}
                        pluckable={!live}
                      />
                    );
                  })
                : null
            )}

            {/* ── cross-link tangles (only when both knots exist) ── */}
            {CROSS_LINKS.map((cl, i) => {
              if (!isPresent(cl.a) || !isPresent(cl.b)) return null;
              const st = threadState(`x:${cl.a}:${cl.b}`);
              return (
                <motion.g
                  key={`x-${cl.a}-${cl.b}`}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: st === "dim" ? 0.08 : st === "hot" ? 0.95 : 0.4,
                  }}
                  transition={{ duration: st === "normal" ? 1 : 0.35, delay: st === "normal" ? 0.4 + i * 0.1 : 0 }}
                >
                  <path
                    d={crossLinkPath(cl.a, cl.b)}
                    fill="none"
                    stroke={MUTED}
                    strokeWidth={st === "hot" ? 1.9 : 1.4}
                    strokeDasharray="5 6"
                    strokeLinecap="round"
                  />
                </motion.g>
              );
            })}

            {/* ── ambient shuttle ── */}
            {entered && !reduced && (
              <g opacity={0.85} aria-hidden>
                <circle r={3.4} fill="#DD7A2E" opacity={0.9}>
                  <animateMotion
                    dur="11s"
                    begin="3.4s"
                    repeatCount="indefinite"
                    path={shuttleD}
                    calcMode="spline"
                    keySplines="0.42 0 0.58 1"
                    keyTimes="0;1"
                    keyPoints="0;1"
                  />
                </circle>
                <circle r={1.6} fill="#DD7A2E" opacity={0.45}>
                  <animateMotion
                    dur="11s"
                    begin="3.05s"
                    repeatCount="indefinite"
                    path={shuttleD}
                    calcMode="spline"
                    keySplines="0.42 0 0.58 1"
                    keyTimes="0;1"
                    keyPoints="0;1"
                  />
                </circle>
              </g>
            )}

            {/* ── root node — a brain stitched out of threads ── */}
            <NodeShell
              id="root"
              pos={ROOT_POS}
              opacity={nodeOpacity("root")}
              entered={entered}
              delay={reduced ? 0 : 0.1}
              selected={selectedId === "root"}
              hovered={hoveredId === "root"}
              ringR={72}
              onEnter={handleNodeEnter}
              onLeave={handleNodeLeave}
              onClick={handleNodeClick}
              onPointerDown={(e) => e.stopPropagation()}
              label="Artificial Intelligence — tap to open."
            >
              <ThreadBrain
                reduced={Boolean(reduced)}
                twinkle={attract}
                glintSeq={reduced ? 0 : tourSeq}
              />
              <text
                y={76}
                textAnchor="middle"
                style={{ fontFamily: "var(--font-deva), sans-serif" }}
                fontWeight={500}
                fontSize={22}
                fill="#3E3529"
                stroke="#F6F1E7"
                strokeWidth={5}
                paintOrder="stroke"
                strokeLinejoin="round"
              >
                {ROOT.deva}
              </text>
              <text
                y={103}
                textAnchor="middle"
                style={{ fontFamily: "var(--font-inter), ui-sans-serif, sans-serif" }}
                fontWeight={700}
                fontSize={27}
                fill={INK}
                stroke="#F6F1E7"
                strokeWidth={6}
                paintOrder="stroke"
                strokeLinejoin="round"
              >
                Artificial Intelligence
              </text>
              <text
                y={123}
                textAnchor="middle"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
                fontSize={12}
                letterSpacing={3}
                fill={MUTED}
                stroke="#F6F1E7"
                strokeWidth={4}
                paintOrder="stroke"
                strokeLinejoin="round"
              >
                THE MAP
              </text>
            </NodeShell>

            {/* ── category balls of threads — pull to weave ── */}
            {CATEGORY_NODES.map((cat, i) => {
              const c = CATEGORIES[cat.category];
              const catId = cat.category;
              const base = CATEGORY_POS[catId];
              const off =
                pull?.id === cat.id ? { x: pull.pos.x - base.x, y: pull.pos.y - base.y } : { x: 0, y: 0 };
              const isPulled = pull?.id === cat.id;
              const demo = entered && catId === "types" && !anyUnraveled && !isPulled;
              const taut = isPulled ? pull!.taut : 0;
              return (
                <NodeShell
                  key={cat.id}
                  id={cat.id}
                  pos={base}
                  off={off}
                  pulling={!!isPulled}
                  demo={demo}
                  opacity={nodeOpacity(cat.id)}
                  entered={entered}
                  delay={reduced ? 0 : 0.45 + i * 0.12}
                  selected={selectedId === cat.id}
                  hovered={hoveredId === cat.id}
                  ringR={26}
                  grabbable
                  onEnter={handleNodeEnter}
                  onLeave={handleNodeLeave}
                  onClick={handleNodeClick}
                  pullHandlers={{
                    onPointerDown: (e) => startPull("cat", cat.id, base, catId, e),
                    onPointerMove: movePull,
                    onPointerUp: endPull,
                    onPointerCancel: endPull,
                  }}
                  label={`${c.title} — pull down to weave its knots, or tap to open`}
                >
                  <BallOfThreads color={c.color} colorDark={c.colorDark} spin={taut * 260} />
                  {/* tautness ring */}
                  {isPulled && (
                    <circle
                      r={30}
                      fill="none"
                      stroke={c.color}
                      strokeWidth={2}
                      strokeDasharray={`${taut * 138} 138`}
                      strokeLinecap="round"
                      opacity={0.85}
                      transform="rotate(-90)"
                      style={{ transformBox: "fill-box", transformOrigin: "center" }}
                    />
                  )}
                  <text
                    y={-38}
                    textAnchor="middle"
                    style={{ fontFamily: "var(--font-deva), sans-serif" }}
                    fontSize={15}
                    fill={c.colorDark}
                  >
                    {c.deva}
                  </text>
                  <CategoryPill title={c.title} color={c.color} colorDark={c.colorDark} />
                  {!unraveled.has(catId) && (
                    <text
                      y={78}
                      textAnchor="middle"
                      style={{ fontFamily: "var(--font-inter), sans-serif" }}
                      fontSize={12}
                      letterSpacing={1.5}
                      fill={c.colorDark}
                      opacity={0.75}
                    >
                      {NODES.filter((n) => n.kind === "leaf" && n.category === catId).length} knots · pull to weave
                    </text>
                  )}
                  {demo && (
                    <motion.text
                      y={96}
                      textAnchor="middle"
                      style={{ fontFamily: "var(--font-inter), sans-serif" }}
                      fontSize={12.5}
                      fontWeight={600}
                      letterSpacing={2}
                      fill={INK}
                      animate={{ opacity: [0.15, 0.85, 0.15] }}
                      transition={{ duration: 2.2, repeat: Infinity }}
                    >
                      ↓ pull me
                    </motion.text>
                  )}
                </NodeShell>
              );
            })}

            {/* ── leaf knots — drag to read; knots appear when their branch is woven ── */}
            {NODES.filter((n) => n.kind === "leaf").map((leaf) => {
              const c = CATEGORIES[leaf.category];
              const woven = unraveled.has(leaf.category);
              const pos = nodePos(leaf.id);
              const leftSide = LEAF_X[leaf.category] < MAP_W / 2;

              if (!woven) return null;

              const off =
                pull?.id === leaf.id ? { x: pull.pos.x - pos.x, y: pull.pos.y - pos.y } : { x: 0, y: 0 };
              const isPulled = pull?.id === leaf.id;

              return (
                <NodeShell
                  key={leaf.id}
                  id={leaf.id}
                  pos={pos}
                  off={off}
                  pulling={!!isPulled}
                  opacity={nodeOpacity(leaf.id)}
                  entered={true}
                  delay={reduced ? 0 : 0.1}
                  selected={selectedId === leaf.id}
                  hovered={hoveredId === leaf.id}
                  ringR={15}
                  grabbable
                  onEnter={handleNodeEnter}
                  onLeave={handleNodeLeave}
                  onClick={handleNodeClick}
                  pullHandlers={{
                    onPointerDown: (e) => startPull("leaf", leaf.id, pos, leaf.category, e),
                    onPointerMove: movePull,
                    onPointerUp: endPull,
                    onPointerCancel: endPull,
                  }}
                  label={`${leaf.title} — ${leaf.tagline}`}
                >
                  <Knot color={c.color} />
                  <text
                    x={leftSide ? -18 : 18}
                    y={5}
                    textAnchor={leftSide ? "end" : "start"}
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                    fontWeight={500}
                    fontSize={16}
                    fill={INK}
                  >
                    {leaf.title}
                  </text>
                </NodeShell>
              );
            })}
          </g>
        </svg>
      )}

      {/* hover tooltip */}
      {tooltipNode && tooltip && (
        <div
          className="cloth-card pointer-events-none absolute z-20 hidden max-w-[330px] rounded-xl border border-[#E2D9C8] bg-[#FFFDF7]/95 px-4 py-3 shadow-[0_10px_30px_-12px_rgba(46,38,32,0.35)] backdrop-blur md:block"
          style={{
            left: tooltip.x,
            top: tooltip.y + 18,
          }}
          role="tooltip"
        >
          <p className="font-body text-[14.5px] font-semibold text-[#2E2620]">
            {tooltipNode.title}
          </p>
          <p className="mt-1 font-body text-[13px] leading-snug text-[#6B5F52]">
            {tooltipNode.tagline}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Thread (pluckable, ripple on touch) ──────────────────────────────────────

function Thread({
  d,
  color,
  state,
  drawDelay,
  entered,
  pluckable = true,
}: {
  d: string;
  color: string;
  state: "normal" | "hot" | "dim";
  drawDelay: number;
  entered: boolean;
  pluckable?: boolean;
}) {
  const [rippling, setRipling] = useState(false);
  const [plucks, setPlucks] = useState<number>(0);
  const ripTimer = useRef<number | null>(null);
  const motionRef = useRef<SVGAnimateMotionElement | null>(null);

  const doRipple = useCallback(() => {
    if (ripTimer.current) window.clearTimeout(ripTimer.current);
    setRipling(true);
    setPlucks((p) => p + 1);
    ripTimer.current = window.setTimeout(() => setRipling(false), 850);
  }, []);

  // the bead element is always mounted, so beginElement works on every pluck
  useEffect(() => {
    if (rippling) {
      try {
        motionRef.current?.beginElement();
      } catch {
        /* not ready */
      }
    }
  }, [rippling, plucks]);

  useEffect(
    () => () => {
      if (ripTimer.current) window.clearTimeout(ripTimer.current);
    },
    []
  );

  return (
    <g
      opacity={state === "dim" ? 0.07 : 1}
      style={{ transition: "opacity 0.35s ease" }}
    >
      {/* shadow — the thread rests on the cloth and casts a soft one */}
      <motion.path
        d={d}
        fill="none"
        stroke="#6E5A3E"
        strokeWidth={3.4}
        strokeLinecap="round"
        transform="translate(3 5)"
        filter="url(#tb-soft)"
        initial={{ opacity: 0 }}
        animate={{ opacity: entered ? 0.16 : 0 }}
        transition={{ duration: 0.9, delay: drawDelay + 0.55 }}
      />
      <motion.path
        d={d}
        fill="none"
        stroke={PAPER}
        strokeWidth={7}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: entered ? 1 : 0 }}
        transition={{ duration: 1.1, delay: drawDelay, ease: "easeInOut" }}
      />
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={2.3}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: entered ? 1 : 0 }}
        transition={{
          pathLength: { duration: 1.1, delay: drawDelay, ease: "easeInOut" },
        }}
        style={{
          filter: state === "hot" ? `drop-shadow(0 0 4px ${color}55)` : undefined,
        }}
      />
      {/* spun-ply shimmer — a lighter filament winding along the yarn */}
      <motion.path
        d={d}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={0.85}
        strokeLinecap="round"
        strokeDasharray="4 5"
        className="tb-ply"
        initial={{ opacity: 0 }}
        animate={{ opacity: entered ? 0.32 : 0 }}
        transition={{ duration: 0.8, delay: drawDelay + 0.8 }}
      />
      {state === "hot" && (
        <path
          d={d}
          fill="none"
          stroke={mixHex(color, "#2E2620", 0.3)}
          strokeWidth={1}
          strokeDasharray="6 4"
          strokeLinecap="round"
          opacity={0.75}
        />
      )}

      {/* ripple bead travelling along the thread — always mounted so the ref lives */}
      <circle
        r={3.2}
        fill={mixHex(color, "#FFFFFF", 0.35)}
        opacity={rippling ? 0.95 : 0}
        pointerEvents="none"
      >
        <animateMotion
          ref={motionRef}
          dur="0.8s"
          begin="indefinite"
          path={d}
          fill="freeze"
        />
      </circle>
      {/* twang dash */}
      {plucks > 0 && (
        <motion.path
          key={plucks}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeDasharray="1 26"
          initial={{ strokeDashoffset: 0, opacity: 0.85 }}
          animate={{ strokeDashoffset: -160, opacity: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
        />
      )}

      {/* invisible hit line for plucking */}
      {pluckable && (
        <path
          d={d}
          fill="none"
          stroke="transparent"
          strokeWidth={16}
          strokeLinecap="round"
          style={{ pointerEvents: "stroke", cursor: "pointer" }}
          onPointerEnter={doRipple}
          onPointerDown={(e) => {
            // let taps pluck too; pan still proceeds in the background
            doRipple();
          }}
        />
      )}
    </g>
  );
}

// ── NodeShell ────────────────────────────────────────────────────────────────

function NodeShell({
  id,
  pos,
  off = { x: 0, y: 0 },
  pulling = false,
  demo = false,
  opacity,
  entered,
  delay,
  selected,
  hovered,
  ringR,
  onEnter,
  onLeave,
  onClick,
  onPointerDown,
  label,
  pullHandlers,
  grabbable = false,
  children,
}: {
  id: string;
  pos: { x: number; y: number };
  off?: { x: number; y: number };
  pulling?: boolean;
  demo?: boolean;
  opacity: number;
  entered: boolean;
  delay: number;
  selected: boolean;
  hovered: boolean;
  ringR: number;
  onEnter: (id: string, e: React.MouseEvent) => void;
  onLeave: () => void;
  onClick: (id: string, e: React.MouseEvent) => void;
  /** stop pointerdown from reaching the cloth (keeps the click target intact) */
  onPointerDown?: (e: React.PointerEvent) => void;
  label: string;
  pullHandlers?: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
  };
  grabbable?: boolean;
  children: React.ReactNode;
}) {
  const spring = { type: "spring" as const, stiffness: 340, damping: 16 };
  const anim =
    demo && !pulling
      ? {
          opacity: entered ? 1 : 0,
          scale: entered ? 1 : 0.5,
          x: 0,
          y: [0, 26, 0],
        }
      : {
          opacity: entered ? 1 : 0,
          scale: entered ? 1 : 0.5,
          x: off.x,
          y: off.y,
        };
  const trans = demo && !pulling
    ? {
        opacity: { duration: 0.5, delay },
        scale: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
        x: { duration: 0 },
        y: { duration: 2.3, repeat: Infinity, ease: "easeInOut" as const },
      }
    : {
        opacity: { duration: 0.5, delay },
        scale: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
        x: pulling ? { duration: 0.05 } : spring,
        y: pulling ? { duration: 0.05 } : spring,
      };

  return (
    <g transform={`translate(${pos.x} ${pos.y})`}>
      <motion.g
        initial={{ opacity: 0, scale: 0.5 }}
        animate={anim}
        transition={trans}
        style={{
          transformBox: "fill-box",
          transformOrigin: "center",
          cursor: pulling ? "grabbing" : grabbable ? "grab" : "pointer",
        }}
        role="button"
        tabIndex={0}
        aria-label={label}
        onMouseEnter={(e) => onEnter(id, e)}
        onMouseLeave={onLeave}
        onClick={(e) => onClick(id, e)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick(id, e as unknown as React.MouseEvent);
          }
        }}
        {...(onPointerDown ? { onPointerDown } : {})}
        {...(pullHandlers ?? {})}
        focusable="true"
      >
        <g
          style={{
            opacity,
            transition: "opacity 0.35s ease",
            pointerEvents: opacity < 0.5 ? "none" : undefined,
          }}
        >
          {children}
          {/* hover dashed ring */}
          <circle
            r={ringR}
            fill="none"
            stroke={INK}
            strokeWidth={1}
            strokeDasharray="3 5"
            opacity={hovered && !selected ? 0.45 : 0}
            className="spin-slow"
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          />
          {/* selected pulse */}
          {selected && (
            <motion.circle
              r={ringR * 0.7}
              fill="none"
              stroke={INK}
              strokeWidth={1.2}
              animate={{ r: [ringR * 0.7, ringR * 1.9], opacity: [0.55, 0] }}
              transition={{ duration: 1.7, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </g>
      </motion.g>
    </g>
  );
}

// ── Glyphs ───────────────────────────────────────────────────────────────────

// ── Central node: a brain stitched out of threads ───────────────────────────
// Brain folds and loops of yarn are almost the same shape, so the root knot
// is embroidered: one dark outline thread laid on the cloth, bright dhaka
// folds inside, tiny synapse beads, and a basted appliqué patch underneath so
// the four converging threads appear to dive under the brain.

const BRAIN_OUTLINE =
  "M 34 -34 " +
  "C 24 -42, 8 -46, -8 -44 " +
  "C -26 -42, -42 -34, -48 -20 " +
  "C -53 -10, -53 2, -49 12 " +
  "C -47 18, -45 22, -42 26 " +
  "C -38 36, -27 41, -19 38 " +
  "C -15 36, -13 31, -12 27 " +
  "C -11.5 25, -10 24, -8 24.5 " +
  "C -5 26, -3 32, -2 38 " +
  "C -1.5 41, -0.5 43, 1 43 " +
  "C 2.5 43, 3.5 40, 4 36 " +
  "C 4.8 31, 6 27, 8 24 " +
  "C 12 21, 18 23, 26 22 " +
  "C 34 21, 40 18, 44 13 " +
  "C 49 7, 52 0, 52 -8 " +
  "C 52 -18, 48 -26, 42 -31 " +
  "C 40 -33, 37 -34, 34 -34";

const BRAIN_FOLDS: { d: string; c: string; w?: number }[] = [
  // central sulcus — teal
  { d: "M -4 -42 C -14 -34, 0 -28, -10 -20 C -18 -14, -6 -8, -12 0 C -17 6, -7 10, -11 17", c: "#17877B" },
  // frontal folds — red, orange
  { d: "M 14 -37 C 6 -30, 18 -24, 10 -16 C 4 -10, 16 -6, 10 2 C 6 8, 14 12, 10 17", c: "#D9536F" },
  { d: "M 30 -30 C 22 -24, 34 -18, 26 -10 C 20 -4, 30 2, 24 10", c: "#DD7A2E" },
  // parietal / occipital folds — purple, green
  { d: "M -24 -38 C -32 -30, -20 -24, -28 -16 C -34 -10, -24 -4, -30 4 C -34 9, -26 13, -29 17", c: "#7C4DA4" },
  { d: "M -42 -16 C -34 -10, -44 -2, -36 4 C -31 8, -38 12, -34 16", c: "#4C8C4A" },
  // temporal fold — red, sweeping to the lower left
  { d: "M 43 -2 C 34 0, 30 6, 22 8 C 13 10, 8 6, 1 12 C -3 15, -8 13, -12 16", c: "#D9536F" },
  // lower horizontal fold — teal
  { d: "M -18 22 C -8 17, 0 23, 10 19", c: "#17877B" },
  // cross-connections — thin yarn bridges between folds
  { d: "M -14 -22 C -8 -18, -2 -20, 2 -14", c: "#17877B", w: 1.6 },
  { d: "M 18 -20 C 24 -16, 22 -10, 28 -8", c: "#DD7A2E", w: 1.6 },
  { d: "M -20 2 C -14 6, -8 4, -2 8", c: "#7C4DA4", w: 1.6 },
  { d: "M 16 6 C 20 10, 26 8, 30 4", c: "#D9536F", w: 1.6 },
  // cerebellum folia — fine short stitches
  { d: "M -38 27 C -33 23, -28 28, -22 24", c: "#DD7A2E", w: 1.9 },
  { d: "M -35 32 C -30 29, -25 33, -19 30", c: "#7C4DA4", w: 1.9 },
  { d: "M -30 36 C -26 34, -23 37, -19 35", c: "#4C8C4A", w: 1.6 },
];

const BRAIN_BEADS: { x: number; y: number; c: string }[] = [
  { x: -11, y: 17, c: "#0F6158" },
  { x: 10, y: 17, c: "#A93A52" },
  { x: 24, y: 10, c: "#B45E1D" },
  { x: -29, y: 17, c: "#5E3780" },
  { x: -34, y: 16, c: "#37693A" },
  { x: 2, y: -14, c: "#0F6158" },
  { x: 28, y: -8, c: "#B45E1D" },
  { x: -2, y: 8, c: "#5E3780" },
  { x: 30, y: 4, c: "#A93A52" },
];

function ThreadBrain({
  reduced = false,
  twinkle = false,
  glintSeq = 0,
}: {
  reduced?: boolean;
  /** attract mode — the synapse beads twinkle for the room */
  twinkle?: boolean;
  /** bump to replay the thread-by-thread glint (guided-tour start) */
  glintSeq?: number;
}) {
  const live = !reduced;
  const sparkle = live && twinkle;
  return (
    <g transform="scale(1.16)">
      {/* gentle breathing — the map is alive (static under reduced motion) */}
      <motion.g
        animate={live ? { scale: [1, 1.02, 1] } : { scale: 1 }}
        transition={
          live
            ? { duration: 4.4, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0 }
        }
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      >
        {/* appliqué patch — lifts the brain off the four converging threads */}
        <ellipse cx={0} cy={-3} rx={59} ry={49} fill={PAPER} />
        <ellipse
          cx={0}
          cy={-3}
          rx={59}
          ry={49}
          fill="none"
          stroke={MUTED}
          strokeWidth={1}
          strokeDasharray="2 5"
          opacity={0.4}
        />
        {/* shadow — the brain rests on the cloth */}
        <ellipse
          cx={5}
          cy={47}
          rx={38}
          ry={7.5}
          fill="#6E5A3E"
          opacity={0.14}
          filter="url(#tb-soft)"
        />
        {/* outline thread + pale stitch ply riding on it */}
        <path
          d={BRAIN_OUTLINE}
          fill="none"
          stroke="#4A3F33"
          strokeWidth={2.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={BRAIN_OUTLINE}
          fill="none"
          stroke={PAPER}
          strokeWidth={1.1}
          strokeLinecap="round"
          strokeDasharray="5 5"
          opacity={0.9}
        />
        {/* gyri folds — the tangle of yarn that thinks */}
        {BRAIN_FOLDS.map((f, i) => (
          <path
            key={`fold-${i}`}
            d={f.d}
            fill="none"
            stroke={f.c}
            strokeWidth={f.w ?? 2.3}
            strokeLinecap="round"
            opacity={0.92}
          />
        ))}
        {/* synapse beads — they twinkle while attract mode performs */}
        {BRAIN_BEADS.map((b, i) => (
          <motion.circle
            key={`bead-${i}`}
            cx={b.x}
            cy={b.y}
            fill={b.c}
            initial={false}
            animate={
              sparkle
                ? { opacity: [0.2, 1, 0.2], r: [1.4, 2.4, 1.4] }
                : { opacity: 1, r: 1.7 }
            }
            transition={
              sparkle
                ? { duration: 1.9, repeat: Infinity, delay: i * 0.42, ease: "easeInOut" }
                : { duration: 0.3 }
            }
          />
        ))}
        {/* sheen — pale filament catching the light along the dome */}
        <path
          d="M 10 -37 C -4 -42, -20 -40, -31 -32"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={0.9}
          strokeLinecap="round"
          strokeDasharray="4 6"
          opacity={0.65}
        />
      </motion.g>
      {/* guided-tour glint — a pulse of light runs thread by thread */}
      {glintSeq > 0 && (
        <g key={`glint-${glintSeq}`} pointerEvents="none" aria-hidden>
          <motion.path
            d={BRAIN_OUTLINE}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={3.4}
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0] }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeInOut" }}
          />
          {BRAIN_FOLDS.map((f, i) => (
            <motion.path
              key={`glint-${i}`}
              d={f.d}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={(f.w ?? 2.3) + 0.8}
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.9, 0] }}
              transition={{ duration: 0.6, delay: 0.25 + i * 0.12, ease: "easeInOut" }}
            />
          ))}
        </g>
      )}
    </g>
  );
}

function BallOfThreads({
  color,
  colorDark,
  spin = 0,
}: {
  color: string;
  colorDark: string;
  spin?: number;
}) {
  const R = 17;
  // winding arcs at varying rotations — thread wound round a ball
  const arcs: React.ReactElement[] = [];
  const N = 7;
  for (let i = 0; i < N; i++) {
    const rot = (360 / N) * i;
    const rx = R * (0.98 - (i % 3) * 0.09);
    const ry = R * 0.42;
    const darker = i % 3 === 2;
    arcs.push(
      <ellipse
        key={i}
        rx={rx}
        ry={ry}
        fill="none"
        stroke={darker ? colorDark : color}
        strokeWidth={2.1}
        strokeLinecap="round"
        opacity={darker ? 0.78 : 0.55 + 0.25 * ((i * 5) % 3) / 2}
        transform={`rotate(${rot.toFixed(1)})`}
      />
    );
  }
  // pulling rotates the windings — the ball turns as its thread is drawn out
  const turn = (spin * 0.1).toFixed(2);
  return (
    <g>
      <ellipse
        cx={3}
        cy={26}
        rx={20}
        ry={5.5}
        fill="#6E5A3E"
        opacity={0.15}
        filter="url(#tb-soft)"
      />
      <circle r={R + 1.2} fill={colorDark} opacity={0.12} />
      <g transform={`rotate(${turn})`}>
        {arcs}
        <circle r={R} fill="none" stroke={colorDark} strokeWidth={1.4} opacity={0.8} />
        {/* sheen — a pale filament catching the light */}
        <ellipse
          rx={R * 0.9}
          ry={R * 0.34}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={0.9}
          strokeDasharray="5 8"
          opacity={0.55}
          transform="rotate(-28)"
        />
      </g>
      {/* a loose strand trailing off the ball */}
      <path
        d="M11 -11 C 16 -17, 22 -19, 28 -16"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.85}
      />
    </g>
  );
}

function CategoryPill({
  title,
  color,
  colorDark,
}: {
  title: string;
  color: string;
  colorDark: string;
}) {
  const w = title.length * 9 + 40;
  return (
    <g>
      <rect
        x={-w / 2}
        y={30}
        width={w}
        height={33}
        rx={16.5}
        fill={CARD}
        stroke={color}
        strokeWidth={1.5}
      />
      <text
        y={52}
        textAnchor="middle"
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
        fontWeight={600}
        fontSize={16}
        fill={colorDark}
      >
        {title}
      </text>
    </g>
  );
}

function Knot({ color }: { color: string }) {
  return (
    <g>
      <ellipse
        cx={2.5}
        cy={10.5}
        rx={9}
        ry={3.2}
        fill="#6E5A3E"
        opacity={0.16}
        filter="url(#tb-soft)"
      />
      <circle r={8.5} fill={CARD} stroke={color} strokeWidth={1.8} />
      <path
        d="M-6.5 -2.5 Q0 -6.5 6.5 -2.5 M-6.5 3 Q0 -1 6.5 3"
        fill="none"
        stroke={color}
        strokeWidth={1.2}
        strokeLinecap="round"
      />
    </g>
  );
}
