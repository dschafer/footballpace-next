import { type LeagueYearParam, validateLeagueYear } from "@/lib/const/current";
import type { Metadata, ResolvingMetadata } from "next/types";
import { openGraphMetadata, twitterMetadata } from "@/lib/metadata";

export async function generateMetadata(
  { params }: { params: Promise<LeagueYearParam> },
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const { league, year } = await params;
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
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
