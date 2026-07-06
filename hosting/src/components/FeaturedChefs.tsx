import { Star, MapPin, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const BADGE_COLORS: Record<string, string> = {
  "Top Rated": "bg-orange-500",
  "New": "bg-blue-500",
  "Popular": "bg-purple-500",
  "Healthy": "bg-emerald-500",
};

export function FeaturedChefs() {
  const chefs = [
    {
      id: 1,
      name: "Maria Garcia",
      specialty: "Mexican Cuisine",
      rating: 4.9,
      reviews: 234,
      distance: "1.2 miles",
      deliveryTime: "25-35 min",
      image: "https://images.unsplash.com/photo-1698854632975-7e7d37ecac69?w=600&q=80&auto=format&fit=crop",
      badge: "Top Rated",
    },
    {
      id: 2,
      name: "Chef Priya Patel",
      specialty: "Indian Delights",
      rating: 4.8,
      reviews: 189,
      distance: "2.5 miles",
      deliveryTime: "30-40 min",
      image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80&auto=format&fit=crop",
      badge: "New",
    },
    {
      id: 3,
      name: "Tony Chen",
      specialty: "Asian Fusion",
      rating: 4.9,
      reviews: 312,
      distance: "0.8 miles",
      deliveryTime: "20-30 min",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80&auto=format&fit=crop",
      badge: "Popular",
    },
    {
      id: 4,
      name: "Emma Thompson",
      specialty: "Healthy Bowls",
      rating: 4.7,
      reviews: 156,
      distance: "1.5 miles",
      deliveryTime: "25-35 min",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80&auto=format&fit=crop",
      badge: "Healthy",
    },
  ];

  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
          <div>
            <motion.p
              className="text-sm font-bold uppercase tracking-widest text-orange-500 mb-3"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            >
              Hand-Picked
            </motion.p>
            <motion.h2
              className="text-4xl sm:text-5xl font-extrabold text-gray-900"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            >
              Featured Home Chefs
            </motion.h2>
          </div>
          <Link
            to="/dashboard/buyer"
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
          >
            View All Chefs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {chefs.map((chef, i) => (
            <motion.div
              key={chef.id}
              className="group rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.08 * i }}
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={chef.image}
                  alt={chef.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent" />
                {chef.badge && (
                  <span className={`absolute top-3 left-3 ${BADGE_COLORS[chef.badge]} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                    {chef.badge}
                  </span>
                )}
                <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-sm px-2 py-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-bold text-white">{chef.rating}</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{chef.name}</h3>
                  <p className="text-sm text-orange-500 font-medium">{chef.specialty}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-700">{chef.rating}</span>
                  <span>({chef.reviews} reviews)</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-orange-400" />{chef.distance}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-orange-400" />{chef.deliveryTime}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 sm:hidden text-center">
          <Link
            to="/dashboard/buyer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600"
          >
            View All Chefs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
