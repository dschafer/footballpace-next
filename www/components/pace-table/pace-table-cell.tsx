"use client";
import {
  Badge,
  Box,
  Center,
  NumberFormatter,
  Popover,
  PopoverDropdown,
  PopoverTarget,
  TableTd,
  Text,
  isLightColor,
} from "@mantine/core";
import { PaceMatch } from "@/lib/pace/pace";

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
  const bgColors = [
    "#762a83",
    "#af8dc3",
    "#e7d4e8",
    "#f7f7f7",
    "#d9f0d3",
    "#7fbf7b",
    "#1b7837",
  ];
  const bg = (delta: number) => bgColors[Math.floor(delta + 3.5)];
  const fg = (delta: number) => (isLightColor(bg(delta)) ? "black" : "white");

  return (
    <TableTd ta="right" bg={bg(delta)} c={fg(delta)} p={0}>
      <Popover>
        <PopoverTarget>
          <Box w="100%" h="100%" p="0.5rem" style={{ cursor: "default" }}>
            {delta > 0 ? "+" : ""}
            <NumberFormatter value={delta} decimalScale={2} fixedDecimalScale />
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
    </TableTd>
  );
}
