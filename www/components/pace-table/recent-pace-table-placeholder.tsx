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
import ColoredCell from "../pace-display/colored-cell";

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
          <Box component="col" width="40%" />
          <Box component="col" width="25%" />
          <Box component="col" width="15%" />
          <Box component="col" width="15%" />
        </Box>
        <TableThead>
          <TableTr>
            <TableTh ta="center">#</TableTh>
            <TableTh ta="left">Team</TableTh>
            <TableTh ta="center">Last Result</TableTh>
            <TableTh ta="right">Last Result vs. Pace</TableTh>
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
                <ColoredCell val={0} ta="right" p="0">
                  <Skeleton>+3</Skeleton>
                </ColoredCell>
                <ColoredCell val={0} ta="right" p="0">
                  <Skeleton>+3</Skeleton>
                </ColoredCell>
              </TableTr>
            );
          })}
        </TableTbody>
      </Table>
    </TableScrollContainer>
  );
}
