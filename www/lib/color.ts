import { cacheLife, cacheTag } from "next/cache";
import { globalDataCacheTag, teamColorsCacheTag } from "@/lib/cache-tags";
import type { TeamColor } from "@/prisma/generated/client";
import prisma from "@/lib/prisma";

export async function fetchTeamColorMap(): Promise<Map<string, TeamColor>> {
  "use cache";
  cacheLife("max");
  cacheTag(globalDataCacheTag, teamColorsCacheTag);

  const allColors = await prisma.teamColor.findMany();
  return new Map(allColors.map((color) => [color.team, color]));
}
