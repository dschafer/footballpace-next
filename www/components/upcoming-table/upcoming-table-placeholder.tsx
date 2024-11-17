import {
  Box,
  Group,
  MultiSelect,
  NumberInput,
  Skeleton,
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

export default function UpcomingTablePlaceholder({
  teamCount,
  matchCount,
}: {
  teamCount: number;
  matchCount: number;
}) {
  return (
    <Stack>
      <Group>
        <Skeleton>
          <NumberInput label="Matches" allowDecimal={false} />
          <MultiSelect label="Teams" searchable />
        </Skeleton>
      </Group>
      <TableScrollContainer minWidth={0}>
        <Table
          style={{
            borderSpacing: "var(--mantine-spacing-lg) 0",
            borderCollapse: "separate",
          }}
        >
          <Box component="colgroup">
            {[...Array(teamCount)].map((_, i) => (
              <Box component="col" width={`${100 / teamCount}%`} key={i} />
            ))}
          </Box>
          <TableThead>
            <TableTr bd={0}>
              {[...Array(teamCount)].map((_, i) => (
                <TableTh ta="center" key={i}>
                  <Text span size="lg" fw={700}>
                    <Skeleton>Arsenal</Skeleton>
                  </Text>
                </TableTh>
              ))}
            </TableTr>
          </TableThead>
          <TableTbody>
            {[...Array(matchCount)].map((_, matchNum) => (
              <TableTr key={matchNum} bd={0}>
                {[...Array(teamCount)].map((_, i) => (
                  <TableTd key={i} ml="xs" pl="xs">
                    <Skeleton>
                      <Stack p={0}>
                        <Text>Tomorrow</Text>
                        <Text>Arsenal</Text>
                        <Text>2.0</Text>
                      </Stack>
                    </Skeleton>
                  </TableTd>
                ))}
              </TableTr>
            ))}
          </TableTbody>
          <TableTfoot>
            <TableTr bd={0}>
              {[...Array(teamCount)].map((_, i) => (
                <TableTd ta="center" key={i} fw="700">
                  <Stack gap="0">
                    <Text span fw={500} size="xs">
                      <Skeleton>Total Target</Skeleton>
                    </Text>
                    <Text span fw={700} size="lg">
                      <Skeleton>22.00</Skeleton>
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
