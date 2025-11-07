import { motion } from "framer-motion";

interface Testimonial {
  text: string;
  author: string;
  avatar?: string;
}

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
}

const defaultTestimonials: Testimonial[] = [
  {
    text: "Beiza made our farewell feel like art. Every detail — from the biography to the ceremony — felt deeply personal and graceful. It gave us peace.",
    author: "Ama Mensah, Daughter",
    avatar: "https://framerusercontent.com/images/CD3L3PqkdrNUHs06U58RQxOMo.png?scale-down-to=512",
  },
];

export const TestimonialsSection = ({ testimonials = defaultTestimonials }: TestimonialsSectionProps) => {
  const testimonial = testimonials[0]; // Show first testimonial only

  return (
    <section className="py-20 md:py-32 bg-white text-black" style={{ padding: '160px 40px' }}>
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-primary"
                  style={{ color: 'rgb(245, 182, 20)' }}
                >
                  <path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    fill="currentColor"
                  />
                </svg>
              ))}
            </div>

            {/* Testimonial Text */}
            <p className="text-xl md:text-2xl text-black font-manrope leading-relaxed mb-6">
              "{testimonial.text}"
            </p>

            {/* Author */}
            <p className="text-lg text-black font-manrope font-medium mb-6">
              {testimonial.author}
            </p>

            {/* Avatars - Below the text */}
            {testimonial.avatar && (
              <div className="flex justify-center gap-3 mt-8">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

