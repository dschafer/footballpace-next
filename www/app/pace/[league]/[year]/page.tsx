import { Anchor, Breadcrumbs, Group, Stack, Title } from "@mantine/core";
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
        {leagues.get(params.league)?.name} {yearInt}
      </Title>
      <StandingsPaceTable league={params.league} year={yearInt} />
      <Group
        style={{
          alignSelf: "flex-end",
        }}
      >
        <Breadcrumbs separator=" · ">
          <Anchor
            component={Link}
            href={`/chart/${params.league}/${params.year}`}
            ta="right"
          >
            Pace Chart »
          </Anchor>
          <Anchor
            component={Link}
            href={`/explanation/${params.league}/${yearInt}`}
            ta="right"
          >
            Explanation »
          </Anchor>
        </Breadcrumbs>
      </Group>
    </Stack>
  );
}
