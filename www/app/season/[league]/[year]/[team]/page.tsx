import { Anchor, Text, Title } from "@mantine/core";
import FixturesTable from "@/components/fixtures-table/fixtures-table";
import Link from "next/link";
import leagues from "@/lib/const/leagues";

export default function SeasonPage({
  params,
}: {
  params: {
    league: string;
    year: string;
    team: string;
  };
}) {
  const yearInt = parseInt(params.year);
  return (
    <>
      <Title order={2}>{params.team}</Title>
      <Anchor component={Link} href={`/table/${params.league}/${yearInt}`}>
        <Text fs="italic">
          {leagues.get(params.league)} {yearInt}
        </Text>
      </Anchor>
      <FixturesTable
        league={params.league}
        year={parseInt(params.year)}
        team={params.team}
      />
    </>
  );
}
