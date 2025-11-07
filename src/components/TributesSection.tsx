import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

export const TributesSection = () => {
  return (
    <section className="py-20 md:py-32 bg-black text-white relative overflow-hidden" id="tributes">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(35% 42% at 50% 50%, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 100%)'
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Heading */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-manrope font-medium text-white mb-6 leading-tight">
            Because the Last Goodbye Should.
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/80 mb-8 font-manrope leading-relaxed">
            We curate meaningful experiences for families.
          </p>

          {/* CTA Button */}
          <Link to="/contact">
            <Button className="bg-white text-black hover:bg-white/90 rounded-full px-8 py-4 text-lg font-manrope font-medium h-auto border-0 shadow-lg flex items-center gap-3 mx-auto">
              <span>Let's Talk</span>
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-white rotate-[-45deg]" />
              </div>
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

