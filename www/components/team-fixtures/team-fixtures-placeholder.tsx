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
  VisuallyHidden,
} from "@mantine/core";

const teamNameWidths = ["65%", "85%", "75%"];

export default function TeamFixturesPlaceholder({
  matchCount,
}: {
  matchCount: number;
}) {
  return (
    <Stack>
      <Title order={3} aria-hidden="true">
        <Skeleton height="1lh" width="100%" />
      </Title>
      <TableScrollContainer minWidth={0}>
        <VisuallyHidden role="status">Loading fixtures…</VisuallyHidden>
        <Table stickyHeader striped aria-hidden="true">
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
                  <Skeleton height="1lh" miw="9em" />
                </TableTd>
                <TableTd ta="right">
                  <Skeleton
                    height="1lh"
                    miw="9ch"
                    width={teamNameWidths[i % teamNameWidths.length]}
                    ml="auto"
                  />
                </TableTd>
                <TableTd ta="right">
                  <Skeleton height="1lh" miw="3ch" />
                </TableTd>
              </TableTr>
            ))}
          </TableTbody>
        </Table>
      </TableScrollContainer>
    </Stack>
  );
}
