import { useRef, useState } from "react";
import type { FamilyPersonGender } from "@/lib/legacy/types";

type TreeNodeContextMenuProps = {
  x: number;
  y: number;
  displayName: string;
  gender?: FamilyPersonGender | null;
  careerPath?: string | null;
  isTreeLeader?: boolean;
  onGenderChange: (gender: FamilyPersonGender | null) => void;
  onCareerSave: (careerPath: string | null) => void;
  onPhotoSelected: (file: File) => void;
  onSetTreeLeader?: () => void;
  onDuplicate: () => void;
  onDisconnect: () => void;
  onClose: () => void;
};

export function TreeNodeContextMenu({
  x,
  y,
  displayName,
  gender,
  careerPath,
  onGenderChange,
  onCareerSave,
  onPhotoSelected,
  isTreeLeader,
  onSetTreeLeader,
  onDuplicate,
  onDisconnect,
  onClose,
}: TreeNodeContextMenuProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [careerDraft, setCareerDraft] = useState(careerPath ?? "");

  return (
    <div
      role="menu"
      className="tree-chrome fixed z-[9999] w-[200px] rounded-lg border border-[#1e1e1e] bg-[#111111] py-1 text-white shadow-xl"
      style={{ top: y, left: x }}
      onMouseLeave={onClose}
    >
      <p className="truncate px-3.5 py-1.5 font-manrope text-[10px] uppercase tracking-wider text-[#555555]">
        {displayName}
      </p>

      <div className="border-t border-[#1a1a1a] px-3.5 py-2">
        <p className="mb-1.5 font-manrope text-[10px] uppercase tracking-wider text-[#555555]">Gender</p>
        <div className="flex gap-1">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onGenderChange("male");
              onClose();
            }}
            className={`flex-1 rounded px-2 py-1 font-manrope text-[10px] ${
              gender === "male"
                ? "bg-[#4466ff]/30 text-[#7aa2ff]"
                : "bg-[#1a1a1a] text-[#888888] hover:bg-[#222222]"
            }`}
          >
            Male
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onGenderChange("female");
              onClose();
            }}
            className={`flex-1 rounded px-2 py-1 font-manrope text-[10px] ${
              gender === "female"
                ? "bg-[#CE1126]/25 text-[#f08080]"
                : "bg-[#1a1a1a] text-[#888888] hover:bg-[#222222]"
            }`}
          >
            Female
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onGenderChange(null);
              onClose();
            }}
            className="rounded px-2 py-1 font-manrope text-[10px] bg-[#1a1a1a] text-[#666666] hover:bg-[#222222]"
            title="Clear gender"
          >
            —
          </button>
        </div>
      </div>

      <div className="border-t border-[#1a1a1a] px-3.5 py-2">
        <p className="mb-1 font-manrope text-[10px] uppercase tracking-wider text-[#555555]">Career</p>
        <input
          value={careerDraft}
          onChange={(e) => setCareerDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onCareerSave(careerDraft.trim() || null);
              onClose();
            }
          }}
          placeholder="e.g. Nurse, Teacher"
          className="mb-1.5 h-7 w-full rounded border border-[#2a2a2a] bg-[#0a0a0a] px-2 font-manrope text-xs text-white"
        />
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onCareerSave(careerDraft.trim() || null);
            onClose();
          }}
          className="w-full rounded px-2 py-1 text-left font-manrope text-[10px] text-[#E6A817] hover:bg-[#1a1a1a]"
        >
          Save career
        </button>
      </div>

      {onSetTreeLeader ? (
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onSetTreeLeader();
            onClose();
          }}
          className={`w-full border-t border-[#1a1a1a] px-3.5 py-1.5 text-left font-manrope text-xs hover:bg-[#1a1a1a] ${
            isTreeLeader ? "text-[#E6A817]" : "text-[#cccccc]"
          }`}
        >
          {isTreeLeader ? "★ Family leader (pinned)" : "Pin as family leader"}
        </button>
      ) : null}

      <button
        type="button"
        role="menuitem"
        onClick={() => fileRef.current?.click()}
        className="w-full border-t border-[#1a1a1a] px-3.5 py-1.5 text-left font-manrope text-xs text-[#cccccc] hover:bg-[#1a1a1a]"
      >
        Upload photo…
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPhotoSelected(file);
          e.target.value = "";
          onClose();
        }}
      />

      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onDuplicate();
          onClose();
        }}
        className="w-full px-3.5 py-1.5 text-left font-manrope text-xs text-[#cccccc] hover:bg-[#1a1a1a]"
      >
        Duplicate node
      </button>

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
