/** Dispatched after persona tools mutate the tree — canvas listens and refetches. */
export const BEIZA_TREE_UPDATED = "beiza:tree-updated";

export type BeizaTreeUpdatedDetail = {
  circleId: string;
};

export function dispatchBeizaTreeUpdated(circleId: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<BeizaTreeUpdatedDetail>(BEIZA_TREE_UPDATED, {
      detail: { circleId },
    }),
  );
}
