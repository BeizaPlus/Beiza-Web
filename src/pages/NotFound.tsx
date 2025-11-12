import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { CTAButton } from "@/components/framer/CTAButton";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="flex min-h-[calc(100vh-200px)] items-center justify-center px-6 py-24">
        <div className="glass-panel flex max-w-2xl flex-col items-center gap-8 rounded-[32px] border border-white/10 p-12 text-center md:p-16">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-8xl font-bold text-white/20 md:text-9xl">404</span>
            </div>
            <h1 className="text-display-md font-semibold text-white md:text-display-lg">Page Not Found</h1>
            <p className="max-w-md text-base text-subtle leading-relaxed md:text-lg">
              The page you're looking for doesn't exist or has been moved. Let's help you find your way back.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <CTAButton to="/" label="Return Home" icon={<Home className="h-4 w-4" />} className="bg-white text-black hover:bg-white/90" />
            <CTAButton
              to="/memoirs"
              label="Browse Memoirs"
              icon={<ArrowLeft className="h-4 w-4" />}
              className="bg-white/15 text-white hover:bg-white/25"
            />
          </div>

          <div className="mt-8 space-y-2 text-sm text-white/50">
            <p>You tried to access:</p>
            <code className="block rounded-lg bg-white/5 px-4 py-2 font-mono text-xs text-white/70">{location.pathname}</code>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
