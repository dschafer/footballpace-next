import {
  Skeleton,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  VisuallyHidden,
} from "@mantine/core";

const matchResultWidths = ["80%", "95%", "85%"];

export default function ResultsTablePlaceholder({
  rowCount,
}: {
  rowCount: number;
}) {
  return (
    <TableScrollContainer minWidth={0}>
      <VisuallyHidden role="status">Loading results…</VisuallyHidden>
      <Table stickyHeader striped aria-hidden="true">
        <TableThead>
          <TableTr>
            <TableTh ta="left">Date</TableTh>
            <TableTh ta="center">Result</TableTh>
            <TableTh ta="right">Season vs. Pace</TableTh>
            <TableTh ta="right">vs. Target</TableTh>
            <TableTh ta="right">Points</TableTh>
            <TableTh ta="right">Target Points</TableTh>
            <TableTh ta="center">Match Description</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {[...Array(rowCount)].map((_, i) => (
            <TableTr key={i}>
              <TableTd ta="left">
                <Skeleton height="1lh" miw="4ch" />
              </TableTd>
              <TableTd ta="center">
                <Skeleton
                  height="1lh"
                  miw="6ch"
                  width={matchResultWidths[i % matchResultWidths.length]}
                  mx="auto"
                />
              </TableTd>
              <TableTd ta="right">
                <Skeleton height="1lh" miw="5ch" />
              </TableTd>
              <TableTd ta="right" fw={700}>
                <Skeleton height="1lh" miw="5ch" />
              </TableTd>
              <TableTd ta="right">
                <Skeleton height="1lh" miw="1ch" />
              </TableTd>
              <TableTd ta="right">
                <Skeleton height="1lh" miw="4ch" />
              </TableTd>
              <TableTd ta="center">
                <Skeleton height="1lh" miw="4em" />
              </TableTd>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </TableScrollContainer>
  );
}
