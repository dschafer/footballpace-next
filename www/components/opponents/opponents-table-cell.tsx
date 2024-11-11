"use client";
import { Fixture, PaceSheetEntry } from "@prisma/client";
import {
  NumberFormatter,
  Stack,
  TableTd,
  Text,
  isLightColor,
  useComputedColorScheme,
} from "@mantine/core";

import { PaceTeam } from "@/lib/pace/pace";
import { ProjectedStandingsRow } from "@/lib/pace/projections";
import Result from "../pace-display/result";
import leagues from "@/lib/const/leagues";

export default function OpponentsTableCell({
  opponentFinish,
  home,
  fixtures,
  paceSheetEntries,
  paceTeam,
  projectedStandingsRow,
}: {
  opponentFinish: number;
  home: boolean;
  fixtures: Fixture[];
  paceSheetEntries: PaceSheetEntry[];
  paceTeam: PaceTeam;
  projectedStandingsRow: ProjectedStandingsRow;
}) {
  const computedColorScheme = useComputedColorScheme("light");
  const paceSheetEntry = paceSheetEntries.filter(
    (pse) => pse.home == home && pse.opponentFinish == opponentFinish,
  )[0];
  if (!paceSheetEntry) {
    return <TableTd />;
  }
  const projectedOpponent = projectedStandingsRow.team;
  const maybePaceMatch = paceTeam.paceMatches.filter(
    (pm) =>
      (home &&
        pm.match.homeTeam == paceTeam.team &&
        pm.match.awayTeam == projectedOpponent) ||
      (!home &&
        pm.match.awayTeam == paceTeam.team &&
        pm.match.homeTeam == projectedOpponent),
  )[0];
  const maybeFixture = fixtures.filter(
    (f) =>
      (home &&
        f.homeTeam == paceTeam.team &&
        f.awayTeam == projectedOpponent) ||
      (!home && f.awayTeam == paceTeam.team && f.homeTeam == projectedOpponent),
  )[0];

  if (maybePaceMatch) {
    const match = maybePaceMatch.match;
    let bgColors = ["red.2", "gray.2", "", "green.2"];
    if (computedColorScheme == "dark") {
      bgColors = ["red.9", "gray.7", "", "green.9"];
    }
    const bg = bgColors[maybePaceMatch.points];
    const fg = isLightColor(bg) ? "black" : "white";
    return (
      <TableTd ta="right" p="xs" bg={bg} color={fg}>
        <Stack>
          <Result match={match} link={true} multiline={true} />
          <Text span size="sm">
            <Text span fw="500">
              Pts
            </Text>
            : <NumberFormatter value={maybePaceMatch.points} decimalScale={2} />
            <br />
            <Text span fw="500">
              Exp
            </Text>
            :{" "}
            <NumberFormatter
              value={paceSheetEntry.expectedPoints}
              decimalScale={2}
            />
          </Text>
        </Stack>
      </TableTd>
    );
  } else {
    let matchDesc = (
      <Text span fs="italic" c="dimmed" size="sm">
        {paceTeam.team}
        <br />
        {projectedOpponent}
      </Text>
    );
    if (!home) {
      matchDesc = (
        <Text span fs="italic" c="dimmed" size="sm">
          {projectedOpponent}
          <br />
          {paceTeam.team}
        </Text>
      );
    }
    let pointsRow = <>&nbsp;</>;
    if (maybeFixture) {
      const dateStr = maybeFixture.kickoffTime.toLocaleDateString([], {
        timeZone: leagues.get(maybeFixture.league)?.tz,
        dateStyle: "short",
      });
      pointsRow = <>{dateStr}</>;
    }
    return (
      <TableTd ta="right" p="xs">
        <Stack>
          <Text span fs="italic" c="dimmed" size="sm">
            {matchDesc}
          </Text>
          <Text span fs="italic" c="dimmed" size="sm">
            {pointsRow}
            <br />
            <Text span fw="500">
              Exp
            </Text>
            :{" "}
            <NumberFormatter
              value={paceSheetEntry.expectedPoints}
              decimalScale={2}
            />
          </Text>
        </Stack>
      </TableTd>
    );
  }
}
