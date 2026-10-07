# Worklog

---
Task ID: 1
Agent: main (Super Z)
Task: Build "TanaBana — The Loom of Intelligence": an interactive woven mind map of AI with Nepali context for the TanaBana exhibition (Yalamaya Kendra, Patan Dhoka, Lalitpur, Oct 8–9 2026).

Work Log:
- Initialized fullstack environment (Next.js 16 + Tailwind 4 + shadcn/ui, bun, port 3000).
- Analyzed the uploaded invitation image: "TanaBana: Weaving through Technology, Power & Justice" — light Dhaka-textile palette, stitched/embroidered typography, event details extracted.
- Built content model `src/data/mindmap.ts`: root + 6 categories (Types, Capabilities, Applications in Nepal, Biases & Blind Spots, Energy & Environment, Power & Justice) + 32 leaf nodes, each with tagline, 2 paragraphs and a Nepal-specific "thread from home" fact; plus 5 cross-links ("knotted with").
- Built thread engine `src/lib/threads.ts`: deterministic layout coordinates (2080×1240 cloth), seeded organic thread path generation (bezier + fibre wiggle), warp/weft background generators, cross-link arcs, color mixing.
- Built `StitchedWord.tsx` — SVG cross-stitch pattern-fill text (embroidery effect, echoes invitation).
- Built `IntroOverlay.tsx` — embroidered TANA/BANA title, event chips, and a draggable loose thread: pull ≥190px to unravel into the map; responsive shrink for short viewports; skip button.
- Built `ThreadMap.tsx` — SVG loom: warp lines + weft ghosts + dhaka lattice background, animated thread drawing (framer-motion pathLength), root loom emblem (woven swatch), category bobbins with Devanagari labels, leaf knots, hover chain-highlighting with stitched texture overlay + tooltips, cross-link tangle threads, ambient shuttle (SMIL animateMotion), custom pan/zoom (wheel/pinch/drag, flyTo tween), keyboard accessible nodes.
- Built `DetailSheet.tsx` — category-colored detail panel (right sheet desktop / bottom sheet mobile) with thread band, body paragraphs, Nepal fact card, child chips, cross-link chips.
- Built `Chrome.tsx` — TopBar (About dialog with event info), Legend (focus mode per branch), ZoomControls (+/−/reset/re-weave), ThreadsIndex drawer.
- Built `TanabanaExperience.tsx` hub + `page.tsx`; layout with Fraunces + Space Grotesk + Noto Serif Devanagari fonts; globals.css weave texture, theme, scrollbars, reduced-motion.
- Fixed: framer CSS transform overriding SVG transform attribute (nodes at origin), CARD import missing in DetailSheet (runtime error caught in browser), fontFamily presentation attribute → style (var() support), click-after-drag suppression, entrance/dim opacity conflicts, portrait height-fit for mobile, strokeWidth framer warning, intro overflow on short screens.
- Verified end-to-end with agent-browser: intro pull gesture, weave-in animation, detail sheets, index navigation, cross-link navigation, legend focus mode, About dialog, hover highlight + tooltip, mobile (iPhone 14) intro/map/bottom sheet, console clean, lint clean.

Stage Summary:
- Deliverable: runnable Next.js app at `/` — single-page interactive installation.
- Key decisions: light cream "cloth" theme (per user: no dark theme), Dhaka-inspired 6-color thread palette, weaving metaphor applied structurally (warp = grid, weft = map threads, knots = nodes, tangles = cross-links), all content in English with Devanagari accents, Nepal context in every node.
- Files: src/data/mindmap.ts, src/lib/threads.ts, src/components/tanabana/{StitchedWord,IntroOverlay,ThreadMap,DetailSheet,Chrome,TanabanaExperience}.tsx, src/app/{page,layout,globals.css}.

---
Task ID: 2
Agent: main (Super Z)
Task: v2 after user feedback — "pull the thread does nothing", "content isn't great", "interactivity is minimal".

