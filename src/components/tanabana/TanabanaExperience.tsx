"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ThreadMap, type MapControls } from "./ThreadMap";
import { DetailSheet } from "./DetailSheet";
import { ClothBackdrop } from "./ClothBackdrop";
import { AttractOverlay, type AttractStop } from "./AttractMode";
import { ZoomControls } from "./Chrome";
import { TourBar, TOUR_STEPS } from "./TourBar";
import { CATEGORIES, CATEGORY_ORDER, NODES, type CategoryId } from "@/data/mindmap";

// tiny helper — the category of a leaf id
function leafCategory(id: string): CategoryId | null {
  return NODES.find((n) => n.id === id)?.category ?? null;
}

// ── attract mode ──
// When nobody has touched the map for a while, the camera drifts between
// the root and the four threads while a caption card invites passers-by in.
// Tune the idle wait with ?idle=<seconds> (min 3s) — handy for the venue.
const ATTRACT_CAPTIONS: Record<CategoryId, string> = {
  types: "Six families of machines — from rule-followers to learners, seers, creators and movers. Pull a ball of threads to weave its knots into the cloth.",
  capabilities: "Seeing, reading, speaking, predicting, creating — every skill learned from data, none of it magic.",
  applications: "Already at work in Nepal — crop-blight alerts in the fields, TB screening in remote districts, flood forecasts up the Koshi.",
  energy: "Every chat costs electricity and cooling water. Where does the cloud's thirst end — and who pays for it?",
};

const ATTRACT_STOPS: AttractStop[] = [
  {
    id: "root",
    kicker: "TanaBana · ताना-बाना",
    caption:
      "An interactive map of artificial intelligence, threaded with stories from Nepal. Every thread can be pulled, plucked and read — come closer, touch the cloth.",
    color: "#D9536F",
    colorDark: "#A93A52",
  },
  ...CATEGORY_ORDER.map((cid) => ({
    id: `cat-${cid}`,
    kicker: CATEGORIES[cid].title,
    caption: ATTRACT_CAPTIONS[cid],
    color: CATEGORIES[cid].color,
    colorDark: CATEGORIES[cid].colorDark,
  })),
];

const ATTRACT_DWELL_MS = 7500;

