import {
  Anchor,
  Box,
  NumberFormatter,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";

import ColoredCell from "../pace-display/colored-cell";
import Link from "next/link";
import PaceNumber from "../pace-display/pace-number";
import { fetchPaceTeams } from "@/lib/pace/pace";

export default async function FixturesTable({
  league,
  year,
  team,
}: {
  league: string;
  year: number;
  team: string;
}) {
  const paceTeams = await fetchPaceTeams(league, year);
  const { matches } = paceTeams.filter((pt) => pt.team == team)[0];

  return (
    <TableScrollContainer minWidth={0}>
      <Table stickyHeader striped>
        <TableThead>
          <TableTr>
            <TableTh ta="left">Date</TableTh>
            <TableTh ta="center">Result</TableTh>
            <TableTh ta="right">Points</TableTh>
            <TableTh ta="right">Expected Points</TableTh>
            <TableTh ta="right">Last Result vs. Pace</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {matches.map((match, i) => (
            <TableTr key={i}>
              <TableTd ta="left">{match.date.toLocaleDateString()}</TableTd>
              <TableTd ta="center">
                {match.homeTeam} {match.ftHomeGoals}:{match.ftAwayGoals}{" "}
                {match.awayTeam}
              </TableTd>
              <TableTd ta="right">{match.points}</TableTd>
              <TableTd ta="right">
                <NumberFormatter
                  value={match.expectedPoints}
                  decimalScale={2}
                  fixedDecimalScale
                />
              </TableTd>
              <ColoredCell val={match.delta} ta="right" p="0">
                <Box w="100%" h="100%" p="0.5rem">
                  <PaceNumber pace={match.delta} />
                </Box>
              </ColoredCell>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </TableScrollContainer>
  );
}
