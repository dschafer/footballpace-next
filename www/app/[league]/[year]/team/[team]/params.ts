import type { LeagueYearParam } from "@/lib/const/current";

export type SeasonPageParam = LeagueYearParam & {
  team: string;
};
