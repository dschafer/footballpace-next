import {
  fixturesCacheTag,
  globalDataCacheTag,
  leagueCacheTag,
  matchesCacheTag,
  paceSheetsCacheTag,
} from "@/lib/cache-tags";
import { type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

function revalidateTags(tags: string[]) {
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const expectedToken = process.env.UPDATE_BEARER_TOKEN;

  if (!expectedToken) {
    return Response.json(
      { message: "Update token is not configured." },
      {
        status: 500,
      },
    );
  }

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
  if (league == null && yearParam == null) {
    revalidateTags([globalDataCacheTag]);
    return Response.json(
      { message: "Revalidated entire site.", tags: [globalDataCacheTag] },
      {
        status: 200,
      },
    );
  }

  if (!league || yearParam == null) {
    return Response.json(
      { message: "Scoped revalidation requires query and year parameters." },
      {
        status: 400,
      },
    );
  }

  const year = Number(yearParam);
  if (!/^\d+$/.test(yearParam) || year <= 0) {
    return Response.json(
      { message: "Scoped revalidation year must be a positive integer." },
      {
        status: 400,
      },
    );
  }

  const tags = [
    leagueCacheTag(league, year),
    matchesCacheTag(league, year),
    fixturesCacheTag(league, year),
    paceSheetsCacheTag(league, year),
  ];
  revalidateTags(tags);
  return Response.json(
    { message: `Revalidated league ${league} and year ${year}.`, tags },
    {
      status: 200,
    },
  );
}
