import { ExtendedStandingsRow } from "./prisma";

export function sortStandings(
  standings: ExtendedStandingsRow[],
): ExtendedStandingsRow[] {
  return standings.sort(
    (a, b) => b.points - a.points || b.gd - a.gd || b.goalsFor - a.goalsFor,
  );
}
