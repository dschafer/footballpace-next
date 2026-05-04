export const globalDataCacheTag = "data";
export const teamColorsCacheTag = "team-colors";

export function leagueCacheTag(league: string, year: number): string {
  return `league:${league}:${year}`;
}

export function matchesCacheTag(league: string, year: number): string {
  return `matches:${league}:${year}`;
}

export function fixturesCacheTag(league: string, year: number): string {
  return `fixtures:${league}:${year}`;
}

export function paceSheetsCacheTag(league: string, year: number): string {
  return `pace-sheets:${league}:${year}`;
}

export function targetPaceSheetsCacheTag(
  league: string,
  year: number,
  targetFinish: number,
): string {
  return `pace-sheets:${league}:${year}:${targetFinish}`;
}
