import { Stack, Text, Title } from "@mantine/core";
import Link from "next/link";

export default function AboutPage() {
  return (
    <Stack>
      <Title order={2}>About FootballPace</Title>
      <Title order={3}>FAQ</Title>
      <Title order={3}>Contact</Title>
      <Text>
        For feedback, comments, questions, or bug reports, please{" "}
        <Link href="mailto:feedback@footballpace.com">contact us</Link> or
        report issues on{" "}
        <Link href="https://github.com/dschafer/footballpace-next">Github</Link>
      </Text>
    </Stack>
  );
}
