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
import Link from "next/link";
import PaceNumber from "../pace-display/pace-number";
import PaceTableCell from "./pace-table-cell";
import { fetchPaceTeams } from "@/lib/pace/pace";

export default async function PaceTable({
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

  const maxMatchday = Math.max(
    ...paceTeams.map(({ paceMatches }) => paceMatches.length),
  );

  return (
    <TableScrollContainer minWidth={0}>
      <Table stickyHeader striped>
        <TableThead>
          <TableTr>
            <TableTh ta="center">#</TableTh>
            <TableTh ta="left">Team</TableTh>
            <TableTh ta="right">Points</TableTh>
            <TableTh ta="right">Pace</TableTh>
            <TableTh ta="right">Delta</TableTh>
            {[...Array(maxMatchday)].map((_, i) => (
              <TableTh ta="right" key={i}>
                {i + 1}
              </TableTh>
            ))}
          </TableTr>
        </TableThead>
        <TableTbody>
          {paceTeams.map((paceTeam, rowNum) => (
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
              <TableTd ta="right">
                <NumberFormatter value={paceTeam.points} decimalScale={0} />
              </TableTd>
              <TableTd ta="right">
                <NumberFormatter
                  value={paceTeam.pace}
                  decimalScale={2}
                  fixedDecimalScale
                />
              </TableTd>
              <TableTd ta="right" fw={700}>
                <PaceNumber pace={paceTeam.points - paceTeam.pace} />
              </TableTd>
              {paceTeam.paceMatches.map((paceMatch, matchNum) => (
                <PaceTableCell paceMatch={paceMatch} key={matchNum} />
              ))}
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </TableScrollContainer>
  );
}
