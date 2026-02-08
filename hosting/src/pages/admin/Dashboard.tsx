import { motion } from "framer-motion";
import { Activity, Briefcase, CheckCircle2, Shield, Users } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  adminMetrics,
  adminOrders,
  adminVendors,
  auditLog,
} from "@/data/mock";

export function AdminDashboard() {
  return (
    <DashboardLayout
      sidebar={{
        title: "Admin",
        nav: [
          { label: "Command Center", to: "/dashboard/admin", icon: <Activity className="h-4 w-4" /> },
          { label: "Orders", to: "/dashboard/admin?tab=orders", icon: <Briefcase className="h-4 w-4" /> },
          { label: "Vendors", to: "/dashboard/admin?tab=vendors", icon: <Users className="h-4 w-4" /> },
          { label: "Compliance", to: "/dashboard/admin?tab=compliance", icon: <Shield className="h-4 w-4" /> },
        ],
      }}
      title="Marketplace Control"
      description="Monitor fulfillment health, vendor trust, and escalations."
      actions={
        <div className="flex gap-2">
          <Button variant="outline">Download report</Button>
          <Button className="bg-orange-500 text-white">Trigger alert</Button>
        </div>
      }
    >
      <section className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {adminMetrics.map((metric) => (
            <motion.div
              key={metric.label}
              className="rounded-3xl bg-white p-6 shadow-sm"
              whileHover={{ y: -4 }}
            >
              <p className="text-sm text-gray-500">{metric.label}</p>
              <div className="mt-3 flex items-end justify-between">
                <h3 className="text-3xl font-semibold text-gray-900">{metric.value}</h3>
                <span className={`text-sm font-semibold ${metric.trend === "up" ? "text-green-600" : "text-red-500"}`}>
                  {metric.delta}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Orders</p>
                <h2 className="text-2xl font-semibold text-gray-900">Network performance</h2>
              </div>
              <Button variant="ghost" size="sm" className="text-orange-600">
                View all
              </Button>
            </div>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="pb-3">Order</th>
                    <th className="pb-3">Buyer</th>
                    <th className="pb-3">Vendor</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {adminOrders.map((order) => (
                    <tr key={order.id} className="text-gray-700">
                      <td className="py-3 font-semibold text-gray-900">{order.id}</td>
                      <td className="py-3">{order.buyer}</td>
                      <td className="py-3">{order.vendor}</td>
                      <td className="py-3 font-semibold">{order.amount}</td>
                      <td className="py-3">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Button variant="ghost" size="sm" className="text-orange-600">
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Vendor compliance</h3>
              <Button variant="ghost" size="sm">See queue</Button>
            </div>
            <div className="mt-4 space-y-4">
              {adminVendors.map((vendor) => (
                <div key={vendor.id} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{vendor.id}</p>
                      <h4 className="text-lg font-semibold text-gray-900">{vendor.name}</h4>
                      <p className="text-sm text-gray-500">{vendor.totalOrders} lifetime orders</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                          vendor.kycStatus === "Approved"
                            ? "bg-green-50 text-green-600"
                            : vendor.kycStatus === "Pending"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> {vendor.kycStatus}
                      </span>
                      <p className="mt-2 text-sm font-semibold text-gray-900">⭐ {vendor.rating}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Audit log</h3>
              <Button variant="ghost" size="sm">Export</Button>
            </div>
            <div className="mt-4 space-y-4">
              {auditLog.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-2xl border border-gray-100 p-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{entry.actor}</p>
                    <p className="text-sm text-gray-500">{entry.action}</p>
                    <p className="text-xs text-gray-400">{entry.target}</p>
                  </div>
                  <span className="text-xs text-gray-400">{entry.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 p-6 text-white">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Playbooks</p>
            <h3 className="mt-3 text-2xl font-semibold">Incident response hub</h3>
            <p className="mt-2 text-white/80">
              Access pre-approved refund scripts, vendor suspension guidelines, and dispute timelines.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                Open runbook
              </Button>
              <Button className="bg-white text-orange-600 hover:bg-white">
                Notify on-call
              </Button>
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
