import { CheckCircle2, RefreshCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/ToastContext";

interface ChecklistItem {
  label: string;
  detail: string;
  complete: boolean;
}

interface KitchenReadinessCardProps {
  checklistItems: ChecklistItem[];
  checklistProgress: number;
}

export function KitchenReadinessCard({ checklistItems, checklistProgress }: KitchenReadinessCardProps) {
  const { showToast } = useToast();
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Kitchen readiness</p>
          <h3 className="text-2xl font-semibold text-gray-900">Keep trust signals fresh</h3>
          <p className="text-xs text-gray-500">Compliance score 92%</p>
        </div>
        <div className="text-right">
          <ShieldCheck className="ml-auto h-6 w-6 text-emerald-500" />
          <p className="mt-1 text-xs font-semibold text-emerald-600">{checklistProgress}% complete</p>
        </div>
      </div>
      <div className="mt-4 h-2 rounded-full bg-gray-100">
        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${checklistProgress}%` }} />
      </div>
      <div className="mt-6 space-y-4">
        {checklistItems.map((item) => (
          <div key={item.label} className="rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full ${item.complete ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-2">
        <Button className="flex-1 bg-orange-500 text-white" onClick={() => showToast("Compliance kit updated.")}>
          Update compliance kit
        </Button>
        <Button variant="outline" className="flex-1 gap-2 border-gray-200 text-gray-700" onClick={() => showToast("Audit sync requested.")}>
          <RefreshCcw className="h-3.5 w-3.5" /> Sync audits
        </Button>
      </div>
    </div>
  );
}
