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

export default function ProjectedStandingsTablePlaceholder({
  rowCount,
}: {
  rowCount: number;
}) {
  return (
    <TableScrollContainer minWidth={0}>
      <Table stickyHeader striped>
        <TableThead>
          <TableTr>
            <TableTh ta="center" rowSpan={2}>
              #
            </TableTh>
            <TableTh ta="left" rowSpan={2}>
              Team
            </TableTh>
            <TableTh ta="center" colSpan={2}>
              <Skeleton>2024</Skeleton>
            </TableTh>
            <TableTh ta="center" colSpan={2}>
              <Skeleton>2023</Skeleton>
            </TableTh>
            <TableTh ta="center" colSpan={2}>
              Projected
            </TableTh>
          </TableTr>
          <TableTr>
            <TableTh ta="right">Played</TableTh>
            <TableTh ta="right">Points</TableTh>
            <TableTh ta="right">Played</TableTh>
            <TableTh ta="right">Points</TableTh>
            <TableTh ta="right">Played</TableTh>
            <TableTh ta="right">Points</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {[...Array(rowCount)].map((_, i) => (
            <TableTr key={i}>
              <TableTd ta="center">{i + 1}</TableTd>
              <TableTh ta="left" scope="row">
                <Skeleton>Arsenal</Skeleton>
              </TableTh>
              <TableTd ta="right">
                <Skeleton>38</Skeleton>
              </TableTd>
              <TableTd ta="right" fw={700}>
                <Skeleton>90</Skeleton>
              </TableTd>
              <TableTd ta="right">
                <Skeleton>38</Skeleton>
              </TableTd>
              <TableTd ta="right" fw={700}>
                <Skeleton>90</Skeleton>
              </TableTd>
              <TableTd ta="right">
                <Skeleton>38</Skeleton>
              </TableTd>
              <TableTd ta="right" fw={700}>
                <Skeleton>90</Skeleton>
              </TableTd>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </TableScrollContainer>
  );
}
