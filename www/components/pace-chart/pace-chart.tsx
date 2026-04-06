import PaceChartClient, {
  type DateRow,
  type MatchdayRow,
} from "./pace-chart-client";
import ErrorAlert from "../error/error-alert";
import type { LineChartSeries } from "@mantine/charts";
import type { PaceTeam } from "@/lib/pace/pace-types";
import type { TeamColor } from "@prisma/client";

export default function PaceChart({
  paceTeams,
  teamColorMap,
  showAxisToggle = false,
}: {
  paceTeams: PaceTeam[];
  teamColorMap: Map<string, TeamColor>;
  showAxisToggle?: boolean;
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

  // Build date-based data with daily gap filling on the server
  const fmt = (d: Date) =>
    new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
      .toISOString()
      .slice(0, 10);

  const allDates: Date[] = paceTeams.flatMap(({ paceMatches }) =>
    paceMatches.map(({ match }) => match.date),
  );

  if (allDates.length === 0) {
    return <ErrorAlert />;
  }

  const minTime = Math.min(...allDates.map((d) => d.getTime()));
  const maxTime = Math.max(...allDates.map((d) => d.getTime()));
  const dayMs = 24 * 60 * 60 * 1000;
  const days: string[] = [];
  for (let t = minTime; t <= maxTime; t += dayMs) {
    days.push(fmt(new Date(t)));
  }

  const teamDateCum: Map<string, Map<string, number>> = new Map();
  paceTeams.forEach(({ team, paceMatches }) => {
    let cumDelta = 0;
    const m = new Map<string, number>();
    paceMatches.forEach(({ delta, match }) => {
      cumDelta += delta;
      m.set(fmt(match.date), Math.round(cumDelta * 100) / 100);
    });
    teamDateCum.set(team, m);
  });

  const dateData = days.map((day) => {
    const row: DateRow = { date: day };
    paceTeams.forEach(({ team }) => {
      const m = teamDateCum.get(team)!;
      row[team] = m.get(day) ?? null;
    });
    return row;
  });

  return (
    <PaceChartClient
      series={series}
      matchdayData={matchdayData}
      dateData={dateData}
      showAxisToggle={showAxisToggle}
    />
  );
}
