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
} from "@mantine/core";

export default function RecentPaceTablePlaceholder({
  rowCount,
}: {
  rowCount?: number;
}) {
  return (
    <TableScrollContainer minWidth={0}>
      <Table stickyHeader striped>
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
            <TableTh ta="right">vs. Expected</TableTh>
            <TableTh ta="right">Points</TableTh>
            <TableTh ta="right">Season vs. Pace</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {[...Array(rowCount)].map((_, rowNum) => {
            return (
              <TableTr key={rowNum}>
                <TableTd ta="center">{rowNum + 1}</TableTd>
                <TableTh ta="left" scope="row">
                  <Skeleton>Arsenal</Skeleton>
                </TableTh>
                <TableTd ta="center">
                  <Skeleton>Arsenal 7:0 Chelsea</Skeleton>
                </TableTd>
                <TableTd ta="right" p="0">
                  <Skeleton>+3</Skeleton>
                </TableTd>
                <TableTd ta="right" p="xs">
                  <Skeleton>3</Skeleton>
                </TableTd>
                <TableTd ta="right" p="0">
                  <Skeleton>+3</Skeleton>
                </TableTd>
              </TableTr>
            );
          })}
        </TableTbody>
      </Table>
    </TableScrollContainer>
  );
}
