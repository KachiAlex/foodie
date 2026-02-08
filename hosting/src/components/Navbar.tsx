import { ShoppingCart, User, ChefHat, Search, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        isScrolled ? "bg-white/90 backdrop-blur-xl border-white/40 shadow-lg" : "bg-white/70 backdrop-blur-md border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold text-gray-900">Foodie Market</span>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for dishes or chefs..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden sm:flex items-center gap-2" asChild>
              <Link to="/dashboard/vendor">
                <ChefHat className="w-5 h-5" />
                <span>Become a Chef</span>
              </Link>
            </Button>
            {!user ? (
              <>
                <Button variant="ghost" className="hidden lg:flex" asChild>
                  <Link to="/auth/sign-in">Sign in</Link>
                </Button>
                <Button className="hidden lg:flex bg-orange-500 text-white" asChild>
                  <Link to="/auth/sign-up">Join Foodie Market</Link>
                </Button>
              </>
            ) : (
              <div className="relative">
                <button
                  className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-orange-300"
                  onClick={() => setMenuOpen((prev) => !prev)}
                >
                  <span className="hidden md:inline">{user.name.split(" ")[0]}</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white text-sm font-bold">
                    {user.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-gray-100 bg-white p-3 text-sm shadow-xl">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Signed in as</p>
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 mb-3">{user.email}</p>
                    <Link
                      to={`/dashboard/${user.role}`}
                      className="flex items-center justify-between rounded-xl bg-orange-50 px-3 py-2 text-orange-600 hover:bg-orange-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      Open {user.role} hub
                      <ShoppingCart className="h-4 w-4" />
                    </Link>
                    <button
                      className="mt-3 flex w-full items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-left text-gray-600 hover:border-gray-300"
                      onClick={() => {
                        setMenuOpen(false);
                        signOut();
                      }}
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link to="/dashboard/buyer" aria-label="Go to buyer dashboard">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard/admin" aria-label="Admin console">
                <User className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for dishes or chefs..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
