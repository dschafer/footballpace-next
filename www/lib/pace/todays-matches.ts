import type { Fixture, Match } from "@/prisma/generated/client";
import type { PaceFixture, PaceMatch, PaceTeam } from "@/lib/pace/pace-types";
import { fetchFixtures, fetchPaceSheetEntries } from "@/lib/pace/data";
import type { LeagueInfo } from "@/lib/const/leagues";
import { connection } from "next/server";
import { dateIsInWindow } from "@/lib/date-key";
import { fetchProjectedStandings } from "@/lib/pace/projections";
import leagues from "@/lib/const/leagues";
import { paceFixturesForTeam } from "@/lib/pace/pace";

const nearbyWindowDays = 1;

export type TodayCompletedMatch = {
  away: PaceMatch;
  home: PaceMatch;
  status: "completed";
};

export type TodayFixture = {
  away: PaceFixture;
  home: PaceFixture;
  status: "upcoming";
};

export type TodayMatch = TodayCompletedMatch | TodayFixture;

type FixtureKeyParts = Pick<
  Fixture | Match,
  "awayTeam" | "homeTeam" | "league" | "year"
>;

function fixtureKey({ awayTeam, homeTeam, league, year }: FixtureKeyParts): string {
  return `${league}/${year}/${homeTeam}/${awayTeam}`;
}

function teamFixtureKey(team: string, fixture: FixtureKeyParts): string {
  return `${team}/${fixtureKey(fixture)}`;
}

function paceMatchMap(paceTeams: PaceTeam[]): Map<string, PaceMatch> {
  const map = new Map<string, PaceMatch>();
  for (const paceTeam of paceTeams) {
    for (const paceMatch of paceTeam.paceMatches) {
      map.set(teamFixtureKey(paceTeam.team, paceMatch.match), paceMatch);
    }
  }
  return map;
}

function paceFixtureMap({
  fixtures,
  paceSheetMap,
  targetFinish,
  teams,
  teamToFinish,
}: {
  fixtures: Fixture[];
  paceSheetMap: Map<string, number>;
  targetFinish: number;
  teams: Set<string>;
  teamToFinish: Map<string, number>;
}): Map<string, PaceFixture> {
  const map = new Map<string, PaceFixture>();
  for (const team of teams) {
    const paceFixtures = paceFixturesForTeam({
      fixtures,
      paceSheetMap,
      targetFinish,
      team,
      teamToFinish,
    });
    for (const paceFixture of paceFixtures) {
      map.set(teamFixtureKey(team, paceFixture.fixture), paceFixture);
    }
  }
  return map;
}

function completedTodayMatch({
  match,
  paceMatchesByTeamFixture,
}: {
  match: Match;
  paceMatchesByTeamFixture: Map<string, PaceMatch>;
}): TodayCompletedMatch | null {
  const home = paceMatchesByTeamFixture.get(teamFixtureKey(match.homeTeam, match));
  const away = paceMatchesByTeamFixture.get(teamFixtureKey(match.awayTeam, match));
  if (home == null || away == null) {
    return null;
  }
  return {
    away,
    home,
    status: "completed",
  };
}

function completedTodayMatches({
  matchesByFixture,
  paceTeams,
}: {
  matchesByFixture: Map<string, Match>;
  paceTeams: PaceTeam[];
}): TodayCompletedMatch[] {
  const paceMatchesByTeamFixture = paceMatchMap(paceTeams);
  return Array.from(matchesByFixture.values())
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map((match) => {
      return completedTodayMatch({
        match,
        paceMatchesByTeamFixture,
      });
    })
    .filter((match) => match != null);
}

export function recentCompletedMatchesFromPaceTeams({
  paceTeams,
  teamNames,
}: {
  paceTeams: PaceTeam[];
  teamNames: Set<string>;
}): TodayMatch[] {
  const matchesByFixture = new Map<string, Match>();
  for (const paceTeam of paceTeams) {
    if (!teamNames.has(paceTeam.team)) {
      continue;
    }
    const lastMatch = paceTeam.paceMatches.at(-1);
    if (lastMatch == null) {
      continue;
    }
    matchesByFixture.set(fixtureKey(lastMatch.match), lastMatch.match);
  }
  return completedTodayMatches({ matchesByFixture, paceTeams });
}

