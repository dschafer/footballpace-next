import {
  Accordion,
  AccordionControl,
  AccordionItem,
  AccordionPanel,
  Title,
} from "@mantine/core";
import type { Fixture } from "@prisma/client";
import FixturesMonth from "./fixtures-month";
import leagues from "@/lib/const/leagues";

export default async function Fixtures({
  league,
  fixtures,
  dateHeadings,
}: {
  league: string;
  fixtures: Fixture[];
  dateHeadings: boolean;
}) {
  const dateFormat = Intl.DateTimeFormat(undefined, {
    timeZone: leagues.get(league)?.tz,
  });
  const monthFormat = Intl.DateTimeFormat(undefined, {
    timeZone: leagues.get(league)?.tz,
    month: "long",
  });
  // This is just Map.groupBy but that's not available in Node 20.
  const fixturesByDay = new Map<string, Fixture[]>();
  for (const fixture of fixtures) {
    const key = dateFormat.format(fixture.kickoffTime);
    if (!fixturesByDay.has(key)) {
      fixturesByDay.set(key, []);
    }
    fixturesByDay.get(key)!.push(fixture);
  }

  const fixturesByMonth = new Map<string, Map<string, Fixture[]>>();
  for (const [day, fixtures] of Array.from(fixturesByDay.entries())) {
    const key = monthFormat.format(fixtures[0].kickoffTime);
    if (!fixturesByMonth.has(key)) {
      fixturesByMonth.set(key, new Map());
    }
    fixturesByMonth.get(key)!.set(day, fixtures);
  }
  return (
    <Accordion
      variant="separated"
      multiple={true}
      defaultValue={[monthFormat.format(new Date())]}
    >
      {Array.from(fixturesByMonth).map(([month, fixturesDict]) => (
        <AccordionItem key={month} value={month}>
          <AccordionControl>
            <Title order={4}>{month}</Title>
          </AccordionControl>
          <AccordionPanel>
            <FixturesMonth
              league={league}
              fixtures={fixturesDict}
              dateHeadings={dateHeadings}
            />
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
