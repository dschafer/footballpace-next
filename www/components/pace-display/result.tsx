import { Anchor, Text } from "@mantine/core";
import Link from "next/link";
import { Match } from "@prisma/client";

export default function Result({
  match,
  highlightedTeam,
  link,
}: {
  match: Match;
  highlightedTeam?: string;
  link?: boolean;
}) {
  const homeFw = highlightedTeam == match.homeTeam ? 600 : 300;
  const awayFw = highlightedTeam == match.awayTeam ? 600 : 300;
  let homeC = "black";
  let awayC = "black";
  if (highlightedTeam == match.homeTeam) {
    homeC =
      match.ftResult == "H"
        ? "green.9"
        : match.ftResult == "A"
          ? "red.9"
          : "black";
  }
  if (highlightedTeam == match.awayTeam) {
    awayC =
      match.ftResult == "A"
        ? "green.9"
        : match.ftResult == "H"
          ? "red.9"
          : "black";
  }
  let homeTeam = <>{match.homeTeam}</>;
  let awayTeam = <>{match.awayTeam}</>;
  if (link) {
    homeTeam = (
      <Anchor
        component={Link}
        href={`/season/${match.league}/${match.year}/${match.homeTeam}`}
        underline="never"
        c={homeC}
        fw={homeFw}
      >
        {homeTeam}
      </Anchor>
    );
    awayTeam = (
      <Anchor
        component={Link}
        href={`/season/${match.league}/${match.year}/${match.awayTeam}`}
        underline="never"
        c={awayC}
        fw={awayFw}
      >
        {awayTeam}
      </Anchor>
    );
  }
  let home = (
    <Text c={homeC} fw={homeFw} span={true}>
      {homeTeam} {match.ftHomeGoals}
    </Text>
  );
  let away = (
    <Text c={awayC} fw={awayFw} span={true}>
      {match.ftAwayGoals} {awayTeam}
    </Text>
  );

  return (
    <Text span={true}>
      {home}:{away}
    </Text>
  );
}
