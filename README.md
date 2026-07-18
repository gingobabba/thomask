# Thomask Hon'bluray — Investigator Field Record

A living **Pathfinder 1e** character sheet for Thomask Hon'bluray, Gnome Investigator (Empiricist archetype), built as a table companion and styled as a detective's field notebook — kraft cover, ruled cream pages, typewriter numerals.

It's a reactive sheet: change your state (HP, bombs, conditions, active buffs) and the dice roller, resource trackers, and AI turn-optimizer all respond in real time.

## Features

- **State-aware dice roller.** Quick-roll chips show live modifiers (a bomb attack reads +17 normally, +23 with Studied Combat up). Every roll opens a ledger showing each modifier as a line item, supports one-off situational bonuses, and chains attack → damage → Studied Strike.
- **Full crit flow.** Per-weapon threat ranges (bomb 20, rapier 18–20, dagger/crossbow 19–20), confirmation rolls, and correct ×2 damage — with precision damage (Studied Strike) never multiplied.
- **Inspiration engine.** Auto-applies 2d8-take-higher (Tenacious Inspiration) and spends uses correctly: free on Knowledge/Perception/Sense Motive/Diplomacy (Expanded Inspiration), 1 for other skills, 2 for attacks and saves.
- **Effects & conditions.** Buffs and the full PF1 condition set tick down each round and modify rolls automatically.
- **Extracts.** Daily prep interface with per-level slots, save DCs, and auto-applied buff durations when consumed.
- **Editable skills.** All 35 skills with their contributing columns (ability + ranks + class + misc = total). Ranks and misc are editable; Empiricist INT-based skill swaps (Ceaseless Observation) are encoded.
- **Persistent turn optimizer.** Reads current state and priority mode (Damage / Control / Survive / Utility) and recommends the turn.
- **Rules search** locked to [d20pfsrd.com](https://www.d20pfsrd.com/), annotated with Thomask's own numbers.
- **Level-up flow** that applies base changes (level, HP, BAB) and fetches your talent/feat picks.
- **Local persistence** — state saves to `localStorage` and survives reloads.

## Running locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

## The AI features & the proxy

The turn optimizer, rules search, and level-up advisor call the Anthropic API. The key must never live in client-side code, so this repo includes a small proxy that holds it server-side. The browser calls `/api/claude`; the proxy adds the key and forwards to Anthropic. Everything else — sheet, dice roller, crit flow, inspiration, effects, extracts — runs fully client-side with no API needed.

Two ways to run the proxy:

### Deploy to Vercel (recommended)

Static app + serverless function deploy together, so `/api/claude` just works.

1. Push this repo to GitHub.
2. In the [Vercel dashboard](https://vercel.com/new), import the repo.
3. Add environment variables: `ANTHROPIC_API_KEY` (required) and optionally `CLAUDE_MODEL` (defaults to `claude-sonnet-5`).
4. Deploy. `api/claude.js` becomes the function; `vercel.json` handles SPA routing.

### Self-host with the Express server

One Node process serves the built app and the proxy.

```bash
cp .env.example .env        # then fill in ANTHROPIC_API_KEY
npm install
npm run build
npm run server              # http://localhost:8787
```

### Local development

Run the app and proxy in two terminals — Vite proxies `/api` to the Express server:

```bash
npm run server              # terminal 1 — proxy on :8787
npm run dev                 # terminal 2 — app on :5173
```

> **Model note:** the component sends `claude-sonnet-4-6` (the artifact model string); the proxy overrides it with `CLAUDE_MODEL` so standalone deploys use a model your key can access. Set `CLAUDE_MODEL` to whatever you have access to.

### GitHub Pages?

Pages is static-only and can't run the proxy, so the AI features won't work there. The sheet and dice roller would, but for the full app use Vercel or the Express server.

## Tech

React 18 · Vite 5 · lucide-react. No CSS framework; the notebook theme is a hand-built token system in the component.

## License

MIT — see [LICENSE](LICENSE).
