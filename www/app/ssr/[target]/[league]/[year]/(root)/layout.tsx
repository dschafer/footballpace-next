import type { Metadata, ResolvingMetadata } from "next/types";
import {
  openGraphMetadata,
  socialImageMetadata,
  twitterMetadata,
} from "@/lib/metadata";
import { validateLeagueYear } from "@/lib/const/current";

export async function generateMetadata(
  props: LayoutProps<"/ssr/[target]/[league]/[year]">,
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const { league, year } = await props.params;
  const [leagueInfo, yearInt] = validateLeagueYear({ league, year });
  const title = {
    default: `${leagueInfo.name} ${yearInt}`,
    template: "%s | Football Pace",
  };
  return {
    title,
    ...socialImageMetadata(
      {
        openGraph: { ...openGraphMetadata, title },
        twitter: { ...twitterMetadata, title },
      },
      `/${league}/${year}/opengraph-image`,
      `${leagueInfo.flag} ${leagueInfo.name} ${yearInt}`,
    ),
  };
}

export default function Layout(
  props: LayoutProps<"/ssr/[target]/[league]/[year]">,
) {
  return <>{props.children}</>;
}