function completedMatchesInWindowFromPaceTeams({
  leagueInfo,
  now,
  paceTeams,
  teamNames,
  windowDays,
}: {
  leagueInfo: LeagueInfo;
  now: Date;
  paceTeams: PaceTeam[];
  teamNames: Set<string>;
  windowDays: number;
}): TodayCompletedMatch[] {
  const matchesByFixture = new Map<string, Match>();
  for (const paceTeam of paceTeams) {
    if (!teamNames.has(paceTeam.team)) {
      continue;
    }
    for (const paceMatch of paceTeam.paceMatches) {
      if (!dateIsInWindow({
        date: paceMatch.match.date,
        now,
        timeZone: leagueInfo.tz,
        windowDays,
      })) {
        continue;
      }
      matchesByFixture.set(fixtureKey(paceMatch.match), paceMatch.match);
    }
  }
  return completedTodayMatches({ matchesByFixture, paceTeams });
}

export async function fetchFixtureLeagueMatches({
  league,
  paceTeams,
  targetFinish,
  teamNames,
  year,
}: {
  league: string;
  paceTeams: PaceTeam[];
  targetFinish: number;
  teamNames: Set<string>;
  year: number;
}): Promise<TodayMatch[]> {
  await connection();
  return fetchFixtureMatchesForLeague({
    league,
    now: new Date(),
    paceTeams,
    targetFinish,
    teamNames,
    year,
  });
}

async function fetchFixtureMatchesForLeague({
  league,
  now,
  paceTeams,
  targetFinish,
  teamNames,
  year,
}: {
  league: string;
  now: Date;
  paceTeams: PaceTeam[];
  targetFinish: number;
  teamNames: Set<string>;
  year: number;
}): Promise<TodayMatch[]> {
  const leagueInfo = leagues.get(league);
  if (!leagueInfo) {
    return [];
  }

  const [fixtures, projectedStandings, paceSheetEntries] = await Promise.all([
    fetchFixtures(league, year, {
      orderBy: { kickoffTime: { sort: "asc", nulls: "last" } },
    }),
    fetchProjectedStandings(league, year),
    fetchPaceSheetEntries(league, year, targetFinish),
  ]);

  const upcomingFixtures = fixtures.filter(
    (fixture) =>
      fixture.kickoffTime != null &&
      fixture.kickoffTime > now &&
      dateIsInWindow({
        date: fixture.kickoffTime,
        now,
        timeZone: leagueInfo.tz,
        windowDays: nearbyWindowDays,
      }),
  );
  const relevantUpcomingFixtures = upcomingFixtures.filter(
    (fixture) => teamNames.has(fixture.homeTeam) || teamNames.has(fixture.awayTeam),
  );
  const completedMatches = completedMatchesInWindowFromPaceTeams({
    leagueInfo,
    now,
    paceTeams,
    teamNames,
    windowDays: nearbyWindowDays,
  });
  if (relevantUpcomingFixtures.length == 0 || paceSheetEntries.length == 0) {
    return completedMatches;
  }

  const teamToFinish = new Map(
    projectedStandings.map(({ team }, index) => [team, index + 1]),
  );
  const paceSheetMap = new Map(
    paceSheetEntries.map(({ expectedPoints, home, opponentFinish }) => [
      `${opponentFinish}_${home}`,
      expectedPoints,
    ]),
  );
  const fixtureTeams = new Set(
    relevantUpcomingFixtures.flatMap((fixture) => [
      fixture.awayTeam,
      fixture.homeTeam,
    ]),
  );
  const paceFixturesByTeamFixture = paceFixtureMap({
    fixtures,
    paceSheetMap,
    targetFinish,
    teams: fixtureTeams,
    teamToFinish,
  });

  const upcomingMatches = relevantUpcomingFixtures
    .map((fixture) => {
      const home = paceFixturesByTeamFixture.get(
        teamFixtureKey(fixture.homeTeam, fixture),
      );
      const away = paceFixturesByTeamFixture.get(
        teamFixtureKey(fixture.awayTeam, fixture),
      );
      if (home == null || away == null) {
        return null;
      }

      return {
        away,
        home,
        status: "upcoming",
      } satisfies TodayFixture;
    })
    .filter((match) => match != null);

  return [...completedMatches, ...upcomingMatches];
}
