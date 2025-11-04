import { type SeasonPageParam, validateLeagueYear } from "@/lib/const/current";
import {
  genOpenGraphImage,
  imageMetadata,
} from "@/components/opengraph-image/opengraph-image";
import type { ImageResponse } from "next/og";

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

export default async function Image(
  props: PageProps<"/[league]/[year]/team/[team]">,
): Promise<ImageResponse> {
  const seasonPageParam = await props.params;
  return await genOpenGraphImage(getSubtitle(seasonPageParam));
}
