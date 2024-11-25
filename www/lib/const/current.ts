import { type LeagueInfo, leagues } from "@/lib/const/leagues";
import { notFound } from "next/navigation";
import year from "@/lib/const/year";

export type LeagueYearParam = {
  league: string;
  year: string;
};

export const currentSeasons: LeagueYearParam[] = Array.from(
  Array.from(leagues.keys()).map((league) => ({
    league,
    year: "" + year,
  })),
);

/**
 * This parses the league and year for any page that gets passed that, and
 * either returns info about the league (and the year as a number). If either
 * is invalid, this will instead call notFound() to trigger a 404.
 *
 * @param param The LeagueYearParam for a page
 * @returns A two element array; the first is a LeagueInfo for the league,
 *          they second a number representing the year.
 *
 *          If either the league or the year is invalid, this calls notFound()
 */
export function validateLeagueYear(
  param: LeagueYearParam,
): [LeagueInfo, number] {
  const leagueInfo = leagues.get(param.league);
  if (!leagueInfo) {
    notFound();
  }
  const yearInt = parseInt(param.year, 10);
  if (isNaN(yearInt) || !Number.isInteger(yearInt)) {
    notFound();
  }
  return [leagueInfo, yearInt];
}
