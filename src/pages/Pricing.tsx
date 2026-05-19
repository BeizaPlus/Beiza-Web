import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { LegacyCurationPricing } from "@/components/landing/LegacyCurationPricing";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="pt-8">
        <LegacyCurationPricing />
      </main>
      <Footer />
    </div>
  );
}
