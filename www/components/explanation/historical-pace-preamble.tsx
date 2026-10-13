import { NumberFormatter, Stack, Text } from "@mantine/core";
import { finishToTargetKey, targetKeyLabels } from "@/lib/pace/target-key";
import ErrorAlert from "../error/error-alert";
import HistoricalPacePreamblePlaceholder from "./historical-pace-preamble-placeholder";
import { Suspense } from "react";
import { fetchPaceSheets } from "@/lib/pace/pace";
import { shouldCachePaceSheetData } from "@/lib/pace/data";

type HistoricalPacePreambleProps = {
  league: string;
  year: number;
  targetFinish?: number;
};

export default function HistoricalPacePreamble(
  props: HistoricalPacePreambleProps,
) {
  const targetFinish = props.targetFinish ?? 1;
  if (shouldCachePaceSheetData(props.league, props.year, targetFinish)) {
    return <HistoricalPacePreambleContent {...props} />;
  }
  return (
    <Suspense fallback={<HistoricalPacePreamblePlaceholder />}>
      <HistoricalPacePreambleContent {...props} />
    </Suspense>
  );
}

async function HistoricalPacePreambleContent({
  league,
  year,
  targetFinish = 1,
}: HistoricalPacePreambleProps) {
  const paceSheetEntries = await fetchPaceSheets(league, year, targetFinish);
  if (paceSheetEntries.length == 0) {
    return <ErrorAlert />;
  }
  const targetLabel = targetKeyLabels[finishToTargetKey(targetFinish)];
  const opponentPositions = paceSheetEntries.map(
    (entry) => entry.opponentFinish,
  );
  const highestOpponentPosition = Math.min(...opponentPositions);
  const lowestOpponentPosition = Math.max(...opponentPositions);
  const awayExample = paceSheetEntries.find(
    (pse) => pse.opponentFinish == highestOpponentPosition && !pse.home,
  )!;
  const homeExample = paceSheetEntries.find(
    (pse) => pse.opponentFinish == lowestOpponentPosition && pse.home,
  )!;
  return (
    <Stack>
      <Text inherit>
        This table shows the target number of points a team would take from each
        match, based on historical data and the {targetLabel} pace target. To
        read, find the row for the position of the opponent, then note whether
        the game was home or away and go to that column. The value in that row
        and column is how many points a typical team takes from that match with
        the {targetLabel} pace target.
      </Text>
      <Text inherit>
        For example, consider an away match against the highest-finishing
        opponent (note that if the pace target is the championship, the
        highest-finished opponent would be projected to finish 2nd, even if in
        reality they finished 1st). Looking at the row for Position{" "}
        {awayExample.opponentFinish} and the column for Away, we see that such
        teams typically take{" "}
        <Text inherit span fw={700}>
          <NumberFormatter
            value={awayExample.expectedPoints}
            decimalScale={2}
            fixedDecimalScale
          />
        </Text>{" "}
        points from that fixture. On the other hand, the easiest match is home
        to the team finishing last; looking at the row for position{" "}
        <NumberFormatter
          value={homeExample.opponentFinish}
          decimalScale={0}
          fixedDecimalScale
        />{" "}
        and the column for Home, we see that teams typically take{" "}
        <Text inherit span fw={700}>
          <NumberFormatter
            value={homeExample.expectedPoints}
            decimalScale={2}
            fixedDecimalScale
          />
        </Text>{" "}
        points from that fixture.
      </Text>
    </Stack>
  );
}
