import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LocaleProvider } from "@/context/LocaleContext";
import { LayoutStudioProvider } from "@/context/LayoutStudioContext";
import { StudioTextEditProvider } from "@/context/StudioTextEditContext";
import { SitePaddingStudioProvider } from "@/components/dev/SitePaddingStudio";
import { SeoManager } from "@/components/seo/SeoManager";
import RegionalRoutePage from "@/pages/regional/RegionalRoutePage";
import Landing from "./pages/Landing";
import WelcomeGate from "./pages/WelcomeGate";
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
import {
  BEIZA_LINKS,
  BEIZA_REDIRECTS,
  REGIONAL_PREFIX_LOCALES,
  REGIONAL_ROUTE_VARIANTS,
  regionalAppRoutePath,
  regionalEducationCulturalImmersionPath,
  routerPath,
} from "@/lib/beizaMasterLinks";

const queryClient = new QueryClient();

const circleBase = routerPath(BEIZA_LINKS.circle.directory);
const familyTreesBase = routerPath(BEIZA_LINKS.circle.familyTreesAlias);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LocaleProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <LayoutStudioProvider>
          <StudioTextEditProvider>
          <SitePaddingStudioProvider>
          <SeoManager />
          <Routes>
          <Route path="/" element={<WelcomeGate />} />
          <Route path={routerPath(BEIZA_LINKS.welcome.alias)} element={<WelcomeGate />} />
          <Route path={routerPath(BEIZA_LINKS.home.educationHome)} element={<Landing />} />
          <Route
            path={routerPath(BEIZA_REDIRECTS.educationCulturalImmersion.from)}
            element={<Navigate to={BEIZA_REDIRECTS.educationCulturalImmersion.to} replace />}
          />
          {REGIONAL_PREFIX_LOCALES.map((locale) => (
            <Route
              key={`${locale}-education-redirect`}
              path={routerPath(regionalEducationCulturalImmersionPath(locale))}
              element={<Navigate to={BEIZA_LINKS.home.educationHome} replace />}
            />
          ))}
          <Route path={routerPath(BEIZA_LINKS.education.storyQuestions)} element={<StoryQuestionsArticle />} />
          <Route path={routerPath(BEIZA_REDIRECTS.gallery.from)} element={<Navigate to={BEIZA_REDIRECTS.gallery.to} replace />} />
          <Route path={routerPath(BEIZA_REDIRECTS.vault.from)} element={<Navigate to={BEIZA_REDIRECTS.vault.to} replace />} />
          <Route path={routerPath(BEIZA_LINKS.record.alias)} element={<RecordRedirect />} />
          <Route path={routerPath(BEIZA_LINKS.marketing.recover)} element={<RecoverPage />} />
          <Route path={circleBase} element={<FamilyTreesDirectoryPage />} />
          <Route path={routerPath(BEIZA_REDIRECTS.familyTrees.from)} element={<Navigate to={BEIZA_REDIRECTS.familyTrees.to} replace />} />
          <Route path={`${circleBase}/:id/enter`} element={<FamilyTreeEnterPage />} />
          <Route path={`${circleBase}/:id/tree`} element={<FamilyTreeCanvasPage />} />
          <Route path={`${circleBase}/:id/record`} element={<CircleRecordPage />} />
          <Route path={`${familyTreesBase}/:id/enter`} element={<FamilyTreeEnterPage />} />
          <Route path={`${familyTreesBase}/:id/tree`} element={<FamilyTreeCanvasPage />} />
          <Route path={`${familyTreesBase}/:id/record`} element={<CircleRecordPage />} />
          <Route path={routerPath(BEIZA_LINKS.marketing.contact)} element={<Contact />} />
          <Route path={`${routerPath(BEIZA_LINKS.tribute.base)}/:id?`} element={<TributePage />} />
          <Route path={routerPath(BEIZA_LINKS.marketing.events)} element={<Events />} />
          <Route path={`${routerPath(BEIZA_LINKS.marketing.memoirs)}/:slug?`} element={<Memoirs />} />
          <Route path={routerPath(BEIZA_LINKS.marketing.blog)} element={<BlogPosts />} />
          <Route path={`${routerPath(BEIZA_LINKS.marketing.blog)}/:slug`} element={<BlogPost />} />
          <Route path={routerPath(BEIZA_LINKS.marketing.orderConfirmation)} element={<OrderConfirmation />} />
          <Route path={routerPath(BEIZA_LINKS.marketing.download)} element={<Download />} />
          <Route path={routerPath(BEIZA_LINKS.marketing.vaultExplore)} element={<VaultExplore />} />
          <Route path={routerPath(BEIZA_LINKS.marketing.pricing)} element={<PricingPage />} />
          <Route path="memory/:token" element={<MemorySharePage />} />
          <Route path={routerPath(BEIZA_LINKS.legacy.heritage)} element={<HeritageLegacyLanding />} />
          <Route path={routerPath(BEIZA_LINKS.farewell.heritage)} element={<FarewellHeritagePage />} />
          {REGIONAL_PREFIX_LOCALES.flatMap((locale) =>
            REGIONAL_ROUTE_VARIANTS.map((variant) => (
              <Route
                key={`${locale}-${variant}`}
                path={routerPath(regionalAppRoutePath(locale, variant))}
                element={<RegionalRoutePage locale={locale} variant={variant} />}
              />
            )),
          )}
          <Route path={routerPath(BEIZA_REDIRECTS.whiteSwan.from)} element={<Navigate to={BEIZA_REDIRECTS.whiteSwan.to} replace />} />
          <Route path={`${routerPath(BEIZA_LINKS.admin.base)}/*`} element={<AdminApp />} />
          <Route path={routerPath(BEIZA_LINKS.legacy.app)} element={<LegacyLayout />}>
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
          </LayoutStudioProvider>
        </BrowserRouter>
      </TooltipProvider>
    </LocaleProvider>
  </QueryClientProvider>
);

export default App;
