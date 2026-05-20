import { BeizaCircleMark } from "@/components/family-trees/BeizaCircleMark";
import { DEFAULT_ADINKRA, formatAdinkraCaption, getAdinkraById } from "@/lib/adinkra";

type AdinkraCircleIdentityProps = {
  adinkraId?: string | null;
};

/** Access gate — family circle mark + Adinkra meaning below the family name. */
export function AdinkraCircleIdentity({ adinkraId }: AdinkraCircleIdentityProps) {
  const symbol = getAdinkraById(adinkraId) ?? DEFAULT_ADINKRA;

  return (
    <div className="mt-5 flex flex-col items-center gap-2">
      <BeizaCircleMark size={40} className="rounded-sm opacity-90" />
      <p className="max-w-xs font-manrope text-xs font-normal italic leading-relaxed text-[#555555]">
        {formatAdinkraCaption(symbol)}
      </p>
    </div>
  );
}
