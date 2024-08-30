import {
  Anchor,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Title,
} from "@mantine/core";
import Link from "next/link";
import leagues from "@/lib/leagues";
import prisma from "@/lib/prisma";

export default async function StandingsTable({
  rowCount,
  league,
  year,
}: {
  rowCount?: number;
  league: string;
  year: number;
}) {
  const standings = await prisma.standingsRow.findMany({
    where: { league: league, year: year },
  });
  if (standings.length == 0) {
    return null;
  }

  var sortedStandings = standings.sort(
    (a, b) => b.points - a.points || b.gd - a.gd || b.goalsFor - a.goalsFor,
  );
  if (rowCount) {
    sortedStandings = sortedStandings.slice(0, rowCount);
  }

  return (
    <Table stickyHeader striped>
      <TableThead>
        <TableTr>
          <TableTh ta="center">#</TableTh>
          <TableTh ta="left">Team</TableTh>
          <TableTh ta="right">Played</TableTh>
          <TableTh ta="right">Won</TableTh>
          <TableTh ta="right">Drawn</TableTh>
          <TableTh ta="right">Lost</TableTh>
          <TableTh ta="right">For</TableTh>
          <TableTh ta="right">Against</TableTh>
          <TableTh ta="right">GD</TableTh>
          <TableTh ta="right">Points</TableTh>
        </TableTr>
      </TableThead>
      <TableTbody>
        {sortedStandings.map((row, i) => (
          <TableTr key={row.team}>
            <TableTd ta="center">{i + 1}</TableTd>
            <TableTh ta="left" scope="row">
              <Anchor
                component={Link}
                href={`/season/${league}/${year}/${row.team}`}
              >
                {row.team}
              </Anchor>
            </TableTh>
            <TableTd ta="right">{row.played}</TableTd>
            <TableTd ta="right">{row.wins}</TableTd>
            <TableTd ta="right">{row.draws}</TableTd>
            <TableTd ta="right">{row.losses}</TableTd>
            <TableTd ta="right">{row.goalsFor}</TableTd>
            <TableTd ta="right">{row.goalsAgainst}</TableTd>
            <TableTd ta="right">{row.gd}</TableTd>
            <TableTd ta="right" fw={600}>
              {row.points}
            </TableTd>
          </TableTr>
        ))}
      </TableTbody>
    </Table>
  );
}
