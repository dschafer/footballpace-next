import { IconUsers, IconUsersGroup } from "@tabler/icons-react";
import { ActiveNavLink } from "./active-nav-link";
import useSWR from "swr";

export function TeamNavLinks({
  league,
  year,
}: {
  league: string;
  year: number;
}) {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, error, isLoading } = useSWR(
    `/api/teams?league=${league}&year=${year}`,
    fetcher,
  );
  let teamLinks = null;
  if (!error && !isLoading) {
    teamLinks = data.data.map((team: string) => (
      <ActiveNavLink
        key={team}
        href={`/season/${league}/${year}/${team}`}
        label={team}
        isActive={(pathname) => pathname == `/season/${league}/${year}/${team}`}
        leftSection={<IconUsers />}
      />
    ));
  }
  return (
    <>
      <ActiveNavLink
        label="Teams"
        isActive={(pathname) => pathname.includes(`/season/${league}/${year}`)}
        leftSection={<IconUsersGroup />}
      >
        {teamLinks}
      </ActiveNavLink>
    </>
  );
}
