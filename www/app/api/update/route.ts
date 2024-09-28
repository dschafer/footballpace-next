import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const expectedToken = process.env.UPDATE_BEARER_TOKEN;

  if (authHeader !== `Bearer ${expectedToken}`) {
    return Response.json(
      { message: "Unauthorized" },
      {
        status: 401,
      },
    );
  }

  revalidatePath("/", "layout");
  return Response.json(
    { message: "Revalidated" },
    {
      status: 200,
    },
  );
}
