import { List, ListItem, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";

export default function AboutPage() {
  return (
    <Stack>
      <Title order={2}>About FootballPace</Title>
      <Title order={3}>FAQ</Title>
      <List>
        <ListItem>
          <Text fw={700}>
            Why is an opponent never expected to finish 1st in the league, even
            when they are top of the table?
          </Text>
          <Text>
            For each match, FootballPace determines{" "}
            <Text span fs="italic">
              expected points at championship pace
            </Text>{" "}
            – that is, how many points would a team expect to take from this
            match if they were on pace to finish champions of the league.
          </Text>
          <Text>
            But by definition, at championship pace, we expect the team to
            finish first... so their opponent will never finish higher than
            second! Hence, the opponents for a given team are given ranks in the
            table starting from second and ending in last, and we assume the
            given team finishes first.
          </Text>
        </ListItem>
        <ListItem>
          <Text fw={700}>
            Why does the expected points for a given matchup change from
            year-to-year, and league-to-league?
          </Text>
          <Text>
            FootballPace determines the expected points based on historical data
            for that league; so each league is expected to be different.
          </Text>
          <Text>
            FootballPace also only considers results from previous seasons when
            determining expected points. So if a league changes over time (for
            example; the number of points needed to win the English Premier
            League has increased from the mid-2000s to present), this will be
            reflected in the pace for current seasons, but will not change the
            pace for those historical seasons.
          </Text>
        </ListItem>
        <ListItem>
          <Text fw={700}>
            Why does the expected points for a given match change as the year
            goes on?
          </Text>
          <Text>
            To determine expected points for a match, FootballPace has to
            approximate where a given opponent will finish in the table this
            year. To do so, it looks at both their performance this year, and
            their performance in previous years.
          </Text>
          <Text>
            This means, though, that FootballPace might change its assessment of
            the difficulty of a match as the year goes on. Take, for example,
            Leicester{"'"}s run to the title in 2015–2016. If you played
            Leicester in MD1 of 2015–2016 (as Sunderland did), FootballPace
            would have expected Leicester to be the 14th best team in the league
            (as that{"'"}s where they finished in 2014–2015). By the end of the
            season, though, FootballPace would have observed that Leicester was
            top of the table, and would now have assessed Leicester as the best
            team in the league. Hence, that match would have much lower expected
            points at the end of the year than at the start.
          </Text>
        </ListItem>
      </List>
      <Title order={3}>Contact</Title>
      <Text>
        For feedback, comments, questions, or bug reports, please{" "}
        <Link href="mailto:feedback@footballpace.com">contact us</Link> or
        report issues on{" "}
        <Link href="https://github.com/dschafer/footballpace-next">Github</Link>
        .
      </Text>
    </Stack>
  );
}
