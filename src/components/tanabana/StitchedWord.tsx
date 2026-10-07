"use client";

import { useId } from "react";
import { CARD } from "@/data/mindmap";

/**
 * StitchedWord — renders a word as if embroidered on cloth:
 * cross-stitch pattern fill + dashed outline, echoing the TanaBana invitation.
 */
export function StitchedWord({
  word,
  color,
  colorDark,
  fontSize = 120,
  className,
  strokeWidth = 2.2,
}: {
  word: string;
  color: string;
  colorDark: string;
  fontSize?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const w = Math.round(fontSize * 0.82 * word.length + fontSize * 0.5);
  const h = Math.round(fontSize * 1.55);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      style={{ overflow: "visible" }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern
          id={`stitch-${uid}`}
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
        >
          <rect width="7" height="7" fill={CARD} />
          <path
            d="M1 1 L6 6 M6 1 L1 6"
            stroke={color}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.9"
          />
        </pattern>
        <pattern
          id={`stitch2-${uid}`}
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
        >
          <rect width="7" height="7" fill="transparent" />
          <path
            d="M0 3.5 L7 3.5"
            stroke={colorDark}
            strokeWidth="0.8"
            strokeLinecap="round"
            opacity="0.35"
          />
        </pattern>
      </defs>
      <text
        x={w / 2}
        y={h * 0.72}
        textAnchor="middle"
        style={{ fontFamily: "var(--font-inter), ui-sans-serif, sans-serif" }}
        fontWeight={900}
        fontSize={fontSize}
        letterSpacing={fontSize * 0.08}
        fill={`url(#stitch-${uid})`}
        stroke={colorDark}
        strokeWidth={strokeWidth}
        strokeDasharray="7 4"
        strokeLinejoin="round"
        paintOrder="stroke"
      >
        {word}
      </text>
      <text
        x={w / 2}
        y={h * 0.72}
        textAnchor="middle"
        style={{ fontFamily: "var(--font-inter), ui-sans-serif, sans-serif" }}
        fontWeight={900}
        fontSize={fontSize}
        letterSpacing={fontSize * 0.08}
        fill={`url(#stitch2-${uid})`}
        stroke="none"
      >
        {word}
      </text>
    </svg>
  );
}
