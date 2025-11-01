"use client";

import type { AnchorProps, ElementProps } from "@mantine/core";

import { Anchor } from "@mantine/core";

interface AnchorLinkProps
  extends AnchorProps,
    ElementProps<"a", keyof AnchorProps> {}

export default function AnchorLink({
  href,
  children,
  ...others
}: AnchorLinkProps) {
  return (
    <Anchor href={href!} {...others}>
      {children}
    </Anchor>
  );
}
