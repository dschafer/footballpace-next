"use client";

import {
  NavLink,
  NavLinkProps,
  createPolymorphicComponent,
} from "@mantine/core";
import { forwardRef } from "react";
import { usePathname } from "next/navigation";

interface ActiveNavLinkProps extends NavLinkProps {
  isActive: (pathname: string) => boolean;
}

export const ActiveNavLink = createPolymorphicComponent<
  "a",
  ActiveNavLinkProps
>(
  forwardRef<HTMLButtonElement, ActiveNavLinkProps>(function ActiveNavLink(
    { isActive, ...others },
    ref,
  ) {
    const pathname = usePathname();

    return (
      <NavLink active={isActive(pathname)} {...others}>
        {others.children}
      </NavLink>
    );
  }),
);
