import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, BadgeCheck, UtensilsCrossed, MapPin, Share2, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/context/CurrencyContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { getVendorMarket } from "@/services/communityApi";
import type { CommunityVendor, CommunityMenuItem } from "@/services/communityApi";
import { RequestDishModal } from "./RequestDishModal";

export function VendorProfile() {
  const { id } = useParams();
  const { symbol } = useCurrency();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [vendor, setVendor] = useState<CommunityVendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<CommunityMenuItem | null>(null);

  useEffect(() => {
    setIsLoading(true);
    getVendorMarket()
      .then((vendors) => {
        const found = vendors.find((v) => v.id === id);
        if (found) setVendor(found);
        else showToast("Vendor not found");
      })
      .catch(() => showToast("Failed to load vendor profile"))
      .finally(() => setIsLoading(false));
  }, [id, showToast]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${vendor?.kitchenName} on Foodie Market`,
        text: `Check out ${vendor?.kitchenName}'s delicious home-cooked meals!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Not Found</h1>
        <Button asChild className="mt-4">
          <Link to="/community/vendor-market">Back to Market</Link>
        </Button>
      </div>
    );
  }

  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1664993101841-036f189719b6?w=900&q=80&auto=format&fit=crop";
  const mainImage = vendor.menuItems.find((m) => m.imageUrl)?.imageUrl || FALLBACK_IMAGE;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[40vh] w-full overflow-hidden">
        <img src={mainImage} className="h-full w-full object-cover" alt={vendor.kitchenName} />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8 w-full">
            <Link to="/community/vendor-market" className="mb-4 inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Market
            </Link>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-orange-500 flex items-center justify-center text-2xl font-bold text-white shadow-xl border-4 border-white/20">
                  {vendor.kitchenName[0].toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white">{vendor.kitchenName}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-white/90">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">{vendor.rating.toFixed(1)}</span>
                      <span className="text-white/60">({vendor.totalOrders} orders)</span>
                    </div>
                    {vendor.verified && <BadgeCheck className="h-4 w-4 text-blue-400" />}
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{vendor.city}, {vendor.state}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button onClick={handleShare} variant="secondary" className="gap-2 bg-white/10 text-white hover:bg-white/20 border-white/20 backdrop-blur-md">
                <Share2 className="h-4 w-4" /> Share Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Menu Items */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Kitchen Menu</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {vendor.menuItems.map((item) => (
                <motion.div
                  key={item.id}
                  layoutId={item.id}
                  className="rounded-3xl bg-white p-4 shadow-sm border border-gray-100 group"
                >
                  <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gray-100">
                    <img 
                      src={item.imageUrl || FALLBACK_IMAGE} 
                      className="h-full w-full object-cover transition-transform group-hover:scale-105" 
                      alt={item.name} 
                    />
                  </div>
                  <div className="mt-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <span className="text-lg font-bold text-orange-600">
                        {symbol}{Number(item.price).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.description || item.category}</p>
                    <Button 
                      className="mt-4 w-full bg-orange-500 hover:bg-orange-600"
                      onClick={() => setActiveItem(item)}
                    >
                      Request Dish
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 uppercase tracking-wider text-sm mb-4">About this Kitchen</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase">Specialties</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {vendor.specialties.map(s => (
                      <span key={s} className="px-3 py-1 bg-orange-50 rounded-full text-xs font-bold text-orange-600 border border-orange-100">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase">Kitchen Status</label>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${vendor.isOnline ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    <span className="text-sm font-semibold">{vendor.isOnline ? 'Active & Cooking' : 'Offline'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {activeItem && (
        <RequestDishModal
          vendor={vendor}
          item={activeItem}
          onClose={() => setActiveItem(null)}
        />
      )}
    </div>
  );
}
