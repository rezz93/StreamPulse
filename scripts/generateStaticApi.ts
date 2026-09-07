import fs from 'fs';
import path from 'path';
import { INITIAL_SERIES_DATABASE, PROVIDERS } from '../server/seriesData';
import { MOVIES_DATABASE } from '../server/moviesData';
import { IMDB_MAPPING } from '../server/bingecatAddon';

const outDir = process.argv[2] || 'dist/api';
fs.mkdirSync(outDir, { recursive: true });

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
