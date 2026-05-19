type TreeEdgeContextMenuProps = {
  x: number;
  y: number;
  onRemove: () => void;
  onClose: () => void;
};

export function TreeEdgeContextMenu({ x, y, onRemove, onClose }: TreeEdgeContextMenuProps) {
  return (
    <div
      role="menu"
      className="fixed z-[9999] min-w-[160px] rounded-lg border border-[#1e1e1e] bg-[#111111] py-1"
      style={{ top: y, left: x }}
      onMouseLeave={onClose}
    >
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onRemove();
          onClose();
        }}
        className="w-full px-3.5 py-1.5 text-left font-manrope text-xs text-[#CE1126] hover:bg-[#1a1a1a]"
      >
        Remove connection
      </button>
    </div>
  );
}
