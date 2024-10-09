import { LineChart, LineChartSeries } from "@mantine/charts";
import { PaceTeam } from "@/lib/pace/pace";
import { TeamColor } from "@prisma/client";

import teamColor from "@/lib/color";

export default async function PaceChart({
  paceTeams,
  allColors,
}: {
  paceTeams: PaceTeam[];
  allColors: TeamColor[];
}) {
  // https://colorbrewer2.org/#type=qualitative&scheme=Pastel1&n=5
  const colors = ["7fc97f", "beaed4", "fdc086", "ffff99", "386cb0"];
  let series: LineChartSeries[] = paceTeams.map((paceTeam, i) => {
    const color =
      teamColor(paceTeam.team, allColors)?.primaryColor ?? colors[i];
    return {
      name: paceTeam.team,
      color: "#" + color,
    };
  });

  const maxMatchday = Math.max(
    ...paceTeams.map(({ paceMatches }) => paceMatches.length),
  );

  let mappedData = [...Array(maxMatchday)].map((_, md) => {
    return new Map([["matchday", md + 1]]);
  });

  paceTeams.forEach((paceTeam, i) => {
    const { team, paceMatches } = paceTeam;
    let cumDelta = 0;
    paceMatches.forEach((paceMatch, md) => {
      cumDelta += paceMatch.delta;
      mappedData[md].set(team, Math.round(cumDelta * 100) / 100);
    });
  });

  const data = mappedData.map((m) => Object.fromEntries(m.entries()));

  return (
    <LineChart
      h={300}
      data={data}
      series={series}
      dataKey="matchday"
      curveType="linear"
      withLegend
      xAxisLabel="Matchday"
      yAxisLabel="vs. Championship Pace"
      tooltipAnimationDuration={200}
      referenceLines={[{ y: 0, label: "Championship Pace", color: "red.3" }]}
    />
  );
}
