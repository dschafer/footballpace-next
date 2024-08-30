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

export default function FixturesTablePlaceholder({
  rowCount,
}: {
  rowCount: number;
}) {
  return (
    <>
      <Skeleton>
        <Title order={2}>Arsenal</Title>
        <Text fs="italic">English Premier League 2023</Text>
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
                <TableTd ta="left">Date</TableTd>
                <TableTd ta="right">Home</TableTd>
                <TableTd ta="center">1 - 1</TableTd>
                <TableTd ta="left">Away</TableTd>
              </TableTr>
            ))}
          </TableTbody>
        </Table>
      </Skeleton>
    </>
  );
}
