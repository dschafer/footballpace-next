import NavLinks from "@/components/shell/nav-links";
import Shell from "@/components/shell/shell";
import TargetFinishSelect from "@/components/header/target-finish-select";
import { TargetProvider } from "@/context/target-context";
import { asTargetKey } from "@/lib/pace/target-key";

export default async function RootLayout(props: LayoutProps<"/ssr/[target]">) {
  const target = asTargetKey((await props.params).target) ?? "champion";
  return (
    <TargetProvider targetKey={target}>
      <Shell
        navLinks={<NavLinks />}
        targetFinishSelect={<TargetFinishSelect initialValue={1} />}
      >
        {props.children}
      </Shell>
    </TargetProvider>
  );
}
