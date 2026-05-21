import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";

/** Query params when opening a memoir from the family tree canvas. */
export const TREE_MEMOIR_FROM = "tree";

export function treeMemoirSearchParams(circleId: string, treeBackHref: string): URLSearchParams {
  const params = new URLSearchParams({
    from: TREE_MEMOIR_FROM,
    circle: circleId,
    return: treeBackHref,
  });
  return params;
}

export function memoirHrefFromTree(memoirSlug: string, circleId: string, treeBackHref: string): string {
  const slug = memoirSlug.trim();
  const params = treeMemoirSearchParams(circleId, treeBackHref);
  return `${BEIZA_LINKS.marketing.memoirs}/${encodeURIComponent(slug)}?${params.toString()}`;
}

export function treeHrefWithFit(treeBackHref: string): string {
  const url = new URL(treeBackHref, "https://beiza.local");
  url.searchParams.set("fit", "1");
  return `${url.pathname}${url.search}`;
}

export function parseTreeMemoirReturn(searchParams: URLSearchParams): {
  circleId: string | null;
  treeBackHref: string | null;
} | null {
  if (searchParams.get("from") !== TREE_MEMOIR_FROM) return null;
  const circleId = searchParams.get("circle")?.trim() || null;
  const treeBackHref = searchParams.get("return")?.trim() || null;
  if (!circleId && !treeBackHref) return null;
  return { circleId, treeBackHref };
}

export function familyTreeBackHref(
  parsed: { circleId: string | null; treeBackHref: string | null },
): string {
  if (parsed.treeBackHref?.startsWith("/")) {
    return treeHrefWithFit(parsed.treeBackHref);
  }
  if (parsed.circleId) {
    return treeHrefWithFit(BEIZA_LINKS.circle.tree(parsed.circleId));
  }
  return BEIZA_LINKS.circle.directory;
}
