import {
  Box,
  Skeleton,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  VisuallyHidden,
} from "@mantine/core";

const teamNameWidths = ["65%", "85%", "75%"];
const matchResultWidths = ["80%", "95%", "85%"];

export default function RecentPaceTablePlaceholder({
  rowCount,
}: {
  rowCount?: number;
}) {
  return (
    <TableScrollContainer minWidth={0}>
      <VisuallyHidden role="status">Loading recent pace…</VisuallyHidden>
      <Table stickyHeader striped aria-hidden="true">
        <Box component="colgroup">
          <Box component="col" width="5%" />
          <Box component="col" width="35%" />
          <Box component="col" width="25%" />
          <Box component="col" width="15%" />
          <Box component="col" width="10%" />
          <Box component="col" width="10%" />
        </Box>
        <TableThead>
          <TableTr>
            <TableTh ta="center">#</TableTh>
            <TableTh ta="left">Team</TableTh>
            <TableTh ta="right">Last Result</TableTh>
            <TableTh ta="right">vs. Target</TableTh>
            <TableTh ta="right">Points</TableTh>
            <TableTh ta="right">Season vs. Pace</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {[...Array(rowCount)].map((_, rowNum) => {
            return (
              <TableTr key={rowNum}>
                <TableTd ta="center">
                  <Skeleton height="1lh" miw={rowNum < 9 ? "1ch" : "2ch"} />
                </TableTd>
                <TableTh ta="left" scope="row">
                  <Skeleton
                    height="1lh"
                    miw="6ch"
                    width={teamNameWidths[rowNum % teamNameWidths.length]}
                  />
                </TableTh>
                <TableTd ta="center">
                  <Skeleton
                    height="1lh"
                    miw="6ch"
                    width={matchResultWidths[rowNum % matchResultWidths.length]}
                    mx="auto"
                  />
                </TableTd>
                <TableTd ta="right" p="0">
                  <Skeleton height="1lh" miw="2ch" />
                </TableTd>
                <TableTd ta="right" p="xs">
                  <Skeleton height="1lh" miw="1ch" />
                </TableTd>
                <TableTd ta="right" p="0">
                  <Skeleton height="1lh" miw="2ch" />
                </TableTd>
              </TableTr>
            );
          })}
        </TableTbody>
      </Table>
    </TableScrollContainer>
  );
}
