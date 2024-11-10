import Fixtures from "./fixtures";
import prisma from "@/lib/prisma";

export default async function TeamFixtures({
  league,
  year,
  team,
}: {
  league: string;
  year: number;
  team: string;
}) {
  const fixtures = await prisma.fixture.findMany({
    where: {
      league: league,
      year: year,
      kickoffTime: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Only show today and future fixtures
      OR: [{ homeTeam: team }, { awayTeam: team }],
    },
    orderBy: { kickoffTime: "asc" },
  });
  return <Fixtures fixtures={fixtures} dateHeadings={false} />;
}
