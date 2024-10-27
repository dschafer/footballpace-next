import { List, ListItem, Skeleton } from "@mantine/core";

export default function MatchesPlaceholder({
  dayCount,
  matchCount,
}: {
  dayCount: number;
  matchCount: number;
}) {
  return (
    <List>
      {[...Array(dayCount)].map((_, i) => (
        <ListItem key={i}>
          <Skeleton>2024-10-23</Skeleton>
          <List withPadding>
            {[...Array(matchCount)].map((_, j) => (
              <ListItem key={j}>
                <Skeleton>Arsenal 2-0 Tottenham</Skeleton>
              </ListItem>
            ))}
          </List>
        </ListItem>
      ))}
    </List>
  );
}
