import type { Fixture, PaceSheetEntry } from "@/prisma/generated/client";
import type { PaceFixture, PaceTeam } from "./pace-types";
import {
  fetchFixtures,
  fetchMatches,
  fetchPaceSheetEntries,
} from "@/lib/pace/data";
import { fetchProjectedStandings } from "./projections";

export function matchPointsForTeam({
  ftResult,
  home,
}: {
  ftResult: "A" | "D" | "H";
  home: boolean;
}): number {
  if (ftResult == "D") {
    return 1;
  }
  return (ftResult == "H" && home) || (ftResult == "A" && !home) ? 3 : 0;
}

export function opponentFinishForPace({
  opponentActualFinish,
  targetFinish,
  teamFinish,
}: {
  opponentActualFinish: number;
  targetFinish: number;
  teamFinish: number;
}): number {
  if (targetFinish <= opponentActualFinish && opponentActualFinish < teamFinish) {
    return opponentActualFinish + 1;
  }
  if (targetFinish >= opponentActualFinish && opponentActualFinish > teamFinish) {
    return opponentActualFinish - 1;
  }
  return opponentActualFinish;
}

export function paceFixturesForTeam({
  fixtures,
  paceSheetMap,
  targetFinish,
  team,
  teamToFinish,
}: {
  fixtures: Fixture[];
  paceSheetMap: Map<string, number>;
  targetFinish: number;
  team: string;
  teamToFinish: Map<string, number>;
}): PaceFixture[] {
  const teamFinish = teamToFinish.get(team)!;
  const paceFixtures: PaceFixture[] = [];
  let cumulativeExpectedPoints = 0;
  for (const fixture of fixtures) {
    if (fixture.homeTeam != team && fixture.awayTeam != team) {
      continue;
    }
    const opponent =
      team == fixture.homeTeam ? fixture.awayTeam : fixture.homeTeam;
    const home = team == fixture.homeTeam;
    const opponentActualFinish = teamToFinish.get(opponent)!;
    const opponentFinish = opponentFinishForPace({
      opponentActualFinish,
      targetFinish,
      teamFinish,
    });
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

export async function fetchPaceTeams(
  league: string,
  year: number,
  targetFinish: number,
): Promise<PaceTeam[]> {
  const [projectedStandings, allMatches, paceSheetMap] = await Promise.all([
    fetchProjectedStandings(league, year),
    fetchMatches(league, year, { orderBy: { date: "asc" } }),
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
        const points = matchPointsForTeam({ ftResult: match.ftResult, home });
        const opponentFinish = opponentFinishForPace({
          opponentActualFinish,
          targetFinish,
          teamFinish,
        });
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
  return fetchPaceSheetEntries(league, year, targetFinish);
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
    fetchFixtures(league, year, {
      orderBy: { kickoffTime: { sort: "asc", nulls: "last" } },
    }),
    fetchPaceSheetMap(league, year, targetFinish),
  ]);

  const teamToFinish = new Map(
    projectedStandings.map(({ team }, i) => [team, i + 1]),
  );

  return paceFixturesForTeam({
    fixtures: allFixtures,
    paceSheetMap,
    targetFinish,
    team,
    teamToFinish,
  });
}
