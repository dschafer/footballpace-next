import {
  Anchor,
  NumberFormatter,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";
import leagues from "@/lib/leagues";
import prisma from "@/lib/prisma";

export default async function PaceSheet({
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
    <>
      <Title order={2}>Pace Sheet</Title>
      <Anchor component={Link} href={`/leagueyear/${league}/${year}`}>
        <Text fs="italic">
          {leagues.get(league)} {year}
        </Text>
      </Anchor>

      <Table stickyHeader striped>
        <TableThead>
          <TableTr>
            <TableTh ta="center">Opponent Position</TableTh>
            <TableTh ta="right">Home</TableTh>
            <TableTh ta="right">Away</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {[...Array(paceSheetEntries.length / 2)].map((_, i) => (
            <TableTr key={i}>
              <TableTd ta="center">{i + 1}</TableTd>
              <TableTd ta="right">
                <NumberFormatter
                  value={i == 0 ? "" : homePace[i]}
                  decimalScale={2}
                />
              </TableTd>
              <TableTd ta="right">
                <NumberFormatter
                  value={i == 0 ? "" : awayPace[i]}
                  decimalScale={2}
                />
              </TableTd>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </>
  );
}
