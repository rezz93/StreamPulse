# StreamPulse

Streaming series and new-season tracker: browse a curated catalog across Netflix, Apple TV+, Max,
Prime Video, Disney+ and more, track a watchlist, and import any movie or show from TMDB.

## Local development

```bash
npm install
npm run dev      # Express + Vite on http://localhost:3000
npm run lint     # tsc --noEmit
```

Optional environment variables (`.env`, gitignored — see `.env.example`):

- `TMDB_API_KEY` (v3 key) or `TMDB_READ_ACCESS_TOKEN` (v4 token) — server-side TMDB credential.
  Without one, each visitor pastes their own key into the "Add from TMDB" dialog.
- `GEMINI_API_KEY` — AI season intelligence.

## Deployments

### Full app (Express)

```bash
npm run build && npm start
```

Serves the built client plus every `/api/*` route, the Bingecat/Stremio addon, and TMDB list sync.

### Static build (GitHub Pages)

GitHub Pages cannot run the Express server, so the static build bakes the catalog into JSON at
build time and talks to TMDB and TVMaze directly from the browser:

```bash
VITE_BASE_PATH=/StreamPulse/ npm run build:static
npm run preview:static
```

`.github/workflows/pages.yml` does this on every push to `main`. It requires **Settings → Pages →
Build and deployment → Source = GitHub Actions** (not "Deploy from a branch"; serving the repo
directly yields a blank page because the app has to be compiled).

In the static build:

- The catalog, provider filters, watchlist, and global TVMaze search all work.
- TMDB search and imports work with a visitor-supplied key (stored in their browser only);
  imported titles persist in `localStorage` instead of `data/tmdb-catalog.json`.
- TMDB list sync works too: the v4 approval flow and list writes run against
  `api.themoviedb.org` from the browser, so no server is involved.
- AI season intelligence and the Bingecat/Stremio addon are unavailable and report as much,
  since they need the server.

### Syncing your watchlist to TMDB

Sync targets TMDB's built-in account watchlist (`themoviedb.org/u/<user>/watchlist`) by default;
the list ID fields are optional extras. Writing to TMDB needs your account's permission, not just
an API key:

1. Paste your **API Read Access Token** (themoviedb.org/settings/api) into the TMDB modal.
2. Click **1-Click TMDB Authorize** and approve the request on themoviedb.org.
3. Come back and click **Complete Sync** — the write token is kept in `localStorage` so later
   syncs are one click.

A TMDB *list* (`themoviedb.org/list/<id>`) is not the same thing as TMDB's built-in
"My Watchlist". Nuvio can read a list directly by its numeric ID, but a Stremio TMDB catalog
labelled "TMDB Watchlist" exposes your account watchlist instead, so **Also mirror to TMDB
"My Watchlist"** is on by default and both list ID fields may be left blank: syncs and
un-favorites then only write the account watchlist (`POST /3/account/{id}/watchlist`), which the
same one-click approval covers — the v4 user token is converted into a v3 session. Fill in a list
ID to keep a custom list updated alongside it; that write is separate, and a failing account
watchlist mirror shows up in the sync status without undoing it.

To surface the StreamPulse list itself in Stremio (instead of the account watchlist), addons such
as [aiometadata](https://github.com/cedya77/aiometadata) can add a list as its own catalog:
in its configure page, TMDB Integration → paste `https://www.themoviedb.org/list/<list id>` →
Preview → Add. It fetches list contents through TMDB's v3 `/list/{id}` endpoint, so a list that
endpoint cannot return will come back empty and the account-watchlist mirror stays the reliable
path.
