import {
  type LeagueYearParam,
  PRERENDER_SEASONS,
  validateLeagueYear,
} from "@/lib/const/current";
import {
  PRERENDER_TARGET_KEYS,
  type TargetKey,
  targetKeyToFinish,
} from "@/lib/pace/target-key";
import { Stack, Title } from "@mantine/core";
import AnchorLink from "@/components/anchor-link/anchor-link";
import type { Metadata } from "next/types";
import StandingsPaceChart from "@/components/pace-chart/standings-pace-chart";

export function generateStaticParams(): (LeagueYearParam & {
  target: TargetKey;
})[] {
  return PRERENDER_TARGET_KEYS.flatMap((target) =>
    PRERENDER_SEASONS.map((p) => ({ ...p, target })),
  );
}

export async function generateMetadata(
  props: PageProps<"/ssr/[target]/[league]/[year]/chart">,
): Promise<Metadata> {
  const { league, year } = await props.params;
  return { alternates: { canonical: `/${league}/${year}/chart` } };
}

export default async function ChartSSR(
  props: PageProps<"/ssr/[target]/[league]/[year]/chart">,
) {
  const { league, year, target } = await props.params;
  const [leagueInfo, yearInt] = validateLeagueYear({ league, year });
  const tf = targetKeyToFinish(league)[target as TargetKey];
  return (
    <Stack>
      <Title order={2}>
        {leagueInfo.name} {yearInt}
      </Title>
      <StandingsPaceChart league={league} year={yearInt} targetFinish={tf} />
      <AnchorLink
        href={`/${league}/${yearInt}`}
        ta="right"
        style={{ alignSelf: "flex-end" }}
      >
        Pace Table »
      </AnchorLink>
    </Stack>
  );
}
