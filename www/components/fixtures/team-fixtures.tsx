import Fixtures from "./fixtures";
import LinkableHeader from "../header/linkable-header";
import { Stack } from "@mantine/core";
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
  if (fixtures.length == 0) {
    return null;
  }
  return (
    <Stack>
      <LinkableHeader order={3} title="Fixtures" />
      <Fixtures fixtures={fixtures} dateHeadings={false} />
    </Stack>
  );
}
