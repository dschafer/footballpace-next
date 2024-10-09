import PaceTable from "./pace-table";
import { fetchPaceTeams } from "@/lib/pace/pace";

export default async function StandingsPaceTable({
  rowCount,
  league,
  year,
}: {
  rowCount?: number;
  league: string;
  year: number;
}) {
  let paceTeams = await fetchPaceTeams(league, year);

  if (rowCount) {
    paceTeams = paceTeams.slice(0, rowCount);
  }

  return <PaceTable paceTeams={paceTeams} />;
}
