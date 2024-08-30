import { Skeleton, Text, Title } from "@mantine/core";
import FixturesTablePlaceholder from "@/components/fixtures-table/fixtures-table-placeholder";

export default function SeasonLoading() {
  return (
    <>
      <Title order={2}>
        <Skeleton>Arsenal</Skeleton>
      </Title>
      <Text fs="italic">
        <Skeleton>English Premier League 2023</Skeleton>
      </Text>
      <FixturesTablePlaceholder rowCount={38} />
    </>
  );
}
