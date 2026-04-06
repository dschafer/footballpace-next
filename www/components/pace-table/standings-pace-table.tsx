import PaceTable from "./pace-table";
import { fetchPaceTeams } from "@/lib/pace/pace";

export default async function StandingsPaceTable({
  rowCount,
  league,
  year,
  targetFinish = 1,
}: {
  rowCount?: number;
  league: string;
  year: number;
  targetFinish?: number;
}) {
  let paceTeams = await fetchPaceTeams(league, year, targetFinish);

  if (rowCount) {
    paceTeams = paceTeams.slice(0, rowCount);
  }

  return <PaceTable paceTeams={paceTeams} />;
}
