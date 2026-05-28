import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Link } from "react-router-dom";

export function Hero() {
  const stats = [
    { label: "Home Chefs", value: "500+" },
    { label: "Happy Customers", value: "10k+" },
    { label: "Cuisines", value: "50+" },
  ];

  return (
    <section className="relative bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 pt-24 pb-16 overflow-hidden">
      <div className="absolute inset-y-0 -right-40 w-2/3 bg-orange-200/40 blur-3xl opacity-60" aria-hidden="true" />
      <div className="absolute -top-32 -left-10 h-72 w-72 rounded-full bg-white/60 blur-3xl" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Fresh Home-Cooked Meals
                <span className="text-orange-500"> Delivered</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-xl">
                Connect with talented home chefs in your neighborhood. Enjoy authentic,
                freshly prepared meals without restaurant markups.
              </p>
            </div>

            {/* Location Input */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter your delivery address"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
                />
              </div>
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg rounded-xl h-auto"
                asChild
              >
                <Link to="/dashboard/buyer">Find Food</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 pt-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1602016753553-6e4cce3587be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwY2hlZiUyMGNvb2tpbmclMjBmcmVzaCUyMG1lYWx8ZW58MXx8fHwxNzcwNDgzMDY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Home chef cooking"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent" />
            </div>
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6 max-w-xs">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Fresh & Quality</div>
                  <div className="text-lg font-bold text-gray-900">100% Verified Chefs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
