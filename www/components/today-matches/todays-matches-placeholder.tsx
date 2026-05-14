import { Group, Paper, Skeleton, Stack } from "@mantine/core";
import type { ReactNode } from "react";
import TodaysMatchesStrip from "@/components/today-matches/todays-matches-strip";

function MatchTeamRowSkeleton({
  metricWidth,
  teamWidth,
}: {
  metricWidth: string;
  teamWidth: string;
}): ReactNode {
  return (
    <Group gap={6} wrap="nowrap">
      <Skeleton height={18} radius="xl" width={28} />
      <Skeleton flex={1} height={14} width={teamWidth} />
      <Skeleton height={14} width={metricWidth} />
    </Group>
  );
}

function MatchCardSkeleton(): ReactNode {
  return (
    <Paper withBorder radius="sm" p="xs">
      <Group align="center" gap="xs" justify="space-between" wrap="nowrap">
        <Stack flex={1} gap={4} miw={0}>
          <MatchTeamRowSkeleton metricWidth="30%" teamWidth="50%" />
          <MatchTeamRowSkeleton metricWidth="28%" teamWidth="54%" />
        </Stack>
        <Skeleton height={20} radius="xl" width={72} />
      </Group>
    </Paper>
  );
}

export default function TodaysMatchesPlaceholder({
  cardCount = 2,
}: {
  cardCount?: number;
}): ReactNode {
  return (
    <TodaysMatchesStrip>
      {Array.from({ length: cardCount }).map((_, i) => (
        <MatchCardSkeleton key={i} />
      ))}
    </TodaysMatchesStrip>
  );
}
