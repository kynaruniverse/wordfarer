# Wordfarer

A cartographer-of-language puzzle game. Full concept lives in the project doc — this README covers the build.

## Workflow (Spck / Termux / GitHub Actions)

You never run `npm install` or `npm run build` locally. Edit files in Spck, commit and push from Termux (`git add -A && git commit -m "..." && git push`), and GitHub Actions builds + deploys to GitHub Pages automatically on every push to `main`.

**One-time setup, from a browser (not Termux):**
1. Push this repo to GitHub.
2. Repo Settings → Pages → Source → "GitHub Actions".
3. Confirm the `base` in `vite.config.ts` matches your repo name: `/your-repo-name/`.
4. Push to `main` — check the Actions tab for the build, then visit the Pages URL.

**Local editing loop:**
1. Edit content JSON (`src/content/*.json`) or component files in Spck.
2. `git add -A && git commit -m "..." && git push`
3. Watch the Actions tab. If `check-content` or `tsc` fails, the log tells you exactly which file/line.

## What's actually built right now

- Full craft engine (`src/engine/`): recipe matching, multi-step reachability, the "ingredient missing" nudge, the tiered Ink hint system.
- Persistence (`src/persistence/`): IndexedDB save + versioned schema + JSON export/import.
- One playable region — **The Coastal Fog** — 9 expeditions, several multi-step chains, one Landmark Expedition (rainbow).
- Full Workbench/Wordbank split UI, tabbed by category, with the ink-bloom craft animation.
- 3 sample Daily Dispatch puzzles.

## What's NOT built yet (by design — see doc's validation priorities)

- Region map screen (currently jumps straight into the next incomplete expedition)
- Fieldbook UI (data is tracked in save state, no screen yet)
- Ink spending UI / hint buttons (engine functions exist, not wired to buttons)
- Web ad integration
- Daily Dispatch screen (content exists, no dedicated UI yet)
- Region-select / world map

This is deliberately scoped to validation priority #1 from the concept doc: prove the Workbench/Wordbank UI works before building everything around it.

## Adding content safely

Always run `npm run check-content` (or just push — CI runs it for you) after editing `words.json`, `recipes.json`, or a region file. It catches typo'd word ids before they ship as a broken expedition.

## Testing on your phone before pushing

There's no local dev server in this workflow, so the fastest check is:
1. Read the diff carefully (Spck shows it).
2. Push to a branch, not `main`, if you want to preview via a PR without touching the live site — Pages won't rebuild until you merge.
