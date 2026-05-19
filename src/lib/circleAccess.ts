// Recovery is the most important feature in this product.
// It is the reason Heritage exists.
// It is the moment when a family realizes what Beiza is for.
//
// The access code is the moat.
// The tree is private. The cover is public.
// You earn entry by belonging to the family.
//
// The recordings are the inheritance.
// Recovery is how we make sure it isn't lost.

const TOKEN_PREFIX = "beiza_circle_";

export function circleTokenStorageKey(circleId: string): string {
  return `${TOKEN_PREFIX}${circleId}_token`;
}

export function getStoredCircleToken(circleId: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(circleTokenStorageKey(circleId));
}

export function storeCircleToken(circleId: string, token: string): void {
  localStorage.setItem(circleTokenStorageKey(circleId), token);
}

export function clearCircleToken(circleId: string): void {
  localStorage.removeItem(circleTokenStorageKey(circleId));
}

export function hasStoredCircleToken(circleId: string): boolean {
  return Boolean(getStoredCircleToken(circleId));
}
