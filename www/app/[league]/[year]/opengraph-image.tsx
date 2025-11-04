import { type LeagueYearParam, validateLeagueYear } from "@/lib/const/current";
import {
  genOpenGraphImage,
  imageMetadata,
} from "@/components/opengraph-image/opengraph-image";
import type { ImageResponse } from "next/og";

function getSubtitle(params: LeagueYearParam): string {
  const [leagueInfo, yearInt] = validateLeagueYear(params);
  return `${leagueInfo.flag} ${leagueInfo.name} ${yearInt}`;
}

export function generateImageMetadata({ params }: { params: LeagueYearParam }) {
  if (!params.league) {
    return imageMetadata();
  }
  return imageMetadata(getSubtitle(params));
}

export default async function Image(
  props: PageProps<"/[league]/[year]">,
): Promise<ImageResponse> {
  const leagueYearParam = await props.params;
  return await genOpenGraphImage(getSubtitle(leagueYearParam));
}
