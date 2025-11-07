import { motion } from "framer-motion";
import { CTAButton } from "./framer/CTAButton";

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
  showReviews?: boolean;
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
  reviews = "100+ Positive Client Reviews",
  backgroundImage,
  showReviews = true,
}: HeroProps) => {
  const heroTitle = title ?? headline ?? "Crafting Meaningful Farewells";
  const heroDescription = description ?? paragraph ?? "We believe farewells are not the end — they're the final chapter of love.";
  const buttonLabel = ctaLabel ?? ctaText ?? "Create a Memoir";
  const buttonTarget = ctaLink ?? ctaHref ?? "/contact#hero";

  return (
    <header
      className="relative -mt-24 flex min-h-[calc(100vh+6rem)] items-stretch justify-center overflow-hidden"
      id="hero"
    >
      {backgroundImage ? (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: [0.12, 0.23, 0.5, 1] }}
        >
          <img
            src={backgroundImage}
            alt="Hero background"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </motion.div>
      ) : null}

      <div className="hero-overlay" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-end px-6 py-24 md:px-12">
        <div className="max-w-xl text-left">
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
            className="mt-6 max-w-2xl text-lg leading-relaxed text-subtle md:text-xl"
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