Work Log:
- Root-caused the intro pull bug: the 190px threshold exceeded the physical drag room (~110px) because the bobbin sat at the bottom screen edge — the gesture was geometrically impossible on desktop AND mobile. Fixed: widget lifted off the edge (pb-24), viewport-calibrated threshold (max(88, 13% vh), cap 130), fast-flick detection, haptics, rising-tone + bobbin spin + cloth-brightening feedback, "unweaving · NN%" progress.
- Rebuilt ThreadMap interaction model: progressive weave (only root + 6 bobbins on entry; leaf knots start as dashed "?" ghosts), pullable bobbins (drag tautens the root thread live via rootThreadPathTo; release ≥55% taut or tap → branch unravels stitch-by-stitch), draggable knots (elastic leaf threads via leafThreadPathTo; release ≥50% → "pull to read" opens the DetailSheet), pluckable threads (invisible hit lines trigger a ripple bead via animateMotion.beginElement + twang dash + pluck note).
- Added lib/sound.ts WebAudio engine: category-tuned pentatonic plucks, tension-pitched pull tones, unravel chords, snap-backs; persisted mute toggle in TopBar.
- Fixed secondary bugs found while testing: container pointerup treated node releases as background clicks (sheet closed instantly — now guarded by pointer-ownership), double-select after pull (350ms suppression), beginElement-before-mount ripples (beads now always-mounted), text selection during pull gestures, focus rectangles on SVG nodes, framer strokeWidth warning.
- Content upgrade: NODE_STATS — 33 hedged stat callouts (Gender Shades 35%, 124 mother tongues, 42,000+ MW hydro, 415 TWh data centres, <$2/hr ghost work, Kusunda 1 speaker...); DetailSheet gained a stat hero card (value/label/source) above the body.
- Added "Add your thread": Prisma VisitorThread model + GET/POST /api/threads (validation, palette whitelist), AddThreadDialog (text + 6 dhaka colour swatches), and the visitor fringe — submitted threads render as coloured strands on the cloth's bottom selvedge with tooltip + pluckable beads.
- Added guided tour "Follow the red thread" (TourBar, 12 narrated steps): auto-unravels branches, flies the camera, hides legend, ends on the add-thread dialog.
- Chrome v2: sound toggle, Add-your-thread, Guided tour, Threads index buttons; updated hints/About to teach pull/pluck/drag.
- Verified with agent-browser: desktop pull→enter, bobbin pull→unravel (screenshot shows 6 knots stitched in), knot drag→sheet with ≈10× stat card, POST /api/threads 201 + fringe strand rendered, tour steps 1-5 auto-weaving, iPhone 14 pull→map; ESLint clean; no page errors.

Stage Summary:
- Deliverable: runnable Next.js app at "/" — every thread on the loom now answers to touch.
- Key decisions: interaction model is now pull-to-weave (progressive disclosure), pull-to-read (drag knots), pluck-for-sound; stats give each knot a holdable number; visitor fringe makes the piece collective for the Oct 8–9 exhibition.
- Files touched: src/components/tanabana/{ThreadMap,IntroOverlay,DetailSheet,Chrome,TanabanaExperience,TourBar,AddThreadDialog}.tsx, src/lib/{threads,sound}.ts, src/data/mindmap.ts, src/app/api/threads/route.ts, prisma/schema.prisma, src/app/globals.css.

---
Task ID: 3
Agent: main (Super Z)
Task: v3 — "Give it a canvas cotton cloth background feel" + "What can you do to improve it?"

Work Log:
- Built src/lib/cloth.ts: procedural seamless 256px cotton-canvas tile (over/under basket weave with per-thread shade jitter, weft seams, slubs, ~720 fibre specks, cotton burrs), generated once on canvas → data URL, cached, SSR-safe, seeded (deterministic).
- Built src/components/tanabana/ClothBackdrop.tsx: fixed pointer-transparent backdrop = weave tile + breathing NW-light/warm-floor shade + 24 drifting cotton motes (rAF, pauses on tab hidden) + edge vignette; exposes the tile as --tanabana-weave CSS var; respects prefers-reduced-motion.
- globals.css: replaced flat .weave-bg grid with real cloth system (.cloth-tile/.cloth-light + cloth-breathe/.cloth-vignette), .cloth-card utility (isolation + z:-1 ::before so texture sits under content), .tb-ply ply-shift shimmer keyframes; reduced-motion guards.
- ThreadMap.tsx: added tb-soft blur filter; every root/leaf thread now casts a soft offset shadow (fades in after draw) and carries a white spun-ply dash shimmer; LoomEmblem/Bobbin/Knot got soft ellipse shadows (threads & knots lie ON the cloth); warp+weft now fade in as the loom wakes; tooltip is a .cloth-card.
- Applied .cloth-card to DetailSheet (incl. stat + fact cards), About dialog, AddThread dialog, TourBar so every surface shares the fabric.
- TanabanaExperience.tsx: mounted ClothBackdrop at z-0, ThreadMap wrapped in z-10 layer; IntroOverlay made transparent so the cloth shows through during the intro (its brighten-on-pull overlay still works).

