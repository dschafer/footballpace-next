import prisma from "@/lib/prisma";
import { sortStandings } from "../sort";

export type ExtendedStandingsRow = {
  league: string;
  year: number;
  team: string;
  played: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  gd: number;
};

export async function fetchStandings(
  league: string,
  year: number,
): Promise<ExtendedStandingsRow[]> {
  const allMatches = await prisma.match.findMany({
    where: { league: league, year: year },
  });
  const standingsMap: Map<String, ExtendedStandingsRow> = new Map();
  for (const match of allMatches) {
    for (const team of [match.homeTeam, match.awayTeam]) {
      if (!standingsMap.has(team)) {
        standingsMap.set(team, {
          league,
          year,
          team,
          played: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          points: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          gd: 0,
        });
      }
    }
    standingsMap.get(match.homeTeam)!.played += 1;
    standingsMap.get(match.homeTeam)!.goalsFor += match.ftHomeGoals;
    standingsMap.get(match.homeTeam)!.goalsAgainst += match.ftAwayGoals;
    standingsMap.get(match.homeTeam)!.gd +=
      match.ftHomeGoals - match.ftAwayGoals;

    standingsMap.get(match.awayTeam)!.played += 1;
    standingsMap.get(match.awayTeam)!.goalsFor += match.ftAwayGoals;
    standingsMap.get(match.awayTeam)!.goalsAgainst += match.ftHomeGoals;
    standingsMap.get(match.awayTeam)!.gd +=
      match.ftAwayGoals - match.ftHomeGoals;
    switch (match.ftResult) {
      case "H":
        standingsMap.get(match.homeTeam)!.wins += 1;
        standingsMap.get(match.homeTeam)!.points += 3;

        standingsMap.get(match.awayTeam)!.losses += 1;
        break;
      case "A":
        standingsMap.get(match.homeTeam)!.losses += 1;

        standingsMap.get(match.awayTeam)!.wins += 1;
        standingsMap.get(match.awayTeam)!.points += 3;
        break;
      case "D":
        standingsMap.get(match.homeTeam)!.draws += 1;
        standingsMap.get(match.homeTeam)!.points += 1;

        standingsMap.get(match.awayTeam)!.draws += 1;
        standingsMap.get(match.awayTeam)!.points += 1;
        break;
    }
  }
  return sortStandings(Array.from(standingsMap.values()));
}
