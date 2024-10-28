import { List, ListItem } from "@mantine/core";
import ErrorAlert from "../error/error-alert";
import Result from "../pace-display/result";
import leagues from "@/lib/const/leagues";
import prisma from "@/lib/prisma";
import { Match } from "@prisma/client";

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
    <List>
      {Array.from(matchesByDay).map(([date, matches]) => (
        <ListItem key={date}>
          {date}
          <List withPadding>
            {matches!.map((match, j) => (
              <ListItem key={j}>
                <Result match={match} link={true} />
              </ListItem>
            ))}
          </List>
        </ListItem>
      ))}
    </List>
  );
}
