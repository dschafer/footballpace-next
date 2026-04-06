"use client";

import {
  Box,
  Group,
  MultiSelect,
  NumberFormatter,
  NumberInput,
  Stack,
  Table,
  TableCaption,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTfoot,
  TableTh,
  TableThead,
  TableTr,
  Text,
} from "@mantine/core";
import { useMemo, useState } from "react";
import AnchorLink from "@/components/anchor-link/anchor-link";
import ErrorAlert from "../error/error-alert";
import type { ExtendedStandingsRow } from "@/lib/pace/standings";
import type { Fixture } from "@prisma/client";
import type { PaceFixture } from "@/lib/pace/pace-types";
import UpcomingTableBlankCell from "./upcoming-table-blank-cell";
import UpcomingTableCell from "./upcoming-table-cell";

export default function UpcomingTable({
  standings,
  fixtures,
}: {
  standings: ExtendedStandingsRow[];
  fixtures: Map<string, PaceFixture[]>;
}) {
  // Unique fixture key (match-level), ignoring date
  const fixtureKey = (f: Fixture) =>
    [f.league, f.year, f.homeTeam, f.awayTeam].join("|");
  const league = standings[0].league;
  const year = standings[0].year;
  const allTeams = standings.map(({ team }) => team);

  const [teams, setTeams] = useState(allTeams.slice(0, 4));
  const [matchCount, setMatchCount] = useState<string | number>(6);

  // Build unique fixture list across selected teams and assign clustered rows
  const {
    totalRows,
    teamRowToFixture,
  }: {
    totalRows: number;
    teamRowToFixture: Map<string, Map<number, PaceFixture>>;
  } = useMemo(() => {
    // Collect unique fixtures (match-level) across selected teams
    const uniqueFixtures = new Map<string, Fixture>();

    for (const team of teams) {
      const list = fixtures.get(team) ?? [];
      for (const pf of list) {
        const key = fixtureKey(pf.fixture);
        if (!uniqueFixtures.has(key)) {
          uniqueFixtures.set(key, pf.fixture);
        }
      }
    }

    // Sort by kickoff time
    const sortedFixtures = Array.from(uniqueFixtures.values()).sort(
      (a, b) => a.kickoffTime.getTime() - b.kickoffTime.getTime(),
    );

    // Assign rows based on 2-day gaps and team conflicts within a row
    const keyToRow = new Map<string, number>();
    let currentRow = 0;
    let lastInRowDate: Date | null = null;
    let teamsInRow = new Set<string>();

    for (const f of sortedFixtures) {
      const timeGapOk =
        lastInRowDate === null
          ? true
          : f.kickoffTime.getTime() - lastInRowDate.getTime() <
            60 * 60 * 60 * 1000; // < 60 hours continues same row
      const teamConflict =
        teamsInRow.has(f.homeTeam) || teamsInRow.has(f.awayTeam);

      if (!timeGapOk || teamConflict) {
        // start new row
        currentRow += 1;
        teamsInRow = new Set<string>();
        lastInRowDate = null;
      }

      keyToRow.set(fixtureKey(f), currentRow);
      teamsInRow.add(f.homeTeam);
      teamsInRow.add(f.awayTeam);
      lastInRowDate = f.kickoffTime;
    }

    const totalRows =
      sortedFixtures.length === 0
        ? 0
        : Math.max(...Array.from(keyToRow.values())) + 1;

    // For each selected team, map row -> that team's PaceFixture in that row
    const teamRowToFixture = new Map<string, Map<number, PaceFixture>>();
    for (const team of teams) {
      const rowMap = new Map<number, PaceFixture>();
      const list = fixtures.get(team) ?? [];
      for (const pf of list) {
        const row = keyToRow.get(fixtureKey(pf.fixture));
        if (row !== undefined) {
          if (!rowMap.has(row)) {
            rowMap.set(row, pf);
          }
        }
      }
      teamRowToFixture.set(team, rowMap);
    }

    return { totalRows, teamRowToFixture };
  }, [teams, fixtures]);

  if (totalRows == 0) {
    return <ErrorAlert />;
  }

  const rowsToShow = Math.min(+matchCount, totalRows);

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
          max={totalRows}
          onChange={setMatchCount}
          value={matchCount}
          hideControls
          maw="6em"
          miw="4em"
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
            borderSpacing: "var(--mantine-spacing-xs) 1px",
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
                    <AnchorLink
                      href={`/${league}/${year}/team/${team}`}
                      inherit
                      c="var(--mantine-color-text)"
                      underline="never"
                    >
                      {team}
                    </AnchorLink>
                  </Text>
                </TableTh>
              ))}
            </TableTr>
          </TableThead>
          <TableTbody>
            {[...Array(rowsToShow)].map((_, rowIdx) => (
              <TableTr key={rowIdx} bd={0}>
                {teams.map((team) => {
                  const rowMap = teamRowToFixture.get(team)!;
                  const paceFixture = rowMap.get(rowIdx);
                  if (!paceFixture) {
                    return (
                      <UpcomingTableBlankCell
                        key={team}
                        label={rowIdx === 0 ? "Already Played" : "No Match"}
                        style={{
                          borderTopLeftRadius:
                            rowIdx == 0 ? "var(--mantine-radius-lg)" : 0,
                          borderTopRightRadius:
                            rowIdx == 0 ? "var(--mantine-radius-lg)" : 0,
                        }}
                      />
                    );
                  }
                  return (
                    <UpcomingTableCell
                      paceFixture={paceFixture}
                      key={team}
                      style={{
                        borderTopLeftRadius:
                          rowIdx == 0 ? "var(--mantine-radius-lg)" : 0,
                        borderTopRightRadius:
                          rowIdx == 0 ? "var(--mantine-radius-lg)" : 0,
                      }}
                    />
                  );
                })}
              </TableTr>
            ))}
          </TableTbody>
          <TableTfoot>
            <TableTr bd={0}>
              {teams.map((team) => (
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
                      Total Difficulty
                    </Text>
                    <Text span fw={700} size="lg">
                      <NumberFormatter
                        value={(() => {
                          const rowMap = teamRowToFixture.get(team)!;
                          return Array.from(rowMap.entries())
                            .filter(([i]) => i < rowsToShow)
                            .reduce(
                              (sum, [_, f]) => sum + (3 - f.expectedPoints),
                              0,
                            );
                        })()}
                        decimalScale={2}
                        fixedDecimalScale
                      />
                    </Text>
                  </Stack>
                </TableTd>
              ))}
            </TableTr>
          </TableTfoot>
          <TableCaption>
            <Stack gap="xs">
              <Text>
                <Text inherit span fw={700}>
                  Difficulty
                </Text>{" "}
                is the average number of points that previous title-winning
                teams dropped in the corresponding match.
              </Text>
              <Text>
                <Text inherit span fw={700}>
                  Total Difficulty
                </Text>{" "}
                hence represents how many points each team can afford to drop
                over this run if they want to keep pace with previous
                title-winning teams.
              </Text>
            </Stack>
          </TableCaption>
        </Table>
      </TableScrollContainer>
    </Stack>
  );
}
