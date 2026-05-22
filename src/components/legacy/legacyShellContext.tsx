import { createContext, useContext, type ReactNode } from "react";

type LegacyShellContextValue = {
  /** True when Supabase session exists — tab links open real legacy pages */
  signedIn: boolean;
};

const LegacyShellContext = createContext<LegacyShellContextValue>({ signedIn: false });

export function LegacyShellProvider({
  signedIn,
  children,
}: {
  signedIn: boolean;
  children: ReactNode;
}) {
  return (
    <LegacyShellContext.Provider value={{ signedIn }}>{children}</LegacyShellContext.Provider>
  );
}

export function useLegacyShell() {
  return useContext(LegacyShellContext);
}
