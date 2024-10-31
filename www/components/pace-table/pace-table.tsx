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
import PaceNumber from "../pace-display/pace-number";
import PaceTableCell from "../pace-display/pace-table-cell";
import { PaceTeam } from "@/lib/pace/pace";

export default async function PaceTable({
  paceTeams,
  startPlace,
}: {
  paceTeams: PaceTeam[];
  startPlace?: number;
}) {
  if (paceTeams.length == 0) {
    return <ErrorAlert />;
  }
  const maxMatchday = Math.max(
    ...paceTeams.map(({ paceMatches }) => paceMatches.length),
  );
  if (!startPlace) {
    startPlace = 0;
  }

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
              <TableTd ta="center">{rowNum + startPlace + 1}</TableTd>
              <TableTh ta="left" scope="row">
                <Anchor
                  component={Link}
                  href={`/${paceTeam.league}/${paceTeam.year}/team/${paceTeam.team}`}
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
