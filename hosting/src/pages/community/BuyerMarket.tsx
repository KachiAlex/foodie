import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { ClipboardList, ArrowRight, User } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function BuyerMarket() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "buyer") {
      navigate("/dashboard/buyer", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 pt-28 pb-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100"
          >
            <ClipboardList className="h-8 w-8 text-orange-600" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-3xl font-bold text-gray-900 sm:text-4xl"
          >
            Buyer Market
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-4 max-w-2xl text-gray-600"
          >
            Post a food brief and let home chefs bid for your order. You choose the best price, chef, and delivery time.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mx-auto mt-12 max-w-2xl rounded-3xl bg-white p-8 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-gray-900">How it works</h2>
          <ol className="mt-4 space-y-4 text-gray-600">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">1</span>
              <span>Describe the meal you want, your budget, and when you need it.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">2</span>
              <span>Verified vendors submit bids with their price and prep time.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">3</span>
              <span>Pick your favorite bid, pay securely into escrow, and enjoy your meal.</span>
            </li>
          </ol>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {user ? (
              <Button className="flex-1 bg-orange-500 text-white" asChild>
                <Link to="/dashboard/buyer">
                  Go to buyer dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button className="flex-1 bg-orange-500 text-white" asChild>
                  <Link to="/auth/sign-up">
                    <User className="mr-2 h-4 w-4" /> Sign up to post a request
                  </Link>
                </Button>
                <Button variant="outline" className="flex-1 border-gray-200 text-gray-700" asChild>
                  <Link to="/community">Back to Food Community</Link>
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
