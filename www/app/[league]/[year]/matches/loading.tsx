import { Skeleton, Stack, Title } from "@mantine/core";
import FixturesPlaceholder from "@/components/fixtures/fixtures-placeholder";
import MatchesPlaceholder from "@/components/matches/matches-placeholder";

export default function MatchesLoading() {
  return (
    <Stack>
      <Title order={2}>
        <Skeleton>English Premier League 2023</Skeleton>
      </Title>
      <MatchesPlaceholder dayCount={10} matchCount={5} />
      <FixturesPlaceholder dayCount={10} matchCount={5} />
    </Stack>
  );
}
