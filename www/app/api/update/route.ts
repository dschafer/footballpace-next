import { type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

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
  const year = searchParams.get("year");
  if (league && year) {
    revalidatePath("/");
    revalidatePath(`/${league}/${year}`, "layout");
    revalidatePath(`/${league}/${year}/team`, "layout");
    return Response.json(
      { message: `Revalidated league ${league} and year ${year}.` },
      {
        status: 200,
      },
    );
  } else {
    // If league and year are not both passed, revalidate the entire thing.
    revalidatePath("/");
    revalidatePath("/", "layout");
    return Response.json(
      { message: "Revalidated entire site." },
      {
        status: 200,
      },
    );
  }
}
