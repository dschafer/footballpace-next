import { Anchor, List, ListItem, Stack, Title } from "@mantine/core";
import { Fixture } from "@prisma/client";
import Link from "next/link";
import leagues from "@/lib/const/leagues";

export default async function FixturesMonth({
  league,
  fixtures,
  dateHeadings,
}: {
  league: string;
  fixtures: Map<string, Fixture[]>;
  dateHeadings: boolean;
}) {
  if (fixtures.size == 0) {
    return null;
  }
  const timeFormat = Intl.DateTimeFormat(undefined, {
    timeZone: leagues.get(league)?.tz,
    timeStyle: "short",
  });
  const dateTimeFormat = Intl.DateTimeFormat(undefined, {
    timeZone: leagues.get(league)?.tz,
    dateStyle: "short",
    timeStyle: "short",
  });
  if (dateHeadings) {
    return (
      <>
        {Array.from(fixtures).map(([date, fixtures]) => (
          <Stack key={date}>
            <Title order={5}>{date}</Title>
            <List listStyleType="none" pb="md">
              {fixtures!.map((fixture, j) => (
                <ListItem key={j}>
                  ({timeFormat.format(fixture.kickoffTime)}){" "}
                  <Anchor
                    component={Link}
                    href={`/${fixture.league}/${fixture.year}/team/${fixture.homeTeam}`}
                    underline="never"
                    c="var(--mantine-color-text)"
                    inherit
                  >
                    {fixture.homeTeam}
                  </Anchor>{" "}
                  vs.{" "}
                  <Anchor
                    component={Link}
                    href={`/${fixture.league}/${fixture.year}/team/${fixture.awayTeam}`}
                    underline="never"
                    c="var(--mantine-color-text)"
                    inherit
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
      <List listStyleType="none">
        {allFixtures.map((fixture, i) => (
          <ListItem key={i}>
            <Anchor
              component={Link}
              href={`/${fixture.league}/${fixture.year}/team/${fixture.homeTeam}`}
              underline="never"
              c="var(--mantine-color-text)"
              inherit
            >
              {fixture.homeTeam}
            </Anchor>{" "}
            vs.{" "}
            <Anchor
              component={Link}
              href={`/${fixture.league}/${fixture.year}/team/${fixture.awayTeam}`}
              underline="never"
              c="var(--mantine-color-text)"
              inherit
            >
              {fixture.awayTeam}
            </Anchor>{" "}
            ({dateTimeFormat.format(fixture.kickoffTime)})
          </ListItem>
        ))}
      </List>
    );
  }
}
