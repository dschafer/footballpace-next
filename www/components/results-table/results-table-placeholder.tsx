import {
  Skeleton,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";

export default function ResultsTablePlaceholder({
  rowCount,
}: {
  rowCount: number;
}) {
  return (
    <TableScrollContainer minWidth={0}>
      <Table stickyHeader striped>
        <TableThead>
          <TableTr>
            <TableTh ta="left">Date</TableTh>
            <TableTh ta="center">Result</TableTh>
            <TableTh ta="right">Season vs. Pace</TableTh>
            <TableTh ta="right">vs. Target</TableTh>
            <TableTh ta="right">Points</TableTh>
            <TableTh ta="right">Target Points</TableTh>
            <TableTh ta="center">Match Description</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {[...Array(rowCount)].map((_, i) => (
            <TableTr key={i}>
              <TableTd ta="left">
                <Skeleton>Date</Skeleton>
              </TableTd>
              <TableTd ta="center">
                <Skeleton>Arsenal 4:2 Leicester</Skeleton>
              </TableTd>
              <TableTd ta="right">
                <Skeleton>+0.50</Skeleton>
              </TableTd>
              <TableTd ta="right" fw={700}>
                <Skeleton>+0.50</Skeleton>
              </TableTd>
              <TableTd ta="right">
                <Skeleton>3</Skeleton>
              </TableTd>
              <TableTd ta="right">
                <Skeleton>2.50</Skeleton>
              </TableTd>
              <TableTd ta="center">
                <Skeleton>Away to 18</Skeleton>
              </TableTd>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </TableScrollContainer>
  );
}
