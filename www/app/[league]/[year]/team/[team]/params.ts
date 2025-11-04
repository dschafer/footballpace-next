export type SeasonPageParam = Awaited<
  Awaited<PageProps<"/[league]/[year]/team/[team]">>["params"]
>;
