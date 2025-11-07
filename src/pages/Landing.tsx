import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { AboutSection } from "@/components/AboutSection";
import { TributesSection } from "@/components/TributesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { Footer } from "@/components/Footer";

const Landing = () => {
  // Hero background image from Framer - using a placeholder, replace with actual image
  const heroBackgroundImage = "https://framerusercontent.com/images/ZwPzi3XEJV1BavrysIhb7QSOE0.jpg?width=4680&height=3120";

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <Hero
        headline="Crafting Meaningful Farewells"
        paragraph="We believe farewells are not the end — they're the final chapter of love. Every ceremony, every detail, every design is our way of saying: Thank you for a life well lived!"
        ctaText="Create a Memoir"
        ctaLink="/contact"
        reviews="100+ Positive Client Reviews"
        backgroundImage={heroBackgroundImage}
        showReviews={true}
      />

      {/* About/Offerings Section */}
      <AboutSection />

      {/* Tributes Section */}
      <TributesSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Landing;
