import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Store } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/context/CurrencyContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { getVendorMarket } from "@/services/communityApi";
import type { CommunityVendor, CommunityMenuItem } from "@/services/communityApi";
import { RequestDishModal } from "./RequestDishModal";

export function VendorMarket() {
  const { symbol } = useCurrency();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [vendors, setVendors] = useState<CommunityVendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [activeVendor, setActiveVendor] = useState<CommunityVendor | null>(null);
  const [activeItem, setActiveItem] = useState<CommunityMenuItem | null>(null);

  useEffect(() => {
    setIsLoading(true);
    getVendorMarket()
      .then(setVendors)
      .catch(() => showToast("Failed to load vendor market"))
      .finally(() => setIsLoading(false));
  }, [showToast]);

  const categories = useMemo(
    () => Array.from(new Set(vendors.flatMap((v) => v.menuItems.map((i) => i.category)))),
    [vendors]
  );

  const filteredVendors = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vendors
      .map((vendor) => ({
        ...vendor,
        menuItems: vendor.menuItems.filter((item) => {
          const matchesCategory = !category || item.category === category;
          const matchesSearch =
            !q ||
            item.name.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            vendor.kitchenName.toLowerCase().includes(q);
          return matchesCategory && matchesSearch;
        }),
      }))
      .filter((vendor) => vendor.menuItems.length > 0);
  }, [vendors, search, category]);

  const openRequest = (vendor: CommunityVendor, item: CommunityMenuItem) => {
    if (!user) {
      showToast("Sign in to request a dish");
      return;
    }
    if (user.role !== "buyer") {
      showToast("Only buyers can request dishes");
      return;
    }
    setActiveVendor(vendor);
    setActiveItem(item);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 pt-28 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vendor Market</h1>
            <p className="mt-1 text-gray-600">Browse dishes from verified home chefs and request what you crave.</p>
          </div>
          <Button variant="outline" asChild>
            <a href="/community">Back to Food Community</a>
          </Button>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes, cuisines, or kitchens"
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-gray-500" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-3xl bg-gray-200" />
            ))}
          </div>
        )}

        {!isLoading && filteredVendors.length === 0 && (
          <div className="mt-12 rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <Store className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-4 text-sm font-semibold text-gray-600">No dishes match your search</p>
            <p className="text-xs text-gray-400">Try a different keyword or category.</p>
          </div>
        )}

        <div className="mt-8 space-y-12">
          {filteredVendors.map((vendor) => (
            <div key={vendor.id} className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{vendor.kitchenName}</h2>
                  <p className="text-sm text-gray-500">
                    {vendor.city || vendor.state ? [vendor.city, vendor.state].filter(Boolean).join(", ") : vendor.user.email}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    vendor.isOnline ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {vendor.isOnline ? "Online" : "Offline"}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {vendor.menuItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-gray-100 p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400">No image</div>
                      )}
                    </div>
                    <div className="mt-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <span className="shrink-0 text-sm font-semibold text-gray-900">
                          {symbol}{Number(item.price).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">{item.description || item.category}</p>
                      <Button
                        size="sm"
                        className="mt-3 w-full bg-orange-500 text-white hover:bg-orange-600"
                        onClick={() => openRequest(vendor, item)}
                      >
                        Request dish
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {activeItem && activeVendor && (
        <RequestDishModal
          vendor={activeVendor}
          item={activeItem}
          onClose={() => {
            setActiveItem(null);
            setActiveVendor(null);
          }}
        />
      )}
    </div>
  );
}
