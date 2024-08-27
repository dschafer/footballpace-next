import {
  Anchor,
  Skeleton,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableTr,
  Text,
  Title,
} from "@mantine/core";

export default async function PaceSheetPlaceholder({
  rowCount,
}: {
  rowCount: number;
}) {
  return (
    <>
      <Title order={2}>
        <Skeleton>Pace Sheet</Skeleton>
      </Title>
      <Text fs="italic">
        <Skeleton>English Premier League 2023</Skeleton>
      </Text>
      <Table stickyHeader striped>
        <TableTh>
          <TableTr>
            <TableTh ta="center">Opponent Position</TableTh>
            <TableTh ta="right">Home</TableTh>
            <TableTh ta="right">Away</TableTh>
          </TableTr>
        </TableTh>
        <TableTbody>
          {[...Array(rowCount)].map((_, i) => (
            <TableTr key={i}>
              <TableTd ta="center">
                <Skeleton>{i + 1}</Skeleton>
              </TableTd>
              <TableTd ta="right">
                <Skeleton>2.00</Skeleton>
              </TableTd>
              <TableTd ta="right">
                <Skeleton>2.00</Skeleton>
              </TableTd>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </>
  );
}
