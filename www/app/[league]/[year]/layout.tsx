import type { Metadata, ResolvingMetadata } from "next/types";
import { openGraphMetadata, twitterMetadata } from "@/lib/metadata";
import type { LeagueYearParam } from "@/lib/const/current";
import leagues from "@/lib/const/leagues";

export async function generateMetadata(
  { params }: { params: LeagueYearParam },
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const league = leagues.get(params.league);
  const title = {
    default: `${league ? league.name : "Unknown"} ${params.year}`,
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
