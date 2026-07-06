import { useState, useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import { Menu, X, Bell, Search, LogOut, Check, CheckCheck } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRole } from "@/context/RoleContext";
import { RoleToggle } from "@/components/RoleToggle";
import { useAuth } from "@/context/AuthContext";
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from "@/services/notificationApi";
import type { Notification } from "@/services/notificationApi";

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
  const [dashSearch, setDashSearch] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const { setRole } = useRole();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const notifRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const loadNotifications = useCallback(async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {
      // silent
    }
  };

  const handleReadAll = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silent
    }
  };

  const handleLogout = () => {
    signOut();
    navigate("/auth/sign-in", { replace: true });
  };

  const avatarLetter = user?.name?.charAt(0).toUpperCase() ?? "?";

  const SidebarContent = (
    <div className="flex flex-col h-full">
      <Link to="/" className="mb-8 inline-block">
        <img src="/logo.png" alt="Foodie Market" className="h-8 w-auto brightness-0 invert" />
      </Link>
      <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
        {sidebar.title} Menu
      </p>
      <nav className="space-y-1">
        {sidebar.nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                  : "text-gray-400 hover:bg-white/10 hover:text-white"
              }`
            }
            onClick={() => setOpen(false)}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-6 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <div className="lg:grid lg:grid-cols-[240px_1fr]">
        {/* Desktop sidebar — dark */}
        <aside className="hidden lg:flex flex-col bg-gray-950 px-5 py-6 min-h-screen sticky top-0">
          {SidebarContent}
        </aside>

        {/* Mobile sidebar */}
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                onClick={() => setOpen(false)}
              />
              <motion.aside
                initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 left-0 z-40 w-72 flex flex-col bg-gray-950 px-5 py-6 lg:hidden"
              >
                <button className="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" /> Close
                </button>
                {SidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/10 bg-[#0f1117]/90 backdrop-blur-md px-4 py-3 shadow-sm lg:px-8">
            <div className="flex items-center gap-3">
              <button className="lg:hidden rounded-xl border border-white/20 p-2 text-gray-300 hover:bg-white/10" onClick={() => setOpen(true)}>
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-orange-400 font-semibold">{sidebar.title}</p>
                <h1 className="text-lg font-bold text-white leading-tight">{title}</h1>
                {description && <p className="hidden lg:block text-xs text-gray-400 mt-0.5">{description}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <RoleToggle
                onRoleChange={(nextRole) => {
                  setRole(nextRole);
                  navigate(`/dashboard/${nextRole}`);
                }}
              />
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (dashSearch.trim()) navigate(`/dashboard/buyer?search=${encodeURIComponent(dashSearch.trim())}`);
                }}
                className="hidden md:flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm focus-within:border-orange-500/60 focus-within:ring-2 focus-within:ring-orange-500/20 transition"
              >
                <Search className="h-4 w-4 shrink-0 text-gray-400" />
                <input
                  type="search"
                  value={dashSearch}
                  onChange={(e) => setDashSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-40 bg-transparent text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none"
                />
              </form>

              {/* Notification bell */}
              <div className="relative" ref={notifRef}>
                <button
                  className="relative rounded-xl border border-white/15 p-2 text-gray-400 hover:border-orange-500/50 hover:text-orange-400 transition"
                  aria-label="Notifications"
                  onClick={() => setNotifOpen((v) => !v)}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-900">Notifications</h4>
                        {unreadCount > 0 && (
                          <button onClick={handleReadAll} className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600">
                            <CheckCheck className="h-3 w-3" /> Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto space-y-1.5">
                        {notifications.length === 0 && (
                          <p className="py-8 text-center text-sm text-gray-400">No notifications yet</p>
                        )}
                        {notifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => handleRead(n.id)}
                            className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition ${n.read ? "hover:bg-gray-50" : "bg-orange-50 hover:bg-orange-100"}`}
                          >
                            <div className="mt-1 shrink-0">
                              {n.read ? <Check className="h-3.5 w-3.5 text-gray-300" /> : <span className="block h-2 w-2 rounded-full bg-orange-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm truncate ${n.read ? "text-gray-600" : "font-semibold text-gray-900"}`}>{n.title}</p>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{n.body}</p>
                              <p className="mt-1 text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Avatar */}
              <div className="relative" ref={avatarRef}>
                <button
                  onClick={() => setAvatarOpen((v) => !v)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-sm font-bold text-white shadow-sm hover:bg-orange-600 transition"
                  aria-label="Account menu"
                >
                  {avatarLetter}
                </button>
                <AnimatePresence>
                  {avatarOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl"
                    >
                      <div className="mb-3 pb-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900">{user?.name ?? "User"}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email ?? ""}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {actions}
            </div>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 space-y-6 bg-[#0f1117]">{children}</main>
        </div>
      </div>
    </div>
  );
}
