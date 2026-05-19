type TreeNodeContextMenuProps = {
  x: number;
  y: number;
  onDisconnect: () => void;
  onClose: () => void;
};

export function TreeNodeContextMenu({ x, y, onDisconnect, onClose }: TreeNodeContextMenuProps) {
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
          onDisconnect();
          onClose();
        }}
        className="w-full px-3.5 py-1.5 text-left font-manrope text-xs text-[#CE1126] hover:bg-[#1a1a1a]"
      >
        Disconnect node
      </button>
    </div>
  );
}
