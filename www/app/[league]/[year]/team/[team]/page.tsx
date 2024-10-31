import { Anchor, Stack, Text, Title } from "@mantine/core";
import FixturesTable from "@/components/fixtures-table/fixtures-table";
import Link from "next/link";
import PaceChart from "@/components/pace-chart/pace-chart";
import PaceTable from "@/components/pace-table/pace-table";
import { fetchPaceTeams } from "@/lib/pace/pace";
import leagues from "@/lib/const/leagues";
import prisma from "@/lib/prisma";
import year from "@/lib/const/year";

export async function generateStaticParams(): Promise<SeasonPageParams[]> {
  const matches = await prisma.match.findMany({
    where: { year: year },
  });
  const params: Set<SeasonPageParams> = new Set();
  for (const m of matches) {
    params.add({
      league: m.league,
      year: "" + m.year,
      team: m.homeTeam,
    });
    params.add({
      league: m.league,
      year: "" + m.year,
      team: m.awayTeam,
    });
  }
  return Array.from(params);
}

type SeasonPageParams = {
  league: string;
  year: string;
  team: string;
};

export default async function SeasonPage({
  params,
}: {
  params: SeasonPageParams;
}) {
  const yearInt = parseInt(params.year);
  const teamDecoded = decodeURIComponent(params.team);

  const [paceTeams, allColors] = await Promise.all([
    fetchPaceTeams(params.league, yearInt),
    prisma.teamColor.findMany(),
  ]);
  const paceTeam = paceTeams.filter((pt) => pt.team == teamDecoded)[0];
  const pacePlace = paceTeams.findIndex((pt) => pt.team == teamDecoded);
  const previewMatches = Array.from(paceTeam.paceMatches).reverse().slice(0, 3);

  return (
    <Stack>
      <Title
        order={2}
        style={{
          alignSelf: "flex-start",
        }}
      >
        {teamDecoded}
      </Title>
      <Anchor
        component={Link}
        href={`/${params.league}/${yearInt}`}
        style={{
          alignSelf: "flex-start",
        }}
      >
        <Text fs="italic">
          {leagues.get(params.league)?.name} {yearInt}
        </Text>
      </Anchor>
      <Title
        order={3}
        style={{
          alignSelf: "flex-start",
        }}
      >
        Recent Matches
      </Title>
      <FixturesTable paceMatches={previewMatches} team={teamDecoded} />
      <Title
        order={3}
        style={{
          alignSelf: "flex-start",
        }}
      >
        Table
      </Title>
      <PaceTable
        paceTeams={paceTeams.slice(
          Math.max(pacePlace - 2, 0),
          Math.min(pacePlace + 3, paceTeams.length),
        )}
        startPlace={Math.max(pacePlace - 2, 0)}
      />
      <Title
        order={3}
        style={{
          alignSelf: "flex-start",
        }}
      >
        Pace Chart
      </Title>
      <PaceChart paceTeams={[paceTeam]} allColors={allColors} />
      <Title
        order={3}
        style={{
          alignSelf: "flex-start",
        }}
      >
        Full Schedule
      </Title>
      <FixturesTable paceMatches={paceTeam.paceMatches} team={teamDecoded} />
    </Stack>
  );
}