import { NumberFormatter, Stack, Text } from "@mantine/core";
import ErrorAlert from "../error/error-alert";
import prisma from "@/lib/prisma";

export default async function HistoricalPacePreamble({
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
  const hardMatch = paceSheetEntries.filter(
    (pse) => pse.opponentFinish == 2 && !pse.home,
  )[0];
  const easyMatch = paceSheetEntries.filter(
    (pse) =>
      pse.opponentFinish == Math.round(1 + paceSheetEntries.length / 2) &&
      pse.home,
  )[0];
  return (
    <Stack>
      <Text inherit>
        This table shows the expected number of points a championship team would
        take from each match, based on historical data. To read, find the row
        for the position of the opponent, then note whether the game was home or
        away and go to that column. The value in that row and column is how many
        points a typical championship team takes from that match.
      </Text>
      <Text inherit>
        For example, the hardest match of the year for a championship team is
        away to the team that finishes 2nd; looking at the row for Position 2
        and the column for Away, we see that championship teams typically take{" "}
        <Text inherit span fw={700}>
          <NumberFormatter
            value={hardMatch.expectedPoints}
            decimalScale={2}
            fixedDecimalScale
          />
        </Text>{" "}
        points from that fixture. On the other hand, the easiest match is home
        to the team finishing last; looking at the row for position{" "}
        <NumberFormatter
          value={easyMatch.opponentFinish}
          decimalScale={0}
          fixedDecimalScale
        />{" "}
        and the column for Home, we see that championship teams typically take{" "}
        <Text inherit span fw={700}>
          <NumberFormatter
            value={easyMatch.expectedPoints}
            decimalScale={2}
            fixedDecimalScale
          />
        </Text>{" "}
        points from that fixture.
      </Text>
    </Stack>
  );
}
