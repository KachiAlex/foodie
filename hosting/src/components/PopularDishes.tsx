import { useState } from "react";
import { Heart, ArrowRight, Flame } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const ALL_DISHES = [
  { id: 1, name: "Homemade Pasta Carbonara", chef: "Chef Isabella", price: 14.99, originalPrice: 18.99, image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80&auto=format&fit=crop", category: "Italian", isVegetarian: true, hot: false },
  { id: 2, name: "Chicken Tikka Masala", chef: "Chef Priya", price: 12.99, originalPrice: null, image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80&auto=format&fit=crop", category: "Indian", isVegetarian: false, hot: true },
  { id: 3, name: "Fresh Poke Bowl", chef: "Chef Tony", price: 15.99, originalPrice: null, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80&auto=format&fit=crop", category: "Asian", isVegetarian: false, hot: true },
  { id: 4, name: "Street-Style Tacos (3pc)", chef: "Chef Maria", price: 9.99, originalPrice: 12.99, image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80&auto=format&fit=crop", category: "Mexican", isVegetarian: false, hot: false },
  { id: 5, name: "Mediterranean Quinoa Bowl", chef: "Chef Emma", price: 11.99, originalPrice: null, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80&auto=format&fit=crop", category: "Healthy", isVegetarian: true, hot: false },
  { id: 6, name: "Margherita Pizza", chef: "Chef Marco", price: 13.99, originalPrice: null, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80&auto=format&fit=crop", category: "Italian", isVegetarian: true, hot: true },
];

const TABS = ["All", "Italian", "Indian", "Asian", "Mexican", "Healthy"];

function FavBtn({ dishId }: { dishId: number }) {
  const [fav, setFav] = useState(() => localStorage.getItem(`fav_${dishId}`) === "1");
  return (
    <button
      onClick={(e) => { e.stopPropagation(); const n = !fav; setFav(n); localStorage.setItem(`fav_${dishId}`, n ? "1" : ""); }}
      className="absolute top-3 right-3 rounded-full bg-black/40 p-2 backdrop-blur-sm hover:bg-black/60 transition-colors"
      aria-label="Toggle favourite"
    >
      <Heart className={`h-4 w-4 ${fav ? "fill-red-500 text-red-500" : "text-white"}`} />
    </button>
  );
}

export function PopularDishes() {
  const { symbol } = useCurrency();
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? ALL_DISHES : ALL_DISHES.filter((d) => d.category === active);

  return (
    <section className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <motion.p className="text-sm font-bold uppercase tracking-widest text-orange-500 mb-3" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              Today's Menu
            </motion.p>
            <motion.h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              Popular Dishes
            </motion.h2>
          </div>
          <Link to="/dashboard/buyer" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
            Explore All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-10">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                active === tab
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid */}
        <AnimatePresence mode="popLayout">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((dish, i) => (
              <motion.div
                key={dish.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="relative h-52 overflow-hidden">
                  <img src={dish.image} alt={dish.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent" />
                  <FavBtn dishId={dish.id} />
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    {dish.isVegetarian && <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-white">Veg</span>}
                    {dish.hot && <span className="flex items-center gap-0.5 rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white"><Flame className="h-3 w-3" />Hot</span>}
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-1">{dish.category}</p>
                  <h3 className="text-base font-bold text-gray-900 mb-0.5 line-clamp-1">{dish.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">by {dish.chef}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-extrabold text-gray-900">{symbol}{dish.price}</span>
                      {dish.originalPrice && <span className="text-sm text-gray-400 line-through">{symbol}{dish.originalPrice}</span>}
                    </div>
                    <Link
                      to="/dashboard/buyer"
                      className="rounded-full bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20"
                    >
                      Order
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        <div className="mt-8 sm:hidden text-center">
          <Link to="/dashboard/buyer" className="inline-flex items-center gap-2 text-sm font-semibold text-orange-500">
            Explore All Dishes <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
