import type { TargetKey } from "@/lib/pace/target-key";

export function isExternalHref(href: string) {
  return (
    /^(https?:)?\/\//.test(href) ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  );
}

export function isLocalPathHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

export function withTargetParam(href: string, targetKey: TargetKey): string {
  // Only decorate internal, relative links
  if (!href || isExternalHref(href) || href.startsWith("#")) return href;

  // Do not include param for default target
  if (targetKey === "champion") return href;

  try {
    // Preserve hash and existing query params
    const [pathAndQuery, hash = ""] = href.split("#");
    // Dummy base is required to parse relative URLs in all environments (SSR/CSR)
    const url = new URL(pathAndQuery, "https://x.invalid");

    // Respect explicit target on the link
    if (!url.searchParams.has("target")) {
      url.searchParams.set("target", targetKey);
    }

    const out = url.pathname + (url.search ? url.search : "");
    return hash ? `${out}#${hash}` : out;
  } catch {
    // Fallback: naive append
    const join = href.includes("?") ? "&" : "?";
    return `${href}${join}target=${encodeURIComponent(targetKey)}`;
  }
}
