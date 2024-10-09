import { Anchor, Stack, Title } from "@mantine/core";
import Link from "next/link";
import StandingsPaceTable from "@/components/pace-table/standings-pace-table";
import leagues from "@/lib/const/leagues";

export default function PacePage({
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
      <StandingsPaceTable league={params.league} year={yearInt} />
      <Anchor
        component={Link}
        href={`/explanation/${params.league}/${yearInt}`}
        ta="right"
        style={{
          alignSelf: "flex-end",
        }}
      >
        Explanation »
      </Anchor>
    </Stack>
  );
}
