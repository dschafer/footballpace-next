import Stack from "@mui/material/Stack";
import StandingsTablePlaceholder from "@/components/standings-table/standings-table-placeholder";
import leagues from "@/lib/leagues";

export default function Home() {
  return (
    <Stack spacing={2}>
      {Array.from(leagues).map(([league, _]) => (
        <StandingsTablePlaceholder rowCount={5} key={league} />
      ))}
    </Stack>
  );
}
