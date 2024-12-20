import { Anchor, List, ListItem, Stack, Text, Title } from "@mantine/core";
import { openGraphMetadata, twitterMetadata } from "@/lib/metadata";
import Link from "next/link";
import type { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "About",
  openGraph: { ...openGraphMetadata, title: "About" },
  twitter: { ...twitterMetadata, title: "About" },
};

export default function AboutPage() {
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
          </Text>
          , based on how historical league champions perform in matches against
          opponents who finished in that position. From this, we can also
          compute the match{"'"}s{" "}
          <Text fw={700} span>
            Difficulty
          </Text>
          , which is just 3 minus the Target Points; in other words, the
          difficulty is how many points a typical champion drops from a given
          fixture.
        </ListItem>
        <ListItem>
          The cumulative{" "}
          <Text fw={700} span>
            Championship Pace
          </Text>
          , based on the sum of all target points for the season so far.
        </ListItem>
      </List>
      <Title order={2}>About FootballPace</Title>
      <Stack gap="xs">
        <Text>
          FootballPace was made by{" "}
          <Anchor component={Link} href="https://github.com/dschafer/">
            Dan Schafer
          </Anchor>
          . The source code is available on{" "}
          <Anchor
            component={Link}
            href="https://github.com/dschafer/footballpace-next"
          >
            Github
          </Anchor>
          .
        </Text>
        <Text>
          The data pipeline is powered by{" "}
          <Anchor component={Link} href="https://dagster.io/">
            Dagster
          </Anchor>
          , the front-end by{" "}
          <Anchor component={Link} href="https://nextjs.org/">
            Next.js
          </Anchor>{" "}
          and hosted on{" "}
          <Anchor component={Link} href="https://vercel.com/">
            Vercel
          </Anchor>
          . The components library is{" "}
          <Anchor component={Link} href="https://mantine.dev/">
            Mantine
          </Anchor>
          . Data is sourced from{" "}
          <Anchor component={Link} href="https://www.football-data.co.uk/">
            Football Data UK
          </Anchor>{" "}
          and from{" "}
          <Anchor component={Link} href="https://fantasy.premierleague.com/">
            Fantasy Premier League
          </Anchor>
          . Flags icons are from{" "}
          <Anchor component={Link} href="https://openmoji.org/">
            OpenMoji
          </Anchor>
          . Team color data is from{" "}
          <Anchor
            component={Link}
            href="https://github.com/jimniels/teamcolors/"
          >
            jimniels/teamcolors
          </Anchor>
          .
        </Text>
        <Text>
          The original inspiration for this is from the Reddit user{" "}
          <Anchor
            component={Link}
            href="https://www.reddit.com/user/AndrycApp/"
          >
            AndrycApp
          </Anchor>
          {"'"}s{" "}
          <Anchor
            component={Link}
            href="https://www.reddit.com/r/soccer/comments/2rx7ho/andrycapps_epl_par_table_game_week_20/"
          >
            par table posts
          </Anchor>
          ; the term {'"'}pace{'"'} is used here instead to clarify that teams
          want to be{" "}
          <Text span fs="italic">
            ahead
          </Text>{" "}
          of pace (whereas with par in golf, you generally want to be{" "}
          <Text span fs="italic">
            below
          </Text>{" "}
          par).
        </Text>
      </Stack>
      <Title order={3}>Updates</Title>
      <Stack gap="xs">
        <Text>
          Football Pace checks for updates from our data sources every hour, but
          we have different data sources for different leagues.
        </Text>
        <List>
          <ListItem>
            The current{" "}
            <Text fw={700} span inherit>
              English Premier League
            </Text>{" "}
            season is sourced from the Fantasy Premier League API. This updates
            nearly live, so English Premier League matches should appear on the
            site within an hour or two after they finish. This API also provides
            a full list of fixtures, allowing Football Pace to display those.
          </ListItem>
          <ListItem>
            <Text fw={700} span inherit>
              All other leagues
            </Text>{" "}
            (and all historical results) are sourced form Football Data UK. They
            tend to update a day or two after the matches take place, so other
            leagues results will appear with a day or two delay.
          </ListItem>
        </List>
      </Stack>
      <Title order={3}>FAQ</Title>
      <List>
        <ListItem>
          <Text fw={700}>
            Why is an opponent never expected to finish 1st in the league, even
            when they are top of the table?
          </Text>
          <Stack gap="xs">
            <Text>
              For each match, FootballPace determines{" "}
              <Text span fs="italic">
                target points at championship pace
              </Text>{" "}
              – that is, how many points would a team expect to take from this
              match if they were on pace to finish champions of the league.
            </Text>
            <Text>
              But by definition, at championship pace, we expect the team to
              finish first... so their opponent will never finish higher than
              second! Hence, the opponents for a given team are given ranks in
              the table starting from second and ending in last, and we assume
              the given team finishes first.
            </Text>
          </Stack>
        </ListItem>
        <ListItem>
          <Text fw={700}>
            Why does the target points for a given matchup change from
            year-to-year, and league-to-league?
          </Text>
          <Stack gap="xs">
            <Text>
              FootballPace determines the target points based on historical data
              for that league; so each league is expected to be different.
            </Text>
            <Text>
              FootballPace also only considers results from previous seasons
              when determining target points. So if a league changes over time
              (for example; the number of points needed to win the English
              Premier League has increased from the mid-2000s to present), this
              will be reflected in the pace for current seasons, but will not
              change the pace for those historical seasons.
            </Text>
          </Stack>
        </ListItem>
        <ListItem>
          <Text fw={700}>
            Why does the target points for a given match change as the year goes
            on?
          </Text>
          <Stack gap="xs">
            <Text>
              To determine target points for a match, FootballPace has to
              approximate where a given opponent will finish in the table this
              year. To do so, it looks at both their performance this year, and
              their performance in previous years.
            </Text>
            <Text>
              This means, though, that FootballPace might change its assessment
              of the difficulty of a match as the year goes on. Take, for
              example, Leicester{"'"}s run to the title in 2015–2016. If you
              played Leicester in MD1 of 2015–2016 (as Sunderland did), at that
              time FootballPace would have expected Leicester to be the 14th
              best team in the league (as that{"'"}s where they finished in
              2014–2015). By the end of the season, though, FootballPace would
              have observed that Leicester was top of the table, and would now
              have assessed Leicester as the best team in the league. And
              indeed, if you look at FootballPace for{" "}
              <Anchor component={Link} href="/E0/2015/team/Sunderland">
                that completed season for Sunderland
              </Anchor>
              , you will see MD1 listed as {'"'}Away to 2{'"'}.
            </Text>
            <Text>
              Hence, that match would have much lower target points at the end
              of the year than at the start. This is an example of why target
              points for a given match change as the year goes on – though they
              are rarely quite this dramatic.
            </Text>
          </Stack>
        </ListItem>
      </List>
      <Title order={3}>Contact</Title>
      <Text>
        For feedback, comments, questions, or bug reports, please{" "}
        <Anchor component={Link} href="mailto:feedback@footballpace.com">
          contact us
        </Anchor>
        .
      </Text>
    </Stack>
  );
}
