"use client";

import type { AnchorProps, ElementProps } from "@mantine/core";
import { isLocalPathHref, withTargetParam } from "@/lib/url/with-target";
import { Anchor } from "@mantine/core";
import Link from "next/link";
import { useTargetKey } from "@/context/target-context";

interface AnchorLinkProps
  extends AnchorProps,
    ElementProps<"a", keyof AnchorProps> {}

export default function AnchorLink({
  href,
  children,
  ...others
}: AnchorLinkProps) {
  const targetKey = useTargetKey();
  const finalHref =
    typeof href === "string" ? withTargetParam(href, targetKey) : href!;
  if (typeof finalHref === "string" && isLocalPathHref(finalHref)) {
    return (
      <Anchor component={Link} href={finalHref} {...others}>
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
