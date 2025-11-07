import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

export const AboutSection = () => {
  return (
    <section className="py-20 md:py-32 bg-white text-black" id="about">
      <div className="container mx-auto px-6">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="mb-6">
            <span
              className="inline-block px-4 py-2 rounded-lg font-manrope font-medium"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderRadius: '10px',
                color: 'rgb(245, 182, 20)', // Framer primary color
                fontSize: '14px',
                fontWeight: 500,
                letterSpacing: '-0.02em',
                lineHeight: '1.4em'
              }}
            >
              Offerings
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-manrope font-medium text-black mb-6 leading-tight">
            We design meaningful farewells — handcrafted tributes that celebrate life, culture, and legacy.
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-600 mb-8 font-manrope leading-relaxed">
            Every ceremony, every detail, every design is our way of saying: Thank you for a life well lived!
          </p>

          {/* CTA Button */}
          <Link to="/contact">
            <Button className="bg-black text-white hover:bg-gray-900 rounded-full px-8 py-4 text-lg font-manrope font-medium h-auto border-0">
              <span>Let's Talk</span>
              <div className="ml-3 w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-black rotate-[-45deg]" />
              </div>
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

