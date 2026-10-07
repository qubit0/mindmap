"use client";

import { useEffect, useRef } from "react";
import { clothTileUrl } from "@/lib/cloth";

// ─────────────────────────────────────────────────────────────────────────────
// ClothBackdrop — the surface everything is woven on.
//
// Layers (bottom → top):
//   1. the seamless cotton-canvas tile (also exposed as `--tanabana-weave`
//      so every card / sheet / dialog in the app can share the same weave)
//   2. a soft north-west light + warm floor shade that slowly "breathes",
//      like a lamp over a tablecloth
//   3. drifting cotton motes — tiny fibres floating in the room light
//   4. a whisper of edge shading so the cloth reads as fabric, not wallpaper
//
// Purely decorative and pointer-transparent; respects prefers-reduced-motion.
// ─────────────────────────────────────────────────────────────────────────────

interface Mote {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  ph: number;
  o: number;
}

export function ClothBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // 1. weave tile — shared with the rest of the app through a CSS variable
    const url = clothTileUrl();
    if (url) {
      document.documentElement.style.setProperty("--tanabana-weave", `url("${url}")`);
    }

    // 2. drifting cotton motes
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cv = canvasRef.current;
    if (!cv || reduced) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const motes: Mote[] = Array.from({ length: 24 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.5 + Math.random() * 1.4,
      vx: 0.04 + Math.random() * 0.1, // slow drift to the right
      vy: -0.015 + Math.random() * 0.03,
      ph: Math.random() * Math.PI * 2,
      o: 0.05 + Math.random() * 0.06,
    }));

    const draw = (t: number) => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.x += m.vx;
        m.y += m.vy + Math.sin(t * 0.0004 + m.ph) * 0.05;
        if (m.x > w + 4) m.x = -4;
        if (m.y < -4) m.y = h + 4;
        if (m.y > h + 4) m.y = -4;
        ctx.beginPath();
        ctx.fillStyle = `rgba(118,96,66,${m.o})`;
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
        // a lighter fleck beside it — reads as a fibre, not a dot
        ctx.fillStyle = `rgba(255,255,250,${m.o * 0.9})`;
        ctx.fillRect(m.x + m.r + 1, m.y - 0.5, 2, 1);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(draw);
      }
    };
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div className="cloth-tile absolute inset-0" />
      <div className="cloth-light absolute inset-0" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="cloth-vignette absolute inset-0" />
    </div>
  );
}
