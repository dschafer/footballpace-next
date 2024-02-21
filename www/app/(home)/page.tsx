import StandingsTable from "@/components/standings-table";
import leagues from "@/lib/leagues";

export default function Home() {
  return (
    <>
      {Array.from(leagues).map(([league, _]) => (
        <StandingsTable
          rowCount={5}
          league={league}
          season={2023}
          key={league}
        />
      ))}
    </>
  );
}
