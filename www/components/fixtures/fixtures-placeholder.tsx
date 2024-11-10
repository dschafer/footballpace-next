import { List, ListItem, Skeleton, Stack, Title } from "@mantine/core";

export default function FixturesPlaceholder({
  dayCount,
  matchCount,
}: {
  dayCount: number;
  matchCount: number;
}) {
  return (
    <Stack>
      <Title order={3}>
        <Skeleton>Fixtures</Skeleton>
      </Title>
      {[...Array(dayCount)].map((_, i) => (
        <Stack key={i}>
          <Title order={4}>
            <Skeleton>2024-10-23</Skeleton>
          </Title>
          <List listStyleType="none">
            {[...Array(matchCount)].map((_, j) => (
              <ListItem key={j}>
                <Skeleton>(15:00) Arsenal vs. Tottenham</Skeleton>
              </ListItem>
            ))}
          </List>
        </Stack>
      ))}
    </Stack>
  );
}
