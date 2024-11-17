import { Stack, Title } from "@mantine/core";
import UpcomingTablePlaceholder from "@/components/upcoming-table/upcoming-table-placeholder";

export default async function UpcomingLoading() {
  return (
    <Stack>
      <Title order={2}>Upcoming Fixtures</Title>
      <UpcomingTablePlaceholder teamCount={4} matchCount={6} />
    </Stack>
  );
}
