import { Skeleton, Title } from "@mantine/core";
import StandingsTablePlaceholder from "@/components/standings-table/standings-table-placeholder";

export default function TableLoading() {
  return (
    <>
      <Title order={2}>
        <Skeleton>English Premier League 2023</Skeleton>
      </Title>
      <StandingsTablePlaceholder rowCount={20} />
    </>
  );
}
