import Stack from "@mui/material/Stack";
import StandingsTable from "@/components/standings-table/standings-table";

export default function LeagueYear({
  params,
}: {
  params: {
    league: string;
    year: string;
  };
}) {
  return <StandingsTable league={params.league} year={parseInt(params.year)} />;
}
