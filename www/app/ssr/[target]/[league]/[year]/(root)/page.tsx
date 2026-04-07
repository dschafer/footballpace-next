import { Breadcrumbs, Group, Stack, Title } from "@mantine/core";
import {
  type LeagueYearParam,
  currentSeasons,
  validateLeagueYear,
} from "@/lib/const/current";
import {
  TARGET_KEYS,
  type TargetKey,
  targetKeyToFinish,
} from "@/lib/pace/target-key";
import AnchorLink from "@/components/anchor-link/anchor-link";
import type { Metadata } from "next/types";
import StandingsPaceTable from "@/components/pace-table/standings-pace-table";
import leagues from "@/lib/const/leagues";

export function generateStaticParams(): (LeagueYearParam & {
  target: TargetKey;
})[] {
  return TARGET_KEYS.flatMap((target) =>
    currentSeasons.map((p) => ({ ...p, target })),
  );
}

export async function generateMetadata(
  props: PageProps<"/ssr/[target]/[league]/[year]">,
): Promise<Metadata> {
  const { league, year } = await props.params;
  return { alternates: { canonical: `/${league}/${year}` } };
}

export default async function LeagueRootSSR(
  props: PageProps<"/ssr/[target]/[league]/[year]">,
) {
  const { league, year, target } = await props.params;
  const [_leagueInfo, yearInt] = validateLeagueYear({ league, year });
  const tf = targetKeyToFinish(league)[target as TargetKey];
  return (
    <Stack>
      <Title order={2}>
        {leagues.get(league)?.name} {yearInt}
      </Title>
      <StandingsPaceTable league={league} year={yearInt} targetFinish={tf} />
      <Group style={{ alignSelf: "flex-end" }}>
        <Breadcrumbs separator=" · ">
          <AnchorLink href={`/${league}/${yearInt}/chart`} ta="right">
            Pace Chart »
          </AnchorLink>
          <AnchorLink href={`/${league}/${yearInt}/explanation`} ta="right">
            Explanation »
          </AnchorLink>
        </Breadcrumbs>
      </Group>
    </Stack>
  );
}
