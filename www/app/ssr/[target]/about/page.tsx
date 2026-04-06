import { List, ListItem, Stack, Text, Title } from "@mantine/core";
import { openGraphMetadata, twitterMetadata } from "@/lib/metadata";
import AnchorLink from "@/components/anchor-link/anchor-link";
import type { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "About",
  openGraph: { ...openGraphMetadata, title: "About" },
  twitter: { ...twitterMetadata, title: "About" },
  alternates: { canonical: "/about" },
};

export default function AboutSSR() {
  return (
    <Stack>
      <Title order={2}>What is FootballPace?</Title>
      <Text>
        Football Pace is a version of the standings table that accounts for
        strength of schedule. It looks at historical data to see how a typical
        champion performs in each match, based on home/away and the opponent
        {"'"}s finishing position. It then presents a new version of the
        standings table, that shows how each team is doing compared to typical
        championship pace, given their schedule so far.
      </Text>
      <Text>Most specifically, for each match, we determine:</Text>
      <List>
        <ListItem>
          The opponent{"'"}s{" "}
          <Text fw={700} span>
            Projected Finishing Position
          </Text>
          , based on the opponent{"'"}s finish this year and last year.
        </ListItem>
        <ListItem>
          The{" "}
          <Text fw={700} span>
            Target Points
          </Text>{" "}
          and the match{" "}
          <Text fw={700} span>
            Difficulty
          </Text>{" "}
          (3 minus Target Points).
        </ListItem>
        <ListItem>
          The cumulative{" "}
          <Text fw={700} span>
            Championship Pace
          </Text>
          .
        </ListItem>
      </List>
      <Title order={2}>About FootballPace</Title>
      <Stack gap="xs">
        <Text>
          FootballPace was made by{" "}
          <AnchorLink href="https://github.com/dschafer/">
            Dan Schafer
          </AnchorLink>
          . Source:{" "}
          <AnchorLink href="https://github.com/dschafer/footballpace-next">
            Github
          </AnchorLink>
          .
        </Text>
      </Stack>
    </Stack>
  );
}
