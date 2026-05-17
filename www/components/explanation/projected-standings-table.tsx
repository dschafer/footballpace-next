import {
  NumberFormatter,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";
import AnchorLink from "@/components/anchor-link/anchor-link";
import ErrorAlert from "../error/error-alert";
import ProjectedStandingsTablePlaceholder from "./projected-standings-table-placeholder";
import { Suspense } from "react";
import { fetchProjectedStandings } from "@/lib/pace/projections";
import { shouldCacheProjectedStandingsData } from "@/lib/pace/data";
import { teamPath } from "@/lib/url/team-links";

type ProjectedStandingsTableProps = {
  league: string;
  year: number;
};

export default function ProjectedStandingsTable(
  props: ProjectedStandingsTableProps,
) {
  if (shouldCacheProjectedStandingsData(props.league, props.year)) {
    return <ProjectedStandingsTableContent {...props} />;
  }
  return (
    <Suspense fallback={<ProjectedStandingsTablePlaceholder rowCount={20} />}>
      <ProjectedStandingsTableContent {...props} />
    </Suspense>
  );
}

async function ProjectedStandingsTableContent({
  league,
  year,
}: ProjectedStandingsTableProps) {
  const projectedStandings = await fetchProjectedStandings(league, year);
  if (projectedStandings.length == 0) {
    return <ErrorAlert />;
  }

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
            <TableTh ta="center" colSpan={3}>
              {year}
            </TableTh>
            <TableTh ta="center" colSpan={3}>
              {year - 1}
            </TableTh>
            <TableTh ta="center" colSpan={2}>
              Projected
            </TableTh>
          </TableTr>
          <TableTr>
            <TableTh ta="right">Played</TableTh>
            <TableTh ta="right">Points</TableTh>
            <TableTh ta="right">&times;</TableTh>
            <TableTh ta="right">Played</TableTh>
            <TableTh ta="right">Points</TableTh>
            <TableTh ta="right">&times;</TableTh>
            <TableTh ta="right">Played</TableTh>
            <TableTh ta="right">Points</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {projectedStandings.map((row, i) => (
            <TableTr key={row.team}>
              <TableTd ta="center">{i + 1}</TableTd>
              <TableTh ta="left" scope="row">
                <AnchorLink
                  href={teamPath(league, year, row.team)}
                  inherit
                >
                  {row.team}
                </AnchorLink>
              </TableTh>
              <TableTd ta="right">{row.currentYear.played}</TableTd>
              <TableTd ta="right" fw={700}>
                {row.currentYear.points}
              </TableTd>
              <TableTd ta="right">
                <NumberFormatter
                  value={row.currentYearMultiplier}
                  decimalScale={2}
                />
              </TableTd>
              <TableTd ta="right">{row.previousYear?.played ?? ""}</TableTd>
              <TableTd ta="right" fw={700}>
                {row.previousYear?.points ?? ""}
              </TableTd>
              <TableTd ta="right">
                <NumberFormatter
                  value={row.previousYearMultiplier}
                  decimalScale={2}
                />
              </TableTd>
              <TableTd ta="right">
                {row.currentYear.played * row.currentYearMultiplier +
                  (row.previousYear?.played ?? 0) * row.previousYearMultiplier}
              </TableTd>
              <TableTd ta="right" fw={700}>
                <NumberFormatter
                  value={
                    row.currentYear.points * row.currentYearMultiplier +
                    (row.previousYear?.points ?? 0) * row.previousYearMultiplier
                  }
                  decimalScale={2}
                />
              </TableTd>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </TableScrollContainer>
  );
}
