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
      <Link to="/" className="text-2xl font-bold text-orange-500 mb-6">
        Foodie Market
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
            <div className="flex flex-1 items-center justify-end gap-3">
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
                className="hidden md:flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-500 shadow-sm focus-within:ring-2 focus-within:ring-orange-500"
              >
                <Search className="h-4 w-4 shrink-0 text-gray-400" />
                <input
                  type="search"
                  value={dashSearch}
                  onChange={(e) => setDashSearch(e.target.value)}
                  placeholder="Search requests, chefs, orders..."
                  className="w-48 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                />
              </form>

              {/* Notification bell */}
              <div className="relative" ref={notifRef}>
                <button
                  className="relative shrink-0 rounded-full border border-gray-200 p-2 text-gray-600 transition hover:border-orange-200 hover:text-orange-500"
                  aria-label="Notifications"
                  onClick={() => setNotifOpen((v) => !v)}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-semibold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-900">Notifications</h4>
                        {unreadCount > 0 && (
                          <button onClick={handleReadAll} className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600">
                            <CheckCheck className="h-3 w-3" /> Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto space-y-2">
                        {notifications.length === 0 && (
                          <p className="py-6 text-center text-sm text-gray-400">No notifications yet</p>
                        )}
                        {notifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => handleRead(n.id)}
                            className={`flex w-full items-start gap-2 rounded-xl p-3 text-left transition ${n.read ? "bg-white hover:bg-gray-50" : "bg-orange-50 hover:bg-orange-100"}`}
                          >
                            <div className="mt-0.5">
                              {n.read ? (
                                <Check className="h-3.5 w-3.5 text-gray-400" />
                              ) : (
                                <span className="block h-2 w-2 rounded-full bg-orange-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm ${n.read ? "text-gray-600" : "font-semibold text-gray-900"}`}>{n.title}</p>
                              <p className="text-xs text-gray-500 line-clamp-2">{n.body}</p>
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
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white shadow-sm ring-2 ring-orange-100 transition hover:bg-orange-600"
                  aria-label="Account menu"
                >
                  {avatarLetter}
                </button>
                <AnimatePresence>
                  {avatarOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl"
                    >
                      <div className="mb-3 border-b pb-3">
                        <p className="text-sm font-semibold text-gray-900">{user?.name ?? "User"}</p>
                        <p className="text-xs text-gray-500">{user?.email ?? ""}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
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

          <main className="px-4 py-6 lg:px-10 lg:py-8 space-y-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
