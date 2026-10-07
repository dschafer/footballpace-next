import {
  Box,
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

const teamNameWidths = ["65%", "85%", "75%"];

export default function PaceTablePlaceholder({
  rowCount,
  matchdayCount,
}: {
  rowCount: number;
  matchdayCount: number;
}) {
  return (
    <TableScrollContainer minWidth={0}>
      <VisuallyHidden role="status">Loading standings…</VisuallyHidden>
      <Table stickyHeader striped aria-hidden="true">
        <TableThead style={{ whiteSpace: "nowrap" }}>
          <TableTr>
            <TableTh ta="center" w="1%">
              #
            </TableTh>
            <TableTh ta="left" w="14ch">
              Team
            </TableTh>
            <TableTh ta="right" w="1%">
              Points
            </TableTh>
            <TableTh ta="right" w="1%">
              Pace
            </TableTh>
            <TableTh ta="right" w="1%">
              Season vs. Pace
            </TableTh>
            {[...Array(matchdayCount)].map((_, i) => (
              <TableTh ta="right" key={i}>
                <Skeleton height="1lh" width="2ch" ml="auto" />
              </TableTh>
            ))}
          </TableTr>
        </TableThead>
        <TableTbody>
          {[...Array(rowCount)].map((_, i) => (
            <TableTr key={i}>
              <TableTd ta="center">
                <Skeleton height="1lh" width="2ch" mx="auto" />
              </TableTd>
              <TableTh ta="left">
                <Skeleton
                  height="1lh"
                  miw="6ch"
                  width={teamNameWidths[i % teamNameWidths.length]}
                />
              </TableTh>
              <TableTd ta="right">
                <Skeleton height="1lh" width="2ch" ml="auto" />
              </TableTd>
              <TableTd ta="right">
                <Skeleton height="1lh" width="5ch" ml="auto" />
              </TableTd>
              <TableTd ta="right" fw={700}>
                <Box p="0.5rem">
                  <Skeleton height="1lh" width="6ch" ml="auto" />
                </Box>
              </TableTd>
              {[...Array(matchdayCount)].map((_, i) => (
                <TableTd ta="right" key={i}>
                  <Skeleton height="1lh" miw="5ch" />
                </TableTd>
              ))}
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </TableScrollContainer>
  );
}
