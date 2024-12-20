import { List, ListItem, Text } from "@mantine/core";

export default function ProjectedStandingsPreamble() {
  return (
    <>
      <Text>
        This table shows the projected standings for the current year. This
        accounts for the unpredicatability of the table during the early part of
        the season by adding in results from the previous season to make up the
        difference. More concretely:
      </Text>
      <List>
        <ListItem>
          If a team has played at least half of its schedule, then we just use
          the current season{"'"}s results, and project that out to a full
          season.
        </ListItem>
        <ListItem>
          If a team has not yet played half of its schedule, then we double
          their current season results (to make sure we{"'"}re weighting current
          season performance more than previous season performance), then then
          we scale down the previous season{"'"}s results to make up the
          difference to a full season.
        </ListItem>
        <ListItem>
          If a team is newly promoted, then for the previous season{"'"}s
          performance, we substitute the performance of the worst non-relegated
          team from the previous season instead.
        </ListItem>
      </List>
      <Text>
        This tends to be fairly conservative on teams that get out to a hot
        start; for example, even after 11 matchdays in 2024, it still projected
        Nottingham Forest (5th in the table at the time) to finish 11th.
        However, this matches pretty closely with the betting markets; Forest
        had only the 10th best odds to make the Champions League at the time. So
        that suggests this approximation is reasonable.
      </Text>
    </>
  );
}
