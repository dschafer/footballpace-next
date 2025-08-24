import {
  Badge,
  Box,
  Center,
  NumberFormatter,
  PopoverDropdown,
  PopoverTarget,
  Text,
} from "@mantine/core";
import { type PaceMatch, matchDescription } from "@/lib/pace/pace";
import ColoredCell from "../pace-display/colored-cell";
import PaceNumber from "../pace-display/pace-number";
import Result from "../pace-display/result";
import dynamic from "next/dynamic";
import leagues from "@/lib/const/leagues";

const PopoverNoSSR = dynamic(() =>
  import("@mantine/core").then((mod) => mod.Popover),
);

export default function PaceTableCell({ paceMatch }: { paceMatch: PaceMatch }) {
  const { delta, match, points, expectedPoints, team } = paceMatch;

  return (
    <ColoredCell val={delta} ta="right">
      <PopoverNoSSR>
        <PopoverTarget>
          <Box w="100%" h="100%" p="0.5rem" style={{ cursor: "pointer" }}>
            <PaceNumber pace={delta} />
          </Box>
        </PopoverTarget>
        <PopoverDropdown>
          <Center>
            <Badge ta="center">
              {match.date.toLocaleDateString([], {
                timeZone: leagues.get(match.league)?.tz,
                dateStyle: "short",
              })}
            </Badge>
          </Center>
          <Text ta="center">
            <Result match={match} highlightedTeam={team} />
          </Text>
          <Text ta="center">
            <Text fw={700} span>
              Points
            </Text>
            : {points}
          </Text>
          <Text ta="center">
            <Text fw={700} span>
              Target Points
            </Text>
            :{" "}
            <NumberFormatter
              value={expectedPoints}
              decimalScale={2}
              fixedDecimalScale
            />{" "}
            {matchDescription(paceMatch)}
          </Text>
        </PopoverDropdown>
      </PopoverNoSSR>
    </ColoredCell>
  );
}
