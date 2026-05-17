import {
  Box,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";
import AnchorLink from "@/components/anchor-link/anchor-link";
import DeltaTableCell from "../pace-display/delta-table-cell";
import ErrorAlert from "../error/error-alert";
import PaceTableCell from "../pace-display/pace-table-cell";
import RecentPaceTablePlaceholder from "@/components/recent-pace-table/recent-pace-table-placeholder";
import Result from "../pace-display/result";
import { Suspense } from "react";
import { fetchPaceTeams } from "@/lib/pace/pace";
import { shouldCachePaceSheetData } from "@/lib/pace/data";
import { slicePaceTeams } from "@/lib/pace/pace-types";
import { teamPath } from "@/lib/url/team-links";

type RecentPaceTableProps = {
  rowCount: number;
  league: string;
  year: number;
  targetFinish: number;
};

export default function RecentPaceTable(props: RecentPaceTableProps) {
  if (shouldCachePaceSheetData(props.league, props.year, props.targetFinish)) {
    return <RecentPaceTableContent {...props} />;
  }
  return (
    <Suspense fallback={<RecentPaceTablePlaceholder rowCount={props.rowCount} />}>
      <RecentPaceTableContent {...props} />
    </Suspense>
  );
}

async function RecentPaceTableContent({
  rowCount,
  league,
  year,
  targetFinish = 1,
}: RecentPaceTableProps) {
  const paceTeams = await fetchPaceTeams(league, year, targetFinish);
  let pacePosTeams = paceTeams.map((pt, i) => ({ position: i + 1, ...pt }));
  pacePosTeams = slicePaceTeams(pacePosTeams, rowCount, targetFinish);

  const bgColor = (pos: number): string | undefined => {
    if (targetFinish > 10 && pos > targetFinish) {
      return "relegation-row";
    }
    if (targetFinish < 10 && pos <= targetFinish) {
      return "promotion-row";
    }
  };

  if (pacePosTeams.length == 0) {
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
            <TableTh ta="right">Last Result</TableTh>
            <TableTh ta="right">vs. Target</TableTh>
            <TableTh ta="right">Points</TableTh>
            <TableTh ta="right">Season vs. Pace</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {pacePosTeams.map((paceTeam) => {
            const lastMatch =
              paceTeam.paceMatches[paceTeam.paceMatches.length - 1];
            return (
              <TableTr key={paceTeam.team}>
                <TableTd ta="center" bg={bgColor(paceTeam.position)}>
                  {paceTeam.position}
                </TableTd>
                <TableTh ta="left" scope="row">
                  <AnchorLink
                    href={teamPath(league, year, paceTeam.team)}
                    inherit
                  >
                    {paceTeam.team}
                  </AnchorLink>
                </TableTh>
                <TableTd ta="right">
                  <Result
                    match={lastMatch.match}
                    highlightedTeam={paceTeam.team}
                    link={true}
                    multiline={true}
                  />
                </TableTd>
                <PaceTableCell paceMatch={lastMatch} />
                <TableTd ta="right" p="xs">
                  {paceTeam.points}
                </TableTd>
                <TableTd ta="right" p="0" fw={700}>
                  <DeltaTableCell
                    delta={paceTeam.delta}
                    gap={paceTeam.gap}
                    interval={paceTeam.interval}
                  />
                </TableTd>
              </TableTr>
            );
          })}
        </TableTbody>
      </Table>
    </TableScrollContainer>
  );
}
