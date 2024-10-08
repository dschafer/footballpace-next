import { Match } from "@prisma/client";
import { Text } from "@mantine/core";

export default function Result({
  match,
  highlightedTeam,
}: {
  match: Match;
  highlightedTeam?: string;
}) {
  return (
    <Text span={true}>
      <Text
        fw={highlightedTeam == match.homeTeam ? 500 : undefined}
        span={true}
      >
        {match.homeTeam} {match.ftHomeGoals}
      </Text>
      :
      <Text
        fw={highlightedTeam == match.awayTeam ? 500 : undefined}
        span={true}
      >
        {match.ftAwayGoals} {match.awayTeam}
      </Text>
    </Text>
  );
}
