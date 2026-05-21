import { cn } from "@/lib/utils";

import homeDuotone from "@/assets/icons/legacy/home-duotone.svg?raw";
import homeRegular from "@/assets/icons/legacy/home.svg?raw";
import recordDuotone from "@/assets/icons/legacy/record-duotone.svg?raw";
import recordRegular from "@/assets/icons/legacy/record.svg?raw";
import vaultDuotone from "@/assets/icons/legacy/vault-duotone.svg?raw";
import vaultRegular from "@/assets/icons/legacy/vault.svg?raw";
import familyDuotone from "@/assets/icons/legacy/family-duotone.svg?raw";
import familyRegular from "@/assets/icons/legacy/family.svg?raw";
import wellDuotone from "@/assets/icons/legacy/well-duotone.svg?raw";
import wellRegular from "@/assets/icons/legacy/well.svg?raw";

export type LegacyNavIconName = "home" | "record" | "vault" | "well" | "family";

const ICONS: Record<LegacyNavIconName, { regular: string; duotone: string }> = {
  home: { regular: homeRegular, duotone: homeDuotone },
  record: { regular: recordRegular, duotone: recordDuotone },
  vault: { regular: vaultRegular, duotone: vaultDuotone },
  well: { regular: wellRegular, duotone: wellDuotone },
  family: { regular: familyRegular, duotone: familyDuotone },
};

type LegacyNavIconProps = {
  name: LegacyNavIconName;
  active?: boolean;
  className?: string;
};

/** Phosphor SVG icons for the signature Legacy tab bar */
export function LegacyNavIcon({ name, active = false, className }: LegacyNavIconProps) {
  const markup = active ? ICONS[name].duotone : ICONS[name].regular;

  return (
    <span
      className={cn(
        "inline-flex h-6 w-6 shrink-0 [&>svg]:h-full [&>svg]:w-full",
        active ? "text-black" : "text-white/55",
        className,
      )}
      aria-hidden
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
