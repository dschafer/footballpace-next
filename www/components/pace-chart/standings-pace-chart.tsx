import PaceChart from "./pace-chart";
import { fetchPaceTeams } from "@/lib/pace/pace";
import { fetchTeamColorMap } from "@/lib/color";

export default async function StandingsPaceChart({
  league,
  year,
}: {
  league: string;
  year: number;
}) {
  const [paceTeams, teamColorMap] = await Promise.all([
    fetchPaceTeams(league, year),
    fetchTeamColorMap(),
  ]);
  const slicedPaceTeams = paceTeams.slice(0, 5);

  return <PaceChart paceTeams={slicedPaceTeams} teamColorMap={teamColorMap} />;
}
