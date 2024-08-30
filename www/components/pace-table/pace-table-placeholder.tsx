import {
  Skeleton,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Title,
} from "@mantine/core";

export default function PaceTablePlaceholder({
  rowCount,
  matchdayCount,
}: {
  rowCount: number;
  matchdayCount: number;
}) {
  return (
    <Table stickyHeader striped>
      <TableThead>
        <TableTr>
          <TableTh ta="center">#</TableTh>
          <TableTh ta="left">Team</TableTh>
          <TableTh ta="right">Points</TableTh>
          <TableTh ta="right">Pace</TableTh>
          <TableTh ta="right">Delta</TableTh>
          {[...Array(matchdayCount)].map((_, i) => (
            <TableTh ta="right" key={i}>
              <Skeleton>{i + 1}</Skeleton>
            </TableTh>
          ))}
        </TableTr>
      </TableThead>
      <TableTbody>
        {[...Array(rowCount)].map((_, i) => (
          <TableTr key={i}>
            <TableTd ta="center">{i + 1}</TableTd>
            <TableTh ta="left">
              <Skeleton>Arsenal</Skeleton>
            </TableTh>
            <TableTd ta="right">
              <Skeleton>90</Skeleton>
            </TableTd>
            <TableTd ta="right">
              <Skeleton>89</Skeleton>
            </TableTd>
            <TableTd ta="right">
              <Skeleton>+1.00</Skeleton>
            </TableTd>
            {[...Array(matchdayCount)].map((_, i) => (
              <TableTd ta="right" key={i}>
                <Skeleton>{i + 1}</Skeleton>
              </TableTd>
            ))}
          </TableTr>
        ))}
      </TableTbody>
    </Table>
  );
}
