import { Metadata, ResolvingMetadata } from "next/types";
import { LeagueYearParam } from "@/lib/const/current";
import leagues from "@/lib/const/leagues";

export async function generateMetadata(
  { params }: { params: LeagueYearParam },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const league = leagues.get(params.league);
  return {
    title: {
      default: `${league ? league.name : "Unknown"} ${params.year}`,
      template: "%s | Football Pace",
    },
  };
}

// This is a no-op, but adding layout.tsx here hopefully lets
// us target layout for revalidatePath()
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
