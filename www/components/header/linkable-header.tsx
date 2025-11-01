import { Text, Title, type TitleOrder } from "@mantine/core";
import AnchorLink from "@/components/anchor-link/anchor-link";

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
        <AnchorLink href={`#${id}`} inherit c="dimmed">
          #
        </AnchorLink>
      </Text>
    </Title>
  );
}
