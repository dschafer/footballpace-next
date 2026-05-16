import { IconUsers, IconUsersGroup } from "@tabler/icons-react";
import { ActiveNavLink } from "./active-nav-link";
import { fetchTeams } from "@/lib/pace/data";
import { teamPath } from "@/lib/url/team-links";

type TeamNavLinksProps = {
  league: string;
  year: number;
};

export async function TeamNavLinks({
  league,
  year,
}: TeamNavLinksProps) {
  const teams = await fetchTeams(league, year, { orderBy: { team: "asc" } });
  return (
    <ActiveNavLink
      label="Teams"
      prefixUrl={`/${league}/${year}/team`}
      leftSection={<IconUsersGroup />}
    >
      {teams.map(({ team }) => {
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
