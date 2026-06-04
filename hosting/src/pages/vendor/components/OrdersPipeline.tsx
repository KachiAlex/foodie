import { Button } from "@/components/ui/button";
import { useToast } from "@/context/ToastContext";
import type { VendorOrderStage } from "@/types/domain";

const statusColumns = ["New", "Cooking", "Ready", "Delivered"] as const;
const NEXT_STATUS: Partial<Record<typeof statusColumns[number], typeof statusColumns[number]>> = {
  New: "Cooking",
  Cooking: "Ready",
  Ready: "Delivered",
};

interface OrdersPipelineProps {
  orders: VendorOrderStage[];
  promotingOrders: Set<string>;
  onPromote: (orderId: string, nextStatus: typeof statusColumns[number]) => void;
}

export function OrdersPipeline({ orders, promotingOrders, onPromote }: OrdersPipelineProps) {
  const { showToast } = useToast();

  const handleSyncCourier = () => {
    showToast("Courier sync requested — riders will be notified shortly.");
  };

  const handlePrintPrepList = () => {
    if (orders.length === 0) {
      showToast("No orders to print.");
      return;
    }
    window.print();
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Orders pipeline</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSyncCourier}>Sync courier</Button>
          <Button size="sm" className="bg-orange-500 text-white" onClick={handlePrintPrepList}>Print prep list</Button>
        </div>
      </div>
      <div className="mt-6 grid gap-4 overflow-x-auto text-sm md:grid-cols-4">
        {statusColumns.map((status) => {
          const columnOrders = orders.filter((o) => o.status === status);
          return (
            <div key={status} className="rounded-2xl bg-gray-50 p-4">
              <div className="flex items-center justify-between text-gray-600">
                <span className="font-semibold">{status}</span>
                <span className="text-xs">{columnOrders.length} orders</span>
              </div>
              <div className="mt-4 space-y-3">
                {columnOrders.length === 0 && (
                  <p className="rounded-xl border border-dashed border-gray-200 py-6 text-center text-xs text-gray-400">
                    No orders
                  </p>
                )}
                {columnOrders.map((order) => {
                  const nextStatus = NEXT_STATUS[status];
                  const isPromoting = promotingOrders.has(order.id);
                  return (
                    <div key={order.id} className="rounded-xl bg-white p-3 shadow-sm">
                      <p className="text-xs text-gray-400">{order.id}</p>
                      <h4 className="text-sm font-semibold text-gray-900">{order.customer}</h4>
                      <p className="text-xs text-gray-500">{order.items}</p>
                      {nextStatus && (
                        <button
                          type="button"
                          disabled={isPromoting}
                          onClick={() => onPromote(order.id, nextStatus)}
                          className="mt-2 w-full rounded-lg bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-100 disabled:opacity-50"
                        >
                          {isPromoting ? "Moving…" : `→ ${nextStatus}`}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
