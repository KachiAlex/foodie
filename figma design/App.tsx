import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { FeaturedChefs } from "./components/FeaturedChefs";
import { PopularDishes } from "./components/PopularDishes";
import { CTASection } from "./components/CTASection";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <HowItWorks />
      <FeaturedChefs />
      <PopularDishes />
      <CTASection />
      <Footer />
    </div>
  );
}
