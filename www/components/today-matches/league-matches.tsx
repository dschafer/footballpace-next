import {
  fetchFixtureLeagueMatches,
  recentCompletedMatchesFromPaceTeams,
} from "@/lib/pace/todays-matches";
import TodaysMatches from "@/components/today-matches/todays-matches";
import { fetchPaceTeams } from "@/lib/pace/pace";
import leagues from "@/lib/const/leagues";
import { slicePaceTeams } from "@/lib/pace/pace-types";

export default async function LeagueMatches({
  league,
  teamCount,
  targetFinish,
  year,
}: {
  league: string;
  teamCount?: number;
  targetFinish: number;
  year: number;
}) {
  const leagueInfo = leagues.get(league);
  if (leagueInfo == null) {
    return null;
  }

  const paceTeams = await fetchPaceTeams(league, year, targetFinish);
  const scopedPaceTeams =
    teamCount == null
      ? paceTeams
      : slicePaceTeams(paceTeams, teamCount, targetFinish);
  const teamNames = new Set(scopedPaceTeams.map(({ team }) => team));
  const matches = leagueInfo.fixtures
    ? await fetchFixtureLeagueMatches({
        league,
        paceTeams,
        targetFinish,
        teamNames,
        year,
      })
    : recentCompletedMatchesFromPaceTeams({
        paceTeams,
        teamNames,
      });

  return (
    <TodaysMatches
      highlightedTeamNames={teamCount == null ? undefined : Array.from(teamNames)}
      matches={matches}
      timeZone={leagueInfo.tz}
    />
  );
}
