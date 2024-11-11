import {
  Stack,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  Title,
} from "@mantine/core";
import OpponentsTableCell from "./opponents-table-cell";
import { PaceTeam } from "@/lib/pace/pace";
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

  const teamPsr = projectedStandings.filter(
    (psr) => psr.team == paceTeam.team,
  )[0];
  const arrangedProjectedStandings = projectedStandings.filter(
    (psr) => psr.team != paceTeam.team,
  );
  arrangedProjectedStandings.unshift(teamPsr);

  return (
    <Stack>
      <Title order={3}>Opponents</Title>
      <Text size="sm">
        This shows all opponents in their projected order of finish (assuming
        that {paceTeam.team} wins the league), and shows the results of the
        matches played thus far. This is most useful mid-season, since it shows
        whether a team has played their most difficult matches yet (those
        against top teams and away from home). By the end of the season, every
        cell will be filled in.
      </Text>
      <TableScrollContainer minWidth={0}>
        <Table stickyHeader striped>
          <TableThead>
            <TableTr>
              <TableTh ta="right">Pos</TableTh>
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
