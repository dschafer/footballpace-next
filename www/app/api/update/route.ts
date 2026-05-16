import {
  fixturesCacheTag,
  matchesCacheTag,
  paceSheetsCacheTag,
  teamsCacheTag,
} from "@/lib/cache-tags";
import { type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

type UpdateScope = "fixtures" | "matches" | "pace-sheets" | "teams";

const updateScopes = new Set<UpdateScope>([
  "fixtures",
  "matches",
  "pace-sheets",
  "teams",
]);

function revalidateTags(tags: string[]) {
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }
}

function tagsForScope(scope: UpdateScope, league: string, year: number): string[] {
  switch (scope) {
    case "fixtures":
      return [fixturesCacheTag(league, year)];
    case "matches":
      return [matchesCacheTag(league, year)];
    case "pace-sheets":
      return [paceSheetsCacheTag(league, year)];
    case "teams":
      return [teamsCacheTag(league, year)];
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
  const league = searchParams.get("league");
  const yearParam = searchParams.get("year");
  const scopeParam = searchParams.get("scope");

  if (!league || yearParam == null || scopeParam == null) {
    return Response.json(
      {
        message:
          "Scoped revalidation requires league, year, and scope parameters.",
      },
      {
        status: 400,
      },
    );
  }

  if (!updateScopes.has(scopeParam as UpdateScope)) {
    return Response.json(
      { message: "Scoped revalidation scope is invalid." },
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

  const scope = scopeParam as UpdateScope;
  const tags = tagsForScope(scope, league, year);
  revalidateTags(tags);
  return Response.json(
    {
      message: `Revalidated ${scope} caches for league ${league} and year ${year}.`,
      tags,
    },
    {
      status: 200,
    },
  );
}
