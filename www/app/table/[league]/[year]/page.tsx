import { Stack, Title } from "@mantine/core";
import StandingsTable from "@/components/standings-table/standings-table";

import leagues from "@/lib/const/leagues";

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
    <Stack>
      <Title
        order={2}
        style={{
          alignSelf: "flex-start",
        }}
      >
        {leagues.get(params.league)} {yearInt}
      </Title>
      <StandingsTable league={params.league} year={yearInt} />
    </Stack>
  );
}
