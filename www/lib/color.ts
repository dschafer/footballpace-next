import type { TeamColor } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function fetchTeamColorMap(): Promise<Map<string, TeamColor>> {
  const allColors = await prisma.teamColor.findMany();
  return new Map(allColors.map((color) => [color.team, color]));
}
