import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { asTargetKey } from "@/lib/pace/target-key";

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  if (url.pathname === "/ssr" || url.pathname.startsWith("/ssr/")) {
    return new NextResponse("Not Found", { status: 404 });
  }
  const target = asTargetKey(url.searchParams.get("target")) ?? "champion";
  url.pathname = `/ssr/${target}${url.pathname}`;
  url.searchParams.delete("target");
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/ssr/:path*",
    "/((?!_next/|api/|ssr/|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\..*$).*)",
  ],
};
