import { LineChart, LineChartSeries } from "@mantine/charts";
import { fetchPaceTeams } from "@/lib/pace/pace";

export default async function PaceChart({
  league,
  year,
}: {
  league: string;
  year: number;
}) {
  let paceTeams = await fetchPaceTeams(league, year);
  paceTeams = paceTeams.slice(0, 5);

  // https://colorbrewer2.org/#type=qualitative&scheme=Pastel1&n=5
  const colors = ["#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0"];
  let series: LineChartSeries[] = paceTeams.map((paceTeam, i) => ({
    name: paceTeam.team,
    color: colors[i],
  }));

  const maxMatchday = Math.max(
    ...paceTeams.map(({ matches }) => matches.length),
  );

  let mappedData = [...Array(maxMatchday)].map((_, md) => {
    return new Map([["matchday", md + 1]]);
  });

  paceTeams.forEach((paceTeam, i) => {
    const { team, matches } = paceTeam;
    let cumDelta = 0;
    matches.forEach((match, md) => {
      cumDelta += match.delta;
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
