import { Anchor, Stack, Text, Title } from "@mantine/core";
import { Metadata, ResolvingMetadata } from "next/types";
import { openGraphMetadata, twitterMetadata } from "@/lib/metadata";
import Link from "next/link";
import LinkableHeader from "@/components/header/linkable-header";
import OpponentsTable from "@/components/opponents/opponents-table";
import PaceChart from "@/components/pace-chart/pace-chart";
import PaceTable from "@/components/pace-table/pace-table";
import ResultsTable from "@/components/results-table/results-table";
import TeamFixtures from "@/components/team-fixtures/team-fixtures";
import { fetchPaceTeams } from "@/lib/pace/pace";
import { fetchTeamColorMap } from "@/lib/color";
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

export async function generateMetadata(
  { params }: { params: SeasonPageParams },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const teamDecoded = decodeURIComponent(params.team);
  const title = `${teamDecoded} ${params.year}`;
  return {
    title,
    openGraph: { ...openGraphMetadata, title },
    twitter: { ...twitterMetadata, title },
  };
}

export default async function SeasonPage({
  params,
}: {
  params: SeasonPageParams;
}) {
  const yearInt = parseInt(params.year);
  const teamDecoded = decodeURIComponent(params.team);

  const [paceTeams, teamColorMap] = await Promise.all([
    fetchPaceTeams(params.league, yearInt),
    fetchTeamColorMap(),
  ]);
  const paceTeam = paceTeams.filter((pt) => pt.team == teamDecoded)[0];
  const pacePlace = paceTeams.findIndex((pt) => pt.team == teamDecoded);
  const previewMatches = Array.from(paceTeam.paceMatches).reverse().slice(0, 3);

  return (
    <Stack>
      <Title order={2}>{teamDecoded}</Title>
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
      <LinkableHeader order={3} title="Recent Matches" />
      <ResultsTable paceMatches={previewMatches} team={teamDecoded} />
      <LinkableHeader order={3} title="Table" />
      <PaceTable
        paceTeams={paceTeams.slice(
          Math.max(pacePlace - 2, 0),
          Math.min(pacePlace + 3, paceTeams.length),
        )}
        startPlace={Math.max(pacePlace - 2, 0)}
      />
      <LinkableHeader order={3} title="Pace Chart" />
      <PaceChart paceTeams={[paceTeam]} teamColorMap={teamColorMap} />
      <OpponentsTable
        league={params.league}
        year={yearInt}
        paceTeam={paceTeam}
      />
      <LinkableHeader order={3} title="Full Results" />
      <ResultsTable paceMatches={paceTeam.paceMatches} team={teamDecoded} />
      <TeamFixtures league={params.league} year={yearInt} team={teamDecoded} />
    </Stack>
  );
}
