import { Anchor, Breadcrumbs, Group, Stack, Title } from "@mantine/core";
import {
  type LeagueYearParam,
  currentSeasons,
  validateLeagueYear,
} from "@/lib/const/current";
import Link from "next/link";
import StandingsPaceTable from "@/components/pace-table/standings-pace-table";

import leagues from "@/lib/const/leagues";

export function generateStaticParams(): LeagueYearParam[] {
  return currentSeasons;
}

export default async function PacePage({
  params,
}: {
  params: Promise<LeagueYearParam>;
}) {
  const { league, year } = await params;
  const [_leagueInfo, yearInt] = validateLeagueYear({ league, year });
  return (
    <Stack>
      <Title order={2}>
        {leagues.get(league)?.name} {yearInt}
      </Title>
      <StandingsPaceTable league={league} year={yearInt} />
      <Group
        style={{
          alignSelf: "flex-end",
        }}
      >
        <Breadcrumbs separator=" · ">
          <Anchor
            component={Link}
            href={`/${league}/${yearInt}/chart`}
            ta="right"
          >
            Pace Chart »
          </Anchor>
          <Anchor
            component={Link}
            href={`/${league}/${yearInt}/explanation`}
            ta="right"
          >
            Explanation »
          </Anchor>
        </Breadcrumbs>
      </Group>
    </Stack>
  );
}
