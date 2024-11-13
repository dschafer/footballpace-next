import {
  NumberFormatter,
  Table,
  TableCaption,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
} from "@mantine/core";
import ErrorAlert from "../error/error-alert";
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
    return <ErrorAlert />;
  }

  const homePace = [...Array(paceSheetEntries.length / 2 + 1)];
  const awayPace = [...Array(paceSheetEntries.length / 2 + 1)];
  for (const entry of paceSheetEntries) {
    if (entry.home) {
      homePace[entry.opponentFinish] = entry.expectedPoints;
    } else {
      awayPace[entry.opponentFinish] = entry.expectedPoints;
    }
  }
  return (
    <TableScrollContainer minWidth={0}>
      <Table stickyHeader striped>
        <TableCaption>
          <Text fw={700} span inherit>
            Home
          </Text>
          <Text span inherit>
            :{" "}
            <NumberFormatter
              value={homePace.reduce((a, p) => (p ? a + p : a), 0)}
              decimalScale={2}
              fixedDecimalScale
            />{" "}
            &middot;{" "}
          </Text>
          <Text fw={700} span inherit>
            Away
          </Text>
          <Text span inherit>
            :{" "}
            <NumberFormatter
              value={awayPace.reduce((a, p) => (p ? a + p : a), 0)}
              decimalScale={2}
              fixedDecimalScale
            />{" "}
            &middot;{" "}
          </Text>
          <Text fw={700} span inherit>
            Total
          </Text>
          <Text span inherit>
            :{" "}
            <NumberFormatter
              value={
                homePace.reduce((a, p) => (p ? a + p : a), 0) +
                awayPace.reduce((a, p) => (p ? a + p : a), 0)
              }
              decimalScale={2}
              fixedDecimalScale
            />
          </Text>
        </TableCaption>
        <TableThead>
          <TableTr>
            <TableTh ta="right">Position</TableTh>
            <TableTh ta="right">Home</TableTh>
            <TableTh ta="right">Away</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {[...Array(paceSheetEntries.length / 2)].map((_, i) => (
            <TableTr key={i}>
              <TableTd ta="right">{i + 2}</TableTd>
              <TableTd ta="right">
                <NumberFormatter
                  value={homePace[i + 2]}
                  decimalScale={2}
                  fixedDecimalScale
                />
              </TableTd>
              <TableTd ta="right">
                <NumberFormatter
                  value={awayPace[i + 2]}
                  decimalScale={2}
                  fixedDecimalScale
                />
              </TableTd>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </TableScrollContainer>
  );
}
