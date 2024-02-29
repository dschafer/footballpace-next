import StandingsTable from "@/components/standings-table/standings-table";

export default function LeagueYearPage({
  params,
}: {
  params: {
    league: string;
    year: string;
  };
}) {
  return <StandingsTable league={params.league} year={parseInt(params.year)} />;
}
