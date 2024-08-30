import StandingsTable from "@/components/standings-table/standings-table";
import { Title } from "@mantine/core";
import leagues from "@/lib/leagues";

export default function TablePage({
  params,
}: {
  params: {
    league: string;
    year: string;
  };
}) {
  const yearInt = parseInt(params.year);
  return (
    <>
      <Title order={2}>
        {leagues.get(params.league)} {yearInt}
      </Title>
      <StandingsTable league={params.league} year={yearInt} />
    </>
  );
}
