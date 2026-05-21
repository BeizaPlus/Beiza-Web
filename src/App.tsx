import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LocaleProvider } from "@/context/LocaleContext";
import { StudioTextEditProvider } from "@/context/StudioTextEditContext";
import { SitePaddingStudioProvider } from "@/components/dev/SitePaddingStudio";
import { SeoManager } from "@/components/seo/SeoManager";
import { StudioTextEditToolbar } from "@/components/dev/StudioTextEditToolbar";
import RegionalRoutePage from "@/pages/regional/RegionalRoutePage";
import Landing from "./pages/Landing";
import WelcomeGate from "./pages/WelcomeGate";
import EducationPage from "./pages/Education";
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
import HeritageLegacyLanding from "./pages/HeritageLegacyLanding";
import FarewellHeritagePage from "./pages/Heritage";
import StoryQuestionsArticle from "./pages/education/StoryQuestionsArticle";
import RecoverPage from "./pages/Recover";
import FamilyTreesDirectoryPage from "./pages/family-trees/index";
import FamilyTreeEnterPage from "./pages/family-trees/enter";
import FamilyTreeCanvasPage from "./pages/family-trees/tree";
import CircleRecordPage from "./pages/family-trees/record";
import MemorySharePage from "./pages/MemoryShare";
import RecordRedirect from "./pages/RecordRedirect";
import { BEIZA_LINKS, BEIZA_REDIRECTS } from "@/lib/beizaMasterLinks";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LocaleProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <StudioTextEditProvider>
          <SitePaddingStudioProvider>
          <SeoManager />
          <StudioTextEditToolbar />
          <Routes>
          <Route path="/" element={<WelcomeGate />} />
          <Route path={BEIZA_LINKS.welcome.alias.slice(1)} element={<WelcomeGate />} />
          <Route path={BEIZA_LINKS.home.intentionalLegacy.slice(1)} element={<Landing />} />
          <Route path={BEIZA_LINKS.education.hub.slice(1)} element={<EducationPage />} />
          <Route path={BEIZA_LINKS.education.storyQuestions.slice(1)} element={<StoryQuestionsArticle />} />
          <Route path={BEIZA_REDIRECTS.gallery.from.slice(1)} element={<Navigate to={BEIZA_REDIRECTS.gallery.to} replace />} />
          <Route path={BEIZA_REDIRECTS.vault.from.slice(1)} element={<Navigate to={BEIZA_REDIRECTS.vault.to} replace />} />
          <Route path={BEIZA_LINKS.record.alias.slice(1)} element={<RecordRedirect />} />
          <Route path="/recover" element={<RecoverPage />} />
          <Route path="/circle" element={<FamilyTreesDirectoryPage />} />
          <Route path={BEIZA_REDIRECTS.familyTrees.from.slice(1)} element={<Navigate to={BEIZA_REDIRECTS.familyTrees.to} replace />} />
          <Route path="/circle/:id/enter" element={<FamilyTreeEnterPage />} />
          <Route path="/circle/:id/tree" element={<FamilyTreeCanvasPage />} />
          <Route path="/circle/:id/record" element={<CircleRecordPage />} />
          <Route path="/family-trees/:id/enter" element={<FamilyTreeEnterPage />} />
          <Route path="/family-trees/:id/tree" element={<FamilyTreeCanvasPage />} />
          <Route path="/family-trees/:id/record" element={<CircleRecordPage />} />
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
          <Route path="/memory/:token" element={<MemorySharePage />} />
          <Route path={BEIZA_LINKS.legacy.heritage.slice(1)} element={<HeritageLegacyLanding />} />
          <Route path={BEIZA_LINKS.farewell.heritage.slice(1)} element={<FarewellHeritagePage />} />
          <Route path="/fr/heritage" element={<RegionalRoutePage locale="fr" variant="legacy" />} />
          <Route path="/fr/farewell" element={<RegionalRoutePage locale="fr" variant="farewell" />} />
          <Route path="/fr/education" element={<RegionalRoutePage locale="fr" variant="education" />} />
          <Route path="/af/heritage" element={<RegionalRoutePage locale="africa" variant="legacy" />} />
          <Route path="/af/farewell" element={<RegionalRoutePage locale="africa" variant="farewell" />} />
          <Route path="/af/education" element={<RegionalRoutePage locale="africa" variant="education" />} />
          <Route path="/in/heritage" element={<RegionalRoutePage locale="indian" variant="legacy" />} />
          <Route path="/in/farewell" element={<RegionalRoutePage locale="indian" variant="farewell" />} />
          <Route path="/in/education" element={<RegionalRoutePage locale="indian" variant="education" />} />
          <Route path="/la/heritage" element={<RegionalRoutePage locale="latina" variant="legacy" />} />
          <Route path="/la/farewell" element={<RegionalRoutePage locale="latina" variant="farewell" />} />
          <Route path="/la/education" element={<RegionalRoutePage locale="latina" variant="education" />} />
          <Route path="/zh/heritage" element={<RegionalRoutePage locale="chinese" variant="legacy" />} />
          <Route path="/zh/farewell" element={<RegionalRoutePage locale="chinese" variant="farewell" />} />
          <Route path="/zh/education" element={<RegionalRoutePage locale="chinese" variant="education" />} />
          <Route path="/br/heritage" element={<RegionalRoutePage locale="brazilian" variant="legacy" />} />
          <Route path="/br/farewell" element={<RegionalRoutePage locale="brazilian" variant="farewell" />} />
          <Route path="/br/education" element={<RegionalRoutePage locale="brazilian" variant="education" />} />
          <Route path={BEIZA_REDIRECTS.whiteSwan.from.slice(1)} element={<Navigate to={BEIZA_REDIRECTS.whiteSwan.to} replace />} />
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
          </SitePaddingStudioProvider>
          </StudioTextEditProvider>
        </BrowserRouter>
      </TooltipProvider>
    </LocaleProvider>
  </QueryClientProvider>
);

export default App;