import { fetchProjectedStandings } from "./projections";
import prisma from "@/lib/prisma";

export type PaceMatch = {
  delta: number;
  date: Date;
  homeTeam: string;
  awayTeam: string;
  ftHomeGoals: number;
  ftAwayGoals: number;
  points: number;
  expectedPoints: number;
  home: boolean;
  opponent: string;
  opponentFinish: number;
};

export type PaceTeam = {
  team: string;
  matches: PaceMatch[];
  points: number;
  pace: number;
  delta: number;
};

export async function fetchPaceTeams(
  league: string,
  year: number,
): Promise<PaceTeam[]> {
  let [allStandings, projectedStandings, allMatches, allPaceSheets] =
    await Promise.all([
      prisma.standingsRow.findMany({
        where: { league: league, year: year },
      }),
      fetchProjectedStandings(league, year),
      prisma.match.findMany({
        where: { league: league, year: year },
        orderBy: { date: "asc" },
      }),
      prisma.paceSheetEntry.findMany({
        where: { league: league, year: year, teamFinish: 1 },
      }),
    ]);
  allStandings = allStandings.sort(
    (a, b) => b.points - a.points || b.gd - a.gd || b.goalsFor - a.goalsFor,
  );

  const teamToFinish = new Map(
    allStandings.map(({ team }, i) => [team, i + 1]),
  );
  const paceSheetMap = new Map(
    allPaceSheets.map(({ opponentFinish, home, expectedPoints }) => [
      `${opponentFinish}_${home}`,
      expectedPoints,
    ]),
  );

  let paceTeams: Array<PaceTeam> = allStandings
    .map(({ team, points }) => {
      const teamFinish = teamToFinish.get(team)!;
      const matches = allMatches
        .filter(
          ({ homeTeam, awayTeam }) => homeTeam == team || awayTeam == team,
        )
        .map((match) => {
          return {
            ...match,
            opponent: team == match.homeTeam ? match.awayTeam : match.homeTeam,
            home: team == match.homeTeam,
          };
        })
        .map((match) => {
          return {
            ...match,
            opponentActualFinish: teamToFinish.get(match.opponent)!,
            points:
              match.ftResult == "D"
                ? 1
                : (match.ftResult == "H" && match.home) ||
                    (match.ftResult == "A" && !match.home)
                  ? 3
                  : 0,
          };
        })
        .map((match) => {
          return {
            ...match,
            // We assume that we will finish first for pace...
            // so if they're ahead of us in the table, bump them down one
            opponentFinish:
              match.opponentActualFinish < teamFinish
                ? match.opponentActualFinish + 1
                : match.opponentActualFinish,
          };
        })
        .map((match) => {
          return {
            ...match,
            expectedPoints: paceSheetMap.get(
              `${match.opponentFinish}_${match.home}`,
            )!,
          };
        })
        .map((match) => {
          return {
            ...match,
            delta: match.points - match.expectedPoints,
          };
        });
      const delta = matches
        .map(({ delta }) => delta)
        .reduce((s, a) => s + a, 0);
      const pace = matches
        .map(({ expectedPoints }) => expectedPoints)
        .reduce((s, a) => s + a, 0);
      return { team, matches, points, pace, delta };
    })
    .sort((a, b) => b.delta - a.delta || b.points - a.points);

  return paceTeams;
}
