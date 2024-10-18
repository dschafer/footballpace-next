import { IconUsers, IconUsersGroup } from "@tabler/icons-react";
import { ActiveNavLink } from "./active-nav-link";
import prisma from "@/lib/prisma";

export async function TeamNavLinks({
  league,
  year,
}: {
  league: string;
  year: number;
}) {
  const standings = await prisma.standingsRow.findMany({
    where: { league: league, year: year },
    orderBy: { team: "asc" },
  });
  const teams = standings.map((r) => r.team);
  return (
    <ActiveNavLink
      label="Teams"
      prefixUrl={`/season/${league}/${year}`}
      leftSection={<IconUsersGroup />}
    >
      {teams.map((team: string) => (
        <ActiveNavLink
          key={team}
          href={`/season/${league}/${year}/${team}`}
          label={team}
          pageUrl={`/season/${league}/${year}/${team}`}
          leftSection={<IconUsers />}
        />
      ))}
    </ActiveNavLink>
  );
}
