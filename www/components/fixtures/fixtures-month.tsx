import { List, ListItem, Stack, Title } from "@mantine/core";
import AnchorLink from "@/components/anchor-link/anchor-link";
import type { Fixture } from "@prisma/client";
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
              {fixtures.map((fixture, j) => (
                <ListItem key={j}>
                  ({timeFormat.format(fixture.kickoffTime)}){" "}
                  <AnchorLink
                    href={`/${fixture.league}/${fixture.year}/team/${fixture.homeTeam}`}
                    underline="never"
                    c="var(--mantine-color-text)"
                    inherit
                  >
                    {fixture.homeTeam}
                  </AnchorLink>{" "}
                  vs.{" "}
                  <AnchorLink
                    href={`/${fixture.league}/${fixture.year}/team/${fixture.awayTeam}`}
                    underline="never"
                    c="var(--mantine-color-text)"
                    inherit
                  >
                    {fixture.awayTeam}
                  </AnchorLink>
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
            <AnchorLink
              href={`/${fixture.league}/${fixture.year}/team/${fixture.homeTeam}`}
              underline="never"
              c="var(--mantine-color-text)"
              inherit
            >
              {fixture.homeTeam}
            </AnchorLink>{" "}
            vs.{" "}
            <AnchorLink
              href={`/${fixture.league}/${fixture.year}/team/${fixture.awayTeam}`}
              underline="never"
              c="var(--mantine-color-text)"
              inherit
            >
              {fixture.awayTeam}
            </AnchorLink>{" "}
            ({dateTimeFormat.format(fixture.kickoffTime)})
          </ListItem>
        ))}
      </List>
    );
  }
}
