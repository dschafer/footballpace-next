import { List, ListItem, Stack, Title } from "@mantine/core";
import ErrorAlert from "../error/error-alert";
import { Match } from "@prisma/client";
import Result from "../pace-display/result";
import leagues from "@/lib/const/leagues";
import prisma from "@/lib/prisma";

export default async function RecentPaceTable({
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

  return (
    <Stack>
      {Array.from(matchesByDay).map(([date, matches]) => (
        <Stack key={date}>
          <Title order={3}>{date}</Title>
          <List listStyleType="none">
            {matches!.map((match, j) => (
              <ListItem key={j}>
                <Result match={match} link={true} />
              </ListItem>
            ))}
          </List>
        </Stack>
      ))}
    </Stack>
  );
}
