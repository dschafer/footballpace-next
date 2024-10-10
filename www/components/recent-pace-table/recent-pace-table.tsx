import {
  Anchor,
  Box,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";
import Link from "next/link";
import PaceNumber from "../pace-display/pace-number";
import PaceTableCell from "../pace-display/pace-table-cell";
import Result from "../pace-display/result";
import { fetchPaceTeams } from "@/lib/pace/pace";

export default async function RecentPaceTable({
  rowCount,
  league,
  year,
}: {
  rowCount?: number;
  league: string;
  year: number;
}) {
  let paceTeams = await fetchPaceTeams(league, year);

  if (rowCount) {
    paceTeams = paceTeams.slice(0, rowCount);
  }

  return (
    <TableScrollContainer minWidth={0}>
      <Table stickyHeader striped>
        <Box component="colgroup">
          <Box component="col" width="5%" />
          <Box component="col" width="40%" />
          <Box component="col" width="25%" />
          <Box component="col" width="15%" />
          <Box component="col" width="15%" />
        </Box>
        <TableThead>
          <TableTr>
            <TableTh ta="center">#</TableTh>
            <TableTh ta="left">Team</TableTh>
            <TableTh ta="center">Last Result</TableTh>
            <TableTh ta="right">Last Result vs. Pace</TableTh>
            <TableTh ta="right">Season vs. Pace</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {paceTeams.map((paceTeam, rowNum) => {
            const lastMatch =
              paceTeam.paceMatches[paceTeam.paceMatches.length - 1];
            return (
              <TableTr key={paceTeam.team}>
                <TableTd ta="center">{rowNum + 1}</TableTd>
                <TableTh ta="left" scope="row">
                  <Anchor
                    component={Link}
                    href={`/season/${league}/${year}/${paceTeam.team}`}
                  >
                    {paceTeam.team}
                  </Anchor>
                </TableTh>
                <TableTd ta="center">
                  <Result
                    match={lastMatch.match}
                    highlightedTeam={paceTeam.team}
                    link={true}
                  />
                </TableTd>
                <PaceTableCell paceMatch={lastMatch} />
                <TableTd ta="right" p="0" fw={700}>
                  <Box w="100%" h="100%" p="0.5rem">
                    <PaceNumber pace={paceTeam.delta} />
                  </Box>
                </TableTd>
              </TableTr>
            );
          })}
        </TableTbody>
      </Table>
    </TableScrollContainer>
  );
}
