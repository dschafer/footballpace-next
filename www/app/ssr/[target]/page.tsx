import {
  Breadcrumbs,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  PRERENDER_TARGET_KEYS,
  targetKeyLabels,
  targetKeyToFinish,
} from "@/lib/pace/target-key";
import AnchorLink from "@/components/anchor-link/anchor-link";
import LeagueMatches from "@/components/today-matches/league-matches";
import type { Metadata } from "next/types";
import RecentPaceTable from "@/components/recent-pace-table/recent-pace-table";
import { Suspense } from "react";
import TodaysMatchesPlaceholder from "@/components/today-matches/todays-matches-placeholder";
import leagues from "@/lib/const/leagues";
import { validateTargetRoute } from "@/lib/pace/validate-target-route";
import year from "@/lib/const/year";

export function generateStaticParams() {
  return PRERENDER_TARGET_KEYS.map((target) => ({ target }));
}

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomeSSR(props: PageProps<"/ssr/[target]">) {
  const { target } = await props.params;
  const targetKey = validateTargetRoute(target);
  const benchmark =
    targetKey === "champion"
      ? "champion"
      : targetKey === "ucl"
        ? "last Champions League–qualifying team"
        : "last relegation-safe team";
  const paceLabel =
    targetKey === "champion" ? "championship" : targetKeyLabels[targetKey];
  return (
    <Stack>
      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        {Array.from(leagues).map(([leagueCode]) => {
          const targetFinish = targetKeyToFinish(leagueCode)[targetKey];
          return (
            <Stack key={leagueCode} p={{ base: 0, lg: "xs" }}>
              <Title order={2} style={{ alignSelf: "flex-start" }}>
                {leagues.get(leagueCode)?.name} {year}
              </Title>
              <Suspense fallback={<TodaysMatchesPlaceholder />}>
                <LeagueMatches
                  league={leagueCode}
                  teamCount={5}
                  targetFinish={targetFinish}
                  year={year}
                />
              </Suspense>
              <RecentPaceTable
                rowCount={5}
                league={leagueCode}
                year={year}
                targetFinish={targetFinish}
              />
              <Group style={{ alignSelf: "flex-end" }}>
                <Breadcrumbs separator=" · ">
                  <AnchorLink href={`/${leagueCode}/${year}/chart`} ta="right">
                    Pace Chart »
                  </AnchorLink>
                  <AnchorLink href={`/${leagueCode}/${year}`} ta="right">
                    Full Pace Table »
                  </AnchorLink>
                </Breadcrumbs>
              </Group>
            </Stack>
          );
        })}
      </SimpleGrid>
      <Title order={2} style={{ alignSelf: "flex-start" }}>
        What is Football Pace?
      </Title>
      <Text>
        Football Pace is a version of the standings table that accounts for
        strength of schedule. It looks at historical data to see how a typical{" "}
        {benchmark} performs in each match, based on home/away and the opponent
        {"'"}s finishing position. These benchmarks define the target points for
        each match. It then presents a new version of the
        standings table, that shows how each team is doing compared to typical
        {paceLabel} pace, given their schedule so far.
      </Text>
    </Stack>
  );
}
