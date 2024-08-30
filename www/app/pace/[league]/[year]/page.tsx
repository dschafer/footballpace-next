import { Anchor, Stack } from "@mantine/core";
import Link from "next/link";
import PaceTable from "@/components/pace-table/pace-table";

export default function TablePage({
  params,
}: {
  params: {
    league: string;
    year: string;
  };
}) {
  return (
    <Stack>
      <PaceTable league={params.league} year={parseInt(params.year)} />
      <Anchor
        component={Link}
        href={`/table/${params.league}/${parseInt(params.year)}`}
        ta="right"
      >
        Pace Sheet »
      </Anchor>
    </Stack>
  );
}
