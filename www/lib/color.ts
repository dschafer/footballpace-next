import { TeamColor } from "@prisma/client";

export default function teamColor(
  team: string,
  allColors: TeamColor[],
): TeamColor | undefined {
  const allColorsMap = new Map(allColors.map((color) => [color.team, color]));
  if (allColorsMap.has(team)) {
    return allColorsMap.get(team);
  }
  if (allColorsMap.has(team.replace("Man", "Manchester"))) {
    return allColorsMap.get(team.replace("Man", "Manchester"));
  }
  return undefined;
}
