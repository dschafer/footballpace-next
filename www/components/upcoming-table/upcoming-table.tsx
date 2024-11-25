"use client";
import {
  Anchor,
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
import ErrorAlert from "../error/error-alert";
import { ExtendedStandingsRow } from "@/lib/pace/standings";
import Link from "next/link";
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
  const league = standings[0].league;
  const year = standings[0].year;
  const allTeams = standings.map(({ team }) => team);
  const maxFixtures = Math.max(
    0,
    ...Array.from(fixtures.values()).map((f) => f.length),
  );

  const [teams, setTeams] = useState(allTeams.slice(0, 4));
  const [matchCount, setMatchCount] = useState<string | number>(6);

  const filteredFixtures: PaceFixture[][] = teams.map(
    (t) => fixtures.get(t)!.slice(0, +matchCount)!,
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
                    <Anchor
                      component={Link}
                      href={`/${league}/${year}/team/${team}`}
                      inherit
                      c="var(--mantine-color-text)"
                      underline="never"
                    >
                      {team}
                    </Anchor>
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
                      Total Difficulty
                    </Text>
                    <Text span fw={700} size="lg">
                      <NumberFormatter
                        value={filteredFixtures[teamNum].reduce(
                          (a, f) => a + 3 - f.expectedPoints,
                          0,
                        )}
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
