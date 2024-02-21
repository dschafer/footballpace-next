import Stack from "@mui/material/Stack";
import StandingsTable from "@/components/standings-table";
import leagues from "@/lib/leagues";

export default function Home() {
  return (
    <Stack spacing={2}>
      {Array.from(leagues).map(([league, _]) => (
        <StandingsTable
          rowCount={5}
          league={league}
          season={2023}
          key={league}
        />
      ))}
    </Stack>
  );
}
