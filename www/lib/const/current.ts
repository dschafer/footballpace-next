import leagues from "@/lib/const/leagues";
import year from "@/lib/const/year";

type SesaonParam = {
  league: string;
  year: string;
};

const currentSeasons: SesaonParam[] = Array.from(
  Array.from(leagues.keys()).map((league) => ({
    league,
    year: "" + year,
  })),
);
export default currentSeasons;
