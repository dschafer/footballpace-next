import type { Metadata, ResolvingMetadata } from "next/types";
import NavLinks from "@/components/shell/nav-links";
import Shell from "@/components/shell/shell";
import TargetFinishSelect from "@/components/header/target-finish-select";
import { TargetProvider } from "@/context/target-context";
import { socialImageMetadata } from "@/lib/metadata";
import { validateTargetRoute } from "@/lib/pace/validate-target-route";

export const instant = false;

export async function generateMetadata(
  _props: LayoutProps<"/ssr/[target]">,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return socialImageMetadata(await parent, "/opengraph-image");
}

export default async function RootLayout(props: LayoutProps<"/ssr/[target]">) {
  const target = validateTargetRoute((await props.params).target);
  return (
    <TargetProvider targetKey={target}>
      <Shell
        navLinks={<NavLinks />}
        targetFinishSelect={<TargetFinishSelect />}
      >
        {props.children}
      </Shell>
    </TargetProvider>
  );
}
