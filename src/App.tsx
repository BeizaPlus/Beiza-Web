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
import OrderConfirmation from "./pages/OrderConfirmation";
import Download from "./pages/Download";
import NotFound from "./pages/NotFound";
import AdminApp from "./admin/AdminApp";
import { LegacyLayout } from "./components/legacy/LegacyLayout";
import LegacyHomePage from "./pages/legacy/index";
import LegacyRecordPage from "./pages/legacy/record";
import LegacyVaultPage from "./pages/legacy/vault";
import LegacyFamilyPage from "./pages/legacy/family";
import VaultExplore from "./pages/VaultExplore";
import PricingPage from "./pages/Pricing";

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
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/download" element={<Download />} />
          <Route path="/vault/explore" element={<VaultExplore />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/legacy" element={<LegacyLayout />}>
            <Route index element={<LegacyHomePage />} />
            <Route path="record" element={<LegacyRecordPage />} />
            <Route path="vault" element={<LegacyVaultPage />} />
            <Route path="family" element={<LegacyFamilyPage />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;