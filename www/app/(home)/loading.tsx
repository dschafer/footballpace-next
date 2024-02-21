import StandingsTablePlaceholder from "@/components/standings-table-placeholder";
import Typography from "@mui/material/Typography";

export default function Home() {
  return (
    <>
      <Typography variant="h2" gutterBottom>
        English Premier League
      </Typography>
      <StandingsTablePlaceholder rowCount={5} />
    </>
  );
}
