type TreeSelectionToolbarProps = {
  selectedPersonCount: number;
  selectedGroupId: string | null;
  onGroup: () => void;
  onUngroup: () => void;
};

export function TreeSelectionToolbar({
  selectedPersonCount,
  selectedGroupId,
  onGroup,
  onUngroup,
}: TreeSelectionToolbarProps) {
  const showGroup = selectedPersonCount >= 2;
  const showUngroup = Boolean(selectedGroupId);

  if (!showGroup && !showUngroup) return null;

  return (
    <div
      className="absolute left-1/2 top-4 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#1e1e1e] bg-[#111111]/95 px-2 py-1.5 shadow-lg backdrop-blur-sm"
      role="toolbar"
      aria-label="Selection actions"
    >
      {showGroup ? (
        <button
          type="button"
          onClick={onGroup}
          className="rounded-full px-3 py-1 font-manrope text-xs text-[#E6A817] hover:bg-[#1a1a1a]"
        >
          Group (G)
        </button>
      ) : null}
      {showUngroup ? (
        <button
          type="button"
          onClick={onUngroup}
          className="rounded-full px-3 py-1 font-manrope text-xs text-[#cccccc] hover:bg-[#1a1a1a]"
        >
          Ungroup
        </button>
      ) : null}
    </div>
  );
}
