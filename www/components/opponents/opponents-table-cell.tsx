"use client";
import {
  NumberFormatter,
  Stack,
  TableTd,
  Text,
  isLightColor,
  useComputedColorScheme,
} from "@mantine/core";
import { PaceSheetEntry } from "@prisma/client";
import { PaceTeam } from "@/lib/pace/pace";
import { ProjectedStandingsRow } from "@/lib/pace/projections";
import Result from "../pace-display/result";

export default function OpponentsTableCell({
  opponentFinish,
  home,
  paceSheetEntries,
  paceTeam,
  projectedStandings,
}: {
  opponentFinish: number;
  home: boolean;
  paceSheetEntries: PaceSheetEntry[];
  paceTeam: PaceTeam;
  projectedStandings: ProjectedStandingsRow[];
}) {
  const computedColorScheme = useComputedColorScheme("light");
  const paceSheetEntry = paceSheetEntries.filter(
    (pse) => pse.home == home && pse.opponentFinish == opponentFinish,
  )[0];
  if (!paceSheetEntry) {
    return <TableTd />;
  }
  const withoutTeamProjectedStandings = projectedStandings.filter(
    (psr) => psr.team != paceTeam.team,
  );
  const projectedOpponent =
    withoutTeamProjectedStandings[opponentFinish - 2].team;
  const maybePaceMatch = paceTeam.paceMatches.filter(
    (pm) =>
      (home &&
        pm.match.homeTeam == paceTeam.team &&
        pm.match.awayTeam == projectedOpponent) ||
      (!home &&
        pm.match.awayTeam == paceTeam.team &&
        pm.match.homeTeam == projectedOpponent),
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
    let projText = (
      <Text span fs="italic" c="dimmed" size="sm">
        &nbsp;
        <br />
        {projectedOpponent}
      </Text>
    );
    if (!home) {
      projText = (
        <Text span fs="italic" c="dimmed" size="sm">
          {projectedOpponent}
          <br />
          &nbsp;
        </Text>
      );
    }
    return (
      <TableTd ta="right" p="xs">
        <Stack>
          {projText}
          <Text span fs="italic" c="dimmed" size="sm">
            <br />
            &nbsp;{" "}
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
