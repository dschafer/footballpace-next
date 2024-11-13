import {
  Anchor,
  NumberFormatter,
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
import { fetchProjectedStandings } from "@/lib/pace/projections";

export default async function ProjectedStandingsTable({
  league,
  year,
}: {
  league: string;
  year: number;
}) {
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
                <Anchor
                  component={Link}
                  href={`/${league}/${year}/team/${row.team}`}
                  inherit
                >
                  {row.team}
                </Anchor>
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
              <TableTd ta="right">{row.previousYear?.played || ""}</TableTd>
              <TableTd ta="right" fw={700}>
                {row.previousYear?.points || ""}
              </TableTd>
              <TableTd ta="right">
                <NumberFormatter
                  value={row.previousYearMultiplier}
                  decimalScale={2}
                />
              </TableTd>
              <TableTd ta="right">
                {row.currentYear.played * row.currentYearMultiplier +
                  (row.previousYear?.played || 0) * row.previousYearMultiplier}
              </TableTd>
              <TableTd ta="right" fw={700}>
                <NumberFormatter
                  value={
                    row.currentYear.points * row.currentYearMultiplier +
                    (row.previousYear?.points || 0) * row.previousYearMultiplier
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
