"use client";

import type { AnchorProps, ElementProps } from "@mantine/core";
import { Anchor } from "@mantine/core";
import { useTargetKey } from "@/context/target-context";
import { withTargetParam } from "@/lib/url/with-target";

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
  return (
    <Anchor href={finalHref as string} {...others}>
      {children}
    </Anchor>
  );
}
