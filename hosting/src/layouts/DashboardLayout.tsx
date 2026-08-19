import { useState, useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import { Menu, X, Bell, Search, LogOut, Check } from "lucide-react";
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
  actions?: ReactNode;
  children: ReactNode;
}

export function DashboardLayout({ sidebar, title, actions, children }: DashboardLayoutProps) {
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
    <div className="flex flex-col h-full relative z-10">
      <Link to="/" className="mb-8 inline-block group">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Foodie Market" className="h-8 w-auto brightness-0 invert" />
          <span className="text-white font-black tracking-tighter text-lg group-hover:text-orange-500 transition-colors">FOODIE</span>
        </div>
      </Link>
      <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500/80">
        {sidebar.title} Menu
      </p>
      <nav className="space-y-1">
        {sidebar.nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20 scale-[1.02]"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`
            }
            onClick={() => setOpen(false)}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-6 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0b10] selection:bg-orange-500/30">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-48 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="lg:grid lg:grid-cols-[260px_1fr] relative">
        {/* Desktop sidebar — dark */}
        <aside className="hidden lg:flex flex-col bg-[#0f1117] border-r border-white/5 px-6 py-8 min-h-screen sticky top-0 overflow-hidden">
          {SidebarContent}
        </aside>

        {/* Mobile sidebar */}
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
                onClick={() => setOpen(false)}
              />
              <motion.aside
                initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 z-[70] w-80 flex flex-col bg-[#0f1117] border-r border-white/10 px-6 py-8 lg:hidden shadow-2xl"
              >
                <div className="flex justify-end mb-4">
                  <button className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white" onClick={() => setOpen(false)}>
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {SidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-white/5 bg-[#0a0b10]/80 backdrop-blur-xl px-4 py-4 shadow-sm lg:px-10 transition-all">
            <div className="flex items-center gap-4">
              <button className="lg:hidden rounded-2xl border border-white/10 p-2.5 text-gray-400 hover:bg-white/5 hover:text-white transition-all" onClick={() => setOpen(true)}>
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-orange-500 font-black mb-0.5">{sidebar.title} HUB</p>
                <h1 className="text-xl font-black text-white leading-none tracking-tight">{title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <RoleToggle
                onRoleChange={(nextRole) => {
                  setRole(nextRole);
                  navigate(`/dashboard/${nextRole}`);
                }}
              />
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (dashSearch.trim()) {
                    const target = user?.role === "vendor" ? "/community/buyer-market" : "/community/vendor-market";
                    navigate(`${target}?search=${encodeURIComponent(dashSearch.trim())}`);
                  }
                }}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus-within:border-orange-500/50 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all duration-300"
              >
                <Search className="h-4 w-4 shrink-0 text-gray-500" />
                <input
                  type="search"
                  value={dashSearch}
                  onChange={(e) => setDashSearch(e.target.value)}
                  placeholder="Find dishes..."
                  className="w-24 sm:w-48 bg-transparent text-sm font-medium text-gray-200 placeholder:text-gray-500 focus:outline-none"
                />
              </form>

              {/* Notification bell */}
              <div className="relative" ref={notifRef}>
                <button
                  className="relative rounded-2xl border border-white/10 bg-white/5 p-2.5 text-gray-400 hover:border-orange-500/40 hover:text-orange-400 transition-all duration-300"
                  aria-label="Notifications"
                  onClick={() => setNotifOpen((v) => !v)}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1 text-[10px] font-black text-white ring-4 ring-[#0a0b10]">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.95 }}
                      className="absolute right-0 top-14 z-[60] w-80 sm:w-96 rounded-[2rem] border border-gray-100 bg-white p-5 shadow-2xl overflow-hidden"
                    >
                      <div className="mb-4 flex items-center justify-between px-1">
                        <h4 className="text-base font-black text-gray-900 tracking-tight">Notifications</h4>
                        {unreadCount > 0 && (
                          <button onClick={handleReadAll} className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-[28rem] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {notifications.length === 0 && (
                          <div className="py-12 text-center">
                            <div className="mx-auto w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                              <Bell className="w-6 h-6 text-gray-300" />
                            </div>
                            <p className="text-sm font-bold text-gray-400">All caught up!</p>
                          </div>
                        )}
                        {notifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => handleRead(n.id)}
                            className={`flex w-full items-start gap-4 rounded-2xl p-4 text-left transition-all duration-200 ${n.read ? "hover:bg-gray-50 opacity-70" : "bg-orange-50/50 hover:bg-orange-50 ring-1 ring-orange-100"}`}
                          >
                            <div className="mt-1 shrink-0">
                              {n.read ? <Check className="h-4 w-4 text-gray-300" /> : <div className="h-2.5 w-2.5 rounded-full bg-orange-500 shadow-lg shadow-orange-500/40" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm tracking-tight ${n.read ? "text-gray-600 font-medium" : "font-black text-gray-900"}`}>{n.title}</p>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed font-medium">{n.body}</p>
                              <p className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(n.createdAt).toLocaleDateString()}</p>
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
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-sm font-black text-white shadow-lg shadow-orange-500/20 hover:scale-105 transition-all active:scale-95"
                  aria-label="Account menu"
                >
                  {avatarLetter}
                </button>
                <AnimatePresence>
                  {avatarOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.95 }}
                      className="absolute right-0 top-14 z-[60] w-64 rounded-3xl border border-gray-100 bg-white p-4 shadow-2xl"
                    >
                      <div className="mb-3 p-4 rounded-2xl bg-gray-50 border border-gray-100/50">
                        <p className="text-sm font-black text-gray-900 tracking-tight">{user?.name ?? "User"}</p>
                        <p className="text-xs font-bold text-gray-500 truncate mt-0.5">{user?.email ?? ""}</p>
                      </div>
                      <div className="space-y-1">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-red-500 hover:bg-red-50 transition-all"
                        >
                          <LogOut className="h-4 w-4" /> Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {actions}
            </div>
          </header>

          <main className="flex-1 px-4 py-8 lg:px-12 lg:py-10 space-y-8 bg-transparent">{children}</main>
        </div>
      </div>
    </div>
  );
}
