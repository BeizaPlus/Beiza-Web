import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

interface HeroProps {
  headline: string;
  paragraph: string;
  ctaText: string;
  ctaLink: string;
  reviews?: string;
  backgroundImage?: string;
  showReviews?: boolean;
}

export const Hero = ({
  headline,
  paragraph,
  ctaText,
  ctaLink,
  reviews = "100+ Positive Client Reviews",
  backgroundImage,
  showReviews = true,
}: HeroProps) => {
  return (
    <header className="relative min-h-screen w-full flex items-center justify-center overflow-hidden" id="hero">
      {/* Background Image */}
      {backgroundImage && (
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: [0.12, 0.23, 0.5, 1] }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        </motion.div>
      )}

      {/* Dark Overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: 'radial-gradient(35% 42% at 50% 50%, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 100%)'
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <motion.h1
            className="font-manrope font-medium text-white mb-6"
            style={{
              letterSpacing: '-0.05em',
            }}
            initial={{ opacity: 0.001, filter: 'blur(6px)', scale: 1.4 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span
              className="hidden md:block"
              style={{ fontSize: '72px', lineHeight: '70px' }}
            >
              {headline}
            </span>
            <span
              className="md:hidden"
              style={{ fontSize: '49px', lineHeight: '50px' }}
            >
              {headline}
            </span>
          </motion.h1>

          {/* Paragraph */}
          <motion.p
            className="text-lg md:text-xl text-white mb-8 max-w-2xl mx-auto leading-relaxed font-manrope"
            initial={{ opacity: 0.001, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            {paragraph}
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0.001, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="mb-8"
          >
            <Link to={ctaLink} className="inline-block">
              <Button
                className="bg-white text-black hover:bg-white/90 rounded-full px-8 py-4 text-lg font-manrope font-medium h-auto border-0 shadow-lg flex items-center gap-3"
              >
                <span>{ctaText}</span>
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-white rotate-[-45deg]" />
                </div>
              </Button>
            </Link>
          </motion.div>

          {/* Reviews */}
          {showReviews && (
            <motion.div
              className="flex items-center justify-center gap-3"
              initial={{ opacity: 0.001, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.4 }}
            >
              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-white"
                  >
                    <path
                      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                      fill="currentColor"
                    />
                  </svg>
                ))}
              </div>
              <p className="text-white font-manrope text-lg">{reviews}</p>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
};

