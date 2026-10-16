export type DateRow = { date: string; [key: string]: number | string };

export function buildDateChartData(
  paceTeams: {
    team: string;
    paceMatches: { match: { date: Date }; delta: number }[];
  }[],
): DateRow[] {
  const matchDates = new Set<string>();
  const teamDailyDeltas = paceTeams.map(({ team, paceMatches }) => {
    const dailyDeltas = new Map<string, number>();
    for (const { delta, match } of paceMatches) {
      const date = match.date.toISOString().slice(0, 10);
      dailyDeltas.set(date, (dailyDeltas.get(date) ?? 0) + delta);
      matchDates.add(date);
    }
    return { team, dailyDeltas, cumulativeDelta: 0 };
  });

  const dates = [...matchDates].sort();
  if (dates.length === 0) {
    return [];
  }

  const dayMs = 24 * 60 * 60 * 1000;
  // Include a zero baseline so the first match also appears as a jump.
  const firstDay = Date.parse(dates[0]) - dayMs;
  const lastDay = Date.parse(dates[dates.length - 1]);
  const dateData: DateRow[] = [];
  for (let time = firstDay; time <= lastDay; time += dayMs) {
    const date = new Date(time).toISOString().slice(0, 10);
    const row: DateRow = { date };
    for (const teamData of teamDailyDeltas) {
      teamData.cumulativeDelta += teamData.dailyDeltas.get(date) ?? 0;
      row[teamData.team] = Math.round(teamData.cumulativeDelta * 100) / 100;
    }
    dateData.push(row);
  }

  return dateData;
}
