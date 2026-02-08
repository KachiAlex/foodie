import { motion } from "framer-motion";
import { ClipboardList, Leaf, Settings, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  menuItems,
  vendorMetrics,
  vendorOpenRequests,
  vendorOrders,
} from "@/data/mock";

const statusColumns = ["New", "Cooking", "Ready", "Delivered"] as const;

export function VendorDashboard() {
  return (
    <DashboardLayout
      sidebar={{
        title: "Vendor",
        nav: [
          { label: "Overview", to: "/dashboard/vendor", icon: <Sparkles className="h-4 w-4" /> },
          { label: "Requests", to: "/dashboard/vendor?tab=requests", icon: <ClipboardList className="h-4 w-4" /> },
          { label: "Menu", to: "/dashboard/vendor?tab=menu", icon: <Leaf className="h-4 w-4" /> },
          { label: "Settings", to: "/dashboard/vendor?tab=settings", icon: <Settings className="h-4 w-4" /> },
        ],
      }}
      title="Chef Command Hub"
      description="Bid on custom requests, manage orders, and showcase your menu."
      actions={
        <div className="flex gap-2">
          <Button variant="outline">Pause Orders</Button>
          <Button className="bg-orange-500 text-white">Add Menu Item</Button>
        </div>
      }
    >
      <section className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {vendorMetrics.map((metric) => (
            <motion.div
              key={metric.label}
              className="rounded-3xl bg-white p-5 shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-sm text-gray-500">{metric.label}</p>
              <h3 className="text-3xl font-semibold text-gray-900">{metric.value}</h3>
              <p className={`text-sm font-semibold ${metric.trend === "up" ? "text-green-600" : "text-red-500"}`}>{metric.change}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Open Requests</p>
                <h2 className="text-2xl font-semibold text-gray-900">Bid marketplace</h2>
              </div>
              <Button variant="ghost" size="sm" className="text-orange-600">
                View filters
              </Button>
            </div>
            <div className="mt-6 space-y-4">
              {vendorOpenRequests.map((request) => (
                <div key={request.id} className="rounded-2xl border border-gray-200 p-4 lg:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-500">{request.id}</p>
                      <h3 className="text-xl font-semibold text-gray-900">{request.title}</h3>
                      <p className="text-sm text-gray-500">{request.location} • {request.servings}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Budget</p>
                      <p className="text-xl font-bold text-gray-900">{request.budget}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-600">{request.deadline}</span>
                    {request.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-gray-100 px-3 py-1">{tag}</span>
                    ))}
                    <Button size="sm" className="ml-auto bg-orange-500 text-white">Submit bid</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Menu Highlights</h3>
              <Button variant="ghost" size="sm">Manage</Button>
            </div>
            <div className="mt-4 space-y-4">
              {menuItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.availability}</p>
                    </div>
                    <span className="text-xl font-semibold text-gray-900">{item.price}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-gray-100 px-2 py-1">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Orders pipeline</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Sync courier</Button>
              <Button size="sm" className="bg-orange-500 text-white">Print prep list</Button>
            </div>
          </div>
          <div className="mt-6 grid gap-4 overflow-x-auto text-sm md:grid-cols-4">
            {statusColumns.map((status) => (
              <div key={status} className="rounded-2xl bg-gray-50 p-4">
                <div className="flex items-center justify-between text-gray-600">
                  <span className="font-semibold">{status}</span>
                  <span className="text-xs">{
                    vendorOrders.filter((order) => order.status === status).length
                  } orders</span>
                </div>
                <div className="mt-4 space-y-3">
                  {vendorOrders
                    .filter((order) => order.status === status)
                    .map((order) => (
                      <div key={order.id} className="rounded-xl bg-white p-3 shadow-sm">
                        <p className="text-xs text-gray-400">{order.id}</p>
                        <h4 className="text-sm font-semibold text-gray-900">{order.customer}</h4>
                        <p className="text-xs text-gray-500">{order.items}</p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
