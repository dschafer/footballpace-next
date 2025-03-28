"use client";

import {
  NavLink,
  type NavLinkProps,
  createPolymorphicComponent,
} from "@mantine/core";
import { forwardRef } from "react";
import { usePathname } from "next/navigation";
interface ActiveNavLinkProps extends NavLinkProps {
  pageUrl?: string;
  prefixUrl?: string;
}

export const ActiveNavLink = createPolymorphicComponent<
  "a",
  ActiveNavLinkProps
>(
  forwardRef<HTMLButtonElement, ActiveNavLinkProps>(function ActiveNavLink(
    { pageUrl, prefixUrl, ...others },
    _ref,
  ) {
    const pathname = usePathname();
    let active = false;
    if (pageUrl) {
      active = pathname == pageUrl;
    }
    if (prefixUrl) {
      active = pathname.includes(prefixUrl);
    }

    return (
      <NavLink active={active} defaultOpened={active} {...others}>
        {others.children}
      </NavLink>
    );
  }),
);
