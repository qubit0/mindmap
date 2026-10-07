"use client";

import { IterationCw as ThreadsIcon, Minus, Plus, RotateCcw, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

// ── Zoom controls + tour entry ───────────────────────────────────────────────

export function ZoomControls({
  controls,
  onReplay,
  onStartTour,
  visible,
}: {
  controls: React.MutableRefObject<{
    zoomIn: () => void;
    zoomOut: () => void;
    reset: () => void;
    flyTo: (id: string) => void;
  } | null>;
  onReplay: () => void;
  onStartTour: () => void;
  visible: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 40 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="absolute bottom-16 right-3 z-30 flex flex-col gap-1.5 sm:bottom-20 sm:right-5"
    >
      <CtrlBtn label="Zoom in" onClick={() => controls.current?.zoomIn()}>
        <Plus className="h-4 w-4" aria-hidden />
      </CtrlBtn>
      <CtrlBtn label="Zoom out" onClick={() => controls.current?.zoomOut()}>
        <Minus className="h-4 w-4" aria-hidden />
      </CtrlBtn>
      <CtrlBtn label="Reset view" onClick={() => controls.current?.reset()}>
        <RotateCcw className="h-4 w-4" aria-hidden />
      </CtrlBtn>
      <CtrlBtn label="Re-weave the map" onClick={onReplay}>
        <ThreadsIcon className="h-4 w-4" aria-hidden />
      </CtrlBtn>
      <CtrlBtn label="Start the guided tour" onClick={onStartTour}>
        <Sparkles className="h-4 w-4 text-[#D9536F]" aria-hidden />
      </CtrlBtn>
    </motion.div>
  );
}

function CtrlBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="h-9 w-9 rounded-full border border-[#E2D9C8] bg-[#FFFDF7]/92 p-0 text-[#3D352C] shadow-[0_6px_18px_-8px_rgba(46,38,32,0.4)] backdrop-blur hover:bg-[#F6F1E7]"
    >
      {children}
    </Button>
  );
}
