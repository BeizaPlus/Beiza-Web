import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ContactHero } from "@/components/ContactHero";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      service: "",
      message: ""
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      {/* Hero Section with Form (Desktop) */}
      <ContactHero
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
      />

      {/* Contact Form - Mobile only */}
      <main className="md:hidden py-16 bg-black">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name and Email Row */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-manrope font-medium text-white mb-2">
                      Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black font-manrope focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Jane Smith"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-manrope font-medium text-white mb-2">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black font-manrope focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="example@example.com"
                    />
                  </div>
                </div>

                {/* Phone and Packages Row */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-manrope font-medium text-white mb-2">
                      Phone <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black font-manrope focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="+123456789"
                    />
                  </div>
                  <div>
                    <label htmlFor="service" className="block text-sm font-manrope font-medium text-white mb-2">
                      Packages <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black font-manrope focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      <option value="Lite">Lite</option>
                      <option value="Standard">Standard</option>
                      <option value="Signature">Signature</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-manrope font-medium text-white mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black font-manrope focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                    placeholder="I'm planning a farewell and would love guidance on the right package."
                  />
                </div>

                {/* Submit Button */}
                <div>
                  <Button
                    type="submit"
                    className="bg-white text-black hover:bg-white/90 rounded-full px-8 py-4 text-lg font-manrope font-medium h-auto border-0 w-full flex items-center justify-center gap-3"
                    style={{ color: 'rgba(0, 0, 0, 0.8)' }}
                  >
                    <span>Submit form</span>
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-white rotate-[-45deg]" />
                    </div>
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Testimonials Section */}
      <TestimonialsSection />

      <Footer />
    </div>
  );
};

export default ContactPage;
