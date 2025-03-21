"use client";
import type { Fixture, PaceSheetEntry } from "@prisma/client";
import {
  NumberFormatter,
  Stack,
  TableTd,
  Text,
  darken,
  isLightColor,
  useComputedColorScheme,
} from "@mantine/core";

import type { PaceTeam } from "@/lib/pace/pace";
import type { ProjectedStandingsRow } from "@/lib/pace/projections";
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
  const paceSheetEntry = paceSheetEntries.find(
    (pse) => pse.home == home && pse.opponentFinish == opponentFinish,
  );
  if (!paceSheetEntry) {
    return <TableTd />;
  }
  const projectedOpponent = projectedStandingsRow.team;
  const maybePaceMatch = paceTeam.paceMatches.find(
    (pm) =>
      (home &&
        pm.match.homeTeam == paceTeam.team &&
        pm.match.awayTeam == projectedOpponent) ||
      (!home &&
        pm.match.awayTeam == paceTeam.team &&
        pm.match.homeTeam == projectedOpponent),
  );
  const maybeFixture = fixtures.find(
    (f) =>
      (home &&
        f.homeTeam == paceTeam.team &&
        f.awayTeam == projectedOpponent) ||
      (!home && f.awayTeam == paceTeam.team && f.homeTeam == projectedOpponent),
  );

  if (maybePaceMatch) {
    const match = maybePaceMatch.match;
    let bgColors = [
      "var(--mantine-color-red-2)",
      "var(--mantine-color-gray-3)",
      "",
      "var(--mantine-color-green-2)",
    ];
    if (computedColorScheme == "dark") {
      bgColors = [
        darken("var(--mantine-color-red-9)", 0.5),
        "var(--mantine-color-gray-7)",
        "",
        darken("var(--mantine-color-green-9)", 0.5),
      ];
    }
    const bg = bgColors[maybePaceMatch.points];
    const fg = isLightColor(bg) ? "black" : "white";
    return (
      <TableTd ta="right" p="xs" bg={bg} color={fg}>
        <Stack gap="xs">
          <Result match={match} link={true} multiline={true} />
          <Text span size="sm" inherit>
            <Text span fw={500} inherit>
              <abbr title="Points">Pts</abbr>
            </Text>
            : <NumberFormatter value={maybePaceMatch.points} decimalScale={0} />{" "}
            <Text span fw={500} inherit>
              <abbr title="Target Points">Tgt</abbr>
            </Text>
            :{" "}
            <NumberFormatter
              value={paceSheetEntry.expectedPoints}
              decimalScale={2}
              fixedDecimalScale
            />
          </Text>
        </Stack>
      </TableTd>
    );
  } else {
    let dateInfo = <>&nbsp;</>;
    if (maybeFixture) {
      const dateStr = maybeFixture.kickoffTime.toLocaleDateString([], {
        timeZone: leagues.get(maybeFixture.league)?.tz,
        dateStyle: "short",
      });
      dateInfo = <>{dateStr}</>;
    }
    let matchDesc = (
      <Text span fs="italic" c="dimmed" size="sm" inherit>
        {dateInfo}
        <br />
        vs {projectedOpponent}
      </Text>
    );
    if (!home) {
      matchDesc = (
        <Text span fs="italic" c="dimmed" size="sm" inherit>
          at {projectedOpponent}
          <br />
          {dateInfo}
        </Text>
      );
    }

    return (
      <TableTd ta="right" p="xs">
        <Stack gap="xs">
          <Text span fs="italic" c="dimmed" size="sm" inherit>
            {matchDesc}
          </Text>
          <Text span fs="italic" c="dimmed" size="sm" inherit>
            <Text span fw={500}>
              <abbr title="Target Points">Tgt</abbr>
            </Text>
            :{" "}
            <NumberFormatter
              value={paceSheetEntry.expectedPoints}
              decimalScale={2}
              fixedDecimalScale
            />
          </Text>
        </Stack>
      </TableTd>
    );
  }
}
