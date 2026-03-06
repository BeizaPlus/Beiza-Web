import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { BookOpen, CalendarDays, Images, LayoutDashboard, ListChecks, Megaphone, Settings, Users, DollarSign, FileText, Package, ShoppingCart, RefreshCw, MessageSquare, PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react";
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

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("adminSidebarCollapsed");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("adminSidebarCollapsed", isCollapsed.toString());
  }, [isCollapsed]);

  return (
    <aside
      className={`hidden flex-col border-r border-slate-200 bg-white py-8 shadow-sm transition-all duration-300 lg:flex ${isCollapsed ? "w-[88px] items-center px-4" : "w-72 px-5"
        }`}
    >
      <div className={`mb-8 flex w-full ${isCollapsed ? "justify-center" : "items-center justify-between"}`}>
        {!isCollapsed && (
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Beiza Studio</p>
            <h1 className="mt-1 text-lg font-semibold text-slate-900">Admin Console</h1>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 w-full flex flex-col items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition w-full ${isCollapsed ? "justify-center px-0" : ""
              } ${isActive
                ? "admin-keep-white bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`
            }
          >
            <item.icon className={`shrink-0 ${isCollapsed ? "h-5 w-5" : "h-4 w-4"}`} />
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 space-y-3 w-full">
        {!isCollapsed && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Signed in as</p>
            <p className="mt-1 text-sm font-medium text-slate-700 truncate">{userEmail}</p>
          </div>
        )}
        <button
          type="button"
          onClick={signOut}
          title={isCollapsed ? "Sign out" : undefined}
          className={`flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 ${isCollapsed ? "px-0 py-3" : ""
            }`}
        >
          {isCollapsed ? <LogOut className="h-5 w-5" /> : "Sign out"}
        </button>
      </div>
    </aside>
  );
};

