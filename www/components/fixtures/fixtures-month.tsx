import { Anchor, List, ListItem, Stack, Title } from "@mantine/core";
import { Fixture } from "@prisma/client";
import Link from "next/link";
import leagues from "@/lib/const/leagues";

export default async function FixturesMonth({
  fixtures,
  dateHeadings,
}: {
  fixtures: Map<string, Fixture[]>;
  dateHeadings: boolean;
}) {
  if (fixtures.size == 0) {
    return null;
  }
  if (dateHeadings) {
    return (
      <>
        {Array.from(fixtures).map(([date, fixtures]) => (
          <Stack key={date}>
            <Title order={4}>{date}</Title>
            <List listStyleType="none" pb="md">
              {fixtures!.map((fixture, j) => (
                <ListItem key={j}>
                  (
                  {fixture.kickoffTime.toLocaleTimeString([], {
                    timeZone: leagues.get(fixture.league)?.tz,
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
      </>
    );
  } else {
    const allFixtures = Array.from(fixtures.values()).flat();
    return (
      <List listStyleType="none" pb="md">
        {allFixtures.map((fixture, i) => (
          <ListItem key={i}>
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
            </Anchor>{" "}
            (
            {fixture.kickoffTime.toLocaleString([], {
              timeZone: leagues.get(fixture.league)?.tz,
              dateStyle: "short",
              timeStyle: "short",
            })}
            )
          </ListItem>
        ))}
      </List>
    );
  }
}
