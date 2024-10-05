import {
  IconChartLine,
  IconColumns,
  IconHome,
  IconRulerMeasure,
} from "@tabler/icons-react";

import { ActiveNavLink } from "./active-nav-link";
import Link from "next/link";
import leagues from "@/lib/const/leagues";
import year from "@/lib/const/year";

export function NavLinks({ onNav }: { onNav: () => void }) {
  return (
    <>
      <ActiveNavLink
        component={Link}
        href="/"
        label="Home"
        isActive={(pathname) => pathname == "/"}
        leftSection={<IconHome />}
        onClick={onNav}
      />
      {Array.from(leagues).map(([league, name]) => (
        <ActiveNavLink
          label={name}
          key={league}
          isActive={(pathname) => pathname.includes(`/${league}/${year}`)}
        >
          <ActiveNavLink
            href={`/pace/${league}/${year}`}
            label="Pace Table"
            isActive={(pathname) => pathname == `/pace/${league}/${year}`}
            leftSection={<IconRulerMeasure />}
            onClick={onNav}
          />
          <ActiveNavLink
            href={`/chart/${league}/${year}`}
            label="Pace Chart"
            isActive={(pathname) => pathname == `/chart/${league}/${year}`}
            leftSection={<IconChartLine />}
            onClick={onNav}
          />
          <ActiveNavLink
            href={`/table/${league}/${year}`}
            label="League Table"
            isActive={(pathname) => pathname == `/table/${league}/${year}`}
            leftSection={<IconColumns />}
            onClick={onNav}
          />
        </ActiveNavLink>
      ))}
    </>
  );
}
