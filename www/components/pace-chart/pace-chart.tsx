import PaceChartClient, { type MatchdayRow } from "./pace-chart-client";
import { finishToTargetKey, targetKeyLabels } from "@/lib/pace/target-key";
import ErrorAlert from "../error/error-alert";
import type { LineChartSeries } from "@mantine/charts";
import type { PaceTeam } from "@/lib/pace/pace-types";
import type { TeamColor } from "@/prisma/generated/client";
import { buildDateChartData } from "./date-chart-data";

export default function PaceChart({
  paceTeams,
  teamColorMap,
  showAxisToggle = false,
  targetFinish = 1,
}: {
  paceTeams: PaceTeam[];
  teamColorMap: Map<string, TeamColor>;
  showAxisToggle?: boolean;
  targetFinish?: number;
}) {
  if (paceTeams.length === 0) {
    return <ErrorAlert />;
  }

  // https://colorbrewer2.org/#type=qualitative&scheme=Pastel1&n=5
  const colors = ["7fc97f", "beaed4", "fdc086", "ffff99", "386cb0"];
  const series: LineChartSeries[] = paceTeams.map((paceTeam, i) => {
    const color = teamColorMap.get(paceTeam.team)?.primaryColor ?? colors[i];
    return {
      name: paceTeam.team,
      color: "#" + color,
    };
  });

  // Build matchday-based data on the server
  const maxMatchday = Math.max(
    ...paceTeams.map(({ paceMatches }) => paceMatches.length),
  );
  const matchdayData: MatchdayRow[] = [...Array(maxMatchday)].map((_, md) => {
    return { matchday: md + 1 };
  });
  paceTeams.forEach(({ team, paceMatches }) => {
    let cumDelta = 0;
    paceMatches.forEach((paceMatch, md) => {
      cumDelta += paceMatch.delta;
      matchdayData[md][team] = Math.round(cumDelta * 100) / 100;
    });
  });

  const dateData = buildDateChartData(paceTeams);
  if (dateData.length === 0) {
    return <ErrorAlert />;
  }

  const paceLabel = targetKeyLabels[finishToTargetKey(targetFinish)];

  return (
    <PaceChartClient
      series={series}
      matchdayData={matchdayData}
      dateData={dateData}
      showAxisToggle={showAxisToggle}
      paceLabel={paceLabel}
    />
  );
}
