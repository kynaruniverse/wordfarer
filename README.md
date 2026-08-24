# Genesis

Procedural evolution sandbox. See `genesis-concept-lock.md` and
`genesis-design-spec.md` for the full design (not included in this repo —
keep them alongside it in your notes).

## Status: engine foundation (Milestone 1 of the MVP)

**Built and tested:**
- `core/genome.ts` — deterministic seeded PRNG (mulberry32) + genome data model
- `core/inheritance.ts` — bias-toward-stronger-parent recombination
- `core/mutation.ts` — frequent subtle jitter, rare dramatic mutation
- `core/bodyPlans.ts` — quadruped + serpent archetype definitions
- `core/seed.ts` — genome ↔ short shareable string, with checksum validation
- `core/organism.ts` — organism entity + `merge()` orchestration
- `render/` — Canvas 2D shapes and per-body-plan procedural movement
- `habitat/` — active-organism state + simulation tick
- `archive/` — localStorage persistence
- `main.ts` — boots a live habitat: first run generates 3 starting organisms
  and they move around the canvas
- 12 passing tests covering determinism, range safety, and seed round-tripping

**Run it:**
```
npm install
npm run dev       # local dev server
npm test          # run the test suite
npm run build     # production build to dist/
```

On GitHub push, point Vercel at this repo with build command `npm run build`
and output directory `dist` — no other config needed, it's fully static.

## Status: full MVP loop wired (Milestone 2)

**Also built:**
- `ui/mergeInteraction.ts` — touch drag-to-merge, with a non-colour-dependent
  highlight ring on a valid target (dashed pulse, not just hue)
- `ui/revealSequence.ts` — 2–3s reveal overlay, never states what changed
- `ui/archiveView.ts` — chronological gallery + tap-to-inspect detail view
  (shows generation/discovery date only — no trait labels or stats)
- `ui/debugPanel.ts` — dev-only raw genome inspector, dynamically imported
  behind `import.meta.env.DEV` so it's fully dead-code-eliminated from the
  production bundle (verified: zero trace of it in `dist/`)
- Habitat ↔ Archive nav tab

Play loop end to end: drag one organism onto another → reveal → child is
recorded to the Archive and added to the habitat → tap the Archive tab to
browse everything discovered so far.

## What's still deferred (post-MVP per the design spec)

WebGL/shader renderer, ancestry tree view, additional body plans, multiple
habitats, environmental adaptation, parent consumption/resource cost, direct
organism interaction beyond merging, offline simulation, per-organism audio,
ambient session-direction hints. None of this should require reworking
`core/` or the screens above — see the spec's own scope reminder (§8).

## Why this order

The design spec's own architectural constraint is that `core/` must be
headless and reusable regardless of renderer. Building and testing it first
means the parts most expensive to get wrong (determinism, trait ranges,
seed integrity) are locked down before any UI work touches them.
