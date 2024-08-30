import {
  Anchor,
  Box,
  NumberFormatter,
  Popover,
  PopoverDropdown,
  PopoverTarget,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
} from "@mantine/core";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function PaceTable({
  rowCount,
  league,
  year,
}: {
  rowCount?: number;
  league: string;
  year: number;
}) {
  const [allStandings, allMatches, allPaceSheets] = await Promise.all([
    prisma.standingsRow.findMany({
      where: { league: league, year: year },
    }),
    prisma.match.findMany({
      where: { league: league, year: year },
      orderBy: { date: "asc" },
    }),
    prisma.paceSheetEntry.findMany({
      where: { league: league, year: year, teamFinish: 1 },
    }),
  ]);

  const teamToFinish = new Map(
    allStandings.map(({ team }, i) => [team, i + 1]),
  );
  const paceSheetMap = new Map(
    allPaceSheets.map(({ opponentFinish, home, expectedPoints }) => [
      `${opponentFinish}_${home}`,
      expectedPoints,
    ]),
  );

  let rows = allStandings
    .map(({ team, points }) => {
      const teamFinish = teamToFinish.get(team)!;
      const matches = allMatches
        .filter(
          ({ homeTeam, awayTeam }) => homeTeam == team || awayTeam == team,
        )
        .map((match) => {
          return {
            ...match,
            opponent: team == match.homeTeam ? match.awayTeam : match.homeTeam,
            home: team == match.homeTeam,
          };
        })
        .map((match) => {
          return {
            ...match,
            opponentActualFinish: teamToFinish.get(match.opponent)!,
            points:
              match.ftResult == "D"
                ? 1
                : (match.ftResult == "H" && match.home) ||
                    (match.ftResult == "A" && !match.home)
                  ? 3
                  : 0,
          };
        })
        .map((match) => {
          return {
            ...match,
            // We assume that we will finish first for pace...
            // so if they're ahead of us in the table, bump them down one
            opponentFinish:
              match.opponentActualFinish < teamFinish
                ? match.opponentActualFinish + 1
                : match.opponentActualFinish,
          };
        })
        .map((match) => {
          return {
            ...match,
            expectedPoints: paceSheetMap.get(
              `${match.opponentFinish}_${match.home}`,
            )!,
          };
        })
        .map((match) => {
          return {
            ...match,
            delta: match.points - match.expectedPoints,
          };
        });
      const delta = matches
        .map(({ delta }) => delta)
        .reduce((s, a) => s + a, 0);
      const pace = matches
        .map(({ expectedPoints }) => expectedPoints)
        .reduce((s, a) => s + a, 0);
      return { team, matches, points, pace, delta };
    })
    .sort((a, b) => b.delta - a.delta || b.points - a.points);

  if (rowCount) {
    rows = rows.slice(0, rowCount);
  }

  const maxMatchday = Math.max(...rows.map(({ matches }) => matches.length));
  const bgColors = [
    "#762a83",
    "#af8dc3",
    "#e7d4e8",
    "#f7f7f7",
    "#d9f0d3",
    "#7fbf7b",
    "#1b7837",
  ];
  const bg = (delta: number) => bgColors[Math.floor(delta + 3.5)];
  // TODO This should probably use isLightColor() from mantine, and not hardcode white and black
  const fg = (delta: number) =>
    Math.floor(delta + 3.5) == 0 ? "white" : "black";

  return (
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
        {rows.map((row, rowNum) => (
          <TableTr key={row.team}>
            <TableTd ta="center">{rowNum + 1}</TableTd>
            <TableTh ta="left" scope="row">
              <Anchor
                component={Link}
                href={`/season/${league}/${year}/${row.team}`}
              >
                {row.team}
              </Anchor>
            </TableTh>
            <TableTd ta="right">
              <NumberFormatter value={row.points} decimalScale={0} />
            </TableTd>
            <TableTd ta="right">
              <NumberFormatter
                value={row.pace}
                decimalScale={2}
                fixedDecimalScale
              />
            </TableTd>
            <TableTd ta="right">
              <NumberFormatter
                value={row.points - row.pace}
                decimalScale={2}
                fixedDecimalScale
              />
            </TableTd>
            {row.matches.map((match, matchNum) => (
              <TableTd
                ta="right"
                key={matchNum}
                bg={bg(match.delta)}
                c={fg(match.delta)}
                p={0}
              >
                <Popover>
                  <PopoverTarget>
                    <Box
                      w="100%"
                      h="100%"
                      p="0.5rem"
                      style={{ cursor: "default" }}
                    >
                      {match.delta > 0 ? "+" : ""}
                      <NumberFormatter
                        value={match.delta}
                        decimalScale={2}
                        fixedDecimalScale
                      />
                    </Box>
                  </PopoverTarget>
                  <PopoverDropdown>
                    <Text ta="center">{match.date.toLocaleDateString()}</Text>
                    <Text ta="center">
                      {match.homeTeam} {match.ftHomeGoals}:{match.ftAwayGoals}{" "}
                      {match.awayTeam}
                    </Text>
                    <Text ta="center">
                      <Text fw={600} span>
                        Points
                      </Text>
                      : {match.points}
                    </Text>
                    <Text ta="center">
                      <Text fw={600} span>
                        Pace
                      </Text>
                      :{" "}
                      <NumberFormatter
                        value={match.expectedPoints}
                        decimalScale={2}
                        fixedDecimalScale
                      />{" "}
                      ({match.home ? "Home" : "Away"} to {match.opponentFinish})
                    </Text>
                  </PopoverDropdown>
                </Popover>
              </TableTd>
            ))}
          </TableTr>
        ))}
      </TableTbody>
    </Table>
  );
}
