import { IconUsers, IconUsersGroup } from "@tabler/icons-react";
import { ActiveNavLink } from "./active-nav-link";
import { Suspense } from "react";
import { fetchStandings } from "@/lib/pace/standings";
import { shouldCacheSeasonData } from "@/lib/pace/data";
import { teamPath } from "@/lib/url/team-links";

type TeamNavLinksProps = {
  league: string;
  year: number;
};

export function TeamNavLinks(props: TeamNavLinksProps) {
  if (shouldCacheSeasonData(props.league, props.year)) {
    return <TeamNavLinksContent {...props} />;
  }
  return (
    <Suspense>
      <TeamNavLinksContent {...props} />
    </Suspense>
  );
}

async function TeamNavLinksContent({
  league,
  year,
}: TeamNavLinksProps) {
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
