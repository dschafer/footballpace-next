import { Stack } from "@mantine/core";
import StandingsTable from "@/components/standings-table/standings-table";
import leagues from "@/lib/leagues";

export default function Home() {
  return (
    <Stack>
      {Array.from(leagues).map(([league, _]) => (
        <StandingsTable rowCount={5} league={league} year={2023} key={league} />
      ))}
    </Stack>
  );
}
