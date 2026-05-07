import { IconUsers, IconUsersGroup } from "@tabler/icons-react";
import { ActiveNavLink } from "./active-nav-link";
import { fetchStandings } from "@/lib/pace/standings";
import { teamPath } from "@/lib/url/team-links";

export async function TeamNavLinks({
  league,
  year,
}: {
  league: string;
  year: number;
}) {
  const standings = await fetchStandings(league, year);
  const teams = standings.map((r) => r.team).sort();
  return (
    <ActiveNavLink
      label="Teams"
      prefixUrl={`/${league}/${year}/team`}
      leftSection={<IconUsersGroup />}
    >
      {teams.map((team: string) => {
        const href = teamPath(league, year, team);
        return (
          <ActiveNavLink
            key={team}
            href={href}
            label={team}
            pageUrl={href}
            leftSection={<IconUsers />}
          />
        );
      })}
    </ActiveNavLink>
  );
}
