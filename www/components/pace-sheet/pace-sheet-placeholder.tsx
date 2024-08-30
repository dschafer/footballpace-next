import {
  Skeleton,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  Title,
} from "@mantine/core";

export default function PaceSheetPlaceholder({
  teamCount,
}: {
  teamCount: number;
}) {
  return (
    <>
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
    </>
  );
}
