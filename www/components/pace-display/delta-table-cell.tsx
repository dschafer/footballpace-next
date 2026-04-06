"use client";

import {
  Box,
  Popover,
  PopoverDropdown,
  PopoverTarget,
  Text,
} from "@mantine/core";

import PaceNumber from "./pace-number";
import { type PaceTeam } from "@/lib/pace/pace-types";

export default function DeltaTableCell({ paceTeam }: { paceTeam: PaceTeam }) {
  const { delta, gap, interval } = paceTeam;

  if (gap == null || interval == null) {
    return (
      <Box w="100%" h="100%" p="0.5rem">
        <PaceNumber pace={delta} />
      </Box>
    );
  }

  return (
    <Popover>
      <PopoverTarget>
        <Box w="100%" h="100%" p="0.5rem" style={{ cursor: "pointer" }}>
          <PaceNumber pace={delta} />
        </Box>
      </PopoverTarget>
      <PopoverDropdown>
        <Text ta="center">
          <Text fw={700} span>
            Gap to {gap.gapTeam}
          </Text>
          : {<PaceNumber pace={gap.gapAmount} />}
        </Text>
        <Text ta="center">
          <Text fw={700} span>
            Interval to {interval.intervalTeam}
          </Text>
          : {<PaceNumber pace={interval.intervalAmount} />}
        </Text>
      </PopoverDropdown>
    </Popover>
  );
}
