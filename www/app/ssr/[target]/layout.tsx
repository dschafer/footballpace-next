import NavLinks from "@/components/shell/nav-links";
import Shell from "@/components/shell/shell";
import TargetFinishSelect from "@/components/header/target-finish-select";
import { TargetProvider } from "@/context/target-context";
import { validateTargetRoute } from "@/lib/pace/validate-target-route";

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
