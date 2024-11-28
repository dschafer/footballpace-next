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
  return imageMetadata(getSubtitle(params));
}

export default async function Image({
  params,
}: {
  params: LeagueYearParam;
}): Promise<ImageResponse> {
  return await genOpenGraphImage(getSubtitle(params));
}
