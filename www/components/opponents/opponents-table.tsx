import {
  Stack,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTh,
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
  const [paceSheetEntries, projectedStandings] = await Promise.all([
    prisma.paceSheetEntry.findMany({
      where: { league: league, year: year, teamFinish: 1 },
    }),
    fetchProjectedStandings(league, year),
  ]);
  if (paceSheetEntries.length == 0) {
    return null;
  }

  return (
    <Stack>
      <Title order={3}>Opponents</Title>
      <Text></Text>
      <TableScrollContainer minWidth={0}>
        <Table stickyHeader striped="even">
          <TableTbody>
            <TableTr bg="var(--mantine-color-dimmed)">
              <TableTh>Opponent</TableTh>
              {[...Array(projectedStandings.length / 2)].map((_, i) => (
                <TableTh key={i} ta="right">
                  {i == 0 ? "" : i + 1}
                </TableTh>
              ))}
            </TableTr>
            <TableTr>
              <TableTh scope="row">Home</TableTh>
              {[...Array(projectedStandings.length / 2)].map((_, i) => (
                <OpponentsTableCell
                  key={i}
                  home={true}
                  opponentFinish={i + 1}
                  paceSheetEntries={paceSheetEntries}
                  paceTeam={paceTeam}
                  projectedStandings={projectedStandings}
                />
              ))}
            </TableTr>
            <TableTr>
              <TableTh scope="row">Away</TableTh>
              {[...Array(projectedStandings.length / 2)].map((_, i) => (
                <OpponentsTableCell
                  key={i}
                  home={false}
                  opponentFinish={i + 1}
                  paceSheetEntries={paceSheetEntries}
                  paceTeam={paceTeam}
                  projectedStandings={projectedStandings}
                />
              ))}
            </TableTr>
            <TableTr />
            <TableTr bg="var(--mantine-color-dimmed)">
              <TableTh>Opponent</TableTh>
              {[...Array(projectedStandings.length / 2)].map((_, i) => (
                <TableTh key={i} ta="right">
                  {i + projectedStandings.length / 2 + 1}
                </TableTh>
              ))}
            </TableTr>
            <TableTr>
              <TableTh scope="row">Home</TableTh>
              {[...Array(projectedStandings.length / 2)].map((_, i) => (
                <OpponentsTableCell
                  key={i}
                  home={true}
                  opponentFinish={i + projectedStandings.length / 2 + 1}
                  paceSheetEntries={paceSheetEntries}
                  paceTeam={paceTeam}
                  projectedStandings={projectedStandings}
                />
              ))}
            </TableTr>
            <TableTr>
              <TableTh scope="row">Away</TableTh>
              {[...Array(projectedStandings.length / 2)].map((_, i) => (
                <OpponentsTableCell
                  key={i}
                  home={false}
                  opponentFinish={i + projectedStandings.length / 2 + 1}
                  paceSheetEntries={paceSheetEntries}
                  paceTeam={paceTeam}
                  projectedStandings={projectedStandings}
                />
              ))}
            </TableTr>
          </TableTbody>
        </Table>
      </TableScrollContainer>
    </Stack>
  );
}
