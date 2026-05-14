import {
  Badge,
  Group,
  NumberFormatter,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import type { Fixture, Match } from "@/prisma/generated/client";
import type { PaceFixture, PaceMatch } from "@/lib/pace/pace-types";
import AnchorLink from "@/components/anchor-link/anchor-link";
import PaceNumber from "@/components/pace-display/pace-number";
import type { ReactNode } from "react";
import type { TodayMatch } from "@/lib/pace/todays-matches";
import TodaysMatchesStrip from "@/components/today-matches/todays-matches-strip";
import { teamPath } from "@/lib/url/team-links";

type MatchSide = "away" | "home";
type MatchTeam = PaceFixture | PaceMatch;

function formatKickoff(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
    weekday: "short",
  }).format(date);
}

function matchDate(match: TodayMatch): Date {
  return new Date(
    match.status == "completed"
      ? match.home.match.date
      : match.home.fixture.kickoffTime!,
  );
}

function matchSource(match: TodayMatch): Fixture | Match {
  return match.status == "completed" ? match.home.match : match.home.fixture;
}

function matchYear(match: TodayMatch): number {
  return matchSource(match).year;
}

function matchLeague(match: TodayMatch): string {
  return matchSource(match).league;
}

function matchKey(match: TodayMatch): string {
  const source = matchSource(match);
  return [
    match.status,
    source.league,
    source.year,
    source.homeTeam,
    source.awayTeam,
    matchDate(match).toISOString(),
  ].join("/");
}

function scoreText(match: TodayMatch, side: MatchSide): number | null {
  if (match.status != "completed") {
    return null;
  }
  return side == "home" ? match.home.match.ftHomeGoals : match.away.match.ftAwayGoals;
}

function badgeColor(match: TodayMatch): string {
  if (match.status == "completed") {
    return "gray";
  }
  return "blue";
}

function badgeText(match: TodayMatch, timeZone: string): string {
  if (match.status == "completed") {
    return "FT";
  }
  return formatKickoff(matchDate(match), timeZone);
}

function deltaColor(delta: number): string {
  if (delta > 0) {
    return "green.8";
  }
  if (delta < 0) {
    return "red.8";
  }
  return "dimmed";
}

function isPaceMatch(team: MatchTeam): team is PaceMatch {
  return "delta" in team;
}

function TeamMetric({ team }: { team: MatchTeam }): ReactNode {
  if (isPaceMatch(team)) {
    return (
      <Text
        c={deltaColor(team.delta)}
        fw={700}
        size="xs"
        w="max-content"
      >
        <PaceNumber pace={team.delta} />
      </Text>
    );
  }
  return (
    <Text c="dimmed" size="xs" w="max-content">
      Target:{" "}
      <NumberFormatter
        value={team.expectedPoints}
        decimalScale={2}
        fixedDecimalScale
      />
    </Text>
  );
}

function TeamLine({
  highlighted,
  match,
  side,
}: {
  highlighted: boolean;
  match: TodayMatch;
  side: MatchSide;
}): ReactNode {
  const score = scoreText(match, side);
  const team = match[side];
  return (
    <Group gap={6} wrap="nowrap">
      {score == null ? null : <ScoreCapsule score={score} />}
      <AnchorLink
        c="inherit"
        display="block"
        flex={1}
        fw={highlighted ? 600 : 400}
        href={teamPath(matchLeague(match), matchYear(match), team.team)}
        miw={0}
        size="xs"
        truncate="end"
        underline="never"
      >
        {team.team}
      </AnchorLink>
      {highlighted ? <TeamMetric team={team} /> : null}
    </Group>
  );
}

function ScoreCapsule({ score }: { score: number }): ReactNode {
  return (
    <Badge color="gray" miw="1.75rem" px={7} size="sm" variant="light">
      <Text fw={700} lh={1.35} size="xs">
        {score}
      </Text>
    </Badge>
  );
}

export default function TodaysMatches({
  highlightedTeamNames,
  matches,
  timeZone,
}: {
  highlightedTeamNames?: string[];
  matches: TodayMatch[];
  timeZone: string;
}): ReactNode {
  const highlightedTeams =
    highlightedTeamNames == null ? null : new Set(highlightedTeamNames);

  return matches.length == 0 ? null : (
    <TodaysMatchesStrip>
      {matches.map((match) => {
        const homeHighlighted =
          highlightedTeams == null || highlightedTeams.has(match.home.team);
        const awayHighlighted =
          highlightedTeams == null || highlightedTeams.has(match.away.team);
        return (
          <Paper key={matchKey(match)} p="xs" radius="sm" withBorder>
            <Group align="center" gap="xs" justify="space-between" wrap="nowrap">
              <Stack flex={1} gap={2} miw={0}>
                <TeamLine
                  highlighted={homeHighlighted}
                  match={match}
                  side="home"
                />
                <TeamLine
                  highlighted={awayHighlighted}
                  match={match}
                  side="away"
                />
              </Stack>
              <Badge color={badgeColor(match)} size="sm" variant="light">
                {badgeText(match, timeZone)}
              </Badge>
            </Group>
          </Paper>
        );
      })}
    </TodaysMatchesStrip>
  );
}
