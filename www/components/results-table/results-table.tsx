import {
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
import { type PaceMatch, matchDescription } from "@/lib/pace/pace";

import ColoredCell from "../pace-display/colored-cell";
import PaceNumber from "../pace-display/pace-number";
import Result from "../pace-display/result";
import leagues from "@/lib/const/leagues";

export default async function ResultsTable({
  paceMatches,
  league,
  team,
}: {
  paceMatches: PaceMatch[];
  league: string;
  team: string;
}) {
  const dateTimeFormat = Intl.DateTimeFormat(undefined, {
    timeZone: leagues.get(league)?.tz,
    dateStyle: "short",
  });
  return (
    <TableScrollContainer minWidth={0}>
      <Table stickyHeader striped>
        <TableThead>
          <TableTr>
            <TableTh ta="left">Date</TableTh>
            <TableTh ta="center">Result</TableTh>
            <TableTh ta="right">Season vs. Pace</TableTh>
            <TableTh ta="right">vs. Target</TableTh>
            <TableTh ta="right">Points</TableTh>
            <TableTh ta="right">Target Points</TableTh>
            <TableTh ta="center">Match Description</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {paceMatches.map((paceMatch, i) => (
            <TableTr key={i}>
              <TableTd ta="left">
                {dateTimeFormat.format(paceMatch.match.date)}
              </TableTd>
              <TableTd ta="center">
                <Result
                  match={paceMatch.match}
                  highlightedTeam={team}
                  link={true}
                />
              </TableTd>
              <TableTd ta="right" p="0" fw={700}>
                <Box w="100%" h="100%" p="0.5rem">
                  <PaceNumber pace={paceMatch.cumulativeDelta} />
                </Box>
              </TableTd>
              <ColoredCell val={paceMatch.delta} ta="right" p="0">
                <Box w="100%" h="100%" p="0.5rem">
                  <PaceNumber pace={paceMatch.delta} />
                </Box>
              </ColoredCell>
              <TableTd ta="right">{paceMatch.points}</TableTd>
              <TableTd ta="right">
                <NumberFormatter
                  value={paceMatch.expectedPoints}
                  decimalScale={2}
                  fixedDecimalScale
                />
              </TableTd>
              <TableTd ta="center">{matchDescription(paceMatch)}</TableTd>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </TableScrollContainer>
  );
}
