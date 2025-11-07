import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const TributePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-4">
            Memorial <em className="italic text-primary">Tribute</em>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            This page is under construction. Please check back later.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TributePage;
