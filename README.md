# TanaBana · The Loom of Intelligence

An interactive, woven mind map of Artificial Intelligence — built as an installation piece for the
**TanaBana: Weaving through Technology, Power & Justice** exhibition at **Yalamaya Kendra, Patan
Dhoka, Lalitpur**.

Every idea is a thread. Pull a ball of thread and a branch unravels into the cloth. Drag a knot and it
opens into a card. The whole map is rendered as a single hand-built SVG loom lying on a procedurally
generated cotton-canvas surface — and every node carries a "thread from home": a story from Nepal.

---

## Table of contents

- [What it is](#what-it-is)
- [The weaving metaphor](#the-weaving-metaphor)
- [Tech stack](#tech-stack)
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [Running for the exhibition (production)](#running-for-the-exhibition-production)
- [How to interact with the map](#how-to-interact-with-the-map)
- [Routes](#routes)
- [Project structure](#project-structure)
- [Content model](#content-model)
- [Architecture notes](#architecture-notes)
- [Accessibility & performance](#accessibility--performance)
- [Troubleshooting](#troubleshooting)
- [Development history](#development-history)

---

## What it is

A **single-page interactive installation**. Visitors walk up to a screen, and the AI mind map is
already there — no landing page, no login, no menu to navigate. When nobody has touched it for a
while, the map starts **drifting on its own** between the root and the four main threads while a
caption card invites passers-by in (attract mode).

Content is in **English with Devanagari accents**, and every single node is grounded in a Nepali
context: crop-blight alerts in the fields, TB screening in remote districts, flood forecasts up the
Koshi, the 124 mother tongues, 42,000+ MW of hydro potential, the water cost of data centres.

## The weaving metaphor

The metaphor is structural, not decorative — it drives the geometry and the interactions:

| Textile idea | What it is in the app |
|---|---|
| **Warp** | The faint vertical threads — the grid the loom hangs on |
| **Weft** | The horizontal ghost threads drifting behind the map |
| **Knot** | A node (a leaf idea) |
| **Ball of thread / bobbin** | A main category, waiting to be pulled |
| **Taut thread** | A branch mid-pull — it visibly tightens as you drag |
| **Tangle** | A cross-link: an arc between two distant knots that belong together |
| **Shuttle** | The ambient bead that glides along threads (SMIL `animateMotion`) |
| Selvedge | The cloth's finished bottom edge |
| **Stitching** | The cross-stitch pattern-fill used for the title lettering |
| **Cotton canvas** | The generated fabric texture everything sits on |

---

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) | `output: "standalone"` for deployment |
| UI | **React 19** | Client components for the interactive loom |
| Language | **TypeScript 5** (strict) | `noImplicitAny` off, as scaffolded |
| Styling | **Tailwind CSS 4** | **CSS-first** — configured in `globals.css` via `@theme inline`, *not* a JS config file |
| Animation | **framer-motion 12** | Path drawing (`pathLength`), springs, camera tweens |
| Icons | **lucide-react** | |
| Components | **shadcn/ui** (2 primitives only) | `button`, `sheet` — the other 45 were removed as unused |
| Data layer | **None** | No database, no ORM, no API. All content is a TypeScript module |
| Package manager | **bun** | `bun.lock` is the only lockfile |
| Fonts | `next/font/google` | Inter + Noto Serif Devanagari, self-hosted at build |

There is **no animation library beyond framer-motion**, **no state manager** (React state +
`useSyncExternalStore`), and **no UI kit**. The loom is raw `<svg>` with hand-computed paths.

### Where the visuals come from

- **`src/lib/threads.ts`** — the geometry engine. Deterministic layout coordinates on a 2080×1240
  "cloth", seeded organic thread paths (cubic bézier + fibre wiggle), warp/weft generators,
  cross-link arcs, colour mixing, taut-thread interpolation.
- **`src/lib/cloth.ts`** — generates a seamless 256px cotton-canvas tile on a `<canvas>` (over/under
  basket weave, per-thread shade jitter, slubs, ~720 fibre specks), cached and exposed as a data URL.
  Seeded, so it is identical on every load.
- **`src/components/tanabana/StitchedWord.tsx`** — SVG cross-stitch pattern-fill text.

---

## Requirements

- **bun** ≥ 1.1 (developed on 1.3.x) — this is the only supported package manager
- **Node.js** ≥ 20 (developed on 22.x)
- No database, no API keys, **no configuration** — clone and run

## Getting started

```bash
# 1. install dependencies
bun install

# 2. run it
bun run dev
```

Then open **<http://localhost:3000>**.

> `bun run dev` starts Next.js on **port 3000** and tees output to `dev.log`.

There is no build step, no database to provision, and no environment file to create — the project has
zero configuration. Every thread of content lives in `src/data/mindmap.ts`.

## Available scripts

| Script | What it does |
|---|---|
| `bun run dev` | Dev server on port 3000, with HMR. Pipes to `dev.log` |
| `bun run build` | `next build`, then copies `.next/static` and `public` into `.next/standalone/` |
| `bun run start` | Serves the production standalone build (`NODE_ENV=production`, pipes to `server.log`) |
| `bun run lint` | `eslint .` — currently clean |

Typecheck (not a script, run manually):

```bash
bunx tsc --noEmit
```

## Running for the exhibition (production)

The dev server is for development only. For the venue machine, build and serve the standalone output:

```bash
bun run build
bun run start
```

`build` produces `.next/standalone/server.js`, and `start` runs it on port 3000. This is the mode the
deployment scripts (`.zscripts/build.sh`, `.zscripts/start.sh`) use; those add a guard that verifies
`.next/standalone/server.js` exists and self-heals `next.config.ts` if `output: "standalone"` is ever
removed.

**Kiosk tips**

- Add `?idle=<seconds>` to tune attract mode. Default is 60s; **minimum 3s**. A short value is very
  useful while testing:
  `http://localhost:3000/?idle=5`
- Hide browser chrome in full screen (F11 / kiosk mode).
- The piece respects `prefers-reduced-motion`: attract mode, the cloth breathing and the drifting
  cotton motes all switch off.

## How to interact with the map

The whole piece is taught by doing. Interactions:

| Gesture | Result |
|---|---|
| **Drag a ball of thread** (a category) | The thread tautens live; release past the threshold and the branch **unravels stitch by stitch**, revealing its knots |
| **Tap a ball of thread** | Same as pulling it fully — unravels the branch |
| **Drag a knot** | Its leaf thread stretches elastically; release past the threshold to open its detail card |
| **Click a knot** | Opens the detail sheet (definition, how it works, further types, a use case, where it shows up) |
| **Pluck a thread** | A ripple bead runs along it with a twang |
| **Drag the cloth** | Pan |
| **Wheel / pinch** | Zoom |
| **Zoom controls** (bottom right) | Zoom in, zoom out, reset view, **re-weave** the map, start the **guided tour** |
| **Guided tour** | An 11-step narrated walk: root → each main thread → a representative knot → back to root. Auto-unravels branches and flies the camera |
| **Idle** | After the idle timeout, attract mode takes over and captions the map for passers-by |

Progressive disclosure is deliberate: on entry you see only the woven brain, four branch threads and
their balls of thread. Nothing is pre-announced by faded scaffolding — expansion is discovered by
pulling.

**URL parameter**

| Parameter | Effect |
|---|---|
| `?idle=<seconds>` | Idle wait before attract mode (min 3, default 60) |

## Routes

| Route | Rendering | Purpose |
|---|---|---|
| `/` | Static | The loom — the installation itself |
| `/card/[id]` | **SSG, 31 pages** | The takeaway a visitor carries out of the room: one knot per page, readable on a phone, framed by the same cotton. Includes definition, how it works, further types, a super-interesting use case, and where it shows up |

`/card/[id]` accepts `root`, `cat-types`, `cat-capabilities`, `cat-applications`, `cat-energy`, and
every leaf id.

There are no API routes. The piece is entirely self-contained: all content is compiled in from
`src/data/mindmap.ts`, and nothing is fetched at runtime.

## Project structure

```
mindmap/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # / — mounts the experience
│   │   ├── layout.tsx               # fonts, metadata, viewport
│   │   ├── globals.css              # Tailwind 4 theme + cloth/weave utilities
│   │   └── card/[id]/page.tsx       # SSG takeaway cards
│   ├── components/
│   │   ├── tanabana/                # the piece itself
│   │   │   ├── TanabanaExperience.tsx  # hub: state, attract mode, tour wiring
│   │   │   ├── ThreadMap.tsx           # the SVG loom (~1640 lines) + pan/zoom engine
│   │   │   ├── ClothBackdrop.tsx       # cloth tile, light, drifting motes, vignette
│   │   │   ├── DetailSheet.tsx         # right sheet (desktop) / bottom sheet (mobile)
│   │   │   ├── Chrome.tsx              # zoom + re-weave + tour controls
│   │   │   ├── TourBar.tsx             # guided-tour bar + TOUR_STEPS
│   │   │   ├── AttractMode.tsx         # idle caption card
│   │   │   └── StitchedWord.tsx        # cross-stitch SVG text
│   │   └── ui/                      # shadcn primitives: button, sheet
│   ├── data/mindmap.ts              # ALL content: nodes, categories, cross-links
│   ├── hooks/use-mobile.ts          # breakpoint via useSyncExternalStore
│   └── lib/
│       ├── threads.ts               # thread geometry engine
│       ├── cloth.ts                 # procedural cotton-canvas tile
│       └── utils.ts                 # cn()
├── public/robots.txt
├── .zscripts/                       # platform build/dev/start scripts
├── Caddyfile                        # reverse proxy (:81 → :3000)
├── next.config.ts                   # standalone output
├── postcss.config.mjs               # @tailwindcss/postcss
├── eslint.config.mjs
└── worklog.md                       # development history, task by task
```

## Content model

All content lives in **`src/data/mindmap.ts`** — no CMS, no database. Edit that one file to change
what the map says.

**Shape: 1 root + 4 categories + 22 leaves = 27 nodes**, plus 5 cross-links.

| Category | Colour | Leaves |
|---|---|---|
| Types of AI · प्रकार | `#D9536F` rose / `#A93A52` | 6 — rulebased, ml, neural, genai, robotics, nextgen |
| Capabilities · क्षमता | `#17877B` teal / `#0F6A60` | 5 — perception, reasoning, memory, creativity, translation |
| Applications in Nepal · प्रयोग | `#DD7A2E` amber / `#B25E1D` | 6 — agriculture, health, disaster, tourism, education, langpres |
| Energy & Environment · ऊर्जा | `#4C8C4A` green / `#39703A` | 5 — trainingcost, datacentres, hydro, hardware, inference |

The **6 "Types of AI" leaves** are richer than the rest: they carry `howItWorks` (bullets),
`subtypes` (the further types — e.g. neural → ANN, CNN, RNN, GNN, Transformer) and `useCase` (a super
interesting practical use case), all of which render in both the detail sheet and the takeaway card.

Node fields:

```ts
interface ThreadNode {
  id: string;                 // "neural" | "cat-types" | "root"
  kind: "root" | "category" | "leaf";
  category: CategoryId;       // "types" | "capabilities" | "applications" | "energy"
  parentId: string | null;
  title: string;
  deva?: string;              // Devanagari flourish
  tagline: string;            // one-line definition
  description: string[];      // the definition, 1–2 short paragraphs
  applications: string[];     // "Where it shows up"
  howItWorks?: string[];      // bullet explanation (Types of AI only)
  subtypes?: SubType[];       // further types (Types of AI only)
  useCase?: string;           // a super interesting practical use case
}
```

Category nodes are **derived** from `CATEGORY_ORDER` + `CATEGORY_TAGLINES`, not hand-written.

## Architecture notes

**Data flow.** `TanabanaExperience.tsx` is the hub and owns all shared state: which node is selected,
which is hovered, which categories are unraveled, tour index, attract mode. `ThreadMap` receives it
as props and reports interactions back up. `DetailSheet` and `Chrome` are siblings reading the same
state.

**No global store.** State is deliberately local; the only "external store" is the mobile breakpoint,
read with `useSyncExternalStore`.

**Deterministic rendering.** Every thread path is seeded (`mulberry32` + `hashStr`), so the cloth
looks identical on every load and on every machine — no random jitter between visitors. This also
means SSR and client agree.

**Node identity.** Category nodes are `cat-<id>` (e.g. `cat-types`); leaves use their raw id. The
prefix convention is threaded through selection, tour steps and camera targeting.

**Camera.** `ThreadMap` exposes a `MapControls` ref — `zoomIn`, `zoomOut`, `reset`, `flyTo(id)`,
`driftTo(id)` — which `Chrome`, the tour and attract mode all drive. Pan/zoom is custom (no library):
pointer events with a pointer-ownership guard so a drag on a knot is never mistaken for a background
click, plus wheel and two-finger pinch.

**The cloth is generated, not an image.** `cloth.ts` paints a 256px tile to an offscreen `<canvas>`
once, caches the data URL, and exposes it as the `--tanabana-weave` CSS variable. Zero image assets
ship with this project.

**Tailwind 4 is CSS-first.** There is intentionally **no `tailwind.config.ts`** — v4 would not load
it. The theme lives in `globals.css` under `@theme inline`. Animation utilities come from
`tw-animate-css` (imported in CSS), which is what `sheet.tsx`'s `animate-in`/`animate-out` classes use.

## Accessibility & performance

- Nodes are keyboard-focusable and the map is navigable without a pointer.
- `prefers-reduced-motion` is honoured: cloth breathing, motes, attract mode and camera drift all
  stop.
- Hover states are additive — the detail sheet is the accessible path to all content.
- The camera is a single `<svg viewBox>` that moves with the pan/zoom state, so the browser clips to
  the visible region natively instead of compositing the whole 2080×1240 cloth. Pan is clamped to the
  cloth plus a 320px overscan allowance, so the map cannot be lost off-screen.
- The cloth backdrop's animation loop pauses while the tab is hidden.
- `/card/[id]` is fully static (31 pages prerendered), so the takeaway pages are instant and work
  offline once cached.

## Troubleshooting

**The map looks empty / no threads appear**
The loom is client-rendered. Give it a moment after the dev server reports ready, and check the
browser console. SSR HTML contains only the shell (~20KB); the hydrated DOM with the full loom is
much larger (~127KB). If it never hydrates, check for a JavaScript error.

**`next.config.ts` warns about `bun.lock` outside the repository**
Harmless. Next detects a lockfile in a parent directory and suggests setting `turbopack.root`. It does
not affect the build.

**Port 3000 is already in use**

```bash
bunx next dev -p 3111
```

Note that `.zscripts/dev.sh` health-checks port **3000** specifically.

## Development history

`worklog.md` documents the full build, task by task — 16 logged tasks of user-driven iteration:
the intro-gate pull-gesture bug (the threshold was geometrically impossible on desktop *and* mobile),
the interaction model rebuilt around pull-to-weave / pull-to-read / pluck-for-sound, the move from a
flat grid background to a real procedural cotton canvas, the brain-shaped root, removal of sound, the
further-types branching, and a large dead-file and unused-dependency cleanup.

It is worth reading before making changes — most of the non-obvious decisions (why the pull threshold
is viewport-calibrated, why node releases are pointer-owned, why `suppressHydrationWarning` sits on
`<body>`) are explained there with the bug that motivated them.
