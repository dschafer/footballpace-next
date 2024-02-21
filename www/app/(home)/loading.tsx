import StandingsTablePlaceholder from "@/components/standings-table-placeholder";
import leagues from "@/lib/leagues";

export default function Home() {
  return (
    <>
      {Array.from(leagues).map(([league, _]) => (
        <StandingsTablePlaceholder rowCount={5} league={league} key={league} />
      ))}
    </>
  );
}
