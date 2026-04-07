import {
  type LeagueYearParam,
  currentSeasons,
  validateLeagueYear,
} from "@/lib/const/current";
import { Stack, Title } from "@mantine/core";
import {
  TARGET_KEYS,
  type TargetKey,
  targetKeyToFinish,
} from "@/lib/pace/target-key";
import HistoricalPacePreamble from "@/components/explanation/historical-pace-preamble";
import HistoricalPaceTable from "@/components/explanation/historical-pace-table";
import type { Metadata } from "next/types";
import ProjectedStandingsPreamble from "@/components/explanation/projected-standings-preamble";
import ProjectedStandingsTable from "@/components/explanation/projected-standings-table";

export function generateStaticParams(): (LeagueYearParam & {
  target: TargetKey;
})[] {
  return TARGET_KEYS.flatMap((target) =>
    currentSeasons.map((p) => ({ ...p, target })),
  );
}

export async function generateMetadata(
  props: PageProps<"/ssr/[target]/[league]/[year]/explanation">,
): Promise<Metadata> {
  const { league, year } = await props.params;
  return { alternates: { canonical: `/${league}/${year}/explanation` } };
}

export default async function ExplanationSSR(
  props: PageProps<"/ssr/[target]/[league]/[year]/explanation">,
) {
  const { league, year, target } = await props.params;
  const [_leagueInfo, yearInt] = validateLeagueYear({ league, year });
  const tf = targetKeyToFinish(league)[target as TargetKey];
  return (
    <Stack>
      <Title order={2}>Historical Pace</Title>
      <HistoricalPacePreamble
        league={league}
        year={yearInt}
        targetFinish={tf}
      />
      <HistoricalPaceTable league={league} year={yearInt} targetFinish={tf} />
      <Title order={2}>Estimated Standings</Title>
      <ProjectedStandingsPreamble />
      <ProjectedStandingsTable league={league} year={yearInt} />
    </Stack>
  );
}
