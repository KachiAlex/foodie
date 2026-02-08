import { Star, MapPin, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

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
      image: "https://images.unsplash.com/photo-1698854632975-7e7d37ecac69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXhpY2FuJTIwdGFjb3MlMjBzdHJlZXQlMjBmb29kfGVufDF8fHx8MTc3MDQ4MzA2Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      badge: "Top Rated"
    },
    {
      id: 2,
      name: "Chef Priya Patel",
      specialty: "Indian Delights",
      rating: 4.8,
      reviews: 189,
      distance: "2.5 miles",
      deliveryTime: "30-40 min",
      image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBjdXJyeSUyMGhvbWVtYWRlfGVufDF8fHx8MTc3MDQwMjQ3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      badge: "New"
    },
    {
      id: 3,
      name: "Tony Chen",
      specialty: "Asian Fusion",
      rating: 4.9,
      reviews: 312,
      distance: "0.8 miles",
      deliveryTime: "20-30 min",
      image: "https://images.unsplash.com/photo-1751809999364-4198daf71543?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGhvbWUlMjBjb29rZWQlMjBmb29kJTIwYm93bHxlbnwxfHx8fDE3NzA0ODMwNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      badge: "Popular"
    },
    {
      id: 4,
      name: "Emma Thompson",
      specialty: "Healthy Bowls",
      rating: 4.7,
      reviews: 156,
      distance: "1.5 miles",
      deliveryTime: "25-35 min",
      image: "https://images.unsplash.com/photo-1605034298551-baacf17591d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwc2FsYWQlMjBib3dsJTIwZnJlc2h8ZW58MXx8fHwxNzcwNDgzMDY2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      badge: "Healthy"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Home Chefs</h2>
            <p className="text-xl text-gray-600">
              Discover talented chefs in your neighborhood
            </p>
          </div>
          <Button variant="outline" className="hidden sm:block">
            View All Chefs
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {chefs.map((chef) => (
            <div
              key={chef.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
            >
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={chef.image}
                  alt={chef.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {chef.badge && (
                  <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {chef.badge}
                  </div>
                )}
              </div>
              
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{chef.name}</h3>
                  <p className="text-gray-600">{chef.specialty}</p>
                </div>

                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900">{chef.rating}</span>
                  <span className="text-gray-500">({chef.reviews})</span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{chef.distance}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{chef.deliveryTime}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Button variant="outline" className="w-full">
            View All Chefs
          </Button>
        </div>
      </div>
    </section>
  );
}
