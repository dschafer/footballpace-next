import {
  Alert,
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
import ErrorAlert from "../error/error-alert";
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

  if (paceTeams.length == 0) {
    return <ErrorAlert />;
  }

  return (
    <TableScrollContainer minWidth={0}>
      <Table stickyHeader striped>
        <Box component="colgroup">
          <Box component="col" width="5%" />
          <Box component="col" width="35%" />
          <Box component="col" width="25%" />
          <Box component="col" width="15%" />
          <Box component="col" width="10%" />
          <Box component="col" width="10%" />
        </Box>
        <TableThead>
          <TableTr>
            <TableTh ta="center">#</TableTh>
            <TableTh ta="left">Team</TableTh>
            <TableTh ta="center">Last Result</TableTh>
            <TableTh ta="right">vs. Expected</TableTh>
            <TableTh ta="right" pr={0}>
              Points
            </TableTh>
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
                    href={`/${league}/${year}/team/${paceTeam.team}`}
                    inherit
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
                <TableTd ta="right" p="0">
                  {paceTeam.points}
                </TableTd>
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
