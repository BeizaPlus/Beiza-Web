import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import TributePage from "./pages/TributePage";
import Events from "./pages/Events";
import Memoirs from "./pages/Memoirs";
import BlogPosts from "./pages/BlogPosts";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import AdminApp from "./admin/AdminApp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/tribute/:id?" element={<TributePage />} />
          <Route path="/events" element={<Events />} />
          <Route path="/memoirs/:slug?" element={<Memoirs />} />
          <Route path="/blog" element={<BlogPosts />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/admin/*" element={<AdminApp />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;