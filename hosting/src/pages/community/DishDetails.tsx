import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";

export function DishDetails() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 pt-32 pb-20 sm:px-6 lg:px-8 text-center">
        <Link to="/community/vendor-market" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Market
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Dish Details</h1>
        <p className="mt-4 text-gray-600">Details for dish {id} are coming soon!</p>
        <Button asChild className="mt-8 bg-orange-500 hover:bg-orange-600">
          <Link to="/community/vendor-market">Return to Market</Link>
        </Button>
      </div>
    </div>
  );
}
