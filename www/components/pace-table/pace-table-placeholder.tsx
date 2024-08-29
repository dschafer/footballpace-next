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

export default async function PaceTablePlaceholder({
  rowCount,
}: {
  rowCount: number;
}) {
  var link = null;
  if (rowCount < 10) {
    link = (
      <Text ta="right">
        <Skeleton>Full Pace »</Skeleton>
      </Text>
    );
  }
  return (
    <>
      <Title order={2}>
        <Skeleton>English Premier League 2023</Skeleton>
      </Title>
      <Table stickyHeader striped>
        <TableThead>
          <TableTr>
            <TableTh ta="center">#</TableTh>
            <TableTh ta="left">Team</TableTh>
            <TableTh ta="right">Played</TableTh>
            <TableTh ta="right">Won</TableTh>
            <TableTh ta="right">Drawn</TableTh>
            <TableTh ta="right">Lost</TableTh>
            <TableTh ta="right">For</TableTh>
            <TableTh ta="right">Against</TableTh>
            <TableTh ta="right">GD</TableTh>
            <TableTh ta="right">Points</TableTh>
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
                <Skeleton>38</Skeleton>
              </TableTd>
              <TableTd ta="right">
                <Skeleton>26</Skeleton>
              </TableTd>
              <TableTd ta="right">
                <Skeleton>12</Skeleton>
              </TableTd>
              <TableTd ta="right">
                <Skeleton>0</Skeleton>
              </TableTd>
              <TableTd ta="right">
                <Skeleton>73</Skeleton>
              </TableTd>
              <TableTd ta="right">
                <Skeleton>26</Skeleton>
              </TableTd>
              <TableTd ta="right">
                <Skeleton>+47</Skeleton>
              </TableTd>
              <TableTd ta="right" fw={600}>
                <Skeleton>90</Skeleton>
              </TableTd>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
      {link}
    </>
  );
}
