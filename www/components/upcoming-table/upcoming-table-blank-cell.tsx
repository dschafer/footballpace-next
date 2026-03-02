import { TableTd, type TableTdProps, Text } from "@mantine/core";

export default function UpcomingTableBlankCell(
  props: { label: string } & TableTdProps,
) {
  const { label, ...rest } = props;
  return (
    <TableTd ta="center" bg="summary-row" ml="xs" pl="xs" {...rest}>
      <Text span fw={600}>
        {label}
      </Text>
    </TableTd>
  );
}
