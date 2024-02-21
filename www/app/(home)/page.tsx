import StandingsTable from "@/components/standings-table";
import Typography from "@mui/material/Typography";

export default function Home() {
  return (
    <>
      <Typography variant="h2" gutterBottom>
        English Premier League
      </Typography>
      <StandingsTable rowCount={5} league="E0" season={2023} />
    </>
  );
}
