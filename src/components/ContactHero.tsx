import { motion } from "framer-motion";
import { Phone, Mail, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface ContactHeroProps {
  formData?: {
    name: string;
    email: string;
    phone: string;
    service: string;
    message: string;
  };
  handleInputChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit?: (e: React.FormEvent) => void;
}

export const ContactHero = ({ formData, handleInputChange, handleSubmit }: ContactHeroProps) => {
  return (
    <header className="relative w-full bg-black text-white py-20 md:py-32 min-h-screen flex items-center" id="hero">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-manrope font-medium text-white mb-6">
              <span className="hidden md:block" style={{ fontSize: '72px', lineHeight: '70px' }}>
                Let's get in touch
              </span>
              <span className="md:hidden" style={{ fontSize: '49px', lineHeight: '50px' }}>
                Let's get in touch
              </span>
            </h1>
          </motion.div>

          {/* Paragraph */}
          <motion.p
            className="text-lg md:text-xl text-white mb-8 font-manrope leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Ready to create something truly timeless?<br />
            Reach out and let's craft a farewell or legacy experience made just for you.
          </motion.p>

          {/* Divider Line */}
          <motion.div
            className="w-24 h-0.5 bg-white/30 mx-auto my-12"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          />

          {/* Contact Info */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {/* Phone */}
            <div className="flex items-center gap-3">
              <Phone className="w-6 h-6 text-white" />
              <a
                href="tel:+123456789"
                className="text-lg font-manrope text-white hover:text-white/80 transition-colors"
              >
                +123456789
              </a>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-white" />
              <a
                href="mailto:info@example.com"
                className="text-lg font-manrope text-white hover:text-white/80 transition-colors"
              >
                info@example.com
              </a>
            </div>
          </motion.div>

          {/* Form - Desktop only (hidden on mobile) */}
          {formData && handleInputChange && handleSubmit && (
            <div className="hidden md:block mt-16">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name and Email Row */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name-desktop" className="block text-sm font-manrope font-medium text-white mb-2">
                        Name
                      </label>
                      <Input
                        id="name-desktop"
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
                      <label htmlFor="email-desktop" className="block text-sm font-manrope font-medium text-white mb-2">
                        Email
                      </label>
                      <Input
                        id="email-desktop"
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
                      <label htmlFor="phone-desktop" className="block text-sm font-manrope font-medium text-white mb-2">
                        Phone <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <Input
                        id="phone-desktop"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black font-manrope focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="+123456789"
                      />
                    </div>
                    <div>
                      <label htmlFor="service-desktop" className="block text-sm font-manrope font-medium text-white mb-2">
                        Packages <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <select
                        id="service-desktop"
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
                    <label htmlFor="message-desktop" className="block text-sm font-manrope font-medium text-white mb-2">
                      Message
                    </label>
                    <Textarea
                      id="message-desktop"
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
          )}
        </div>
      </div>
    </header>
  );
};

