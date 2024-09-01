import {
  Badge,
  Box,
  Center,
  NumberFormatter,
  Popover,
  PopoverDropdown,
  PopoverTarget,
  Text,
} from "@mantine/core";
import ColoredCell from "../pace-display/colored-cell";
import { PaceMatch } from "@/lib/pace/pace";
import PaceNumber from "../pace-display/pace-number";

export default function PaceTableCell({ match }: { match: PaceMatch }) {
  const {
    delta,
    date,
    homeTeam,
    awayTeam,
    ftHomeGoals,
    ftAwayGoals,
    points,
    expectedPoints,
    home,
    opponentFinish,
  } = match;

  return (
    <ColoredCell val={delta} ta="right">
      <Popover>
        <PopoverTarget>
          <Box w="100%" h="100%" p="0.5rem" style={{ cursor: "default" }}>
            <PaceNumber pace={delta} />
          </Box>
        </PopoverTarget>
        <PopoverDropdown>
          <Center>
            <Badge ta="center">{date.toLocaleDateString()}</Badge>
          </Center>
          <Text ta="center">
            {homeTeam} {ftHomeGoals}:{ftAwayGoals} {awayTeam}
          </Text>
          <Text ta="center">
            <Text fw={700} span>
              Points
            </Text>
            : {points}
          </Text>
          <Text ta="center">
            <Text fw={700} span>
              Pace
            </Text>
            :{" "}
            <NumberFormatter
              value={expectedPoints}
              decimalScale={2}
              fixedDecimalScale
            />{" "}
            ({home ? "Home" : "Away"} to {opponentFinish})
          </Text>
        </PopoverDropdown>
      </Popover>
    </ColoredCell>
  );
}
