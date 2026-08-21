---
name: testing-streampulse
description: How to run and end-to-end test the StreamPulse app locally (dev server, TMDB credential setup, browse/search/watchlist flows) without touching the user's TMDB account.
---

# Testing StreamPulse locally

## Run the app
- `npm install` (already vendored in `node_modules` on the standard box), then `npm run dev` — a single
  `tsx server.ts` process serves the Express API **and** Vite on http://localhost:3000.
- Run it in a **persistent shell** (not `(... &)` backgrounded from a one-shot shell): backgrounded
  copies have been observed to die silently, leaving nothing listening on port 3000.
- Editing `.env` makes Vite print `.env changed, restarting server...`; in practice the Express listener
  can disappear after that. Verify with `ss -ltn | grep 3000` and restart `npm run dev` if needed.

## TMDB credential
- Almost every interesting feature (browse grids `/api/tmdb/discover`, movie search via
  `/api/series/live-search`, `/api/catalog/tmdb` import) requires a TMDB credential.
- Provide it as `TMDB_API_KEY` (v3) or `TMDB_READ_ACCESS_TOKEN` (v4) in `/path/to/StreamPulse/.env`
  (`.env*` is gitignored). Alternatively a token can be pasted at runtime in the "Add from TMDB" dialog
  (stored in localStorage, see `src/tmdbToken.ts`).
- Without a credential: `/api/tmdb/discover` returns HTTP 400 `{needsToken:true}` and live-search falls
  back to TVMaze (`source:"tvmaze"`, series only). Confirm the UI labels this honestly.
- Quick credential smoke test:
  `curl -s "http://localhost:3000/api/tmdb/discover?type=movie&page=1"` and
  `curl -s "http://localhost:3000/api/series/live-search?q=Inception&type=multi"` (check the `source` field).

### Devin Secrets Needed
- `TMDB_API_KEY` or `TMDB_READ_ACCESS_TOKEN` (read scope is sufficient for browse/search/import).

## Do NOT write to the user's TMDB account
Only these endpoints write to TMDB: `POST /api/tmdb/auth-complete`, `POST /api/tmdb/sync-to-list`,
`POST /api/tmdb/remove-from-list`. In the UI they are behind the header **"TMDB Sync"** button /
1‑Click Authorize flow. `POST /api/watchlist/sync` is local-only (Bingecat addon state).
Important: **un-favoriting** a title calls `removeFromTmdb` in `src/App.tsx`, which hits
`/api/tmdb/remove-from-list` — so never toggle a favorite off while testing with a real user token.

## UI paths for the browse / search / watchlist features
- Category tabs: **Series** (TV discover + catalog), **Movies** (film discover + catalog),
  Upcoming Premieres, New Season Radar, Classic & Older Series, **My Watchlist**.
- Discover rows are appended after the local catalog and are **hidden whenever a streaming-network
  filter other than "All Providers" is active** (they carry no provider data) — expect the grid count to
  collapse to catalog-only titles when you click e.g. "Netflix".
- "Load more <movies|series>" sits at the bottom of the grid; the heading count ("Movies (40)") is the
  cheapest way to assert a page was appended. It is hidden while a header-search query is active.
- **Tab search**: the header search box (placeholder "Search TMDB or filter by cast, genre...") also
  queries TMDB while the Series/Movies tab is active — debounced 350 ms, minimum 2 characters. The
  heading subtitle switches to `TMDB <movie|series> results for "<query>" plus matches in your catalog`,
  which is the cheapest signal that the TMDB round trip (not just a local text filter) happened.
  Dropping to 1 character or clearing restores the discover grid.
- When choosing titles to prove tab search works, prefer titles **not already in the local catalog**.
  `browseSuggestions` drops any TMDB hit whose id or `mediaType-tmdbId` already exists in the catalog,
  and `searchHitIds` is built from the surviving suggestions only — so a catalog title that is not
  currently airing can be filtered out again by the Series tab's `isNowPlaying` gate and never appear.
  Seeded catalog series include breaking-bad, the-sopranos, the-wire, mad-men, succession, twin-peaks,
  star-trek-tng, the-twilight-zone (all `isNowPlaying:false`). Check `curl /api/series` for the current
  list, and always cross-check a suspicious "0 results" against
  `curl "/api/series/live-search?q=...&type=tv"` before blaming the UI.
- Empty states are three-way: an active network filter says the tab is limited to catalog titles (reset
  to "All Providers"), a fruitless TMDB search says `TMDB returned no <movies|series> for "..."`, and the
  no-credential case points at "Add from TMDB".
- `migrateDefaultTmdbListId()` (src/tmdbSettings.ts) clears retired list ids from
  `localStorage['streampulse_tmdb_list_id']` and `['streampulse_tmdb_movie_list_id']` on every load. It is
  pure localStorage, so it can be tested safely by seeding both keys in the console and reloading — no
  TMDB request is involved.
- Global search: header button **"Find Movies & Series"** → modal "Global Movie & Series Finder" with
  media filters `Movies & Series | Movies | Series`, a `SOURCE: TMDB (MOVIES & SERIES)` /
  `TVMAZE (SERIES ONLY)` label, and per-row **Favorite** / **Inspect** buttons.
- Watchlist ids live in `localStorage['streampulse_watchlist']`; the Watchlist tab renders only titles
  present in the server catalog, and favorited TMDB rows are imported server-side into
  `data/`-persisted `importedTitles`, which is what makes them survive a reload. A row without a
  `tmdbId` (e.g. a TVMaze fallback result) may therefore vanish from the Watchlist after reload — worth
  checking whenever the TVMaze path is exercised.

## Known/possible pitfalls
- With no TMDB credential the Series/Movies tabs show an amber "No TMDB API key configured" banner with
  a Retry button and no titles beyond the local catalog. If you see a perpetual "Loading more from
  TMDB..." spinner, suspect a missing credential rather than a slow network.
- Chrome launched without `--remote-debugging-port` makes the CDP-backed console/read_dom tools
  unavailable; launch Chrome with a debugging port if you need DOM/console access, and close extra
  Chrome windows so the tools attach to the app tab. As a fallback, F12 opens Chrome DevTools and its
  Console works for localStorage seeding; beware that typed underscores are occasionally dropped by
  xdotool, so echo the value back and verify before trusting the result.
- The DevTools **Network** panel filtered on `api/` is a good way to prove no TMDB list write happened:
  favoriting a search hit should only produce `live-search`, `POST /api/catalog/tmdb` (app catalog
  import) and `POST /api/watchlist/sync` (local). Anything named `sync-to-list`/`remove-from-list` means
  the user's TMDB account was touched.
- To exercise the no-credential path, `mv .env .env.disabled`, restart the server, test, then move it
  back and restart again — verify with `ss -ltn | grep 3000` plus a `source:` curl each time.
