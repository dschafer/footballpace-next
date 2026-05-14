import { Breadcrumbs, Group, Skeleton, Stack, Title } from "@mantine/core";

import PaceTablePlaceholder from "@/components/pace-table/pace-table-placeholder";
import TodaysMatchesPlaceholder from "@/components/today-matches/todays-matches-placeholder";

export default function PaceLoading() {
  return (
    <Stack>
      <Title order={2}>
        <Skeleton>English Premier League 2023</Skeleton>
      </Title>
      <TodaysMatchesPlaceholder cardCount={4} />
      <PaceTablePlaceholder rowCount={20} matchdayCount={20} />
      <Group style={{ alignSelf: "flex-end" }}>
        <Breadcrumbs separator=" · ">
          <Skeleton ta="right">Pace Chart »</Skeleton>
          <Skeleton ta="right">Explanation »</Skeleton>
        </Breadcrumbs>
      </Group>
    </Stack>
  );
}
