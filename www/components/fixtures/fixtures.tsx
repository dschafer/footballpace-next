import {
  Accordion,
  AccordionControl,
  AccordionItem,
  AccordionPanel,
  Stack,
  Title,
} from "@mantine/core";
import { Fixture } from "@prisma/client";
import FixturesMonth from "./fixtures-month";
import leagues from "@/lib/const/leagues";

export default async function Fixtures({
  fixtures,
  dateHeadings,
}: {
  fixtures: Fixture[];
  dateHeadings: boolean;
}) {
  if (fixtures.length == 0) {
    return null;
  }
  // This is just Map.groupBy but that's not available in Node 20.
  const fixturesByDay: Map<string, Array<Fixture>> = new Map();
  for (const fixture of fixtures) {
    const key = fixture.kickoffTime.toLocaleDateString([], {
      timeZone: leagues.get(fixture.league)?.tz,
    });
    if (!fixturesByDay.has(key)) {
      fixturesByDay.set(key, []);
    }
    fixturesByDay.get(key)!.push(fixture);
  }

  const fixturesByMonth: Map<string, Map<string, Array<Fixture>>> = new Map();
  for (const [day, fixtures] of Array.from(fixturesByDay.entries())) {
    const key = fixtures[0].kickoffTime.toLocaleString([], { month: "long" });
    if (!fixturesByMonth.has(key)) {
      fixturesByMonth.set(key, new Map());
    }
    fixturesByMonth.get(key)!.set(day, fixtures);
  }
  return (
    <Stack>
      <Title order={3}>Fixtures</Title>
      <Accordion
        variant="separated"
        multiple={true}
        defaultValue={[new Date().toLocaleString([], { month: "long" })]}
      >
        {Array.from(fixturesByMonth).map(([month, fixturesDict]) => (
          <AccordionItem key={month} value={month}>
            <AccordionControl>
              <Title order={4}>{month}</Title>
            </AccordionControl>
            <AccordionPanel>
              <FixturesMonth
                fixtures={fixturesDict}
                dateHeadings={dateHeadings}
              />
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Stack>
  );
}
