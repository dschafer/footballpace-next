import { Anchor, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import OpponentsTable from "@/components/opponents/opponents-table";
import PaceChart from "@/components/pace-chart/pace-chart";
import PaceTable from "@/components/pace-table/pace-table";
import ResultsTable from "@/components/results-table/results-table";
import TeamFixtures from "@/components/fixtures/team-fixtures";
import { fetchPaceTeams } from "@/lib/pace/pace";
import leagues from "@/lib/const/leagues";
import prisma from "@/lib/prisma";

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
      <Title order={3}>Recent Matches</Title>
      <ResultsTable paceMatches={previewMatches} team={teamDecoded} />
      <Title order={3}>Table</Title>
      <PaceTable
        paceTeams={paceTeams.slice(
          Math.max(pacePlace - 2, 0),
          Math.min(pacePlace + 3, paceTeams.length),
        )}
        startPlace={Math.max(pacePlace - 2, 0)}
      />
      <Title order={3}>Pace Chart</Title>
      <PaceChart paceTeams={[paceTeam]} allColors={allColors} />
      <OpponentsTable
        league={params.league}
        year={yearInt}
        paceTeam={paceTeam}
      />
      <Title order={3}>Full Results</Title>
      <ResultsTable paceMatches={paceTeam.paceMatches} team={teamDecoded} />
      <TeamFixtures league={params.league} year={yearInt} team={teamDecoded} />
    </Stack>
  );
}
