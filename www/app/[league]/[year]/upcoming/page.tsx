import {
  NumberFormatter,
  Stack,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  Title,
} from "@mantine/core";
import { LeagueYearParam } from "@/lib/const/current";
import { fetchPaceFixtures } from "@/lib/pace/pace";
import { fetchStandings } from "@/lib/pace/standings";
import leagues from "@/lib/const/leagues";

export default async function UpcomingPage({
  params,
}: {
  params: LeagueYearParam;
}) {
  const yearInt = parseInt(params.year);
  const standings = (await fetchStandings(params.league, yearInt)).slice(0, 4);
  const fixtures = await Promise.all(
    standings.map(async ({ team }) => {
      const pf = await fetchPaceFixtures(params.league, yearInt, team);
      return pf.slice(0, 6);
    }),
  );
  const numFixtures = Math.max(...fixtures.map((f) => f.length));

  return (
    <Stack>
      <Title order={2}>Upcoming Fixtures</Title>
      <TableScrollContainer minWidth={0}>
        <Table stickyHeader striped>
          <TableThead>
            <TableTr>
              {standings.map(({ team }) => (
                <TableTh ta="center" key={team}>
                  {team}
                </TableTh>
              ))}
            </TableTr>
          </TableThead>
          <TableTbody>
            {[...Array(numFixtures)].map((_, matchNum) => (
              <TableTr key={matchNum}>
                {standings.map(({ team }, teamNum) => {
                  const pf = fixtures[teamNum][matchNum];
                  if (!pf) {
                    return <TableTd key={team} />;
                  }
                  return (
                    <TableTd ta="center" key={team}>
                      <Stack gap="xs">
                        <Text span c="dimmed" size="xs">
                          {pf.fixture.kickoffTime.toLocaleDateString([], {
                            timeZone: leagues.get(pf.fixture.league)?.tz,
                            dateStyle: "short",
                          })}
                        </Text>
                        <Text span size="sm">
                          {pf.opponent} ({pf.home ? "H" : "A"})
                        </Text>
                        <Text span size="sm">
                          <NumberFormatter
                            value={pf.expectedPoints}
                            decimalScale={2}
                            fixedDecimalScale
                          />
                        </Text>
                      </Stack>
                    </TableTd>
                  );
                })}
              </TableTr>
            ))}
          </TableTbody>
        </Table>
      </TableScrollContainer>
    </Stack>
  );
}
