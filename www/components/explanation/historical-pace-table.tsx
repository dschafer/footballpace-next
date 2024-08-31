import {
  NumberFormatter,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";
import prisma from "@/lib/prisma";

export default async function HistoricalPaceTable({
  league,
  year,
}: {
  league: string;
  year: number;
}) {
  const paceSheetEntries = await prisma.paceSheetEntry.findMany({
    where: { league: league, year: year, teamFinish: 1 },
  });
  if (paceSheetEntries.length == 0) {
    return null;
  }

  const homePace = [...Array(paceSheetEntries.length / 2)];
  const awayPace = [...Array(paceSheetEntries.length / 2)];
  for (const entry of paceSheetEntries) {
    if (entry.home) {
      homePace[entry.opponentFinish - 1] = entry.expectedPoints;
    } else {
      awayPace[entry.opponentFinish - 1] = entry.expectedPoints;
    }
  }

  return (
    <TableScrollContainer minWidth={0}>
      <Table stickyHeader striped>
        <TableThead>
          <TableTr>
            <TableTh>Match</TableTh>
            {[...Array(homePace.length)].map((pace, i) => (
              <TableTh key={i} ta="right">
                {i + 1}
              </TableTh>
            ))}
          </TableTr>
        </TableThead>
        <TableTbody>
          <TableTr>
            <TableTh scope="row">Home</TableTh>
            {homePace.map((pace, i) => (
              <TableTd ta="right" key={i}>
                <NumberFormatter value={i == 0 ? "" : pace} decimalScale={2} />
              </TableTd>
            ))}
          </TableTr>
          <TableTr>
            <TableTh scope="row">Away</TableTh>
            {awayPace.map((pace, i) => (
              <TableTd ta="right" key={i}>
                <NumberFormatter value={i == 0 ? "" : pace} decimalScale={2} />
              </TableTd>
            ))}
          </TableTr>
        </TableTbody>
      </Table>
    </TableScrollContainer>
  );
}
