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
            <TableTh>Match</TableTh>
            {[...Array(teamCount)].map((_, i) => (
              <TableTh key={i} ta="right">
                {i + 1}
              </TableTh>
            ))}
          </TableTr>
        </TableThead>
        <TableTbody>
          <TableTr>
            <TableTh scope="row">Home</TableTh>
            {[...Array(teamCount)].map((_, i) => (
              <TableTd ta="right" key={i}>
                <Skeleton>0</Skeleton>
              </TableTd>
            ))}
          </TableTr>
          <TableTr>
            <TableTh scope="row">Away</TableTh>
            {[...Array(teamCount)].map((_, i) => (
              <TableTd ta="right" key={i}>
                <Skeleton>0</Skeleton>
              </TableTd>
            ))}
          </TableTr>
        </TableTbody>
      </Table>
    </TableScrollContainer>
  );
}
