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
import PaceNumber from "../pace-display/pace-number";
import Result from "../pace-display/result";
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
  const { paceMatches } = paceTeams.filter((pt) => pt.team == team)[0];

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
          {paceMatches.map((paceMatch, i) => (
            <TableTr key={i}>
              <TableTd ta="left">
                {paceMatch.match.date.toLocaleDateString()}
              </TableTd>
              <TableTd ta="center">
                <Result
                  match={paceMatch.match}
                  highlightedTeam={team}
                  link={true}
                />
              </TableTd>
              <TableTd ta="right">{paceMatch.points}</TableTd>
              <TableTd ta="right">
                <NumberFormatter
                  value={paceMatch.expectedPoints}
                  decimalScale={2}
                  fixedDecimalScale
                />
              </TableTd>
              <ColoredCell val={paceMatch.delta} ta="right" p="0">
                <Box w="100%" h="100%" p="0.5rem">
                  <PaceNumber pace={paceMatch.delta} />
                </Box>
              </ColoredCell>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </TableScrollContainer>
  );
}
