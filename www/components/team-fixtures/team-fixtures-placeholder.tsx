import {
  Skeleton,
  Stack,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Title,
} from "@mantine/core";

export default function TeamFixturesPlaceholder({
  matchCount,
}: {
  matchCount: number;
}) {
  return (
    <Stack>
      <Title order={3}>
        <Skeleton>Fixtures</Skeleton>
      </Title>
      <TableScrollContainer minWidth={0}>
        <Table stickyHeader striped>
          <TableThead>
            <TableTr>
              <TableTh ta="right">Date</TableTh>
              <TableTh ta="right">Match</TableTh>
              <TableTh ta="right">Target Pace</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {[...Array(matchCount)].map((_, i) => (
              <TableTr key={i}>
                <TableTd ta="right">
                  <Skeleton>Jan 1, 2024 5:30 PM</Skeleton>
                </TableTd>
                <TableTd ta="right">
                  <Skeleton>vs Tottenham</Skeleton>
                </TableTd>
                <TableTd ta="right">
                  <Skeleton>2.0</Skeleton>
                </TableTd>
              </TableTr>
            ))}
          </TableTbody>
        </Table>
      </TableScrollContainer>
    </Stack>
  );
}
