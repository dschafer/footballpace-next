"use client";
import {
  Box,
  Group,
  MultiSelect,
  NumberFormatter,
  NumberInput,
  Stack,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTfoot,
  TableTh,
  TableThead,
  TableTr,
  Text,
} from "@mantine/core";
import ErrorAlert from "../error/error-alert";
import { ExtendedStandingsRow } from "@/lib/pace/standings";
import { PaceFixture } from "@/lib/pace/pace";
import UpcomingTableCell from "./upcoming-table-cell";
import { useState } from "react";

export default function UpcomingTable({
  standings,
  fixtures,
}: {
  standings: ExtendedStandingsRow[];
  fixtures: Map<string, PaceFixture[]>;
}) {
  const allTeams = standings.map(({ team }) => team);
  const maxFixtures = Math.max(
    0,
    ...Array.from(fixtures.values()).map((f) => f.length),
  );

  const [teams, setTeams] = useState(allTeams.slice(0, 4));
  const [matchCount, setMatchCount] = useState<string | number>(6);

  const filteredFixtures: PaceFixture[][] = teams.map(
    (t) => fixtures.get(t)?.slice(0, +matchCount)!,
  );
  const numFixtures = Math.max(0, ...filteredFixtures.map((f) => f.length));

  if (maxFixtures == 0) {
    return <ErrorAlert />;
  }

  return (
    <Stack>
      <Group
        preventGrowOverflow={false}
        gap="xs"
        grow
        wrap="nowrap"
        align="start"
      >
        <NumberInput
          label="Matches"
          allowDecimal={false}
          min={1}
          max={maxFixtures}
          onChange={setMatchCount}
          value={matchCount}
          hideControls
          maw="6em"
        />
        <MultiSelect
          label="Teams"
          data={allTeams}
          maxValues={6}
          searchable
          onChange={setTeams}
          value={teams}
        />
      </Group>
      <TableScrollContainer minWidth={0}>
        <Table
          style={{
            borderSpacing: "var(--mantine-spacing-xs) 0",
            borderCollapse: "separate",
          }}
        >
          <Box component="colgroup">
            {teams.map((team) => (
              <Box
                component="col"
                width={`${100 / teams.length}%`}
                key={team}
              />
            ))}
          </Box>
          <TableThead>
            <TableTr bd={0}>
              {teams.map((team) => (
                <TableTh ta="center" key={team}>
                  <Text span size="lg" fw={700}>
                    {team}
                  </Text>
                </TableTh>
              ))}
            </TableTr>
          </TableThead>
          <TableTbody>
            {[...Array(numFixtures)].map((_, matchNum) => (
              <TableTr key={matchNum} bd={0}>
                {teams.map((team, teamNum) => {
                  const paceFixture = filteredFixtures[teamNum][matchNum];
                  if (!paceFixture) {
                    return <TableTd key={team} ml="xs" pl="xs" />;
                  }
                  return (
                    <UpcomingTableCell
                      paceFixture={paceFixture}
                      key={team}
                      style={{
                        borderTopLeftRadius:
                          matchNum == 0 ? "var(--mantine-radius-lg)" : 0,
                        borderTopRightRadius:
                          matchNum == 0 ? "var(--mantine-radius-lg)" : 0,
                      }}
                    />
                  );
                })}
              </TableTr>
            ))}
          </TableTbody>
          <TableTfoot>
            <TableTr bd={0}>
              {teams.map((team, teamNum) => (
                <TableTd
                  ta="center"
                  key={team}
                  fw="700"
                  bg="summary-row"
                  style={{
                    borderBottomLeftRadius: "var(--mantine-radius-lg)",
                    borderBottomRightRadius: "var(--mantine-radius-lg)",
                  }}
                >
                  <Stack gap="0">
                    <Text span fw={500} size="xs">
                      Total Target
                    </Text>
                    <Text span fw={700} size="lg">
                      <NumberFormatter
                        value={filteredFixtures[teamNum].reduce(
                          (a, f) => a + f.expectedPoints,
                          0,
                        )}
                        decimalScale={2}
                        fixedDecimalScale
                      />
                    </Text>
                    <Text span fw={500} size="xs">
                      {getRecordString(filteredFixtures[teamNum])}
                    </Text>
                  </Stack>
                </TableTd>
              ))}
            </TableTr>
          </TableTfoot>
        </Table>
      </TableScrollContainer>
    </Stack>
  );
}

function getRecord(
  matchCount: number,
  points: number,
): [number, number, number] {
  if (matchCount == 0) {
    return [0, 0, 0];
  }
  const pointsToGive = matchCount * 3 - points;
  if (pointsToGive < 2) {
    return [matchCount, 0, 0];
  }
  if (pointsToGive < 3) {
    return [matchCount - 1, 1, 0];
  }
  if (pointsToGive < 4) {
    return [matchCount - 1, 0, 1];
  }
  if (pointsToGive < 5) {
    return [matchCount - 2, 2, 0];
  }
  if (pointsToGive < 6) {
    return [matchCount - 2, 1, 1];
  }
  const [w, d, l] = getRecord(matchCount - 1, points);
  return [w, d, l + 1];
}

function getRecordString(fixtures: PaceFixture[]): string {
  const [w, d, l] = getRecord(
    fixtures.length,
    fixtures.reduce((a, f) => a + f.expectedPoints, 0),
  );
  return `W${w} D${d} L${l}`;
}
