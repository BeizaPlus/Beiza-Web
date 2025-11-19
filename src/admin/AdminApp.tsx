import { lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { AdminLayout } from "./components/AdminLayout";
import { SignIn } from "./pages/SignIn";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Memoirs = lazy(() => import("./pages/Memoirs"));
const MemoirEditor = lazy(() => import("./pages/MemoirEditor"));
const BlogPosts = lazy(() => import("./pages/BlogPosts"));
const BlogPostEditor = lazy(() => import("./pages/BlogPostEditor"));
const ContentLibrary = lazy(() => import("./pages/ContentLibrary"));
const Testimonials = lazy(() => import("./pages/Testimonials"));
const Offerings = lazy(() => import("./pages/Offerings"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Events = lazy(() => import("./pages/Events"));
const Settings = lazy(() => import("./pages/Settings"));
const Users = lazy(() => import("./pages/Users"));
const Products = lazy(() => import("./pages/Products"));
const Orders = lazy(() => import("./pages/Orders"));
const ShopifySync = lazy(() => import("./pages/ShopifySync"));
const Ads = lazy(() => import("./pages/Ads"));

const LoadingView = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-6 py-4">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm uppercase tracking-[0.3em] text-white/70">Loading admin...</span>
    </div>
  </div>
);

export const AdminApp = () => {
  const { session, loading } = useSupabaseSession();

  if (loading)
  {
    return <LoadingView />;
  }

  if (!session)
  {
    return <SignIn />;
  }

  return (
    <AdminLayout>
      <Suspense fallback={<LoadingView />}>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="memoirs">
            <Route index element={<Memoirs />} />
            <Route path="new" element={<MemoirEditor />} />
            <Route path=":slug" element={<MemoirEditor />} />
          </Route>
          <Route path="blog-posts">
            <Route index element={<BlogPosts />} />
            <Route path="new" element={<BlogPostEditor />} />
            <Route path=":slug" element={<BlogPostEditor />} />
          </Route>
          <Route path="events" element={<Events />} />
          <Route path="content-library" element={<ContentLibrary />} />
          <Route path="settings" element={<Settings />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="offerings" element={<Offerings />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="users" element={<Users />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="shopify-sync" element={<ShopifySync />} />
          <Route path="ads" element={<Ads />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
      </Suspense>
    </AdminLayout>
  );
};

export default AdminApp;

