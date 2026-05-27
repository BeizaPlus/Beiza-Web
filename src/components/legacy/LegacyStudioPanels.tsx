import { useLocation } from "react-router-dom";
import { LegacyNavTabStudioPanel } from "@/components/legacy/LegacyNavTabStudioPanel";
import { RecordMemoryStudioPanel } from "@/components/legacy/RecordMemoryStudioPanel";
import { RecordPageStudioPanel } from "@/components/legacy/RecordPageStudioPanel";
import { useRecordLayoutStudio } from "@/context/RecordLayoutStudioContext";
import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";
import { isLayoutStudioEnabled } from "@/lib/layoutStudio";
import {
  loadRecordPageStudioFrame,
  saveRecordPageStudioFrame,
  type RecordPageStudioFrame,
} from "@/lib/legacy/recordPageStudio";
import { useState } from "react";
/** Floating studio panels shared across /legacy/* when layout studio is on. */
export function LegacyStudioPanels() {
  const studioOn = isLayoutStudioEnabled();
  const location = useLocation();
  const ctx = useRecordLayoutStudio();
  const isRecordRoute = location.pathname.startsWith(BEIZA_LINKS.legacy.recordStation);
  const [recordStudio, setRecordStudio] = useState<RecordPageStudioFrame>(() =>
    loadRecordPageStudioFrame(),
  );

  if (!studioOn || !ctx) return null;

  const onRecordStudioChange = (frame: RecordPageStudioFrame) => {
    setRecordStudio(frame);
    saveRecordPageStudioFrame(frame);
  };

  return (
    <>
      <LegacyNavTabStudioPanel frame={ctx.tabFrame} onChange={ctx.setTabFrame} />
      {isRecordRoute ? (
        <>
          <RecordPageStudioPanel frame={recordStudio} onChange={onRecordStudioChange} />
          <RecordMemoryStudioPanel frame={ctx.memoryFrame} onChange={ctx.setMemoryFrame} />
        </>
      ) : null}
    </>
  );
}
