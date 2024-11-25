import { Anchor, Text, Title, type TitleOrder } from "@mantine/core";
import Link from "next/link";

export default function LinkableHeader({
  order,
  title,
}: {
  order: TitleOrder;
  title: string;
}) {
  const id = title.toLowerCase().replaceAll(" ", "_");
  return (
    <Title order={order} id={id}>
      {title}
      <Text inherit span visibleFrom="sm">
        &nbsp;
        <Anchor component={Link} href={`#${id}`} inherit c="dimmed">
          #
        </Anchor>
      </Text>
    </Title>
  );
}
