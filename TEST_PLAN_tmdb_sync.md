# Test Plan — TMDB list sync in the static build (PR #3)

Env: static build served at http://localhost:4173/StreamPulse/ (`VITE_BASE_PATH=/StreamPulse/ npm run build:static` + `vite preview`).
No TMDB credentials exist in this environment (`list_secrets` = none), so real list writes cannot be proven;
plan is designed so a broken implementation still shows visibly different results using fake tokens.

UI path (traced): Header "TMDB Sync" button (src/components/Header.tsx:144-152) opens TmdbSyncModal
(src/App.tsx:467), default tab "1. Sync to TMDB List" (TmdbSyncModal.tsx:284).
Fields: "Your TMDB List ID or URL" (line 321), password field "TMDB API Read Access Token (required for sync)" (line 348).
Buttons: "Sync N Shows to TMDB" (line 359-366), "1-Click TMDB Authorize" (line 369-377).

## T1 — Token field starts empty (no hard-coded token)
Steps: fresh profile (clear localStorage), open modal, sync tab. Reveal field value via zoom/screenshot of the
password input (dots count) and confirm placeholder text "Paste your TMDB API Read Access Token, then click
1-Click TMDB Authorize" is visible (placeholder only renders when value is empty).
PASS: placeholder visible / field empty. FAIL: field shows a long masked value (old baked-in eyJ... token).

## T2 — Sync with no stored write token gives the permission message (not 501 "static build" error)
Steps: with list ID prefilled (8687068) and token field empty, click "Sync N Shows to TMDB".
PASS: red status banner contains 'TMDB needs your permission before StreamPulse can write to a list. Click
"1-Click TMDB Authorize" to grant it.'
FAIL: banner says "needs the StreamPulse server and is unavailable in the static build", or any green success.

## T3 — Short value validated locally (v3-key error, no network call)
Steps: type `abc123` in the token field, click "1-Click TMDB Authorize".
PASS: banner contains 'That looks like a v3 API key' and mentions "API Read Access Token"; DevTools Network
panel shows NO request to api.themoviedb.org for this click.
FAIL: 501/"unavailable in the static build", or a network request to /4/auth/request_token, or no error.

## T4 — Long fake bearer token hits TMDB directly from the browser
Steps: replace token with a 200-char fake `eyJ...`-style string, click "1-Click TMDB Authorize". Inspect
DevTools Network.
PASS: a POST to `https://api.themoviedb.org/4/auth/request_token` appears (status 401) AND the banner shows
TMDB's own message (e.g. "Invalid API key: You must be granted a valid key." / similar status_message).
FAIL: no request to api.themoviedb.org (i.e. request went to localhost/api or returned 501), or generic
StreamPulse-only error.

## T5 — Paste-once: search/import flow reuses the token
Steps: after T4 (token saved via handleSaveSettings on sync click), close modal, click header "Add from TMDB",
search "breaking".
PASS: no "add your TMDB API key" prompt / no key-entry gate; instead a TMDB 401-derived error surfaces
(proving stored `streampulse_tmdb_token` was used).
FAIL: modal asks to paste a TMDB API key.

## T6 — Regression (shell/curl): server build 4xx not 500
Steps: stop preview, `npm run dev` (:3000), curl POST /api/tmdb/auth-start, /api/tmdb/auth-complete,
/api/tmdb/sync-to-list with empty/short tokens.
PASS: HTTP 4xx with JSON `error` message strings (401/400), no 500 and no HTML error page.

## T7 — Regression (static build sanity)
Steps: reload /StreamPulse/, confirm catalog cards render, add a title to watchlist via UI, confirm watchlist
count increments and no console errors besides the expected TMDB 401s.
PASS: catalog visible, watchlist toggle works.
