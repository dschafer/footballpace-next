"use client";
import {
  NumberFormatter,
  Stack,
  TableTd,
  TableTdProps,
  Text,
} from "@mantine/core";
import { PaceFixture } from "@/lib/pace/pace";
import leagues from "@/lib/const/leagues";
import useFixtureDifficultyColor from "../pace-display/use-fixture-difficulty-color";

export default function UpcomingTableCell(
  props: {
    paceFixture: PaceFixture;
  } & TableTdProps,
) {
  const paceFixture = props.paceFixture;
  const [bg, fg] = useFixtureDifficultyColor(paceFixture.expectedPoints);
  return (
    <TableTd ta="center" bg={bg} c={fg} {...props}>
      <Stack gap="0">
        <Text span size="xs">
          {paceFixture.fixture.kickoffTime.toLocaleDateString([], {
            timeZone: leagues.get(paceFixture.fixture.league)?.tz,
            dateStyle: "short",
          })}
        </Text>
        <Text span size="md">
          {paceFixture.opponent} ({paceFixture.home ? "H" : "A"})
        </Text>
        <Text
          size="sm"
          style={{
            alignSelf: "center",
          }}
        >
          <Text span inherit fw={500}>
            Target
          </Text>
          {": "}
          <Text span inherit fw={700}>
            <NumberFormatter
              value={paceFixture.expectedPoints}
              decimalScale={2}
              fixedDecimalScale
            />
          </Text>
        </Text>
      </Stack>
    </TableTd>
  );
}
