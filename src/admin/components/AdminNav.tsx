import { NavLink } from "react-router-dom";
import { BookOpen, CalendarDays, Images, LayoutDashboard, ListChecks, Megaphone, Settings, Users, DollarSign, FileText, Package, ShoppingCart, RefreshCw, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";

const navItems = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/memoirs", label: "Memoirs", icon: BookOpen },
  { to: "/admin/blog-posts", label: "Blog Posts", icon: FileText },
  { to: "/admin/content-library", label: "Content Library", icon: Images },
  { to: "/admin/settings", label: "Site Settings", icon: Settings },
  { to: "/admin/offerings", label: "Offerings", icon: ListChecks },
  { to: "/admin/pricing", label: "Pricing", icon: DollarSign },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquare },
  { to: "/admin/users", label: "Users & Roles", icon: Users },
  { to: "/admin/products", label: "Shopify Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/shopify-sync", label: "Shopify Sync", icon: RefreshCw },
  { to: "/admin/ads", label: "Ads & Sponsorships", icon: Megaphone },
];

const signOut = async () => {
  if (!supabase)
  {
    return;
  }
  await supabase.auth.signOut();
};

export const AdminNav = () => {
  const { session } = useSupabaseSession();
  const userEmail = session?.user?.email ?? "Unknown user";

  return (
    <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white px-5 py-8 shadow-sm lg:flex">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Beiza Studio</p>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">Admin Console</h1>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${isActive
                ? "admin-keep-white bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 space-y-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Signed in as</p>
          <p className="mt-1 text-sm font-medium text-slate-700">{userEmail}</p>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
};

