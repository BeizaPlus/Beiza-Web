import { Link } from "react-router-dom";
import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";
import { cn } from "@/lib/utils";

const HOME_MENU_ITEMS = [
  { icon: "🎙", label: "Record a memory", route: BEIZA_LINKS.legacy.recordStation },
  { icon: "📖", label: "Your family booklet", route: BEIZA_LINKS.marketing.booklet },
  { icon: "🎁", label: "The Legacy Packet", route: BEIZA_LINKS.legacy.packet },
  { icon: "💳", label: "Plans and pricing", route: BEIZA_LINKS.marketing.pricing },
  { icon: "🕊", label: "Planning a farewell?", route: BEIZA_LINKS.farewell.heritage },
  { icon: "❓", label: "FAQs", route: BEIZA_LINKS.legacy.faqs },
] as const;

type Props = {
  open: boolean;
  onClose: () => void;
};

/** Home tab only: secondary navigation sheet (mic tab unchanged). */
export function LegacyHomeDrawer({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[45]">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 max-h-[70vh] overflow-y-auto rounded-t-2xl",
          "border border-white/10 bg-[#0a0a0a] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl",
        )}
        role="dialog"
        aria-label="Home menu"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" aria-hidden />
        <ul className="space-y-1">
          {HOME_MENU_ITEMS.map((item) => (
            <li key={item.route}>
              <Link
                to={item.route}
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg px-3 py-3 font-manrope text-base text-white transition-colors hover:bg-[#E6A817]/15 hover:text-[#E6A817]"
              >
                <span className="text-lg" aria-hidden>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
