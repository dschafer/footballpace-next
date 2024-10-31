import leagues from "@/lib/const/leagues";
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
