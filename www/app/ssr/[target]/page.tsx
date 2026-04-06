export const dynamic = "error";

import {
  Breadcrumbs,
  Group,
  SimpleGrid,
  Spoiler,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  TARGET_KEYS,
  type TargetKey,
  targetKeyToFinish,
} from "@/lib/pace/target-key";
import AnchorLink from "@/components/anchor-link/anchor-link";
import type { Metadata } from "next/types";
import RecentPaceTable from "@/components/recent-pace-table/recent-pace-table";
import leagues from "@/lib/const/leagues";
import year from "@/lib/const/year";

export function generateStaticParams() {
  return TARGET_KEYS.map((target) => ({ target }));
}

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomeSSR(props: PageProps<"/ssr/[target]">) {
  const { target } = await props.params;
  const tf = targetKeyToFinish[target as TargetKey];
  return (
    <Stack>
      <Title order={2} style={{ alignSelf: "flex-start" }}>
        What is Football Pace?
      </Title>
      <Spoiler maxHeight={75} showLabel="Read more" hideLabel="Hide">
        <Text>
          Football Pace is a version of the standings table that accounts for
          strength of schedule. It looks at historical data to see how a typical
          champion performs in each match, based on home/away and the opponent
          {"'"}s finishing position. It then presents a new version of the
          standings table, that shows how each team is doing compared to typical
          championship pace, given their schedule so far.
        </Text>
      </Spoiler>
      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        {Array.from(leagues).map(([leagueCode]) => (
          <Stack key={leagueCode} p={{ base: 0, lg: "xs" }}>
            <Title order={2} style={{ alignSelf: "flex-start" }}>
              {leagues.get(leagueCode)?.name} {year}
            </Title>
            <RecentPaceTable
              rowCount={5}
              league={leagueCode}
              year={year}
              targetFinish={tf}
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
        ))}
      </SimpleGrid>
    </Stack>
  );
}
