import { Anchor, Group, Stack, Title } from "@mantine/core";
import Link from "next/link";
import RecentPaceTable from "@/components/recent-pace-table/recent-pace-table";
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
          <Stack style={{ maxWidth: "var(--mantine-breakpoint-md)" }}>
            <RecentPaceTable rowCount={5} league={league} year={year} />
            <Group
              style={{
                alignSelf: "flex-end",
              }}
            >
              <Anchor
                component={Link}
                href={`/pace/${league}/${year}`}
                ta="right"
              >
                Full Pace Table »
              </Anchor>
            </Group>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
