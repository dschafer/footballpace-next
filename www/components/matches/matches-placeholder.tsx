import { List, ListItem, Skeleton, Stack, Title } from "@mantine/core";

export default function MatchesPlaceholder({
  dayCount,
  matchCount,
}: {
  dayCount: number;
  matchCount: number;
}) {
  return (
    <Stack>
      {[...Array(dayCount)].map((_, i) => (
        <Stack key={i}>
          <Title order={4}>
            <Skeleton>2024-10-23</Skeleton>
          </Title>
          <List listStyleType="none">
            {[...Array(matchCount)].map((_, j) => (
              <ListItem key={j}>
                <Skeleton>Arsenal 2-0 Tottenham</Skeleton>
              </ListItem>
            ))}
          </List>
        </Stack>
      ))}
    </Stack>
  );
}
