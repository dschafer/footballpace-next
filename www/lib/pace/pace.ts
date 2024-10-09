import { Match } from "@prisma/client";
import { fetchProjectedStandings } from "./projections";
import prisma from "@/lib/prisma";
import { sortStandings } from "../sort";

export type PaceMatch = {
  match: Match;
  delta: number;
  cumulativeDelta: number;
  points: number;
  expectedPoints: number;
  cumulativeExpectedPoints: number;
  home: boolean;
  opponent: string;
  opponentFinish: number;
};

export type PaceTeam = {
  team: string;
  paceMatches: PaceMatch[];
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
  allStandings = sortStandings(allStandings);

  const teamToFinish = new Map(
    projectedStandings.map(({ team }, i) => [team, i + 1]),
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
      let paceMatches = [];
      let cumulativeExpectedPoints = 0;
      let cumulativeDelta = 0;
      for (const match of allMatches) {
        if (match.homeTeam != team && match.awayTeam != team) {
          continue;
        }
        const opponent =
          team == match.homeTeam ? match.awayTeam : match.homeTeam;
        const home = team == match.homeTeam;
        const opponentActualFinish = teamToFinish.get(opponent)!;
        const points =
          match.ftResult == "D"
            ? 1
            : (match.ftResult == "H" && home) ||
                (match.ftResult == "A" && !home)
              ? 3
              : 0;
        const opponentFinish =
          opponentActualFinish < teamFinish
            ? opponentActualFinish + 1
            : opponentActualFinish;
        const expectedPoints = paceSheetMap.get(`${opponentFinish}_${home}`)!;
        const delta = points - expectedPoints;
        cumulativeExpectedPoints += expectedPoints;
        cumulativeDelta += delta;
        paceMatches.push({
          match,
          opponent,
          home,
          opponentActualFinish,
          points,
          opponentFinish,
          expectedPoints,
          delta,
          cumulativeExpectedPoints,
          cumulativeDelta,
        });
      }

      const delta = paceMatches[paceMatches.length - 1].cumulativeDelta;
      const pace = paceMatches[paceMatches.length - 1].cumulativeExpectedPoints;
      return { team, paceMatches, points, pace, delta };
    })
    .sort((a, b) => b.delta - a.delta || b.points - a.points);

  return paceTeams;
}
