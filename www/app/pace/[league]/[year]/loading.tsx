import { Skeleton, Stack, Text } from "@mantine/core";
import PaceTablePlaceholder from "@/components/pace-table/pace-table-placeholder";

export default function PaceLoading() {
  return (
    <Stack>
      <PaceTablePlaceholder rowCount={20} />
      <Text ta="right">
        <Skeleton>Pace Sheet »</Skeleton>
      </Text>
    </Stack>
  );
}
