import { motion } from "framer-motion";
import { CTAButton } from "./framer/CTAButton";
import { HERO_OVERLAY_GRADIENT, HERO_SHELL_CLASS, HERO_CONTENT_CLASS, HERO_CONTENT_BOTTOM_STYLE } from "@/lib/brandImages";
import { FALLBACK_SITE_SETTINGS } from "@/lib/fallbackContent";

interface HeroProps {
  headline?: string;
  title?: string;
  paragraph?: string;
  description?: string;
  ctaText?: string;
  ctaLabel?: string;
  ctaLink?: string;
  ctaHref?: string;
  reviews?: string;
  backgroundImage?: string;
  backgroundPosition?: string;
  backgroundScale?: number;
  showReviews?: boolean;
  /** When set, replaces default hero-overlay (e.g. Heritage Gye Nyame gradient). */
  overlayStyle?: React.CSSProperties;
  /** vw/vh copy shift from layout studio */
  copyOffsetStyle?: React.CSSProperties;
}

export const Hero = ({
  headline,
  title,
  paragraph,
  description,
  ctaText,
  ctaLabel,
  ctaLink,
  ctaHref,
  reviews = FALLBACK_SITE_SETTINGS.heroReviews,
  backgroundImage,
  backgroundPosition,
  backgroundScale = 100,
  showReviews = true,
  overlayStyle,
  copyOffsetStyle,
}: HeroProps) => {
  const heroTitle = title ?? headline ?? FALLBACK_SITE_SETTINGS.heroHeading;
  const heroDescription =
    description ?? paragraph ?? FALLBACK_SITE_SETTINGS.heroSubheading;
  const buttonLabel = ctaLabel ?? ctaText ?? FALLBACK_SITE_SETTINGS.heroCtaLabel;
  const buttonTarget = ctaLink ?? ctaHref ?? FALLBACK_SITE_SETTINGS.heroCtaHref;

  return (
    <header className={HERO_SHELL_CLASS} id="hero">
      {backgroundImage ? (
        <motion.div
          className="absolute inset-0 overflow-hidden"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: [0.12, 0.23, 0.5, 1] }}
        >
          <img
            src={backgroundImage}
            alt="Hero background"
            className="h-full w-full object-cover"
            style={{
              objectPosition: backgroundPosition ?? "50% 50%",
              transform: backgroundScale !== 100 ? `scale(${backgroundScale / 100})` : undefined,
              transformOrigin: backgroundPosition ?? "50% 50%",
            }}
            loading="lazy"
          />
        </motion.div>
      ) : null}

      {overlayStyle ? (
        <div className="absolute inset-0" style={overlayStyle} aria-hidden />
      ) : (
        <div className="hero-overlay" />
      )}

      <div
        className="relative z-10 flex w-full flex-1 items-end px-6 pt-28 md:px-12 md:pt-32"
        style={HERO_CONTENT_BOTTOM_STYLE}
      >
        <div className="max-w-[680px] text-left md:pl-20" style={copyOffsetStyle}>
          <motion.h1
            initial={{ opacity: 0, filter: "blur(16px)", scale: 1.12 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 0.8, ease: [0.12, 0.23, 0.5, 1] }}
            className="text-display-xl text-white"
          >
            {heroTitle}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.12, 0.23, 0.5, 1] }}
            className="mt-5 max-w-[680px] text-lg leading-relaxed text-white/90 md:text-xl"
          >
            {heroDescription}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.12, 0.23, 0.5, 1] }}
            className="mt-10 flex"
          >
            <CTAButton to={buttonTarget} label={buttonLabel} />
          </motion.div>

          {showReviews ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease: [0.12, 0.23, 0.5, 1] }}
              className="mt-8 flex items-center gap-3 text-white"
            >
              <div className="flex gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, index) => (
                  <svg key={index} width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2Z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-medium uppercase tracking-[0.3em] text-subtle">{reviews}</span>
            </motion.div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Hero;

