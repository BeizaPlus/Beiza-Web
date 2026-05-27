import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Feather, GraduationCap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getWelcomeCardHref } from "@/lib/locale/welcomeRegionalRoutes";
import { welcomeCopyForLocale } from "@/lib/locale/welcomeCopy";
import type { BeizaLocale, WelcomePathKey } from "@/lib/locale/types";
import { useLocaleContext } from "@/context/LocaleContext";
import { cn } from "@/lib/utils";

const SESSION_KEY = "beiza-welcome-explore-prompt-v1";

const PATH_OPTIONS: {
  key: WelcomePathKey;
  icon: typeof GraduationCap;
  accent: string;
}[] = [
  { key: "education", icon: GraduationCap, accent: "hover:border-[#E6A817]/50 hover:bg-[#E6A817]/10" },
  { key: "legacy", icon: BookOpen, accent: "hover:border-white/40 hover:bg-white/10" },
  { key: "farewell", icon: Feather, accent: "hover:border-white/40 hover:bg-white/10" },
];

const LOCALE_QUICK: { id: BeizaLocale; label: string }[] = [
  { id: "black-american", label: "US" },
  { id: "indian", label: "IN" },
  { id: "latina", label: "LA" },
  { id: "chinese", label: "CN" },
  { id: "brazilian", label: "BR" },
  { id: "africa", label: "AF" },
  { id: "fr", label: "FR" },
];

type WelcomeExplorePromptProps = {
  isLight?: boolean;
};

/** One-time welcome popup — story path or language, then route to the right place. */
export function WelcomeExplorePrompt({ isLight = false }: WelcomeExplorePromptProps) {
  const navigate = useNavigate();
  const { locale, setLocale, setLocalePinned, ready } = useLocaleContext();
  const [open, setOpen] = useState(false);
  const copy = welcomeCopyForLocale(locale);

  useEffect(() => {
    if (!ready) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const timer = window.setTimeout(() => setOpen(true), 700);
    return () => window.clearTimeout(timer);
  }, [ready]);

  const dismiss = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setOpen(false);
  };

  const goPath = (key: WelcomePathKey) => {
    dismiss();
    navigate(getWelcomeCardHref(locale, key));
  };

  const pickLocale = (next: BeizaLocale) => {
    setLocale(next);
    setLocalePinned(true);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) dismiss();
        else setOpen(true);
      }}
    >
      <DialogContent
        className={cn(
          "max-w-md gap-0 border p-0 sm:rounded-2xl",
          isLight
            ? "border-black/10 bg-[#f7f6f3] text-[#1a1816]"
            : "border-white/15 bg-[#0a0a0a] text-white",
        )}
      >
        <DialogHeader className="space-y-2 px-5 pb-4 pt-5 text-left sm:px-6 sm:pt-6">
          <p
            className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.28em]",
              isLight ? "text-[#1a1816]/50" : "text-[#E6A817]",
            )}
          >
            Quick start
          </p>
          <DialogTitle className="font-serif text-xl font-normal italic leading-snug sm:text-2xl">
            Which story would you like to explore?
          </DialogTitle>
          <DialogDescription
            className={cn(
              "text-sm leading-relaxed",
              isLight ? "text-[#1a1816]/70" : "text-white/65",
            )}
          >
            Pick a path — we&apos;ll take you there. Or set your language first.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 px-5 sm:px-6">
          {PATH_OPTIONS.map(({ key, icon: Icon, accent }) => {
            const pathCopy = copy.paths[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => goPath(key)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition",
                  isLight ? "border-black/10 bg-white/60" : "border-white/12 bg-white/[0.04]",
                  accent,
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    isLight ? "bg-black/5 text-[#1a1816]/80" : "bg-white/10 text-white/90",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{pathCopy.title}</span>
                  <span
                    className={cn(
                      "mt-0.5 block text-xs leading-snug",
                      isLight ? "text-[#1a1816]/60" : "text-white/55",
                    )}
                  >
                    {pathCopy.subtitle}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div
          className={cn(
            "mt-5 border-t px-5 py-4 sm:px-6",
            isLight ? "border-black/10" : "border-white/10",
          )}
        >
          <p
            className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.22em]",
              isLight ? "text-[#1a1816]/45" : "text-white/45",
            )}
          >
            Language
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {LOCALE_QUICK.map(({ id, label }) => {
              const active = locale === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => pickLocale(id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    active
                      ? "border-[#E6A817] bg-[#E6A817]/15 text-[#E6A817]"
                      : isLight
                        ? "border-black/10 text-[#1a1816]/70 hover:border-black/25"
                        : "border-white/15 text-white/70 hover:border-white/35",
                  )}
                  aria-pressed={active}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 pb-5 pt-2 sm:px-6 sm:pb-6">
          <button
            type="button"
            onClick={dismiss}
            className={cn(
              "rounded-lg px-4 py-2 text-xs font-medium uppercase tracking-wider transition",
              isLight
                ? "text-[#1a1816]/55 hover:text-[#1a1816]"
                : "text-white/50 hover:text-white/80",
            )}
          >
            Skip for now
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
