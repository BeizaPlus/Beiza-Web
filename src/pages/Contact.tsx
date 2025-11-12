import { useMemo, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/framer/SectionHeader";
import { TestimonialsCarousel, type Testimonial } from "@/components/framer/TestimonialsCarousel";
import { CTAButton } from "@/components/framer/CTAButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { useContactChannels, useTestimonials, useSiteSettings } from "@/hooks/usePublicContent";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const { data: contactChannels } = useContactChannels();
  const { data: contactTestimonials } = useTestimonials("contact");
  const { data: siteSettings } = useSiteSettings();

  const channels = useMemo(() => {
    // First try to get from contact_channels table
    const phoneChannel = contactChannels?.find((channel) => channel.channelType === "phone");
    const emailChannel = contactChannels?.find((channel) => channel.channelType === "email");
    const externalChannel = contactChannels?.find((channel) => channel.channelType === "external");

    // Fallback to site_settings if not found in contact_channels
    return {
      phone: phoneChannel ?? {
        id: "site-settings-phone",
        channelType: "phone",
        label: "Phone",
        value: siteSettings?.phonePrimary ?? "",
      },
      email: emailChannel ?? {
        id: "site-settings-email",
        channelType: "email",
        label: "Email",
        value: siteSettings?.emailPrimary ?? "",
      },
      external: externalChannel ?? {
        id: "site-settings-calendly",
        channelType: "external",
        label: "Book a discovery call",
        value: siteSettings?.calendlyUrl ?? "",
      },
    };
  }, [contactChannels, siteSettings]);

  const testimonialsList = useMemo(() => {
    return contactTestimonials?.filter((item) => item.surfaces.includes("contact")) ?? [];
  }, [contactTestimonials]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Form submitted:", formData);
    setFormData({ name: "", email: "", phone: "", service: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="space-y-24 pb-24 pt-32 lg:space-y-32 lg:pb-32">
        <section className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-10">
              <SectionHeader
                eyebrow="Contact"
                title="Let's create a celebration that feels like them"
                description="Tell us about the tribute you have in mind — we’ll craft a roadmap, timeline, and experience that honours your loved one."
              />

              <div className="glass-panel flex flex-col gap-6 rounded-3xl border border-white/10 p-6 md:p-8">
                <div className="flex items-center gap-4">
                  <span className="ring-background flex h-12 w-12 items-center justify-center rounded-full text-white">
                    <Phone className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-subtle">{channels.phone.label}</p>
                    <a href={`tel:${channels.phone.value}`} className="text-lg font-medium text-white transition hover:text-white/80">
                      {channels.phone.value}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="ring-background flex h-12 w-12 items-center justify-center rounded-full text-white">
                    <Mail className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-subtle">{channels.email.label}</p>
                    <a
                      href={`mailto:${channels.email.value}`}
                      className="text-lg font-medium text-white transition hover:text-white/80"
                    >
                      {channels.email.value}
                    </a>
                  </div>
                </div>

                <CTAButton href={channels.external.value} external label={channels.external.label ?? "Book a discovery call"} className="bg-primary text-black" />
              </div>
            </div>

            <div className="glass-panel rounded-[32px] border border-white/10 p-6 shadow-glass md:p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="text-sm uppercase tracking-[0.3em] text-subtle">
                      Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Adwoa Mensah"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="mt-2 bg-white text-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="text-sm uppercase tracking-[0.3em] text-subtle">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="hello@family.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="mt-2 bg-white text-black"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="phone" className="text-sm uppercase tracking-[0.3em] text-subtle">
                      Phone <span className="text-subtle lowercase">(optional)</span>
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+233 20 000 0000"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-2 bg-white text-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="service" className="text-sm uppercase tracking-[0.3em] text-subtle">
                      Package <span className="text-subtle lowercase">(optional)</span>
                    </label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select…</option>
                      <option value="Lite">Lite</option>
                      <option value="Standard">Standard</option>
                      <option value="Signature">Signature</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="text-sm uppercase tracking-[0.3em] text-subtle">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us about the loved one, the story, and the moments you want preserved."
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="mt-2 bg-white text-black"
                  />
                </div>

                <button type="submit" className="button-pill w-full justify-center">
                  <span>Submit form</span>
                  <span className="ring-background flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
                    <ArrowRight className="h-4 w-4 -rotate-45" />
                  </span>
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6">
          <SectionHeader
            eyebrow="Kind Words"
            title="Families who reached out"
            description="We craft every experience with empathy, rhythm, and respect — these notes remind us why."
            align="center"
          />
          <TestimonialsCarousel testimonials={testimonialsList} className="mt-12" />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
