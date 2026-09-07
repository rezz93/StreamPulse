import fs from 'fs';
import path from 'path';
import { INITIAL_SERIES_DATABASE, PROVIDERS } from '../server/seriesData';
import { MOVIES_DATABASE } from '../server/moviesData';
import { IMDB_MAPPING, getAddonManifest, seriesToMetaItem, seriesToFullMeta } from '../server/bingecatAddon';

const outDir = process.argv[2] || 'dist/api';
fs.mkdirSync(outDir, { recursive: true });
const distDir = path.resolve(outDir, '..');

const combinedSeries = [
  ...INITIAL_SERIES_DATABASE.map(s => {
    const mapping = IMDB_MAPPING[s.id];
    return {
      ...s,
      imdbId: s.imdbId || mapping?.imdbId
    };
  }),
  ...MOVIES_DATABASE
];

// Write providers.json
const providersPath = path.join(outDir, 'providers.json');
fs.writeFileSync(providersPath, JSON.stringify(PROVIDERS, null, 2), 'utf8');
console.log(`Wrote ${PROVIDERS.length} providers to ${providersPath}`);

// Write series.json
const seriesPath = path.join(outDir, 'series.json');
fs.writeFileSync(seriesPath, JSON.stringify({ total: combinedSeries.length, series: combinedSeries }, null, 2), 'utf8');
console.log(`Wrote ${combinedSeries.length} series and movies to ${seriesPath}`);

// Ensure .nojekyll exists in dist/ so GitHub Pages serves raw JSON files and assets
const nojekyllPath = path.join(distDir, '.nojekyll');
fs.writeFileSync(nojekyllPath, '', 'utf8');
console.log(`Created .nojekyll at ${nojekyllPath}`);

// --- Static Nuvio / Stremio Addon Generation ---
const manifest = getAddonManifest('');

function writeJson(filePath: string, data: any) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// 1. Manifest locations
const manifestPaths = [
  path.join(distDir, 'manifest.json'),
  path.join(distDir, 'stremio', 'manifest.json'),
  path.join(outDir, 'manifest.json'),
  path.join(outDir, 'stremio', 'manifest.json'),
];
for (const p of manifestPaths) {
  writeJson(p, manifest);
}
console.log(`Wrote addon manifest to ${manifestPaths.length} locations`);

// 2. Catalogs
const upcomingSeries = combinedSeries.filter(
  s => s.mediaType !== 'movie' && (s.isUpcoming || (s.nextSeasonDaysLeft !== undefined && s.nextSeasonDaysLeft > 0 && s.nextSeasonDaysLeft <= 180))
);
const renewalsSeries = combinedSeries.filter(
  s => s.mediaType !== 'movie' && (s.hasNewSeasonAlert || ['season_upcoming', 'renewed', 'in_production', 'final_season_upcoming'].includes(s.renewalState))
);
const trendingSeries = combinedSeries
  .filter(s => s.mediaType !== 'movie')
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 25);
const moviesList = combinedSeries.filter(s => s.mediaType === 'movie');
const watchlistDefaults = combinedSeries
  .filter(s => ['severance', 'the-last-of-us', 'stranger-things', 'shogun', 'the-bear', 'dune-part-two'].includes(s.id));

const catalogs: Record<string, { type: string; items: any[] }> = {
  streampulse_upcoming: { type: 'series', items: upcomingSeries },
  streampulse_renewals: { type: 'series', items: renewalsSeries },
  streampulse_trending: { type: 'series', items: trendingSeries },
  streampulse_movies: { type: 'movie', items: moviesList },
  streampulse_watchlist: { type: 'series', items: watchlistDefaults }
};

for (const [catId, { type, items }] of Object.entries(catalogs)) {
  const metaItems = items.map(seriesToMetaItem);
  const payload = { metas: metaItems };

  writeJson(path.join(distDir, 'catalog', type, `${catId}.json`), payload);
  writeJson(path.join(distDir, 'stremio', 'catalog', type, `${catId}.json`), payload);
}
console.log(`Wrote ${Object.keys(catalogs).length} catalogs`);

// 3. Meta detail files for each item
let metaCount = 0;
for (const item of combinedSeries) {
  const fullMeta = seriesToFullMeta(item);
  const payload = { meta: fullMeta };
  const type = item.mediaType === 'movie' ? 'movie' : 'series';

  const idsToWrite = new Set<string>();
  if (item.imdbId) idsToWrite.add(item.imdbId);
  idsToWrite.add(item.id);
  idsToWrite.add(`streampulse:${item.id}`);

  for (const id of idsToWrite) {
    writeJson(path.join(distDir, 'meta', type, `${id}.json`), payload);
    writeJson(path.join(distDir, 'stremio', 'meta', type, `${id}.json`), payload);
    metaCount++;
  }
}
console.log(`Wrote ${metaCount} static metadata JSON endpoints for Nuvio & Stremio`);
