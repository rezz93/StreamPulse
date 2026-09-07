# StreamPulse

Streaming series and new-season tracker: browse a curated catalog across Netflix, Apple TV+, Max,
Prime Video, Disney+ and more, track a watchlist, and discover TV shows.

The **Series** and **Movies** tabs list the catalog with streaming network filters and renewal radars.
**Find Series** searches across the directory and TVMaze public show index.

## Local development

```bash
npm install
npm run dev      # Express + Vite on http://localhost:3000
npm run lint     # tsc --noEmit
```

Optional environment variables (`.env`, gitignored — see `.env.example`):

- `GEMINI_API_KEY` — AI season intelligence.

## Deployments

### Full app (Express)

```bash
npm run build && npm start
```

Serves the built client plus every `/api/*` route and the Bingecat/Stremio addon.

### Static build (GitHub Pages)

Live site: https://rezz93.github.io/StreamPulse/

GitHub Pages cannot run the Express server, so the static build bakes the catalog into JSON at
build time and talks to TVMaze directly from the browser:

```bash
VITE_BASE_PATH=/StreamPulse/ npm run build:static
npm run preview:static
```

`.github/workflows/pages.yml` does this on every push to `main`. It requires **Settings → Pages →
Build and deployment → Source = GitHub Actions**.

In the static build:

- The catalog, provider filters, watchlist, and global series search all work.
- AI season intelligence and the Bingecat/Stremio addon are unavailable and report as much,
  since they need the server.
