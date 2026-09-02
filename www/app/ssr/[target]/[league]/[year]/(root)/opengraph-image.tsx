import { type LeagueYearParam, validateLeagueYear } from "@/lib/const/current";
import {
  genOpenGraphImage,
  imageMetadata,
} from "@/components/opengraph-image/opengraph-image";
import type { ImageResponse } from "next/og";

type Props = { params: Promise<LeagueYearParam> };

function getSubtitle(params: LeagueYearParam): string {
  const [leagueInfo, yearInt] = validateLeagueYear(params);
  return `${leagueInfo.flag} ${leagueInfo.name} ${yearInt}`;
}

export async function generateImageMetadata({ params }: Props) {
  const resolvedParams = await params;
  if (!resolvedParams.league) {
    return imageMetadata();
  }
  return imageMetadata(getSubtitle(resolvedParams));
}

export default async function Image({ params }: Props): Promise<ImageResponse> {
  return await genOpenGraphImage(getSubtitle(await params));
}
