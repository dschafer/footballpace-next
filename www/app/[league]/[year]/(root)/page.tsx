import { Anchor, Breadcrumbs, Group, Stack, Title } from "@mantine/core";
import { LeagueYearParam } from "@/lib/const/current";
import Link from "next/link";
import StandingsPaceTable from "@/components/pace-table/standings-pace-table";

import leagues from "@/lib/const/leagues";

export default function PacePage({ params }: { params: LeagueYearParam }) {
  const yearInt = parseInt(params.year);
  return (
    <Stack>
      <Title order={2}>
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
            href={`/${params.league}/${params.year}/chart`}
            ta="right"
          >
            Pace Chart »
          </Anchor>
          <Anchor
            component={Link}
            href={`/${params.league}/${yearInt}/explanation`}
            ta="right"
          >
            Explanation »
          </Anchor>
        </Breadcrumbs>
      </Group>
    </Stack>
  );
}
