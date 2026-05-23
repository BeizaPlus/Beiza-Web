import { useLayoutStudio } from "@/context/LayoutStudioContext";

/** Exclusive floating studio panel — only one open at a time across the app. */
export function useStudioPanel(panelId: string) {
  const { activePanelId, openStudioPanel, closeStudioPanel } = useLayoutStudio();
  return {
    open: activePanelId === panelId,
    onOpen: () => openStudioPanel(panelId),
    onClose: () => closeStudioPanel(),
  };
}
