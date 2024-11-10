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
import ErrorAlert from "../error/error-alert";
import { Match } from "@prisma/client";
import Result from "../pace-display/result";
import leagues from "@/lib/const/leagues";
import prisma from "@/lib/prisma";

export default async function Matches({
  league,
  year,
}: {
  league: string;
  year: number;
}) {
  const matches = await prisma.match.findMany({
    where: { league: league, year: year },
    orderBy: { date: "desc" },
  });
  if (matches.length == 0) {
    return <ErrorAlert />;
  }
  // This is just Map.groupBy but that's not available in Node 20.
  const matchesByDay: Map<string, Array<Match>> = new Map();
  for (const match of matches) {
    const key = match.date.toLocaleDateString([], {
      timeZone: leagues.get(league)?.tz,
    });
    if (matchesByDay.has(key)) {
      matchesByDay.get(key)!.push(match);
    } else {
      matchesByDay.set(key, [match]);
    }
  }

  const matchesByMonth: Map<string, Map<string, Array<Match>>> = new Map();
  for (const [day, matches] of Array.from(matchesByDay.entries())) {
    const key = matches[0].date.toLocaleString([], { month: "long" });
    if (!matchesByMonth.has(key)) {
      matchesByMonth.set(key, new Map());
    }
    matchesByMonth.get(key)!.set(day, matches);
  }
  return (
    <Stack>
      <Title order={3}>Matches</Title>
      <Accordion
        variant="separated"
        multiple={true}
        defaultValue={[new Date().toLocaleString([], { month: "long" })]}
      >
        {Array.from(matchesByMonth).map(([month, matchesDict]) => (
          <AccordionItem key={month} value={month}>
            <AccordionControl>
              <Title order={4}>{month}</Title>
            </AccordionControl>
            <AccordionPanel p="md">
              {Array.from(matchesDict).map(([date, matches]) => (
                <Stack key={date}>
                  <Title order={4}>{date}</Title>
                  <List listStyleType="none" pb="md">
                    {matches!.map((match, j) => (
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
