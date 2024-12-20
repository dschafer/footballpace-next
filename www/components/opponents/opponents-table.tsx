import {
  Anchor,
  Stack,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
} from "@mantine/core";
import Link from "next/link";
import LinkableHeader from "../header/linkable-header";
import OpponentsTableCell from "./opponents-table-cell";
import type { PaceTeam } from "@/lib/pace/pace";
import { fetchProjectedStandings } from "@/lib/pace/projections";
import prisma from "@/lib/prisma";

export default async function OpponentsTable({
  league,
  year,
  paceTeam,
}: {
  league: string;
  year: number;
  paceTeam: PaceTeam;
}) {
  const [fixtures, paceSheetEntries, projectedStandings] = await Promise.all([
    prisma.fixture.findMany({
      where: {
        league: league,
        year: year,
        OR: [{ homeTeam: paceTeam.team }, { awayTeam: paceTeam.team }],
      },
      orderBy: { kickoffTime: "asc" },
    }),
    prisma.paceSheetEntry.findMany({
      where: { league: league, year: year, teamFinish: 1 },
    }),
    fetchProjectedStandings(league, year),
  ]);
  if (paceSheetEntries.length == 0) {
    return null;
  }

  const teamPsr = projectedStandings.find((psr) => psr.team == paceTeam.team)!;
  const arrangedProjectedStandings = projectedStandings.filter(
    (psr) => psr.team != paceTeam.team,
  );
  arrangedProjectedStandings.unshift(teamPsr);

  return (
    <Stack>
      <LinkableHeader order={3} title="Opponents" />
      <Text size="sm">
        This shows all opponents in their{" "}
        <Anchor component={Link} href={`/${league}/${year}/explanation`}>
          projected order of finish
        </Anchor>{" "}
        (assuming that {paceTeam.team} wins the league), and shows the results
        of the matches played thus far, including the points taken from the
        match (
        <Text span fw={500} inherit>
          <abbr title="Points">Pts</abbr>
        </Text>
        ) and the target points from the match (
        <Text span fw={500} inherit>
          <abbr title="Target Points">Tgt</abbr>
        </Text>
        ). This is most useful mid-season, since it shows whether a team has
        played their most difficult matches yet (those against top teams and
        away from home). By the end of the season, every cell will be filled in.
      </Text>
      <TableScrollContainer minWidth={0}>
        <Table stickyHeader striped>
          <TableThead>
            <TableTr>
              <TableTh ta="right">Position</TableTh>
              <TableTh ta="right">Team</TableTh>
              <TableTh ta="right">Home</TableTh>
              <TableTh ta="right">Away</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {arrangedProjectedStandings.map((psr, i) => (
              <TableTr key={psr.team}>
                <TableTd ta="right">{i + 1}</TableTd>
                <TableTh scope="row" ta="right">
                  {psr.team}
                </TableTh>
                <OpponentsTableCell
                  home={true}
                  opponentFinish={i + 1}
                  fixtures={fixtures}
                  paceSheetEntries={paceSheetEntries}
                  paceTeam={paceTeam}
                  projectedStandingsRow={psr}
                />
                <OpponentsTableCell
                  home={false}
                  opponentFinish={i + 1}
                  fixtures={fixtures}
                  paceSheetEntries={paceSheetEntries}
                  paceTeam={paceTeam}
                  projectedStandingsRow={psr}
                />
              </TableTr>
            ))}
          </TableTbody>
        </Table>
      </TableScrollContainer>
    </Stack>
  );
}
