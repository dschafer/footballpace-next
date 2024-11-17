import {
  Box,
  NumberFormatter,
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
import { ExtendedStandingsRow } from "@/lib/pace/standings";
import { PaceFixture } from "@/lib/pace/pace";
import UpcomingTableCell from "./upcoming-table-cell";

export default function UpcomingTable({
  standings,
  fixtures,
}: {
  standings: ExtendedStandingsRow[];
  fixtures: PaceFixture[][];
}) {
  const numFixtures = Math.max(...fixtures.map((f) => f.length));

  return (
    <Stack>
      <TableScrollContainer minWidth={0}>
        <Table
          style={{
            borderSpacing: "var(--mantine-spacing-lg) 0",
            borderCollapse: "separate",
          }}
        >
          <Box component="colgroup">
            {standings.map(({ team }) => (
              <Box
                component="col"
                width={`${100 / standings.length}%`}
                key={team}
              />
            ))}
          </Box>
          <TableThead>
            <TableTr bd={0}>
              {standings.map(({ team }) => (
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
                {standings.map(({ team }, teamNum) => {
                  const paceFixture = fixtures[teamNum][matchNum];
                  if (!paceFixture) {
                    return <TableTd key={team} ml="xs" pl="xs" />;
                  }
                  return (
                    <UpcomingTableCell
                      paceFixture={paceFixture}
                      key={team}
                      style={{
                        borderTopLeftRadius:
                          matchNum == 0 ? "var(--mantine-radius-xl)" : 0,
                        borderTopRightRadius:
                          matchNum == 0 ? "var(--mantine-radius-xl)" : 0,
                      }}
                    />
                  );
                })}
              </TableTr>
            ))}
          </TableTbody>
          <TableTfoot>
            <TableTr bd={0}>
              {standings.map(({ team }, teamNum) => (
                <TableTd
                  ta="center"
                  key={team}
                  fw="700"
                  bg="summary-row"
                  style={{
                    borderBottomLeftRadius: "var(--mantine-radius-xl)",
                    borderBottomRightRadius: "var(--mantine-radius-xl)",
                  }}
                >
                  <Stack gap="0">
                    <Text span fw={500} size="xs">
                      Total Target
                    </Text>
                    <Text span fw={700} size="lg">
                      <NumberFormatter
                        value={fixtures[teamNum].reduce(
                          (a, f) => a + f.expectedPoints,
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
        </Table>
      </TableScrollContainer>
    </Stack>
  );
}
