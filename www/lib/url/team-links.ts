export function teamPath(
  league: string,
  year: number | string,
  team: string,
): string {
  return `/${league}/${year}/team/${encodeURIComponent(team)}`;
}
