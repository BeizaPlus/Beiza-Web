import { useEffect } from "react";
import EducationPage from "@/pages/Education";
import FarewellHeritagePage from "@/pages/Heritage";
import HeritageLegacyLanding from "@/pages/HeritageLegacyLanding";
import { useLocaleContext } from "@/context/LocaleContext";
import type { BeizaLocale } from "@/lib/locale/types";
import type { WelcomePathKey } from "@/lib/locale/types";

type RegionalRoutePageProps = {
  locale: BeizaLocale;
  variant: WelcomePathKey;
};

export default function RegionalRoutePage({ locale, variant }: RegionalRoutePageProps) {
  const { setLocale } = useLocaleContext();

  useEffect(() => {
    setLocale(locale);
  }, [locale, setLocale]);
  switch (variant) {
    case "legacy":
      return <HeritageLegacyLanding locale={locale} />;
    case "farewell":
      return <FarewellHeritagePage locale={locale} />;
    case "education":
      return <EducationPage locale={locale} />;
    default:
      return null;
  }
}
