export default function Layout(
  props: LayoutProps<"/ssr/[target]/[league]/[year]/team">,
) {
  return <>{props.children}</>;
}
