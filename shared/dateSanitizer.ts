import { Series } from '../src/types';

/**
 * Dynamically sanitizes and computes season renewal & premiere dates.
 * Eliminates false countdowns for dates that have already passed,
 * ensuring no series misreports a past season as "X days remaining".
 */
export function sanitizeSeriesSeasonIntel(series: Series): Series {
  const item = { ...series };
  const now = new Date();

  if (item.nextSeasonReleaseDate) {
    const releaseTime = new Date(item.nextSeasonReleaseDate).getTime();
    const diffDays = Math.ceil((releaseTime - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      // The release date has already passed!
      item.nextSeasonDaysLeft = undefined;
      item.hasNewSeasonAlert = false;
      item.isUpcoming = false;
      if (item.renewalState === 'season_upcoming') {
        item.renewalState = 'airing_now';
      }
    } else {
      // Valid future release date: dynamically calculate remaining days
      item.nextSeasonDaysLeft = diffDays;
      if (diffDays <= 180) {
        item.hasNewSeasonAlert = true;
      }
    }
  } else if (item.nextSeasonDaysLeft !== undefined) {
    // If no future release date is specified, it cannot have an active countdown
    item.nextSeasonDaysLeft = undefined;
  }

  return item;
}

export function sanitizeSeriesCatalog(catalog: Series[]): Series[] {
  return catalog.map(sanitizeSeriesSeasonIntel);
}
