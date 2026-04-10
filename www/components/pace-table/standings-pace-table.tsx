import PaceTable from "./pace-table";
import { fetchPaceTeams } from "@/lib/pace/pace";
import { slicePaceTeams } from "@/lib/pace/pace-types";

export default async function StandingsPaceTable({
  rowCount,
  league,
  year,
  targetFinish,
}: {
  rowCount?: number;
  league: string;
  year: number;
  targetFinish: number;
}) {
  let paceTeams = await fetchPaceTeams(league, year, targetFinish);
  if (rowCount) {
    paceTeams = slicePaceTeams(paceTeams, rowCount, targetFinish);
  }
  return <PaceTable paceTeams={paceTeams} />;
}
