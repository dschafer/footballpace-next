import prisma, { ExtendedStandingsRow } from "@/lib/prisma";

export type ProjectedStandingsRow = {
  team: string;
  currentYear: ExtendedStandingsRow;
  previousYear?: ExtendedStandingsRow | null;
  previousYearMultiplier: number;
};

function score(
  psr: ProjectedStandingsRow,
  propGetter: (rs: ExtendedStandingsRow) => number,
): number {
  var score = propGetter(psr.currentYear);
  if (psr.previousYear != null) {
    score += propGetter(psr.previousYear) * psr.previousYearMultiplier;
  }
  return score;
}

function comp(
  a: ProjectedStandingsRow,
  b: ProjectedStandingsRow,
  propGetter: (rs: ExtendedStandingsRow) => number,
): number {
  return score(b, propGetter) - score(a, propGetter);
}

export async function fetchProjectedStandings(
  league: string,
  year: number,
): Promise<ProjectedStandingsRow[]> {
  let [currentStandings, prevStandings] = await Promise.all([
    prisma.standingsRow.findMany({
      where: { league: league, year: year },
    }),
    prisma.standingsRow.findMany({
      where: { league: league, year: year - 1 },
    }),
  ]);

  const projectedStandings = currentStandings
    .map((currentYear) => {
      const team = currentYear.team;
      const previousYear = null;
      const previousYearMultiplier = 0;
      return { team, currentYear, previousYear, previousYearMultiplier };
    })
    .sort(
      (a, b) =>
        comp(a, b, (psr) => psr.points) ||
        comp(a, b, (psr) => psr.gd) ||
        comp(a, b, (psr) => psr.goalsFor),
    );

  return projectedStandings;
}
