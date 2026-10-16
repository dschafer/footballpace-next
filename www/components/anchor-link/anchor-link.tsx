"use client";

import type { AnchorProps, ElementProps } from "@mantine/core";
import Link, { type LinkProps } from "next/link";
import { isLocalPathHref, withTargetParam } from "@/lib/url/with-target";
import { Anchor } from "@mantine/core";
import { useTargetKey } from "@/context/target-context";

interface AnchorLinkProps
  extends AnchorProps,
    ElementProps<"a", keyof AnchorProps> {
  prefetch?: LinkProps["prefetch"];
}

export default function AnchorLink({
  href,
  children,
  prefetch,
  ...others
}: AnchorLinkProps) {
  const targetKey = useTargetKey();
  const finalHref =
    typeof href === "string" ? withTargetParam(href, targetKey) : href!;
  if (typeof finalHref === "string" && isLocalPathHref(finalHref)) {
    return (
      <Anchor component={Link} href={finalHref} prefetch={prefetch} {...others}>
        {children}
      </Anchor>
    );
  }
  return (
    <Anchor href={finalHref as string} {...others}>
      {children}
    </Anchor>
  );
}
