import { Anchor, Text } from "@mantine/core";
import Link from "next/link";
import type { Match } from "@prisma/client";

export default function Result({
  match,
  highlightedTeam,
  link,
  multiline,
}: {
  match: Match;
  highlightedTeam?: string;
  link?: boolean;
  multiline?: boolean;
}) {
  const homeFw =
    highlightedTeam == match.homeTeam ? 600 : highlightedTeam ? 300 : 400;
  const awayFw =
    highlightedTeam == match.awayTeam ? 600 : highlightedTeam ? 300 : 400;
  let homeC = "var(--mantine-color-text)";
  let awayC = "var(--mantine-color-text)";
  if (highlightedTeam == match.homeTeam) {
    homeC =
      match.ftResult == "H"
        ? "green.9"
        : match.ftResult == "A"
          ? "red.9"
          : "var(--mantine-color-text)";
  }
  if (highlightedTeam == match.awayTeam) {
    awayC =
      match.ftResult == "A"
        ? "green.9"
        : match.ftResult == "H"
          ? "red.9"
          : "var(--mantine-color-text)";
  }
  let homeTeam = <>{match.homeTeam}</>;
  let awayTeam = <>{match.awayTeam}</>;
  if (link) {
    homeTeam = (
      <Anchor
        component={Link}
        href={`/${match.league}/${match.year}/team/${match.homeTeam}`}
        underline="never"
        c={homeC}
        fw={homeFw}
        inherit
      >
        {homeTeam}
      </Anchor>
    );
    awayTeam = (
      <Anchor
        component={Link}
        href={`/${match.league}/${match.year}/team/${match.awayTeam}`}
        underline="never"
        c={awayC}
        fw={awayFw}
        inherit
      >
        {awayTeam}
      </Anchor>
    );
  }
  if (multiline) {
    const home = (
      <Text c={homeC} fw={homeFw} span={true} inherit>
        {homeTeam}&nbsp;{match.ftHomeGoals}
      </Text>
    );
    const away = (
      <Text c={awayC} fw={awayFw} span={true} inherit>
        {awayTeam}&nbsp;{match.ftAwayGoals}
      </Text>
    );

    return (
      <Text span={true} inherit>
        {home}
        <br />
        {away}
      </Text>
    );
  } else {
    const home = (
      <Text c={homeC} fw={homeFw} span={true} inherit>
        {homeTeam}&nbsp;{match.ftHomeGoals}
      </Text>
    );
    const away = (
      <Text c={awayC} fw={awayFw} span={true} inherit>
        {match.ftAwayGoals}&nbsp;{awayTeam}
      </Text>
    );

    return (
      <Text span={true} inherit>
        {home}:{away}
      </Text>
    );
  }
}
