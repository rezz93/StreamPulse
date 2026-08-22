---
name: testing-tmdb-sync
description: How to exercise StreamPulse's TMDB list-sync UI (shows/TV + movies lists) end-to-end without TMDB credentials, including how to get movies into the watchlist and how to verify outgoing TMDB v4 requests.
---

# Testing the TMDB sync / watchlist export UI

## Which build to test
The live app users hit is the **static GitHub Pages build**, where `src/apiClient.ts`
answers `/api/*` in the browser. Prefer it:

```bash
VITE_BASE_PATH=/StreamPulse/ npm run build:static
npx vite preview --outDir dist --port 4173 --base /StreamPulse/   # open /StreamPulse/
```

Server mode (`npm run dev`, port 3000) shares the same `shared/` logic through Express;
run only one of the two at a time (same checkout/dist). Server endpoints can be probed with
curl for guard-rail behavior, e.g. `POST /api/tmdb/create-list` with an empty `writeToken`
returns 401 `"Paste your TMDB API Read Access Token…"`.

## Getting movies into the watchlist with no TMDB key
The seeded catalog (`server/seriesData.ts`) contains **TV only** — no item has
`mediaType: 'movie'`, so the "Movies" tab is empty and the TMDB browse/import flow needs a
TMDB key that may not be provisioned. Workaround: after `build:static`, patch the baked
catalog `dist/api/series.json` (test data only, no source changes) by cloning an existing
entry with `mediaType: 'movie'`, a unique `id`, and a real `tmdbId` (e.g. Inception 27205,
The Matrix 603). The movies then appear in the "Movies" tab and can be watchlisted through
the UI via each card's bookmark button.

Give one fixture a pre-2020 `year`, the matching `decade` (e.g. `'90s'` for 1999) and
`isClassic: true` if you also need a **classic movie** in the "Classic & Older Series" tab —
otherwise the Classics media-kind selector (`#classic-media-btn-all|series|movies`, composing
with `#decade-btn-*`) shows a Movies count of 0 and cannot be exercised.

## Modal facts worth knowing
- Open via the **TMDB Sync** button in the header.
- Shows/TV list id defaults to `8687068` (`localStorage.streampulse_tmdb_list_id`);
  movies list id is blank by default (`localStorage.streampulse_tmdb_movie_list_id`).
- The save path runs on the Sync / 1-Click Authorize clicks (`handleSaveSettings`), not on
  blur — click one of those before reloading to test persistence.
- `Open shows list on TMDB` / `Open movies list on TMDB` links render only when the
  respective id is non-empty; TMDB slugifies `/list/<id>` on redirect, so the URL bar may
  read `/list/8687068-<slug>` — still the right id.
- With no write token in `localStorage.streampulse_tmdb_write_token`, Sync and
  "Create movies list" both short-circuit to the 1-Click Authorize guidance banner before any
  network call, so guard rails can be tested with no credentials at all.
- A pre-existing console error (`manifest icon-192.png` download error) appears on load in the
  static build; it is unrelated to feature work.

## Verifying which list each item is sent to (no real TMDB writes)
Stub `globalThis.fetch` and call the shared helper directly with `npx tsx`:

```ts
import { syncItemsToTmdbLists } from './shared/tmdbListSync';
(globalThis as any).fetch = async (url, init) => { console.log(url, init.body);
  return { ok: true, status: 200, json: async () => ({ success: true }) } as any; };
```
Use a token string longer than 40 chars — `assertBearerToken` rejects shorter ones as v3 keys.
This shows the exact `POST /4/list/<id>/items` bodies per media kind.

## Verifying un-favorite → TMDB removal from the real UI (static build)
In the static build the TMDB v4 call is made **from the browser**, so an in-page `fetch` stub
captures it. Run this in the page (via the console/CDP) right after a reload, before clicking:

```js
localStorage.setItem('streampulse_tmdb_write_token', 'FAKE_TEST_WRITE_TOKEN_0000000000000000000000000000_pr7'); // >40 chars
localStorage.setItem('streampulse_tmdb_list_id', '8687068');
localStorage.setItem('streampulse_tmdb_movie_list_id', '1234567'); // '' ⇒ movies fall back to the TV list
window.__tmdbCalls = []; window.__tmdbStatus = 200;   // set 401 to simulate an expired token
const orig = window.fetch;
window.fetch = async (input, init = {}) => {
  const url = typeof input === 'string' ? input : input.url;
  if (url.includes('api.themoviedb.org')) {
    window.__tmdbCalls.push({ url, method: init.method, authorization: (init.headers||{}).Authorization, body: init.body });
    const ok = window.__tmdbStatus === 200;
    return new Response(JSON.stringify(ok ? { results: [{ success: true }] } : { status_message: 'expired' }),
                        { status: window.__tmdbStatus });
  }
  return orig(input, init);
};
```

Then un-favorite a card (bookmark button on the card, or from My Watchlist) and read
`window.__tmdbCalls`. Expected: one `DELETE https://api.themoviedb.org/4/list/<id>/items`,
`Authorization: Bearer <token>`, body `{"items":[{"media_type":"tv"|"movie","media_id":<tmdbId>}]}`,
plus a bottom-right `role="status"` toast naming the title and `#<listId>`.

Guard rails worth re-testing, they are easy to regress:
- **No write token stored** ⇒ no TMDB request at all and *no toast* (the card still leaves the
  watchlist). Verify `window.__tmdbCalls.length === 0`, not just the absence of an error.
- A stubbed **401** must clear `localStorage.streampulse_tmdb_write_token` and toast
  "TMDB authorization expired…"; every later un-favorite is then silent.
- Reloads wipe the stub — reinstall it after each reload, and remember `localStorage` writes
  only take effect for code paths read at click time.

## Devin Secrets Needed
- None for the above. Real TMDB writes would need `TMDB_READ_ACCESS_TOKEN` (or `TMDB_API_KEY`)
  plus a user-approved v4 write token, which requires a real TMDB account — avoid unless the
  user explicitly provides one.

## Console/CDP gotcha
The `browser_console` tool attaches to the Chrome instance that exposes CDP. If you launch a
second `google-chrome` window for the app, console reads may target the old tab
(`location.href` returns `chrome://new-tab-page/`). Check `location.href` first; otherwise
use the app's existing window/tab or DevTools visually.
