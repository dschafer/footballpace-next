import { Stack, Title } from "@mantine/core";
import Fixtures from "./fixtures";
import prisma from "@/lib/prisma";

export default async function LeagueFixtures({
  league,
  year,
}: {
  league: string;
  year: number;
}) {
  const fixtures = await prisma.fixture.findMany({
    where: {
      league: league,
      year: year,
      kickoffTime: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Only show today and future fixtures
    },
    orderBy: { kickoffTime: "asc" },
  });
  if (fixtures.length == 0) {
    return null;
  }
  return (
    <Stack>
      <Title order={3}>Fixtures</Title>
      <Fixtures league={league} fixtures={fixtures} dateHeadings={true} />
    </Stack>
  );
}
