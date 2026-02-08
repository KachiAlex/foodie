import { useState } from "react";
import type { ReactNode } from "react";
import { Menu, X, Bell, Search } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useRole } from "@/context/RoleContext";
import { RoleToggle } from "@/components/RoleToggle";

interface DashboardLayoutProps {
  sidebar: {
    title: string;
    nav: { label: string; to: string; icon: ReactNode }[];
  };
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function DashboardLayout({ sidebar, title, description, actions, children }: DashboardLayoutProps) {
  const [open, setOpen] = useState(false);
  const { role, setRole } = useRole();
  const navigate = useNavigate();

  const SidebarContent = (
    <div className="flex flex-col h-full">
      <Link to="/" className="text-2xl font-bold text-orange-500 mb-6">
        HomePlate
      </Link>
      <nav className="space-y-1">
        {sidebar.nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive ? "bg-orange-100 text-orange-600" : "text-gray-600 hover:bg-gray-100"
              }`
            }
            onClick={() => setOpen(false)}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="lg:grid lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block border-r bg-white px-6 py-8 min-h-screen">{SidebarContent}</aside>

        {/* Mobile sidebar */}
        <motion.aside
          initial={false}
          animate={{ x: open ? 0 : "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-y-0 left-0 z-40 w-72 border-r bg-white px-6 py-8 lg:hidden"
        >
          <button className="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-500" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" /> Close
          </button>
          {SidebarContent}
        </motion.aside>

        <div className="flex flex-col">
          <header className="flex flex-col gap-4 border-b bg-white px-4 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between lg:px-10">
            <div className="flex items-center gap-4">
              <button className="lg:hidden rounded-full border p-2 text-gray-600" onClick={() => setOpen(true)}>
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{sidebar.title}</p>
                <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
                {description && <p className="text-sm text-gray-500">{description}</p>}
              </div>
            </div>
            <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
              <RoleToggle
                onRoleChange={(nextRole) => {
                  setRole(nextRole);
                  navigate(`/dashboard/${nextRole}`);
                }}
              />
              <div className="hidden md:flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-500 shadow-sm focus-within:ring-2 focus-within:ring-orange-500">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search requests, chefs, orders..."
                  className="w-48 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                />
              </div>
              <button className="relative rounded-full border border-gray-200 p-2 text-gray-600 transition hover:border-orange-200 hover:text-orange-500">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-500 text-[10px] font-semibold text-white">3</span>
              </button>
              {actions}
            </div>
          </header>

          <main className="px-4 py-6 lg:px-10 lg:py-8 space-y-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
