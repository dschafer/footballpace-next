export function matchesCacheTag(league: string, year: number): string {
  return `matches:${league}:${year}`;
}

export function fixturesCacheTag(league: string, year: number): string {
  return `fixtures:${league}:${year}`;
}

export function paceSheetsCacheTag(league: string, year: number): string {
  return `pace-sheets:${league}:${year}`;
}

export function teamsCacheTag(league: string, year: number): string {
  return `teams:${league}:${year}`;
}

export function targetPaceSheetsCacheTag(
  league: string,
  year: number,
  targetFinish: number,
): string {
  return `pace-sheets:${league}:${year}:${targetFinish}`;
}
