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

export default function HistoricalPaceTablePlaceholder({
  teamCount,
}: {
  teamCount: number;
}) {
  return (
    <TableScrollContainer minWidth={0}>
      <Table stickyHeader striped>
        <TableThead>
          <TableTr>
            <TableTh ta="right">Position</TableTh>
            <TableTh ta="right">Home</TableTh>
            <TableTh ta="right">Away</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {[...Array(teamCount - 1)].map((_, i) => (
            <TableTr key={i}>
              <TableTd ta="right">{i + 2}</TableTd>
              <TableTd ta="right">
                <Skeleton>0</Skeleton>
              </TableTd>
              <TableTd ta="right">
                <Skeleton>0</Skeleton>
              </TableTd>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </TableScrollContainer>
  );
}
