import { List, ListItem, Stack, Text, Title } from "@mantine/core";
import { Fixture } from "@prisma/client";
import leagues from "@/lib/const/leagues";
import prisma from "@/lib/prisma";

export default async function Fixtures({
  league,
  year,
}: {
  league: string;
  year: number;
}) {
  const fixtures = await prisma.fixture.findMany({
    where: { league: league, year: year },
    orderBy: { kickoffTime: "asc" },
  });
  if (fixtures.length == 0) {
    return null;
  }
  // This is just Map.groupBy but that's not available in Node 20.
  const fixturesByDay: Map<string, Array<Fixture>> = new Map();
  for (const fixture of fixtures) {
    const key = fixture.kickoffTime.toLocaleDateString([], {
      timeZone: leagues.get(league)?.tz,
    });
    if (fixturesByDay.has(key)) {
      fixturesByDay.get(key)!.push(fixture);
    } else {
      fixturesByDay.set(key, [fixture]);
    }
  }

  return (
    <Stack>
      <Title order={3}>Fixtures</Title>
      {Array.from(fixturesByDay).map(([date, fixtures]) => (
        <Stack key={date}>
          <Title order={4}>{date}</Title>
          <List listStyleType="none">
            {fixtures!.map((fixture, j) => (
              <ListItem key={j}>
                (
                {fixture.kickoffTime.toLocaleTimeString([], {
                  timeZone: leagues.get(league)?.tz,
                  timeStyle: "short",
                })}
                ) {fixture.homeTeam} vs. {fixture.awayTeam}
              </ListItem>
            ))}
          </List>
        </Stack>
      ))}
    </Stack>
  );
}