Stage Summary:
- Deliverable: the whole experience now sits on a procedurally woven unbleached-cotton canvas — intro, loom, sheets, dialogs all share the fabric; threads cast shadows and shimmer like spun yarn.
- Verified: fresh browser session desktop + iPhone 14 — full flow (intro → skip → unravel → sheet → About) ERROR COUNT 0; tsc/eslint clean. (Earlier console errors were stale HMR artifacts from editing while the page was open.)
- Files: src/lib/cloth.ts, src/components/tanabana/ClothBackdrop.tsx (new); globals.css, ThreadMap.tsx, TanabanaExperience.tsx, IntroOverlay.tsx, DetailSheet.tsx, Chrome.tsx, AddThreadDialog.tsx, TourBar.tsx (modified).

---
Task ID: 4
Agent: main (Super Z)
Task: v4 — user edits: (1) remove curved red/green threads from top of home page, (2) remove "Add your thread.", (3) increase font size / focus on readability, (4) use Inter font overall. (User's item 5 arrived truncated.)

Work Log:
- Removed the intro's hanging-warp SVG (8 curved red/teal/orange threads across the top) and its spacer from IntroOverlay.tsx.
- Removed the map's top-corner decorative looseThread paths (red tl, teal tr) from ThreadMap.tsx; kept the two bottom fibres.
- Removed the entire "Add your thread" feature: TopBar button + onOpenAdd prop + PenLine import (Chrome.tsx), AddThreadDialog.tsx deleted, visitor-fringe rendering + VisitorFringe/FringeStrand components + VisitorThreadVM + fringeStrand import + "v:" tooltip branch removed from ThreadMap.tsx, fetch/POST /api/threads + visitorThreads state + tieKnot import removed from TanabanaExperience.tsx, tour no longer ends in the add dialog (tourNext ends the tour; last TOUR_STEPS caption rewritten to "The loom is yours now…", button "Weave yours" → "Finish"), About dialog no longer mentions tying a thread into the fringe. Backend (/api/threads route, Prisma VisitorThread model) left dormant.
- Inter font overall: layout.tsx now loads Inter (variable, normal+italic) as --font-inter plus Noto Serif Devanagari for Devanagari accents; Fraunces/Space Grotesk removed. globals.css --font-sans/--font-display/--font-body + body + .font-display/.font-body all point at var(--font-inter). All SVG fontFamily attrs in ThreadMap.tsx and StitchedWord.tsx switched (no font-fraunces/font-space refs remain).
- Readability pass (+~2-4px everywhere): intro deva line, tagline, description, chips, pull labels, skip button; map root title 23→27 (weight 700), root deva 14→16, THE LOOM 10.5→12, bobbin deva 12.5→15, CategoryPill 13.5→16 (pill resized: w=len*9+40, h=33, y=52), leaf knot labels 13.5→16 (x ±18), ghost "?" 9→11, hints 10→12/12.5; tooltip 13/11.5→14.5/13 with max-w 280→330 and clamp widened; TopBar title 15→17, sub 9.5→10.5, buttons 12→13; Legend 11.5→13, hint 10.5→12; ThreadsIndex title/items 15→17/15; About dialog 13.5→15 body sizes; DetailSheet title 26→30, tagline 13→15, stat value 34→40, body 13.5→15.5 (leading 1.65), fact/labels bumped; TourBar caption 13→15, controls 12→13; bottom nudge 11→12.5.
- Verified: bunx tsc --noEmit → no errors in src/ (only pre-existing examples/skills errors); eslint on tanabana + app → clean; agent-browser desktop 1440×900 (intro → map → unravel Types of AI → Machine Learning sheet → About) and iPhone 14 (intro → map): zero page errors, no add-thread button, no top threads, Inter rendering, larger type everywhere. Screenshots: scripts/v4-01…v4-06.

Stage Summary:
- Deliverable: runnable Next.js app at "/" — quieter top, no visitor-thread feature, Inter typography, noticeably more readable at presentation distance.
- Files touched: src/app/{layout.tsx,globals.css}, src/components/tanabana/{IntroOverlay,ThreadMap,Chrome,TanabanaExperience,TourBar,DetailSheet,StitchedWord}.tsx; deleted src/components/tanabana/AddThreadDialog.tsx. Backend /api/threads + VisitorThread model kept but unused.

---
Task ID: 5
Agent: main (Super Z)
Task: v5 — user asked (1) for improvement suggestions, (2) "make the bobbin or the spool more realistic".

Work Log:
- Rebuilt ThreadMap.tsx `Bobbin` as a realistic turned-wooden spool: two wooden flanges (vertical birch gradient #F4E3C2→#CFA268, rim stroke, grain streaks, top-light highlight line), wooden core slivers peeking between flanges and winding, dense wound wraps (pitch 4.6, per-row deterministic shade/opacity jitter, every 3rd wrap darker), horizontal cylindrical shading gradient (dark edges + white sheen band left-of-centre), crisp dark wrap-edge lines, wood-knot ellipse in the top flange, and a thread strand leaving the winding and curling over the flange to meet the incoming root thread.
- Fixed the unphysical spin: the old version rotated the whole spool (cartwheel). Now `spin` drives (a) vertical scrolling of the wraps inside a clipPath (thread surface passing over the cylinder = true unwinding) and (b) a ±1.8° sin tilt. useId()-prefixed gradient/clip ids avoid collisions across the 6 mounted bobbins.
- Rebuilt IntroOverlay.tsx `BobbinHandle` the same way (46×58 realistic wooden spool, pitch 4.1): replaced the flat circular icon badge; wrap colour red #D9536F → teal #17877B when pull crosses threshold; wraps scroll with `pull` (dy), tilt clamped to ±9°; CSS drop-shadow instead of the old bordered circle.
- Verified: bunx tsc --noEmit → no src/ errors; eslint on both files → clean; agent-browser desktop 1440×900 (intro spool render, mid-pull "unweaving · NN%" with tilted spool, release → map with 6 wooden spools, bobbin pull → taut thread + unravel, zoom inspection) and iPhone 14 intro; 0 page errors. 6× detail preview harness at scripts/spool-preview.html; screenshots scripts/v5-01…v5-10.

Stage Summary:
- Deliverable: runnable Next.js app at "/" — both spools (intro pull-handle + six category bobbins) are now realistic wooden bobbins whose wound thread visibly unwinds while pulled.
- Files touched: src/components/tanabana/{ThreadMap,IntroOverlay}.tsx; added scripts/spool-preview.html (dev harness).

---
Task ID: 6
Agent: main (Super Z)
Task: v6 — user requests: (0) build Attract mode + Takeaway cards, (1) dark-black text on the info card, (2) the central AI node's Nepali name is hard to read.

Work Log:
- Attract mode: new AttractMode.tsx (caption card overlay, bottom-centre, per-branch colour kicker + caption + 7 progress dots + "touch anywhere to weave", AnimatePresence mode="wait" crossfades). TanabanaExperience: idle detection (pointerdown/move/touchstart/wheel/keydown on window) arms a 60s timer (?idle=<seconds> override, min 3s); on fire it sweeps the visitor's place (sheet/index/about/tour/focus/hover cleared) and enters attract; camera drifts through 7 stops (root + 6 threads) via new controlsRef.driftTo, dwelling 7.5s per stop. Wake on any interaction exits instantly and re-arms. Guards: skipped under prefers-reduced-motion, while the guided tour runs, or while index/about is open. Chrome (TopBar/Legend/ZoomControls/bottom nudge) fades out while attracting. ThreadMap: animateViewTo gained a dur param; driftTo = wide framing (fit/1.3) + slow 2400ms tween.
- Takeaway cards: DetailSheet gained a Takeaway block (react-qr-code@2.2.0, 72px QR on white, "Take this thread with you" + helper line) encoding `${origin}/card/<id>`. New route src/app/card/[id]/page.tsx — generateStaticParams for all 39 nodes, generateMetadata with OG tags, notFound for unknown ids; page = thread band in branch colour, kicker/title/deva/tagline, stat hero, body, "A thread from home" fact, event footer with dates/venue and a "Pull this thread in the full loom" link back to /; reuses ClothBackdrop + cloth-card so the card shares the woven fabric; verified desktop + iPhone 14.
- Readability: DetailSheet reading text darkened to near-black — body/stat/fact/chips #3D352C→#1F1811, title #2E2620→#1C1610, tagline + cross-link notes #6B5F52→#4A4238, stat source #A79A87→#8A7F72. Root node deva: fontSize 16→22, weight 500, fill MUTED→#3E3529, plus a cloth-coloured paintOrder=stroke halo (5px #F6F1E7) so it lifts off the converging threads.
- Bug found & fixed while verifying: the ROOT node could not be opened by real clicks (regression since v2). Its pointerdown bubbled to the cloth container which setPointerCapture on itself, so the subsequent click event was retargeted to the container and the node's onClick never fired (leaf/bobbin nodes worked because startPull captures on the node itself). Fix: NodeShell gained an optional onPointerDown prop (spread before pullHandlers so pull nodes override) and the root passes e.stopPropagation(), keeping the click target intact. Verified: desktop + mobile tap on root now opens the sheet; bobbin tap-to-unravel regression-checked.
- Verification: tsc clean (src/), eslint clean (tanabana + card), 0 page errors; screenshots scripts/v6-01…v6-15 (map root deva, sheet dark text + QR, card pages root/hydro, mobile card, attract start/advance/wake, mobile bottom sheet, bobbin tap). Temp debug state hook used during verification was removed.

Stage Summary:
- Deliverable: runnable Next.js app at "/" plus new /card/<id> takeaway pages — the loom now presents itself when idle and every knot can leave the room on a visitor's phone.
- Files: src/components/tanabana/{AttractMode (new),DetailSheet,ThreadMap,TanabanaExperience}.tsx, src/app/card/[id]/page.tsx (new); react-qr-code added.
- Venue note: tune attract delay with ?idle=<seconds>; QR codes encode the page's own origin, so they resolve on whatever LAN/URL serves the app.
- Re-verification (fresh session after context compaction, user said "yes please"): confirmed all four items live on disk and working. tsc clean (src/), eslint clean (tanabana + card). Desktop 1440×900: intro spool → map → root node CLICK OPENS SHEET (fix holds) → dark-black sheet text → QR block at sheet foot → attract fired with ?idle=4 (swept the open sheet, drifted camera, caption card + progress dots, chrome hidden) → mouse move woke instantly, chrome returned. /card/castegender full-page render (stat hero 142, fact, event footer, link back). iPhone 14: index → leaf bottom sheet → dark text + fact + QR all readable; mobile TopBar uses condensed "Index" label. 0 page errors throughout. Screenshots scripts/v6-recheck-01…09.

---
Task ID: 7-10 (catch-up note)
Agent: main (Super Z)
Task: Recovery note — Tasks 7-10 were completed in a previous session, but the environment was reset to the last committed state (Task 6) and that work was lost from disk.

Work Log:
- Task 7-9 (lost, rebuilt within Task 11): single mind-map page (TopBar/Legend/About/Index removed), loom/bobbin terminology removed from UI strings, Biases & Blind Spots + Power & Justice branches removed, bobbins replaced by balls of threads, info cards simplified to title/description/applications (no stat hero, no fact card, no QR).
- Task 10 (lost, rebuilt within Task 11): Types of AI rewritten to the six families of the reference site — Rule-Based AI, Machine Learning, Neural Networks, Generative AI, Robotics & Embodied AI, Next-Generation AI.

Stage Summary:
- No separate artifacts; rebuilt inside Task 11. Recorded here so the history is complete.

---
Task ID: 11
Agent: main (Super Z)
Task: "Let's work on the version aa32342. Remove sound. For every types of AI, there are further types, like for Neural net: ANN, CNN, RNN, GNN, Transformer. Please work on those further branching. Also develop a short (bullet points) explanation of how it works? and 'Super interesting practical use case of it' in the info card along with the definition."

Work Log:
- Version note: no commit "aa32342" exists in git history (UUID-named commits only); the disk had been reset to the Task 6 state, so Tasks 7-10 were faithfully rebuilt (see catch-up note) and Task 11 implemented on top.
- Sound removed: deleted src/lib/sound.ts (WebAudio engine); stripped initSound/pluckCat/pluckNote/snapBack/unravelChord/CATEGORY_FREQS from ThreadMap (start/move/end pull + thread ripple), IntroOverlay (pull gesture), sound pref wiring + toggle state from TanabanaExperience, Volume2/VolumeX toggle died with the TopBar. Visual pluck ripple/twang kept (visuals only).
- mindmap.ts rebuilt: CategoryId now types/capabilities/applications/energy (2x2 layout); 22 leaves; node model changed to { title, tagline, description[], applications[], howItWorks?[], subtypes?[{name,line}], useCase? }; NODE_STATS and fact removed; six AI families written fresh (rulebased/ml/neural/genai/robotics/nextgen) each with 4-5 how-it-works bullets, 4-6 further types and a Nepal-grounded use case. Neural Networks subtypes per the user's exact list: ANN, CNN, RNN, GNN, Transformer.
- Cross-links re-anchored to live ids: neural-translation, perception-robotics, genai-creativity, agriculture-langpres, disaster-tourism (5, two within Applications).
- threads.ts: CATEGORY_POS/LEAF_X rebuilt as 2x2 (types TL, applications TR, capabilities BL, energy BR).
- Chrome.tsx reduced to ZoomControls (+ new guided-tour button, Sparkles) — TopBar/Legend/AboutDialog/ThreadsIndex deleted.
- ThreadMap: Bobbin replaced by BallOfThreads (winding-arc yarn ball, turns while pulled); root label THE MAP; aria-labels de-loomed; hint nudge "PULL A BALL OF THREADS ...".
- IntroOverlay: BobbinHandle replaced by ThreadBallHandle (rotating yarn ball, red-to-teal when hot); intro copy updated to the four branches + "enter the map".
- DetailSheet rebuilt: kicker The Map / A Main Thread / A Knot on the Thread; sections = definition, How it works (bullets), Further types (sub-branch list), A super interesting use case (tinted card), Where it shows up (chips), children chips for root/category; QR/stat/fact/cross-link chips removed.
- /card/[id] takeaway page mirrors the same sections; tour rebuilt (10 steps over 4 branches, ids ml/neural/translation/agriculture); attract captions 4 stops; layout.tsx metadata de-loomed.
- Verified: bunx tsc --noEmit clean (src/), eslint clean; agent-browser desktop 1440x900 (intro ball handle, 2x2 map, types unravel with 6 families, Neural Networks card showing How it works + ANN/CNN/RNN/GNN/Transformer + use case + Where it shows up, static /card/neural, guided tour 1/10) and iPhone 14 (intro, map, root bottom sheet); zero console/page errors. Screenshots scripts/v11-01..v11-10.

Stage Summary:
- Deliverable: the aa32342 experience restored and extended — silent, six AI families each branching into named subtypes inside the info card, with how-it-works bullets and a super interesting practical use case alongside the definition.
- Key decisions: further types presented as an in-card sub-branch list (GitBranch section) rather than ~28 new map knots — keeps the 2x2 cloth geometry and the calm minimal look the user asked for; Neural subtypes follow the user's list exactly (ANN added, SNN dropped).
- Files: src/data/mindmap.ts, src/lib/threads.ts, src/lib/sound.ts (deleted), src/components/tanabana/{ThreadMap,IntroOverlay,DetailSheet,Chrome,TanabanaExperience,TourBar,AttractMode}.tsx, src/app/card/[id]/page.tsx, src/app/layout.tsx.

---
Task ID: 12
Agent: main (Super Z)
Task: "1. only show the mindmap page.. remove the homepage. 2. in the mindmap page, can you create the central node also using threads that look like artificial brain"

Work Log:
- Homepage removed: deleted src/components/tanabana/IntroOverlay.tsx (the pull-the-thread entry gate); TanabanaExperience now renders the map directly — entered=true const (no gate state), handleEnter + intro JSX removed, chrome (zoom controls + hint) still fades in 1.2s after mount; dead .intro-fit CSS removed from globals.css. The weave-in (warp fade, thread pathLength draw, node scale-in) now plays automatically on load since Thread/ThreadMap animate from initial 0 when entered is true on mount.
- Central node redesigned: LoomEmblem (woven swatch) replaced by ThreadBrain — a side-profile brain embroidered in thread. One dark outline thread (BRAIN_OUTLINE cubic path with cerebrum dome, occiput, cerebellum bump, brain stem, temporal underside) plus a pale PAPER dashed stitch ply riding it; 14 interior gyri folds in the dhaka palette (teal central sulcus, red/orange frontal, purple/green parietal-occipital, red temporal sweep, teal lower fold, 4 thin cross-connection bridges, 3 cerebellum folia stitches); 9 synapse beads at fold ends; white sheen dash along the dome; all wrapped in scale(1.16).
- Under the brain: a PAPER appliqué ellipse with a basted dashed border lifts the glyph off the four converging root threads so they appear to dive under it; soft shadow ellipse keeps it resting on the cloth.
- Root labels repositioned below the brain (deva y76, title y103, kicker y123) and all three now carry a PAPER paintOrder=stroke halo where the outgoing threads pass; NodeShell ringR 52→72 to match the larger glyph.
- Verified: tsc clean (src/), eslint clean (pre-existing warnings only in examples/skills); agent-browser desktop 1440x900 — map lands directly with no intro, brain renders with threads diving under the patch, clicking the brain opens the root info card, tapping "Types of AI" ball unravels its six family knots, zero page errors; iPhone 14 — brain framed on load, labels readable. Screenshots scripts/v12-01..v12-07 + zoom crop scripts/v12-brain-crop.png.

Stage Summary:
- Deliverable: the mind map IS the homepage — no entry gate — and the map's heart is now a thread-embroidered artificial brain that the four branch threads feed into.
- Key decisions: brain silhouette + gyri hand-drawn as cubic thread paths in the existing 5-colour palette so the centerpiece stays on the cloth-craft language; appliqué patch instead of a hard card backing keeps the embroidered feel while preserving root-card tap target and label legibility.
- Files: src/components/tanabana/{ThreadMap,TanabanaExperience}.tsx, src/components/tanabana/IntroOverlay.tsx (deleted), src/app/globals.css.

---
Task ID: 13
Agent: main (Super Z)
Task: "yes please" — implement the three offered brain-life enhancements: gentle breathing, synapse beads twinkling in attract mode, thread-by-thread glint on guided-tour start.

Work Log:
- Breathing: ThreadBrain content now lives inside a motion.g pulsing scale [1, 1.02, 1] (4.4s, easeInOut, infinite) with transformBox fill-box / transformOrigin center (same pattern as NodeShell, so no SVG/CSS transform conflict); static under prefers-reduced-motion. Verified live via DOM sample — transform read scale(1.01452) mid-pulse.
- Attract twinkle: ThreadMap gained a required `attract` prop (wired from TanabanaExperience); synapse beads became motion.circle — in attract they loop opacity [0.2,1,0.2] + r [1.4,2.4,1.4] staggered i*0.42s, otherwise rest at full opacity. Verified in ?idle=4 attract mode: two DOM samples 0.9s apart showed radii animating (1.85→1.75, 1.40→2.36, 1.76→2.22, 2.36→1.54).
- Tour glint: TanabanaExperience now keeps a tourSeq counter bumped in startTour and passes it to ThreadMap (new required `tourSeq` prop) → ThreadBrain glintSeq. On glintSeq > 0 a keyed overlay group replays: white pulses sweep the outline then each of the 14 folds (opacity [0,0.9,0], 0.6s, staggered 0.12s ≈ 2.5s total). First implementation used setState-in-effect (React Compiler lint error) — replaced with the counter-prop pattern. Verified: tour start screenshot caught the white pulse mid-sweep on central folds.
- Reduced motion: breathing static, twinkle/glint suppressed (glintSeq passed as 0, sparkle gated on live).
- Verified: tsc clean (src/), eslint clean; desktop + iPhone 14 zero page errors. Screenshots scripts/v13-01..v13-04.

Stage Summary:
- Deliverable: the thread-brain centerpiece is now alive — it breathes, its synapses twinkle for an idle room, and it flashes thread-by-thread when the guided tour begins.
- Key decisions: all three effects run through framer-motion on SVG with the fill-box transform pattern; tour start is signalled by a counter prop instead of an effect (React Compiler-safe); everything degrades to static under prefers-reduced-motion.
- Files: src/components/tanabana/{ThreadMap,TanabanaExperience}.tsx.

---
Task ID: 14
Agent: main (Super Z)
Task: "remove 'Pull a ball of threads to weave it knots. Drag a knot to read'" + "there is this faded blobs and thread for the expansion of each node.. it looks ugly, please hide it"

Work Log:
- Hint removed: the first-visit nudge <p> ("PULL A BALL OF THREADS TO WEAVE ITS KNOTS · DRAG A KNOT TO READ" + sm:hidden mobile variant "PULL A BALL OF THREADS · DRAG A KNOT") deleted from TanabanaExperience.tsx; chromeVisible state kept (ZoomControls still uses it).
- Ghost stub-threads removed: the "ghost hints for un-unravelled branches" block in ThreadMap.tsx (22 faint dashed colour lines from each category ball to its future leaf positions) deleted outright.
- Ghost '?' knots removed: leaf knots no longer render a pre-woven placeholder — the dashed circle + "?" glyph (opacity 0.45) is gone; un-unravelled leaves now simply return null, so the cloth stays empty until the branch is pulled. Comment updated to "knots appear when their branch is woven".
- Cleanups: dead catIdx constant dropped from the leaf map; wefts/warp cloth texture and CATEGORY_POS verified still used elsewhere (imports unchanged).
- Verified: bunx tsc --noEmit clean (src/), eslint clean on both edited files; agent-browser desktop 1440x900 — initial map shows no hint bar and no ghosts, tapping the Types of AI ball still unravels its six family knots with the detail card opening; iPhone 14 — brain framed, no hint text; zero page errors, zero console warnings. Screenshots scripts/v14-01..v14-03.

Stage Summary:
- Deliverable: a calmer first impression — the cloth now shows only what exists (brain, four branch threads, balls of threads); expansion is discovered by pulling, not pre-announced by faded scaffolding.
- Key decisions: full removal instead of opacity 0 (no dead DOM, no stray transitions); ghost placeholders removed rather than restyled per the user's "hide it".
- Files: src/components/tanabana/{TanabanaExperience,ThreadMap}.tsx.

---
Task ID: 15
Agent: main (Super Z)
Task: "please remove all the unrequired and unecessary files ... just keep the only required fields"

Work Log:
- Usage-traced every source file before deleting (rg import graph), then removed:
  - 45 of 47 shadcn/ui components in src/components/ui (kept only button.tsx used by Chrome/TourBar and sheet.tsx used by DetailSheet; lib/utils.ts stays as their dependency).
  - src/hooks/use-toast.ts (orphaned toast chain — toaster/toast deleted with the ui sweep; use-mobile.ts KEPT: DetailSheet imports useIsMobile).
  - src/app/api/route.ts (scaffold "Hello, world!" health route; .zscripts/dev.sh probes / not /api).
  - public/logo.svg (unreferenced anywhere).
- Scaffold/dev-artifact removal: examples/ (websocket demo), mini-services/ (empty), tests/ (3 runtime shell scripts duplicated in .zscripts), tool-results/ contents, scripts/ contents (110 dev screenshots from v2-v14 + crop_brain.py + spool-preview.html), dev.log truncated (dev.sh re-tees), tsconfig.tsbuildinfo (regenerates).
- Kept deliberately: prisma/ + db/ + db.ts + api/threads route (.zscripts/dev.sh runs `bun run db:push` on every start — platform DB contract, and the API still serves the visitor fringe), skills/ + .zscripts/ + upload/ (platform infrastructure), robots.txt, download/, worklog.md, all configs/env/bun.lock.
- Project footprint excluding node_modules/.next/.git/skills: ~150 MB -> 1.4 MB.
- Verified after cleanup: bunx tsc --noEmit clean for src/ (only pre-existing errors inside platform skills/), `eslint .` fully clean for the first time (old examples/skills lint noise gone with the folders), dev server HTTP 200, map renders (scripts/final-check.png), /api/threads still returns JSON, zero page errors.

Stage Summary:
- Deliverable: a minimal project tree — only files the running app (or the platform start/build scripts) actually require.
- Key decisions: usage-traced deletions instead of guessing (saved use-mobile.ts and the prisma chain from false-positive deletion); platform-owned dirs (skills/, .zscripts/, upload/) left untouched.
- Files deleted: 45 ui components, use-toast.ts, api/route.ts, logo.svg, examples/, mini-services/, tests/, tool-results/*, scripts/* artifacts.

---
Task ID: 16
Agent: main (Super Z)
Task: Fix reported console hydration error — "A tree hydrated but some attributes of the server rendered HTML didn't match the client properties" with diff `data-new-gr-c-s-check-loaded` / `data-gr-ext-installed` on <body>.

Work Log:
- Diagnosed: those two attributes are Grammarly's browser-extension fingerprint — the extension mutates <body> before React hydrates, so the server HTML (without them) mismatches the client DOM. Not an app-logic bug; React's error text itself lists extensions as a cause.
- Fix: added suppressHydrationWarning to <body> in src/app/layout.tsx (it already sat on <html> from the scaffold, but the mismatch occurred one level down). Comment added explaining why. suppressHydrationWarning only silences attribute/one-level content warnings for that element — deeper hydration mismatch checking and all app behaviour unchanged.
- Verified: tsc clean (src/), eslint clean on layout.tsx, live reload — agent-browser console shows zero hydration/error/warning messages, zero page errors.

Stage Summary:
- Deliverable: hydration console error gone for visitors running Grammarly (and similar attribute-injecting extensions like Dark Reader / LastPass).
- Key decisions: suppress at <body> (canonical Next.js approach for extension-injected attributes) rather than fighting the extension.
- Files: src/app/layout.tsx.
