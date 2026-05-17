import PaceChart from "./pace-chart";
import PaceChartPlaceholder from "./pace-chart-placeholder";
import { Suspense } from "react";
import { fetchPaceTeams } from "@/lib/pace/pace";
import { fetchTeamColorMap } from "@/lib/color";
import { shouldCachePaceData } from "@/lib/pace/data";
import { slicePaceTeams } from "@/lib/pace/pace-types";

type StandingsPaceChartProps = {
  league: string;
  year: number;
  targetFinish?: number;
};

export default function StandingsPaceChart(props: StandingsPaceChartProps) {
  const targetFinish = props.targetFinish ?? 1;
  if (shouldCachePaceData(props.league, props.year, targetFinish)) {
    return <StandingsPaceChartContent {...props} />;
  }
  return (
    <Suspense fallback={<PaceChartPlaceholder />}>
      <StandingsPaceChartContent {...props} />
    </Suspense>
  );
}

async function StandingsPaceChartContent({
  league,
  year,
  targetFinish = 1,
}: StandingsPaceChartProps) {
  const [paceTeams, teamColorMap] = await Promise.all([
    fetchPaceTeams(league, year, targetFinish),
    fetchTeamColorMap(),
  ]);
  const slicedPaceTeams = slicePaceTeams(paceTeams, 5, targetFinish);

  return (
    <PaceChart
      paceTeams={slicedPaceTeams}
      teamColorMap={teamColorMap}
      targetFinish={targetFinish}
      showAxisToggle
    />
  );
}
