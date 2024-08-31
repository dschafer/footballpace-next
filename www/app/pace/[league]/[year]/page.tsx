import { Anchor, Stack, Title } from "@mantine/core";
import Link from "next/link";
import PaceTable from "@/components/pace-table/pace-table";
import leagues from "@/lib/const/leagues";

export default function PacePage({
  params,
}: {
  params: {
    league: string;
    year: string;
  };
}) {
  const yearInt = parseInt(params.year);
  return (
    <Stack>
      <Title order={2}>
        {leagues.get(params.league)} {yearInt}
      </Title>
      <PaceTable league={params.league} year={yearInt} />
      <Anchor
        component={Link}
        href={`/explanation/${params.league}/${yearInt}`}
        ta="right"
      >
        Explanation »
      </Anchor>
    </Stack>
  );
}
