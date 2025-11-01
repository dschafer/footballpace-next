import {
  genOpenGraphImage,
  imageMetadata,
} from "@/components/opengraph-image/opengraph-image";
import type { ImageResponse } from "next/og";
import type { SeasonPageParam } from "./params";
import { validateLeagueYear } from "@/lib/const/current";

function getSubtitle(params: SeasonPageParam): string {
  const [leagueInfo, yearInt] = validateLeagueYear(params);
  return `${leagueInfo.flag} ${decodeURIComponent(params.team)} ${yearInt}`;
}

export function generateImageMetadata({ params }: { params: SeasonPageParam }) {
  if (!params.league) {
    return imageMetadata();
  }
  return imageMetadata(getSubtitle(params));
}

export default async function Image({
  params,
}: {
  params: Promise<SeasonPageParam>;
}): Promise<ImageResponse> {
  const seasonPageParam = await params;
  return await genOpenGraphImage(getSubtitle(seasonPageParam));
}
