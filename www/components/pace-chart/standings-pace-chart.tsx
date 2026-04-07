import PaceChart from "./pace-chart";
import { fetchPaceTeams } from "@/lib/pace/pace";
import { fetchTeamColorMap } from "@/lib/color";

export default async function StandingsPaceChart({
  league,
  year,
  targetFinish = 1,
}: {
  league: string;
  year: number;
  targetFinish?: number;
}) {
  const [paceTeams, teamColorMap] = await Promise.all([
    fetchPaceTeams(league, year, targetFinish),
    fetchTeamColorMap(),
  ]);
  const slicedPaceTeams = paceTeams.slice(0, 5);

  return (
    <PaceChart
      paceTeams={slicedPaceTeams}
      teamColorMap={teamColorMap}
      targetFinish={targetFinish}
      showAxisToggle
    />
  );
}
