import StandingsTable from "@/components/standings-table";

export default function Home() {
  return <StandingsTable rowCount={5} league="E0" season={2023} />;
}
