import { Anchor, Box, Stack, Text, Title } from "@mantine/core";

export default function NotFound() {
  return (
    <Box p="xs">
      <Stack>
        <Title order={2}>Page not found</Title>
        <Text>
          This Football Pace page does not exist, or the league and season are
          not available.
        </Text>
        <Anchor href="/">Return to Football Pace</Anchor>
      </Stack>
    </Box>
  );
}
