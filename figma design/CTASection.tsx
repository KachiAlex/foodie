import { Button } from "./ui/button";
import { ChefHat, DollarSign, Calendar, TrendingUp } from "lucide-react";

export function CTASection() {
  const benefits = [
    {
      icon: DollarSign,
      title: "Earn Extra Income",
      description: "Set your own prices and schedule"
    },
    {
      icon: Calendar,
      title: "Flexible Hours",
      description: "Cook when it works for you"
    },
    {
      icon: TrendingUp,
      title: "Grow Your Business",
      description: "Build a loyal customer base"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-orange-500 to-amber-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <ChefHat className="w-5 h-5" />
              <span className="font-semibold">For Home Chefs & Vendors</span>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl font-bold">
                Turn Your Passion Into Profit
              </h2>
              <p className="text-xl text-white/90">
                Join hundreds of home chefs already earning money by sharing their 
                culinary talents. No restaurant overhead, just your amazing food.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-xl h-auto">
                Start Selling Today
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl h-auto"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Right Benefits Grid */}
          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-white/20 rounded-xl p-3">
                    <benefit.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                    <p className="text-white/80">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/30">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">$2,500+</div>
                <div className="text-white/90">Average monthly earnings for active chefs</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
