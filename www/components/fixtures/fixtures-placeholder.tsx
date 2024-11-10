import {
  Accordion,
  AccordionControl,
  AccordionItem,
  AccordionPanel,
  List,
  ListItem,
  Skeleton,
  Stack,
  Title,
} from "@mantine/core";

export default function FixturesPlaceholder({
  monthCount,
  dayCount,
  matchCount,
}: {
  monthCount: number;
  dayCount: number;
  matchCount: number;
}) {
  return (
    <Stack>
      <Title order={3}>
        <Skeleton>Fixtures</Skeleton>
      </Title>
      <Accordion variant="separated" multiple={true} defaultValue={["0"]}>
        {[...Array(monthCount)].map((_, j) => (
          <AccordionItem key={j} value={"" + j}>
            <AccordionControl>
              <Title order={4}>
                <Skeleton>October</Skeleton>
              </Title>
            </AccordionControl>
            <AccordionPanel p="md">
              {[...Array(dayCount)].map((_, i) => (
                <Stack key={i}>
                  <Title order={4}>
                    <Skeleton>2024-10-23</Skeleton>
                  </Title>
                  <List listStyleType="none" pb="md">
                    {[...Array(matchCount)].map((_, j) => (
                      <ListItem key={j}>
                        <Skeleton>Arsenal 2-0 Tottenham</Skeleton>
                      </ListItem>
                    ))}
                  </List>
                </Stack>
              ))}
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Stack>
  );
}
