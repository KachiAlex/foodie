import { Heart, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function PopularDishes() {
  const dishes = [
    {
      id: 1,
      name: "Homemade Pasta Carbonara",
      chef: "Chef Isabella",
      price: 14.99,
      originalPrice: 18.99,
      image: "https://images.unsplash.com/photo-1767913338843-1ac3854e202e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWxpY2lvdXMlMjBob21lbWFkZSUyMHBhc3RhJTIwZGlzaHxlbnwxfHx8fDE3NzA0ODMwNjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      category: "Italian",
      isVegetarian: true
    },
    {
      id: 2,
      name: "Authentic Chicken Tikka Masala",
      chef: "Chef Priya",
      price: 12.99,
      originalPrice: null,
      image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBjdXJyeSUyMGhvbWVtYWRlfGVufDF8fHx8MTc3MDQwMjQ3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      category: "Indian",
      isVegetarian: false
    },
    {
      id: 3,
      name: "Fresh Poke Bowl",
      chef: "Chef Tony",
      price: 15.99,
      originalPrice: null,
      image: "https://images.unsplash.com/photo-1751809999364-4198daf71543?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGhvbWUlMjBjb29rZWQlMjBmb29kJTIwYm93bHxlbnwxfHx8fDE3NzA0ODMwNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      category: "Asian",
      isVegetarian: false
    },
    {
      id: 4,
      name: "Street-Style Tacos (3pc)",
      chef: "Chef Maria",
      price: 9.99,
      originalPrice: 12.99,
      image: "https://images.unsplash.com/photo-1698854632975-7e7d37ecac69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXhpY2FuJTIwdGFjb3MlMjBzdHJlZXQlMjBmb29kfGVufDF8fHx8MTc3MDQ4MzA2Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      category: "Mexican",
      isVegetarian: false
    },
    {
      id: 5,
      name: "Mediterranean Quinoa Bowl",
      chef: "Chef Emma",
      price: 11.99,
      originalPrice: null,
      image: "https://images.unsplash.com/photo-1605034298551-baacf17591d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwc2FsYWQlMjBib3dsJTIwZnJlc2h8ZW58MXx8fHwxNzcwNDgzMDY2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      category: "Healthy",
      isVegetarian: true
    },
    {
      id: 6,
      name: "Classic Margherita Pizza",
      chef: "Chef Marco",
      price: 13.99,
      originalPrice: null,
      image: "https://images.unsplash.com/photo-1767913338843-1ac3854e202e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWxpY2lvdXMlMjBob21lbWFkZSUyMHBhc3RhJTIwZGlzaHxlbnwxfHx8fDE3NzA0ODMwNjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      category: "Italian",
      isVegetarian: true
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Dishes Today</h2>
            <p className="text-xl text-gray-600">
              Freshly prepared meals you'll love
            </p>
          </div>
          <Button variant="outline" className="hidden sm:block">
            Explore All Dishes
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dishes.map((dish) => (
            <div
              key={dish.id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="relative h-56 overflow-hidden">
                <ImageWithFallback
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <button className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors">
                  <Heart className="w-5 h-5 text-gray-600" />
                </button>
                {dish.isVegetarian && (
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Vegetarian
                  </div>
                )}
              </div>
              
              <div className="p-5 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-orange-500 font-semibold">{dish.category}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{dish.name}</h3>
                  <p className="text-sm text-gray-600">by {dish.chef}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">${dish.price}</span>
                    {dish.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">${dish.originalPrice}</span>
                    )}
                  </div>
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-4">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Button variant="outline" className="w-full">
            Explore All Dishes
          </Button>
        </div>
      </div>
    </section>
  );
}
