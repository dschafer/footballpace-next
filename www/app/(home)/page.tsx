import { Anchor, Stack, Title } from "@mantine/core";
import Link from "next/link";
import StandingsTable from "@/components/standings-table/standings-table";
import leagues from "@/lib/const/leagues";
import year from "@/lib/const/year";

export default function Home() {
  return (
    <Stack>
      {Array.from(leagues).map(([league, _]) => (
        <Stack key={league}>
          <Title
            order={2}
            style={{
              alignSelf: "flex-start",
            }}
          >
            {leagues.get(league)} {year}
          </Title>
          <StandingsTable rowCount={5} league={league} year={year} />
          <Anchor
            component={Link}
            href={`/table/${league}/${year}`}
            ta="right"
            style={{
              alignSelf: "flex-end",
            }}
          >
            Full Table »
          </Anchor>
        </Stack>
      ))}
    </Stack>
  );
}
