import { List, ListItem } from "@mantine/core";
import ErrorAlert from "../error/error-alert";
import Result from "../pace-display/result";
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
  const matchesByDay = Map.groupBy(matches, ({ date }) => date.toDateString());

  return (
    <List>
      {Array.from(matchesByDay).map(([date, matches]) => (
        <ListItem key={date}>
          {date}
          <List withPadding>
            {matches.map((match, j) => (
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
