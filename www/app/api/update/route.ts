import {
  fixturesCacheTag,
  globalDataCacheTag,
  leagueCacheTag,
  matchesCacheTag,
  paceSheetsCacheTag,
} from "@/lib/cache-tags";
import { type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const expectedToken = process.env.UPDATE_BEARER_TOKEN;

  if (authHeader !== `Bearer ${expectedToken}`) {
    return Response.json(
      { message: "Unauthorized" },
      {
        status: 401,
      },
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const league = searchParams.get("query");
  const yearParam = searchParams.get("year");
  const year = yearParam == null ? null : Number(yearParam);
  if (league && year != null && Number.isInteger(year)) {
    revalidateTag(leagueCacheTag(league, year), "max");
    revalidateTag(matchesCacheTag(league, year), "max");
    revalidateTag(fixturesCacheTag(league, year), "max");
    revalidateTag(paceSheetsCacheTag(league, year), "max");
    return Response.json(
      { message: `Revalidated league ${league} and year ${year}.` },
      {
        status: 200,
      },
    );
  } else {
    revalidateTag(globalDataCacheTag, "max");
    return Response.json(
      { message: "Revalidated entire site." },
      {
        status: 200,
      },
    );
  }
}
