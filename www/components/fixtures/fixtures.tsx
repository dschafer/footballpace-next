import {
  Accordion,
  AccordionControl,
  AccordionItem,
  AccordionPanel,
  Anchor,
  List,
  ListItem,
  Stack,
  Title,
} from "@mantine/core";
import { Fixture } from "@prisma/client";
import Link from "next/link";
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
    where: {
      league: league,
      year: year,
      kickoffTime: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Only show today and future fixtures
    },
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
    if (!fixturesByDay.has(key)) {
      fixturesByDay.set(key, []);
    }
    fixturesByDay.get(key)!.push(fixture);
  }

  const fixturesByMonth: Map<string, Map<string, Array<Fixture>>> = new Map();
  for (const [day, fixtures] of Array.from(fixturesByDay.entries())) {
    const key = fixtures[0].kickoffTime.toLocaleString([], { month: "long" });
    if (!fixturesByMonth.has(key)) {
      fixturesByMonth.set(key, new Map());
    }
    fixturesByMonth.get(key)!.set(day, fixtures);
  }
  return (
    <Stack>
      <Title order={3}>Fixtures</Title>
      <Accordion
        variant="separated"
        multiple={true}
        defaultValue={[new Date().toLocaleString([], { month: "long" })]}
      >
        {Array.from(fixturesByMonth).map(([month, fixturesDict]) => (
          <AccordionItem key={month} value={month}>
            <AccordionControl>
              <Title order={4}>{month}</Title>
            </AccordionControl>
            <AccordionPanel p="md">
              {Array.from(fixturesDict).map(([date, fixtures]) => (
                <Stack key={date}>
                  <Title order={4}>{date}</Title>
                  <List listStyleType="none" pb="md">
                    {fixtures!.map((fixture, j) => (
                      <ListItem key={j}>
                        (
                        {fixture.kickoffTime.toLocaleTimeString([], {
                          timeZone: leagues.get(league)?.tz,
                          timeStyle: "short",
                        })}
                        ){" "}
                        <Anchor
                          component={Link}
                          href={`/${fixture.league}/${fixture.year}/team/${fixture.homeTeam}`}
                          underline="never"
                          c="var(--mantine-color-text)"
                        >
                          {fixture.homeTeam}
                        </Anchor>{" "}
                        vs.{" "}
                        <Anchor
                          component={Link}
                          href={`/${fixture.league}/${fixture.year}/team/${fixture.awayTeam}`}
                          underline="never"
                          c="var(--mantine-color-text)"
                        >
                          {fixture.awayTeam}
                        </Anchor>
                      </ListItem>
                    ))}
                  </List>
                </Stack>
              ))}
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Stack>
  );
}
