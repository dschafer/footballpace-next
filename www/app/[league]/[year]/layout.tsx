import type { Metadata, ResolvingMetadata } from "next/types";
import { openGraphMetadata, twitterMetadata } from "@/lib/metadata";
import { validateLeagueYear } from "@/lib/const/current";

export async function generateMetadata(
  props: LayoutProps<"/[league]/[year]">,
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
    openGraph: { ...openGraphMetadata, title },
    twitter: { ...twitterMetadata, title },
  };
}

// This is a no-op, but adding layout.tsx here hopefully lets
// us target layout for revalidatePath()
export default function Layout(props: LayoutProps<"/[league]/[year]">) {
  return <>{props.children}</>;
}
