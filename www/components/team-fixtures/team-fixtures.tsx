import {
  NumberFormatter,
  Stack,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTfoot,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";
import FixtureDifficultyCell from "../pace-display/fixture-difficulty-cell";
import LinkableHeader from "../header/linkable-header";
import { fetchPaceFixtures } from "@/lib/pace/pace";
import leagues from "@/lib/const/leagues";

export default async function TeamFixtures({
  league,
  year,
  team,
}: {
  league: string;
  year: number;
  team: string;
}) {
  const fixtures = await fetchPaceFixtures(league, year, team);
  const upcomingFixtures = fixtures.filter(
    (f) => f.fixture.kickoffTime > new Date(),
  );
  if (fixtures.length == 0) {
    return null;
  }
  return (
    <Stack>
      <LinkableHeader order={3} title="Fixtures" />
      <TableScrollContainer minWidth={0}>
        <Table stickyHeader striped>
          <TableThead>
            <TableTr>
              <TableTh ta="right">Date</TableTh>
              <TableTh ta="right">Match</TableTh>
              <TableTh ta="right">Target Pace</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {upcomingFixtures.map((pf, i) => (
              <TableTr key={i}>
                <TableTd ta="right">
                  {pf.fixture.kickoffTime.toLocaleString([], {
                    timeZone: leagues.get(pf.fixture.league)?.tz,
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </TableTd>
                <TableTd ta="right">
                  {pf.home ? "vs " + pf.opponent : "at " + pf.opponent}
                </TableTd>
                <FixtureDifficultyCell ta="right" val={pf.expectedPoints}>
                  <NumberFormatter
                    value={pf.expectedPoints}
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </FixtureDifficultyCell>
              </TableTr>
            ))}
          </TableTbody>
          <TableTfoot fw={700}>
            <TableTr>
              <TableTd ta="right"></TableTd>
              <TableTd ta="right">{upcomingFixtures.length} matches</TableTd>
              <TableTd ta="right">
                <NumberFormatter
                  value={upcomingFixtures.reduce(
                    (a, uf) => a + uf.expectedPoints,
                    0,
                  )}
                  decimalScale={2}
                  fixedDecimalScale
                />
              </TableTd>
            </TableTr>
          </TableTfoot>
        </Table>
      </TableScrollContainer>
    </Stack>
  );
}
