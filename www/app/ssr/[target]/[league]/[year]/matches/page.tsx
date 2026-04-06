import {
  type LeagueYearParam,
  currentSeasons,
  validateLeagueYear,
} from "@/lib/const/current";
import { SimpleGrid, Stack, Title } from "@mantine/core";
import { TARGET_KEYS, type TargetKey } from "@/lib/pace/target-key";
import LeagueFixtures from "@/components/fixtures/league-fixtures";
import Matches from "@/components/matches/matches";
import type { Metadata } from "next/types";

export function generateStaticParams(): (LeagueYearParam & {
  target: TargetKey;
})[] {
  return TARGET_KEYS.flatMap((target) =>
    currentSeasons.map((p) => ({ ...p, target })),
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
