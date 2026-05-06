import { cacheLife } from "next/cache";
import currentYear from "@/lib/const/year";

export function cacheSeasonData(year: number) {
  if (year === currentYear) {
    cacheLife("hours");
  } else {
    cacheLife("max");
  }
}