export function TanabanaExperience() {
  // no intro gate — the mind map IS the page; the weave-in plays on mount
  const entered = true;
  const [weaveKey, setWeaveKey] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusCat, setFocusCat] = useState<CategoryId | null>(null);
  const [unraveled, setUnraveled] = useState<Set<CategoryId>>(new Set());
  const [tourIdx, setTourIdx] = useState<number | null>(null);
  // bumped each time the guided tour starts — the brain glints on it
  const [tourSeq, setTourSeq] = useState(0);
  const [chromeVisible, setChromeVisible] = useState(false);
  const [attract, setAttract] = useState(false);
  const [attractIdx, setAttractIdx] = useState(0);
  const controlsRef = useRef<MapControls | null>(null);

  // idle wait before the map starts drifting on its own (?idle=<seconds>)
  const getIdleMs = useCallback(() => {
    if (typeof window === "undefined") return 60000;
    const p = new URLSearchParams(window.location.search).get("idle");
    const n = p ? Number(p) : NaN;
    return Number.isFinite(n) && n >= 3 ? n * 1000 : 60000;
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setChromeVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // ── attract mode: idle detection + wake ──
  // Any pointer/wheel/key activity wakes the map; after the idle wait the
  // camera takes over. Skipped entirely under prefers-reduced-motion or
  // while the guided tour runs.
  useEffect(() => {
    if (!entered) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const blocked = tourIdx !== null;
    let timer: number | undefined;
    const arm = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        // sweep the visitor's place clean, then drift
        setSelectedId(null);
        setFocusCat(null);
        setHoveredId(null);
        setTourIdx(null);
        setAttractIdx(0);
        setAttract(true);
      }, getIdleMs());
    };
    const wake = () => {
      setAttract(false);
      if (!blocked) arm();
    };
    if (!blocked) arm();
    const opts = { passive: true } as AddEventListenerOptions;
    window.addEventListener("pointerdown", wake, opts);
    window.addEventListener("pointermove", wake, opts);
    window.addEventListener("touchstart", wake, opts);
    window.addEventListener("wheel", wake, opts);
    window.addEventListener("keydown", wake, opts);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", wake, opts);
      window.removeEventListener("pointermove", wake, opts);
      window.removeEventListener("touchstart", wake, opts);
      window.removeEventListener("wheel", wake, opts);
      window.removeEventListener("keydown", wake, opts);
    };
  }, [entered, tourIdx, getIdleMs]);

  // attract camera: fly to the current stop whenever it changes
  useEffect(() => {
    if (!attract) return;
    const t = window.setTimeout(
      () => controlsRef.current?.driftTo(ATTRACT_STOPS[attractIdx].id),
      60
    );
    return () => window.clearTimeout(t);
  }, [attract, attractIdx]);

  // attract dwell: advance to the next stop
  useEffect(() => {
    if (!attract) return;
    const iv = window.setInterval(
      () => setAttractIdx((i) => (i + 1) % ATTRACT_STOPS.length),
      ATTRACT_DWELL_MS
    );
    return () => window.clearInterval(iv);
  }, [attract]);

  const unravel = useCallback((cat: CategoryId) => {
    setUnraveled((prev) => {
      if (prev.has(cat)) return prev;
      const next = new Set(prev);
      next.add(cat);
      return next;
    });
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      // opening a knot unravels its branch first
      if (id !== "root") {
        const target = id.startsWith("cat-")
          ? (id.slice(4) as CategoryId)
          : leafCategory(id);
        if (target) unravel(target);
      }
      setTourIdx(null);
      setSelectedId(id);
      controlsRef.current?.flyTo(id);
    },
    [unravel]
  );

  const handleBackgroundClick = useCallback(() => {
    setSelectedId(null);
  }, []);

  const handleReplay = useCallback(() => {
    setSelectedId(null);
    setFocusCat(null);
    setUnraveled(new Set());
    setTourIdx(null);
    setWeaveKey((k) => k + 1);
  }, []);

  // ── guided tour ──
  const startTour = useCallback(() => {
    setSelectedId(null);
    setFocusCat(null);
    setAttract(false);
    setTourSeq((s) => s + 1);
    setTourIdx(0);
  }, []);

  const goToStep = useCallback(
    (i: number) => {
      if (i < 0 || i >= TOUR_STEPS.length) return;
      const step = TOUR_STEPS[i];
      // unravel whatever the step needs
      const nid = step.nodeId;
      if (nid.startsWith("cat-")) {
        unravel(nid.slice(4) as CategoryId);
      } else if (nid !== "root") {
        const leafCat = leafCategory(nid);
        if (leafCat) unravel(leafCat);
      }
      setTourIdx(i);
      setSelectedId(null);
      controlsRef.current?.flyTo(step.nodeId);
    },
    [unravel]
  );

  const endTour = useCallback(() => setTourIdx(null), []);

  const tourNext = useCallback(() => {
    if (tourIdx === null) return;
    if (tourIdx >= TOUR_STEPS.length - 1) {
      endTour();
      return;
    }
    goToStep(tourIdx + 1);
  }, [tourIdx, goToStep, endTour]);

  return (
    <div className="weave-bg relative h-dvh w-full overflow-hidden">
      {/* the cotton-canvas surface everything sits on */}
      <ClothBackdrop />

      <div className="relative z-10 h-full w-full">
        <ThreadMap
          entered={entered}
          weaveKey={weaveKey}
          selectedId={selectedId}
          hoveredId={hoveredId}
          setHoveredId={setHoveredId}
          onSelect={handleSelect}
          onBackgroundClick={handleBackgroundClick}
          focusCat={focusCat}
          unraveled={unraveled}
          onUnravel={unravel}
          tourId={tourIdx !== null ? TOUR_STEPS[tourIdx].nodeId : null}
          tourSeq={tourSeq}
          attract={attract}
          controlsRef={controlsRef}
        />
      </div>

      <ZoomControls
        controls={controlsRef}
        onReplay={handleReplay}
        onStartTour={startTour}
        visible={entered && chromeVisible && !attract}
      />

      <AnimatePresence>
        {tourIdx !== null && (
          <TourBar
            key="tour"
            index={tourIdx}
            total={TOUR_STEPS.length}
            caption={TOUR_STEPS[tourIdx].caption}
            onNext={tourNext}
            onPrev={() => tourIdx > 0 && goToStep(tourIdx - 1)}
            onSkip={endTour}
          />
        )}
      </AnimatePresence>

      {/* attract mode — the map drifts and speaks to the room */}
      <AnimatePresence>
        {attract && (
          <AttractOverlay
            stop={ATTRACT_STOPS[attractIdx]}
            index={attractIdx}
            total={ATTRACT_STOPS.length}
          />
        )}
      </AnimatePresence>

      <DetailSheet
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
        onSelect={handleSelect}
      />
    </div>
  );
}
