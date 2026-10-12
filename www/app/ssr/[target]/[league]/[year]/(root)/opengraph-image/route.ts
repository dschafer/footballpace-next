import { type LeagueYearParam, validateLeagueYear } from "@/lib/const/current";
import type { ImageResponse } from "next/og";
import { genOpenGraphImage } from "@/components/opengraph-image/opengraph-image";

export async function GET(
  _request: Request,
  { params }: { params: Promise<LeagueYearParam> },
): Promise<ImageResponse> {
  const [leagueInfo, yearInt] = validateLeagueYear(await params);
  return genOpenGraphImage(`${leagueInfo.flag} ${leagueInfo.name} ${yearInt}`);
}
