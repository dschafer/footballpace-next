import type { PaceFixture, PaceTeam } from "./pace-types";
import type { PaceSheetEntry } from "@/prisma/generated/client";
import { fetchProjectedStandings } from "./projections";
import prisma from "@/lib/prisma";

export async function fetchPaceTeams(
  league: string,
  year: number,
  targetFinish: number,
): Promise<PaceTeam[]> {
  const [projectedStandings, allMatches, paceSheetMap] = await Promise.all([
    fetchProjectedStandings(league, year),
    prisma.match.findMany({
      where: { league: league, year: year },
      orderBy: { date: "asc" },
    }),
    fetchPaceSheetMap(league, year, targetFinish),
  ]);

  const teamToFinish = new Map(
    projectedStandings.map(({ team }, i) => [team, i + 1]),
  );

  const paceTeams = projectedStandings
    .map(({ team }) => {
      const teamFinish = teamToFinish.get(team)!;
      const paceMatches = [];
      let cumulativeExpectedPoints = 0;
      let cumulativeDelta = 0;
      let cumulativePoints = 0;
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
        const opponentFinishShift =
          targetFinish <= opponentActualFinish &&
          opponentActualFinish < teamFinish
            ? 1
            : targetFinish >= opponentActualFinish &&
                opponentActualFinish > teamFinish
              ? -1
              : 0;
        const opponentFinish = opponentActualFinish + opponentFinishShift;
        const expectedPoints = paceSheetMap.get(`${opponentFinish}_${home}`)!;
        const delta = points - expectedPoints;
        cumulativePoints += points;
        cumulativeExpectedPoints += expectedPoints;
        cumulativeDelta += delta;
        paceMatches.push({
          match,
          team,
          opponent,
          home,
          opponentFinish,
          opponentActualFinish,
          points,
          cumulativePoints,
          expectedPoints,
          cumulativeExpectedPoints,
          delta,
          cumulativeDelta,
        });
      }

      const delta = paceMatches[paceMatches.length - 1].cumulativeDelta;
      const pace = paceMatches[paceMatches.length - 1].cumulativeExpectedPoints;
      const points = paceMatches[paceMatches.length - 1].cumulativePoints;
      return { team, paceMatches, points, pace, delta, league, year };
    })
    .sort((a, b) => b.delta - a.delta || b.points - a.points);

  return paceTeams.map((team, i) => ({
    gap:
      i == 0
        ? null
        : {
            gapAmount: team.delta - paceTeams[0].delta,
            gapTeam: paceTeams[0].team,
          },
    interval:
      i == 0
        ? null
        : {
            intervalAmount: team.delta - paceTeams[i - 1].delta,
            intervalTeam: paceTeams[i - 1].team,
          },
    ...team,
  }));
}

export async function fetchPaceSheets(
  league: string,
  year: number,
  targetFinish: number,
): Promise<PaceSheetEntry[]> {
  return prisma.paceSheetEntry.findMany({
    where: { league: league, year: year, teamFinish: targetFinish },
  });
}

async function fetchPaceSheetMap(
  league: string,
  year: number,
  targetFinish: number,
): Promise<Map<string, number>> {
  const allPaceSheets = await fetchPaceSheets(league, year, targetFinish);
  if (allPaceSheets.length == 0) {
    throw new Error(
      `fetchPaceSheetMap() failed for league ${league} and year ${year}`,
    );
  }
  return new Map(
    allPaceSheets.map(({ opponentFinish, home, expectedPoints }) => [
      `${opponentFinish}_${home}`,
      expectedPoints,
    ]),
  );
}

export async function fetchPaceFixtures(
  league: string,
  year: number,
  team: string,
  targetFinish: number,
): Promise<PaceFixture[]> {
  const [projectedStandings, allFixtures, paceSheetMap] = await Promise.all([
    fetchProjectedStandings(league, year),
    prisma.fixture.findMany({
      where: { league: league, year: year },
      orderBy: { kickoffTime: "asc" },
    }),
    fetchPaceSheetMap(league, year, targetFinish),
  ]);

  const teamToFinish = new Map(
    projectedStandings.map(({ team }, i) => [team, i + 1]),
  );

  const teamFinish = teamToFinish.get(team)!;
  const paceFixtures: PaceFixture[] = [];
  let cumulativeExpectedPoints = 0;
  for (const fixture of allFixtures) {
    if (fixture.homeTeam != team && fixture.awayTeam != team) {
      continue;
    }
    const opponent =
      team == fixture.homeTeam ? fixture.awayTeam : fixture.homeTeam;
    const home = team == fixture.homeTeam;
    const opponentActualFinish = teamToFinish.get(opponent)!;
    const opponentFinishShift =
      targetFinish <= opponentActualFinish && opponentActualFinish < teamFinish
        ? 1
        : targetFinish >= opponentActualFinish &&
            opponentActualFinish > teamFinish
          ? -1
          : 0;
    const opponentFinish = opponentActualFinish + opponentFinishShift;
    const expectedPoints = paceSheetMap.get(`${opponentFinish}_${home}`)!;
    cumulativeExpectedPoints += expectedPoints;
    paceFixtures.push({
      fixture,
      expectedPoints,
      cumulativeExpectedPoints,
      home,
      team,
      opponent,
      opponentFinish,
    });
  }
  return paceFixtures;
}
