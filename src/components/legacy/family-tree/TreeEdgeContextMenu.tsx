type TreeEdgeContextMenuProps = {
  x: number;
  y: number;
  onEdit: () => void;
  onRemove: () => void;
  onClose: () => void;
};

export function TreeEdgeContextMenu({ x, y, onEdit, onRemove, onClose }: TreeEdgeContextMenuProps) {
  return (
    <div
      role="menu"
      className="tree-chrome fixed z-[9999] min-w-[160px] rounded-lg border border-[#1e1e1e] bg-[#111111] py-1 text-white"
      style={{ top: y, left: x }}
      onMouseLeave={onClose}
    >
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onEdit();
          onClose();
        }}
        className="w-full px-3.5 py-1.5 text-left font-manrope text-xs text-[#E6A817] hover:bg-[#1a1a1a]"
      >
        Edit relationship
      </button>
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
