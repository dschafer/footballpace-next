"use client";

import { NavLink, type NavLinkProps, createPolymorphicComponent } from "@mantine/core";
import { isLocalPathHref, withTargetParam } from "@/lib/url/with-target";
import Link from "next/link";
import { forwardRef } from "react";
import { usePathname } from "next/navigation";
import { useTargetKey } from "@/context/target-context";
interface ActiveNavLinkProps extends NavLinkProps {
  href?: string;
  pageUrl?: string;
  prefixUrl?: string;
}

function pathnameMatchesPrefix(pathname: string, prefixUrl: string) {
  return pathname === prefixUrl || pathname.startsWith(`${prefixUrl}/`);
}

export const ActiveNavLink = createPolymorphicComponent<
  "a",
  ActiveNavLinkProps
>(
  forwardRef<HTMLAnchorElement, ActiveNavLinkProps>(function ActiveNavLink(
    { pageUrl, prefixUrl, href, ...others },
    ref,
  ) {
    const pathname = usePathname();
    const targetKey = useTargetKey();
    let active = false;
    if (pageUrl) {
      active = pathname == pageUrl;
    }
    if (prefixUrl) {
      active = pathnameMatchesPrefix(pathname, prefixUrl);
    }

    const finalHref: string | undefined =
      typeof href === "string" ? withTargetParam(href, targetKey) : href;

    if (typeof finalHref === "string" && isLocalPathHref(finalHref)) {
      return (
        <NavLink
          active={active}
          component={Link}
          defaultOpened={active}
          href={finalHref}
          ref={ref}
          {...others}
        >
          {others.children}
        </NavLink>
      );
    }

    return (
      <NavLink
        active={active}
        defaultOpened={active}
        href={finalHref}
        ref={ref}
        {...others}
      >
        {others.children}
      </NavLink>
    );
  }),
);
