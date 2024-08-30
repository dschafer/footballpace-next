import {
  Skeleton,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";

export default function FixturesTablePlaceholder({
  rowCount,
}: {
  rowCount: number;
}) {
  return (
    <>
      <Table stickyHeader striped>
        <TableThead>
          <TableTr>
            <TableTh ta="left">Date</TableTh>
            <TableTh ta="right">Home</TableTh>
            <TableTh ta="center">Result</TableTh>
            <TableTh ta="left">Away</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {[...Array(rowCount)].map((_, i) => (
            <TableTr key={i}>
              <TableTd ta="left">
                <Skeleton>Date</Skeleton>
              </TableTd>
              <TableTd ta="right">
                <Skeleton>Home</Skeleton>
              </TableTd>
              <TableTd ta="center">
                <Skeleton>1 - 1</Skeleton>
              </TableTd>
              <TableTd ta="left">
                <Skeleton>Away</Skeleton>
              </TableTd>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </>
  );
}
