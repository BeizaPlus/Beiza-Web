import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
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
import LegacyCirclePage from "./pages/legacy/circle";
import VaultExplore from "./pages/VaultExplore";
import PricingPage from "./pages/Pricing";
import HeritagePage from "./pages/Heritage";
import RecoverPage from "./pages/Recover";
import FamilyTreesDirectoryPage from "./pages/family-trees/index";
import FamilyTreeEnterPage from "./pages/family-trees/enter";
import FamilyTreeCanvasPage from "./pages/family-trees/tree";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/gallery" element={<Navigate to="/circle" replace />} />
          <Route path="/vault" element={<Navigate to="/legacy/vault" replace />} />
          <Route path="/record" element={<Navigate to="/legacy/record" replace />} />
          <Route path="/recover" element={<RecoverPage />} />
          <Route path="/circle" element={<FamilyTreesDirectoryPage />} />
          <Route path="/family-trees" element={<Navigate to="/circle" replace />} />
          <Route path="/circle/:id/enter" element={<FamilyTreeEnterPage />} />
          <Route path="/circle/:id/tree" element={<FamilyTreeCanvasPage />} />
          <Route path="/family-trees/:id/enter" element={<FamilyTreeEnterPage />} />
          <Route path="/family-trees/:id/tree" element={<FamilyTreeCanvasPage />} />
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
          <Route path="/heritage" element={<HeritagePage />} />
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/legacy" element={<LegacyLayout />}>
            <Route index element={<LegacyHomePage />} />
            <Route path="circle" element={<LegacyCirclePage />} />
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