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

export default function PaceTablePlaceholder({
  rowCount,
  matchdayCount,
}: {
  rowCount: number;
  matchdayCount: number;
}) {
  return (
    <TableScrollContainer minWidth={0}>
      <Table stickyHeader striped>
        <TableThead>
          <TableTr>
            <TableTh ta="center">#</TableTh>
            <TableTh ta="left">Team</TableTh>
            <TableTh ta="right">Points</TableTh>
            <TableTh ta="right">Pace</TableTh>
            <TableTh ta="right">Season vs. Pace</TableTh>
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
              <TableTd ta="center">
                <Skeleton>{i + 1}</Skeleton>
              </TableTd>
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
    </TableScrollContainer>
  );
}
