"use client";

import { Alert, Box, Button, Stack, Title } from "@mantine/core";
import { IconExclamationCircle } from "@tabler/icons-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Box p="xs">
      <Stack>
        <Title order={2}>Something went wrong</Title>
        <Alert
          variant="light"
          color="red"
          title="Unable to load this page"
          icon={<IconExclamationCircle />}
        >
          Football Pace hit an unexpected error while loading this page.
        </Alert>
        <Button onClick={reset} style={{ alignSelf: "flex-start" }}>
          Try again
        </Button>
      </Stack>
    </Box>
  );
}
