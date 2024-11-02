import { ExtendedStandingsRow } from "./pace/standings";

export function sortStandings(
  standings: ExtendedStandingsRow[],
): ExtendedStandingsRow[] {
  return standings.sort(
    (a, b) => b.points - a.points || b.gd - a.gd || b.goalsFor - a.goalsFor,
  );
}
