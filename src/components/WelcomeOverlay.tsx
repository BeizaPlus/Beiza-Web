import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

interface WelcomeOverlayProps {
  onDismiss: () => void;
}

export const WelcomeOverlay = ({ onDismiss }: WelcomeOverlayProps) => {
  const [mousePos, setMousePos] = useState({ x: -142, y: -142 });
  const [isVisible, setIsVisible] = useState(false);
  const welcomeRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Handle mouse movement for gradient
  const handleMouseMove = (event: React.MouseEvent) => {
    if (mousePos.x === -142)
    {
      setMousePos({ x: event.clientX, y: event.clientY });
    }
    if (welcomeRef.current)
    {
      const rect = welcomeRef.current.getBoundingClientRect();
      setMousePos({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
  };

  // Handle wheel to dismiss
  const handleWheel = (event: React.WheelEvent) => {
    if (event.deltaY > 0)
    {
      dismiss();
    }
  };

  // Handle keyboard events
  const handleKeydown = (event: KeyboardEvent) => {
    if (["Enter", " ", "Tab", "Escape"].includes(event.key))
    {
      event.preventDefault();
      dismiss();
    }
  };

  const dismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
    }, 300); // Match animation duration
  };

  const navigateToPage = (path: string) => {
    dismiss();
    setTimeout(() => {
      navigate(path);
    }, 300);
  };

  // Show overlay after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);

    document.addEventListener("keydown", handleKeydown);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  if (!isVisible && mousePos.x === -142) return null;

  return (
    <div
      ref={welcomeRef}
      className={`fixed inset-0 z-50 flex flex-col justify-between items-center px-4 sm:px-6 overflow-y-auto transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
      style={{
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Mouse-following gradient */}
      {mousePos.x !== -142 && (
        <div
          className="absolute w-[360px] h-[360px] rounded-full opacity-60 pointer-events-none"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(
              circle at center,
              hsl(45 93% 47%) 0,
              hsl(45 80% 35%) 20%,
              hsl(30 100% 50%) 40%,
              hsl(0 0% 0%) 100%
            )`,
          }}
        />
      )}

      {/* Header */}
      <div className="py-8 z-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img
            src="/Head.svg"
            alt="Beiza Plus"
            className="h-12 w-auto"
          />
          <img
            src="/Beiza_White.svg"
            alt="Beiza Plus"
            className="h-8 w-auto"
          />
        </div>
        <p className="sm:text-xl text-white/80">
          <button
            onClick={() => navigateToPage('/services')}
            className="hover:text-primary transition-colors"
          >
            services
          </button>
          <span className="mx-1.5">|</span>
          <button
            onClick={() => navigateToPage('/gallery')}
            className="hover:text-primary transition-colors"
          >
            gallery
          </button>
          <span className="mx-1.5">|</span>
          <button
            onClick={() => navigateToPage('/contact')}
            className="hover:text-primary transition-colors"
          >
            contact
          </button>
        </p>
      </div>

      {/* Main tagline */}
      <div className="text-center z-10">
        <p className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif text-white leading-tight">
          <span>Preserving <span className="italic text-primary">memories</span></span>
          <br />
          <span>with <span className="font-serif">dignity</span> and <span className="italic text-primary">care</span></span>
        </p>
        <p className="text-lg md:text-xl text-white/70 mt-6 max-w-3xl mx-auto">
          Creating meaningful memorial experiences through digital tributes, photo books, and legacy archives
        </p>
      </div>

      {/* CTA Button */}
      <div className="py-10 z-10">
        <Button
          onClick={dismiss}
          className="rounded-full px-8 py-4 bg-primary text-primary-foreground text-xl hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-xl"
        >
          Explore Our Services
          <ChevronDown className="w-6 h-6 ml-2" />
        </Button>
      </div>
    </div>
  );
};

