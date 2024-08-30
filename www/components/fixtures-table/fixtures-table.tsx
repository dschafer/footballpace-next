import {
  Anchor,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function FixturesTable({
  league,
  year,
  team,
}: {
  league: string;
  year: number;
  team: string;
}) {
  const matches = await prisma.match.findMany({
    where: {
      league: league,
      year: year,
      OR: [{ homeTeam: team }, { awayTeam: team }],
    },
  });

  return (
    <Table stickyHeader striped>
      <TableThead>
        <TableTr>
          <TableTh ta="left">Date</TableTh>
          <TableTh ta="right">Home</TableTh>
          <TableTh ta="center">Result</TableTh>
          <TableTh ta="left">Away</TableTh>
        </TableTr>
      </TableThead>
      <TableTbody>
        {matches.map((match, i) => (
          <TableTr key={i}>
            <TableTd ta="left">{match.date.toLocaleDateString()}</TableTd>
            <TableTd ta="right">
              <Anchor
                component={Link}
                href={`/season/${league}/${year}/${match.homeTeam}`}
              >
                {match.homeTeam}
              </Anchor>
            </TableTd>
            <TableTd ta="center">
              {match.ftHomeGoals} - {match.ftAwayGoals}
            </TableTd>
            <TableTd ta="left">
              <Anchor
                component={Link}
                href={`${league}/${year}/${match.awayTeam}`}
              >
                {match.awayTeam}
              </Anchor>
            </TableTd>
          </TableTr>
        ))}
      </TableTbody>
    </Table>
  );
}
