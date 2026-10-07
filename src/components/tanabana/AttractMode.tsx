"use client";

import { AnimatePresence, motion } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// AttractMode — the map drifts on its own when nobody has touched it for a
// while. The camera slowly travels between stops (handled by the experience
// hub); this overlay is the quiet caption card that tells passers-by what
// they are looking at and invites them to touch the cloth.
//
// Pointer-transparent: any interaction anywhere wakes the map instantly
// (listeners live in TanabanaExperience).
// ─────────────────────────────────────────────────────────────────────────────

export interface AttractStop {
  id: string;
  kicker: string;
  caption: string;
  color: string;
  colorDark: string;
}

export function AttractOverlay({
  stop,
  index,
  total,
}: {
  stop: AttractStop;
  index: number;
  total: number;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-24 z-40 flex justify-center px-4 sm:bottom-28">
      <AnimatePresence mode="wait">
        <motion.div
          key={stop.id}
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18, transition: { duration: 0.35 } }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="cloth-card relative w-full max-w-xl rounded-2xl border px-5 py-4 shadow-[0_18px_44px_-18px_rgba(46,38,32,0.4)]"
          style={{ borderColor: `${stop.color}66`, background: "#FDFBF5" }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex h-2 w-8 rounded-full"
              style={{ background: stop.color }}
              aria-hidden
            />
            <p
              className="font-body text-[11.5px] font-bold uppercase tracking-[0.24em]"
              style={{ color: stop.colorDark }}
            >
              {stop.kicker}
            </p>
          </div>
          <p className="mt-1.5 text-pretty font-body text-[15.5px] leading-relaxed text-[#1F1811]">
            {stop.caption}
          </p>
          <div className="mt-3 flex items-center gap-1.5" aria-hidden>
            {Array.from({ length: total }, (_, i) => (
              <span
                key={i}
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: i === index ? 14 : 5,
                  background: i === index ? stop.color : "#CDC1AB",
                }}
              />
            ))}
          </div>
          <p className="mt-2.5 font-body text-[11px] font-medium uppercase tracking-[0.28em] text-[#A79A87]">
            touch anywhere to begin
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
