import { IconUsers, IconUsersGroup } from "@tabler/icons-react";
import { ActiveNavLink } from "./active-nav-link";
import { fetchStandings } from "@/lib/pace/standings";

export async function TeamNavLinks({
  league,
  year,
}: {
  league: string;
  year: number;
}) {
  const standings = await fetchStandings(league, year);
  const teams = standings.map((r) => r.team);
  return (
    <ActiveNavLink
      label="Teams"
      prefixUrl={`/${league}/${year}/team`}
      leftSection={<IconUsersGroup />}
    >
      {teams.map((team: string) => (
        <ActiveNavLink
          key={team}
          href={`/${league}/${year}/team/${team}`}
          label={team}
          pageUrl={`/${league}/${year}/team/${team}`}
          leftSection={<IconUsers />}
        />
      ))}
    </ActiveNavLink>
  );
}
