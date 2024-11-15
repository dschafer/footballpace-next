import { SimpleGrid, Skeleton, Stack, Title } from "@mantine/core";
import LeagueFixturesPlaceholder from "@/components/fixtures/league-fixtures-placeholder";
import MatchesPlaceholder from "@/components/matches/matches-placeholder";

export default function MatchesLoading() {
  return (
    <Stack>
      <Title order={2}>
        <Skeleton>English Premier League 2023</Skeleton>
      </Title>
      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <MatchesPlaceholder monthCount={5} dayCount={10} matchCount={5} />
        <LeagueFixturesPlaceholder
          monthCount={5}
          dayCount={10}
          matchCount={5}
        />
      </SimpleGrid>
    </Stack>
  );
}
