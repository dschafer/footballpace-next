import { Anchor, Stack, Text, Title } from "@mantine/core";
import FixturesTable from "@/components/fixtures-table/fixtures-table";
import Link from "next/link";
import { fetchPaceTeams } from "@/lib/pace/pace";
import leagues from "@/lib/const/leagues";

export default async function SeasonPage({
  params,
}: {
  params: {
    league: string;
    year: string;
    team: string;
  };
}) {
  const yearInt = parseInt(params.year);
  const teamDecoded = decodeURIComponent(params.team);

  const paceTeams = await fetchPaceTeams(params.league, yearInt);
  const { paceMatches } = paceTeams.filter((pt) => pt.team == params.team)[0];

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
        href={`/table/${params.league}/${yearInt}`}
        style={{
          alignSelf: "flex-start",
        }}
      >
        <Text fs="italic">
          {leagues.get(params.league)} {yearInt}
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
      <FixturesTable
        paceMatches={paceMatches.toReversed().slice(0, 3)}
        team={teamDecoded}
      />
      <Title
        order={3}
        style={{
          alignSelf: "flex-start",
        }}
      >
        Full Schedule
      </Title>
      <FixturesTable paceMatches={paceMatches} team={teamDecoded} />
    </Stack>
  );
}
