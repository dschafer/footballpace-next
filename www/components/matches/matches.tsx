import {
  Accordion,
  AccordionControl,
  AccordionItem,
  AccordionPanel,
  List,
  ListItem,
  Stack,
  Title,
} from "@mantine/core";
import {
  fetchMatches,
  shouldCacheSeasonData,
} from "@/lib/pace/data";
import ErrorAlert from "../error/error-alert";
import type { Match } from "@/prisma/generated/client";
import MatchesPlaceholder from "./matches-placeholder";
import Result from "../pace-display/result";
import { Suspense } from "react";
import leagues from "@/lib/const/leagues";

type MatchesProps = {
  league: string;
  year: number;
};

export default function Matches(props: MatchesProps) {
  if (shouldCacheSeasonData(props.league, props.year)) {
    return <MatchesContent {...props} />;
  }
  return (
    <Suspense
      fallback={
        <MatchesPlaceholder monthCount={5} dayCount={10} matchCount={5} />
      }
    >
      <MatchesContent {...props} />
    </Suspense>
  );
}

async function MatchesContent({ league, year }: MatchesProps) {
  const matches = await fetchMatches(league, year, {
    orderBy: { date: "desc" },
  });
  if (matches.length == 0) {
    return <ErrorAlert />;
  }
  const dateFormat = Intl.DateTimeFormat(undefined, {
    timeZone: leagues.get(league)?.tz,
  });
  const monthFormat = Intl.DateTimeFormat(undefined, {
    timeZone: leagues.get(league)?.tz,
    month: "long",
  });
  // This is just Map.groupBy but that's not available in Node 20.
  const matchesByDay = new Map<string, Match[]>();
  for (const match of matches) {
    const key = dateFormat.format(match.date);
    if (matchesByDay.has(key)) {
      matchesByDay.get(key)!.push(match);
    } else {
      matchesByDay.set(key, [match]);
    }
  }

  const matchesByMonth = new Map<string, Map<string, Match[]>>();
  for (const [day, matches] of Array.from(matchesByDay.entries())) {
    const key = monthFormat.format(matches[0].date);
    if (!matchesByMonth.has(key)) {
      matchesByMonth.set(key, new Map());
    }
    matchesByMonth.get(key)!.set(day, matches);
  }
  const defaultMonth = Array.from(matchesByMonth.keys())[0];
  return (
    <Stack>
      <Title order={3}>Matches</Title>
      <Accordion
        variant="separated"
        multiple={true}
        defaultValue={defaultMonth ? [defaultMonth] : []}
      >
        {Array.from(matchesByMonth).map(([month, matchesDict]) => (
          <AccordionItem key={month} value={month}>
            <AccordionControl>
              <Title order={4}>{month}</Title>
            </AccordionControl>
            <AccordionPanel>
              {Array.from(matchesDict).map(([date, matches]) => (
                <Stack key={date}>
                  <Title order={5}>{date}</Title>
                  <List listStyleType="none" pb="md">
                    {matches.map((match, j) => (
                      <ListItem key={j}>
                        <Result match={match} link={true} />
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
