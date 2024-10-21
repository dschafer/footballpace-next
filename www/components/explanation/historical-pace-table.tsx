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
        <TableCaption>
          <Text fw={700} span>
            Home
          </Text>
          <Text span>
            :{" "}
            <NumberFormatter
              value={homePace.reduce((a, p) => (p ? a + p : a), 0)}
              decimalScale={2}
              fixedDecimalScale
            />{" "}
            &middot;{" "}
          </Text>
          <Text fw={700} span>
            Away
          </Text>
          <Text span>
            :{" "}
            <NumberFormatter
              value={awayPace.reduce((a, p) => (p ? a + p : a), 0)}
              decimalScale={2}
              fixedDecimalScale
            />{" "}
            &middot;{" "}
          </Text>
          <Text fw={700} span>
            Total
          </Text>
          <Text span>
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
            <TableTh>Match</TableTh>
            {homePace.map((_, i) => (
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
