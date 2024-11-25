import { ExtendedStandingsRow, fetchStandings } from "./standings";

export type ProjectedStandingsRow = {
  team: string;
  currentYear: ExtendedStandingsRow;
  currentYearMultiplier: number;
  previousYear?: ExtendedStandingsRow | null;
  previousYearMultiplier: number;
};

function score(
  psr: ProjectedStandingsRow,
  propGetter: (rs: ExtendedStandingsRow) => number,
): number {
  let score = propGetter(psr.currentYear) * psr.currentYearMultiplier;
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

function findPreviousYear(
  prevStandings: ExtendedStandingsRow[],
  team: string,
): ExtendedStandingsRow | null {
  if (prevStandings.length == 0) {
    // This might legit be the first season in our DB. In that case, we have to return null
    return null;
  }
  const maybePrevRow = prevStandings.filter((esr) => esr.team == team);
  if (maybePrevRow.length == 1) {
    // We found last year's data. Use that.
    return maybePrevRow[0];
  }
  // Okay, we have data from last year, but not for this team.
  // That means this team is newly promoted. Let's approximate last
  // years performance with the 4th-worst-team (i.e. the worst team that
  // stayed up in most leagues).
  return prevStandings[prevStandings.length - 4];
}

export async function fetchProjectedStandings(
  league: string,
  year: number,
): Promise<ProjectedStandingsRow[]> {
  const [currentStandings, prevStandings] = await Promise.all([
    fetchStandings(league, year),
    fetchStandings(league, year - 1),
  ]);

  const projectedStandings = currentStandings
    .map((currentYear) => {
      const team = currentYear.team;
      const previousYear = findPreviousYear(prevStandings, team);

      const numMatches = (currentStandings.length - 1) * 2;
      let previousYearMultiplier = 0;
      let currentYearMultiplier = 1;
      if (currentYear.played >= numMatches / 2 || previousYear == null) {
        currentYearMultiplier = numMatches / currentYear.played;
        previousYearMultiplier = 0;
      } else {
        previousYearMultiplier =
          (numMatches / 2 - currentYear.played) / previousYear.played;
        currentYearMultiplier *= 2;
        previousYearMultiplier *= 2;
      }

      return {
        team,
        currentYear,
        currentYearMultiplier,
        previousYear,
        previousYearMultiplier,
      };
    })
    .sort(
      (a, b) =>
        comp(a, b, (psr) => psr.points) ||
        comp(a, b, (psr) => psr.gd) ||
        comp(a, b, (psr) => psr.goalsFor),
    );

  return projectedStandings;
}
