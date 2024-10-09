import PaceChart from "./pace-chart";
import { fetchPaceTeams } from "@/lib/pace/pace";
import prisma from "@/lib/prisma";

export default async function StandingsPaceChart({
  league,
  year,
}: {
  league: string;
  year: number;
}) {
  let [paceTeams, allColors] = await Promise.all([
    fetchPaceTeams(league, year),
    prisma.teamColor.findMany(),
  ]);
  paceTeams = paceTeams.slice(0, 5);

  return <PaceChart paceTeams={paceTeams} allColors={allColors} />;
}
