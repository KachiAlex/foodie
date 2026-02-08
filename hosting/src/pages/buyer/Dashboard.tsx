import { motion } from "framer-motion";
import { Bell, Plus, Quote, Search, Star } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  buyerOrders,
  buyerRequests,
  featuredVendors,
} from "@/data/mock";

export function BuyerDashboard() {
  return (
    <DashboardLayout
      sidebar={{
        title: "Buyer",
        nav: [
          { label: "Overview", to: "/dashboard/buyer", icon: <Quote className="h-4 w-4" /> },
          { label: "Requests", to: "/dashboard/buyer?tab=requests", icon: <Plus className="h-4 w-4" /> },
          { label: "Orders", to: "/dashboard/buyer?tab=orders", icon: <Bell className="h-4 w-4" /> },
        ],
      }}
      title="Buyer Control Center"
      description="Coordinate custom food requests, bids, and direct orders."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Search className="h-4 w-4" /> Find Vendors
          </Button>
          <Button className="gap-2 bg-orange-500 text-white">
            <Plus className="h-4 w-4" /> New Request
          </Button>
        </div>
      }
    >
      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Live Requests</p>
                <h2 className="text-2xl font-semibold text-gray-900">Your open bids</h2>
              </div>
              <Button variant="ghost" size="sm" className="text-orange-600">
                Manage
              </Button>
            </div>
            <div className="mt-6 space-y-4">
              {buyerRequests.map((request) => (
                <motion.div
                  key={request.id}
                  className="rounded-2xl border border-gray-200 p-4 lg:p-5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-500">{request.id}</p>
                      <h3 className="text-xl font-semibold text-gray-900">{request.title}</h3>
                      <p className="text-sm text-gray-500">{request.cuisine} • {request.portionType} • {request.servings} servings</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Budget</p>
                      <p className="text-2xl font-bold text-gray-900">${request.budget}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-600">{request.status.replace("_", " ")}</span>
                    <span>{request.deliveryWindow}</span>
                    <span>{request.bids} bids</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Orders</p>
                <h2 className="text-2xl font-semibold text-gray-900">Current deliveries</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {buyerOrders.map((order) => (
                <motion.div
                  key={order.id}
                  className="rounded-2xl border border-gray-200 p-5"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{order.id}</p>
                      <h3 className="text-lg font-semibold text-gray-900">{order.chef}</h3>
                      <p className="text-sm text-gray-500">{order.dishes}</p>
                    </div>
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">{order.status}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                    <span>ETA: {order.eta}</span>
                    <span className="text-lg font-bold text-gray-900">${order.amount}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Featured Vendors</h3>
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </div>
            <div className="mt-4 space-y-4">
              {featuredVendors.map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between rounded-2xl border border-gray-100 p-4">
                  <div>
                    <p className="text-sm text-gray-500">{vendor.specialty}</p>
                    <h4 className="text-lg font-semibold text-gray-900">{vendor.name}</h4>
                    <p className="text-sm text-gray-500">{vendor.distance} away</p>
                  </div>
                  <div className="flex items-center gap-1 text-orange-500">
                    <Star className="h-4 w-4 fill-orange-500" />
                    <span className="font-semibold text-gray-900">{vendor.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 p-6 text-white">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Need something specific?</p>
            <h3 className="mt-3 text-2xl font-semibold">Connect with a food concierge</h3>
            <p className="mt-2 text-white/80">Share portion sizes, dietary needs, and delivery logistics—we will route to verified chefs.</p>
            <Button variant="outline" className="mt-4 border-white text-white hover:bg-white/10">
              Talk to concierge
            </Button>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
