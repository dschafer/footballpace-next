import { Alert } from "@mantine/core";
import { IconExclamationCircle } from "@tabler/icons-react";
export default function ErrorAlert() {
  return (
    <Alert
      variant="light"
      color="red"
      title="No matches found"
      icon={<IconExclamationCircle />}
    >
      No matches found. Either the season hasn{"'"}t started, or the site is
      having issues.
    </Alert>
  );
}
