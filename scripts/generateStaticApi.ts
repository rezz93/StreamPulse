/**
 * Bakes the catalog endpoints the client needs into static JSON so the app can run on a
 * static host (GitHub Pages) with no Express server. Mirrors the default shape and ordering
 * of GET /api/series and GET /api/providers.
 */
import fs from 'fs';
import path from 'path';
import { IMDB_MAPPING } from '../server/bingecatAddon';
import { INITIAL_SERIES_DATABASE, PROVIDERS } from '../server/seriesData';
import { Series } from '../src/types';

const outDir = path.resolve(process.argv[2] || 'dist/api');

const series: Series[] = INITIAL_SERIES_DATABASE.map((s) => {
  const mapping = IMDB_MAPPING[s.id];
  return { ...s, imdbId: mapping?.imdbId, tmdbId: mapping?.tmdbId };
}).sort((a, b) => {
  if (a.hasNewSeasonAlert && !b.hasNewSeasonAlert) return -1;
  if (!a.hasNewSeasonAlert && b.hasNewSeasonAlert) return 1;
  return b.rating - a.rating;
});

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'providers.json'), JSON.stringify(PROVIDERS));
fs.writeFileSync(path.join(outDir, 'series.json'), JSON.stringify({ total: series.length, series }));

console.log(`Wrote ${series.length} series and ${PROVIDERS.length} providers to ${outDir}`);
