import type { TeamColor } from "@/prisma/generated/client";
import { fetchTeamColors } from "@/lib/pace/data";

export async function fetchTeamColorMap(): Promise<Map<string, TeamColor>> {
  const allColors = await fetchTeamColors();
  return new Map(allColors.map((color) => [color.team, color]));
}
