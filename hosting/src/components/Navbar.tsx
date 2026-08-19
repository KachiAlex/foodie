import { ShoppingCart, ChefHat, Search, LogOut, Users, Menu, X as CloseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, signOut } = useAuth();
  const { orders } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const q = encodeURIComponent(searchQuery.trim());
      if (location.pathname.includes("/community/buyer-market")) {
        navigate(`/community/buyer-market?search=${q}`);
      } else if (location.pathname.includes("/community/vendor-market")) {
        navigate(`/community/vendor-market?search=${q}`);
      } else {
        navigate(`/community/vendor-market?search=${q}`);
      }
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 transition-all duration-300 ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link to="/" className="flex items-center">
              <img src="/logo.png" alt="Foodie Market" className="h-10 w-auto" />
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for dishes or chefs..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" className="hidden lg:flex items-center gap-2" asChild>
              <Link to="/community">
                <Users className="w-5 h-5" />
                <span>Community</span>
              </Link>
            </Button>
            <Button variant="ghost" className="hidden lg:flex items-center gap-2" asChild>
              <Link to="/dashboard/vendor">
                <ChefHat className="w-5 h-5" />
                <span>Become a Chef</span>
              </Link>
            </Button>
            {!user ? (
              <>
                <Button variant="ghost" className="hidden sm:flex" asChild>
                  <Link to="/auth/sign-in">Sign in</Link>
                </Button>
                <Button className="bg-orange-500 text-white shadow-lg shadow-orange-500/20" asChild>
                  <Link to="/auth/sign-up">Join</Link>
                </Button>
              </>
            ) : (
              <div className="relative">
                <button
                  className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-orange-300 transition-all bg-white"
                  onClick={() => setMenuOpen((prev) => !prev)}
                >
                  <span className="hidden md:inline">{user.name.split(" ")[0]}</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white text-sm font-bold shadow-sm">
                    {user.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-100 bg-white p-3 text-sm shadow-2xl z-[60]"
                    >
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1 px-2">Signed in as</p>
                      <p className="font-bold text-gray-900 px-2">{user.name}</p>
                      <p className="text-xs text-gray-500 mb-4 px-2 truncate">{user.email}</p>
                      <Link
                        to={`/dashboard/${user.role}`}
                        className="flex items-center justify-between rounded-xl bg-orange-50 px-3 py-2.5 text-orange-600 hover:bg-orange-100 transition-colors font-semibold"
                        onClick={() => setMenuOpen(false)}
                      >
                        Open hub
                        <ShoppingCart className="h-4 w-4" />
                      </Link>
                      <button
                        className="mt-2 flex w-full items-center gap-2 rounded-xl border border-transparent px-3 py-2.5 text-left text-gray-600 hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          setMenuOpen(false);
                          signOut();
                        }}
                      >
                        <LogOut className="h-4 w-4 text-red-500" /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            <Button variant="ghost" size="icon" className="relative group" asChild>
              <Link to="/dashboard/buyer" aria-label="Go to buyer dashboard">
                <ShoppingCart className="w-5 h-5 group-hover:text-orange-500 transition-colors" />
                {orders.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
                    {orders.length}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[45] lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-[50] lg:hidden flex flex-col p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <img src="/logo.png" alt="Foodie Market" className="h-8 w-auto" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>

              <nav className="space-y-2 flex-1">
                <Link
                  to="/community"
                  className="flex items-center gap-3 p-4 rounded-2xl text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all font-semibold"
                >
                  <Users className="w-5 h-5" />
                  <span>Food Community</span>
                </Link>
                <Link
                  to="/community/vendor-market"
                  className="flex items-center gap-3 p-4 rounded-2xl text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all font-semibold"
                >
                  <Search className="w-5 h-5" />
                  <span>Browse Market</span>
                </Link>
                <Link
                  to="/dashboard/vendor"
                  className="flex items-center gap-3 p-4 rounded-2xl text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all font-semibold"
                >
                  <ChefHat className="w-5 h-5" />
                  <span>Become a Chef</span>
                </Link>
                <Link
                  to="/community/circles"
                  className="flex items-center gap-3 p-4 rounded-2xl text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all font-semibold"
                >
                  <Users className="w-5 h-5 text-emerald-500" />
                  <span>Food Circles</span>
                </Link>
              </nav>

              <div className="mt-auto pt-6 border-t border-gray-100">
                {!user ? (
                  <div className="grid gap-3">
                    <Button variant="outline" className="rounded-2xl h-12" asChild>
                      <Link to="/auth/sign-in">Sign In</Link>
                    </Button>
                    <Button className="bg-orange-500 text-white rounded-2xl h-12 shadow-lg shadow-orange-500/20" asChild>
                      <Link to="/auth/sign-up">Get Started</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-4 rounded-3xl bg-gray-50">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button onClick={signOut} className="p-2 text-gray-400 hover:text-red-500">
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Search Bar Bottom (only on mobile) */}
      <div className="md:hidden border-t border-gray-100 bg-white/80 backdrop-blur-md px-4 py-3">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dishes or chefs..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
        </form>
      </div>
    </nav>
  );
}

