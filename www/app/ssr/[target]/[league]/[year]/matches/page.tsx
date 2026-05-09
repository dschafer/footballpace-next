import {
  type LeagueYearParam,
  PRERENDER_SEASONS,
  validateLeagueYear,
} from "@/lib/const/current";
import { PRERENDER_TARGET_KEYS, type TargetKey } from "@/lib/pace/target-key";
import { SimpleGrid, Stack, Title } from "@mantine/core";
import LeagueFixtures from "@/components/fixtures/league-fixtures";
import Matches from "@/components/matches/matches";
import type { Metadata } from "next/types";

export function generateStaticParams(): (LeagueYearParam & {
  target: TargetKey;
})[] {
  return PRERENDER_TARGET_KEYS.flatMap((target) =>
    PRERENDER_SEASONS.map((p) => ({ ...p, target })),
  );
}

export async function generateMetadata(
  props: PageProps<"/ssr/[target]/[league]/[year]/matches">,
): Promise<Metadata> {
  const { league, year } = await props.params;
  return { alternates: { canonical: `/${league}/${year}/matches` } };
}

export default async function MatchesSSR(
  props: PageProps<"/ssr/[target]/[league]/[year]/matches">,
) {
  const { league, year } = await props.params;
  const [leagueInfo, yearInt] = validateLeagueYear({ league, year });
  return (
    <Stack>
      <Title order={2}>
        {leagueInfo.name} {yearInt}
      </Title>
      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <Matches league={league} year={yearInt} />
        <LeagueFixtures league={league} year={yearInt} />
      </SimpleGrid>
    </Stack>
  );
}
