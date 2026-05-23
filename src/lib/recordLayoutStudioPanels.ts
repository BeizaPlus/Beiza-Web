import type { RecordLayoutStudioTarget } from "@/context/RecordLayoutStudioContext";

/** Maps a record-layout click target to its floating panel id in the PANELS dock. */
export function studioPanelIdForTarget(target: RecordLayoutStudioTarget): string | null {
  if (target.startsWith("nav-tab:")) return "legacy-nav-tabs";
  switch (target) {
    case "record-page":
      return "record-page";
    case "nav-rail":
      return "legacy-tab-nav";
    case "record-cta":
    case "record-playback":
    case "record-upload":
    case "record-seal":
    case "record-upload-hud":
      return "record-memory-hud";
    default:
      return null;
  }
}
