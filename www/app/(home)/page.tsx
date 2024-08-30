import { Anchor, Stack } from "@mantine/core";
import Link from "next/link";
import StandingsTable from "@/components/standings-table/standings-table";
import leagues from "@/lib/leagues";
import year from "@/lib/year";

export default function Home() {
  return (
    <Stack>
      {Array.from(leagues).map(([league, _]) => (
        <Stack key={league}>
          <StandingsTable rowCount={5} league={league} year={year} />
          <Anchor component={Link} href={`/table/${league}/${year}`} ta="right">
            Full Table »
          </Anchor>
        </Stack>
      ))}
    </Stack>
  );
}
