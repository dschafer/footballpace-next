import { Stack } from "@mantine/core";
import StandingsTablePlaceholder from "@/components/standings-table/standings-table-placeholder";
import leagues from "@/lib/leagues";

export default function Home() {
  return (
    <Stack>
      {Array.from(leagues).map(([league, _]) => (
        <StandingsTablePlaceholder rowCount={5} key={league} />
      ))}
    </Stack>
  );
}
