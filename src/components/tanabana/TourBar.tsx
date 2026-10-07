"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface TourStep {
  nodeId: string;
  caption: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    nodeId: "root",
    caption:
      "This is the map. Every coloured thread is one story about AI — pull a ball of threads to weave that story into the cloth.",
  },
  {
    nodeId: "cat-types",
    caption:
      "Six families of AI: from machines that follow hand-written rules to ones that learn, see, create and act.",
  },
  {
    nodeId: "ml",
    caption:
      "Machine learning: show a system thousands of tomato-leaf photos and it learns to spot disease — no hand-written rules.",
  },
  {
    nodeId: "neural",
    caption:
      "Neural networks stack layers of tiny mathematical neurons — the engine behind the whole AI boom, from face recognition to ChatGPT.",
  },
  {
    nodeId: "cat-capabilities",
    caption:
      "What can these machines actually do? Sense, reason, remember, create — and translate.",
  },
  {
    nodeId: "translation",
    caption:
      "Nepal counts 124 mother tongues. AI translation is building bridges between them — some wide and smooth, some barely begun.",
  },
  {
    nodeId: "cat-applications",
    caption:
      "AI is already threaded into Nepali soil — farms, clinics, mountainsides and classrooms.",
  },
  {
    nodeId: "agriculture",
    caption:
      "Kalimati's prices decide a farmer's year. Forecasts built on its data help decide what to truck to Kathmandu — and what to plant next.",
  },
  {
    nodeId: "cat-energy",
    caption:
      "Every answer costs electricity. Data centres already draw hundreds of terawatt-hours a year — while Nepal weighs selling its monsoon surplus.",
  },
  {
    nodeId: "root",
    caption:
      "The map is yours now — pull a ball of threads, drag a knot, pluck a thread. What should Nepal weave into AI?",
  },
];

export function TourBar({
  index,
  total,
  caption,
  onNext,
  onPrev,
  onSkip,
}: {
  index: number;
  total: number;
  caption: string;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}) {
  const last = index >= total - 1;
  return (
    <motion.div
      initial={{ y: 90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 90, opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-x-0 bottom-16 z-40 flex justify-center px-3 sm:bottom-20"
    >
      <div className="cloth-card pointer-events-auto relative w-full max-w-xl rounded-2xl border border-[#E2D9C8] bg-[#FFFDF7]/95 p-4 shadow-[0_18px_50px_-20px_rgba(46,38,32,0.45)] backdrop-blur">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#D9536F]/10 text-[#D9536F]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
          </span>
          <p className="flex-1 text-pretty font-body text-[15px] leading-relaxed text-[#3D352C]">
            {caption}
          </p>
          <button
            onClick={onSkip}
            aria-label="End the tour"
            className="rounded-md p-1 text-[#A79A87] transition-colors hover:bg-[#F6F1E7] hover:text-[#2E2620]"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1" aria-hidden>
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === index ? 16 : 6,
                  background: i <= index ? "#D9536F" : "#E2D9C8",
                }}
              />
            ))}
            <span className="ml-2 font-body text-[11px] font-medium tracking-[0.18em] text-[#A79A87]">
              FOLLOW THE RED THREAD · {index + 1}/{total}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {index > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrev}
                className="h-8 rounded-full px-3 font-body text-[13px] text-[#5C5347] hover:bg-[#F6F1E7]"
              >
                Back
              </Button>
            )}
            <Button
              size="sm"
              onClick={onNext}
              className="h-8 gap-1.5 rounded-full bg-[#D9536F] px-4 font-body text-[13px] font-medium text-white shadow-[0_6px_16px_-6px_rgba(217,83,111,0.6)] hover:bg-[#C13B57]"
            >
              {last ? "Finish" : "Next"}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
