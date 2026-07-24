# A-Maze-ing Race

[![Tests](https://github.com/bryanluu/a-maze-ing-race-web/actions/workflows/test.yml/badge.svg)](https://github.com/bryanluu/a-maze-ing-race-web/actions/workflows/test.yml)
[![Deploy to GitHub Pages](https://github.com/bryanluu/a-maze-ing-race-web/actions/workflows/deploy.yml/badge.svg)](https://github.com/bryanluu/a-maze-ing-race-web/actions/workflows/deploy.yml)

A browser maze game built with vanilla TypeScript and jQuery — no framework, no bundler. Generate a random maze, explore it under a fog-of-war visibility box, collect artifacts, and escape before the timer runs out.

Play it live: https://bryanluu.github.io/a-maze-ing-race-web/

## Gameplay

- **Move** with the arrow keys or the on-screen D-pad.
- **Collect artifacts** (stars) scattered around the maze for bonus points.
- **Reach the end tile** before time runs out to escape.
- Your score is based on artifacts collected and time remaining.

### Settings

- **Width / Height** — maze dimensions (3–20 tiles per side).
- **Visibility** — how much of the maze is revealed around the player (Small / Medium / Large / Infinite).
- **Memory** — whether previously seen tiles stay revealed, or fog back over once out of view.

## How it works

The maze is generated with a randomized minimum spanning tree (Prim's algorithm) over a grid graph with random edge weights, so every playthrough produces a different layout. The start and end tiles are chosen as the two mutually-furthest points in the maze (via repeated furthest-node search), which keeps the path from being trivially short.

Player position and camera panning happen through jQuery `.animate()` callbacks, and the game logic is decoupled from movement via custom DOM events (`playermove`, `playermoving`, `playerrotate`, `playercollide`) dispatched from the player onto the play area.

## Project structure

```
index.html         entry point (loads jQuery from CDN, then index.js)
index.js           game orchestration: DOM wiring, timer, settings, input handling
src/
  maze.ts            Graph: maze generation, grid layout, rendering
  heap.ts            generic binary heap (priority queue for maze generation)
  player.ts          Player: movement, rotation, collisions, fog-of-war visibility
  artifact.ts        Artifact: collectible items
test/
  maze.test.ts       tests for maze generation
  heap.test.ts       tests for the heap
  player.test.ts     tests for Player movement, collisions, visibility
  artifact.test.ts   tests for Artifact placement
style.css          game styling
reset.css          CSS reset
public/assets/     SVG art assets
```

## Development

This project has **no bundler** — `src/*.ts` files are compiled directly to sibling `.js` files (with source maps), and those compiled `.js` files are what `index.html` actually loads in the browser. The compiled output is *not* committed (it's gitignored), so after cloning — and after editing any file in `src/` — you need to (re)compile before there's anything for the browser to load:

```bash
npm run build
```

TypeScript here is used purely for type-checking / editor support (via `tsconfig.json`, `moduleResolution: "bundler"`) — it doesn't bundle or minify anything. Babel + `babel-preset-typescript` handles the type-stripping for Jest tests only. Deploys to GitHub Pages run this same build step in CI (see `.github/workflows/deploy.yml`).

### Running locally

```bash
npm run build
npm run dev
```

then open the served game at the printed local URL (`npm run dev` runs `npx serve .`).

### Running tests

```bash
npm test
```

Runs the Jest suite (`test/*.test.ts`) covering maze generation, the heap, and the Player/Artifact DOM logic.

## Tech stack

- TypeScript (type-checking only, no emit-based build pipeline)
- jQuery (DOM manipulation, animation)
- Jest + Babel (testing)
- Plain CSS (Grid-based maze layout, custom properties for theming)

## License

GPL-3.0-or-later — see [LICENSE](LICENSE).
