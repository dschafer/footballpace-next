"use client";

import { NavLink, type NavLinkProps, createPolymorphicComponent } from "@mantine/core";
import { forwardRef } from "react";
import { usePathname } from "next/navigation";
import { useTargetKey } from "@/context/target-context";
import { withTargetParam } from "@/lib/url/with-target";
interface ActiveNavLinkProps extends NavLinkProps {
  href?: string;
  pageUrl?: string;
  prefixUrl?: string;
}

export const ActiveNavLink = createPolymorphicComponent<
  "a",
  ActiveNavLinkProps
>(
  forwardRef<HTMLButtonElement, ActiveNavLinkProps>(function ActiveNavLink(
    { pageUrl, prefixUrl, href, ...others },
    _ref,
  ) {
    const pathname = usePathname();
    const targetKey = useTargetKey();
    let active = false;
    if (pageUrl) {
      active = pathname == pageUrl;
    }
    if (prefixUrl) {
      active = pathname.includes(prefixUrl);
    }

    const finalHref: string | undefined =
      typeof href === "string" ? withTargetParam(href, targetKey) : href;

    return (
      <NavLink active={active} defaultOpened={active} href={finalHref} {...others}>
        {others.children}
      </NavLink>
    );
  }),
);
