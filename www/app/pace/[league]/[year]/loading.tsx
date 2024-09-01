import { Skeleton, Stack, Text, Title } from "@mantine/core";
import PaceTablePlaceholder from "@/components/pace-table/pace-table-placeholder";

export default function PaceLoading() {
  return (
    <Stack>
      <Title
        order={2}
        style={{
          alignSelf: "flex-start",
        }}
      >
        <Skeleton>English Premier League 2023</Skeleton>
      </Title>
      <PaceTablePlaceholder rowCount={20} matchdayCount={20} />
      <Skeleton
        ta="right"
        style={{
          alignSelf: "flex-end",
        }}
        width={100}
      >
        Pace Sheet »
      </Skeleton>
    </Stack>
  );
}
