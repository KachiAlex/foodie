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
    <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Kitchen readiness</p>
          <h3 className="mt-1 text-xl font-bold text-gray-900">Trust &amp; compliance</h3>
        </div>
        <div className="flex flex-col items-end gap-1">
          <ShieldCheck className="h-6 w-6 text-emerald-500" />
          <p className="text-xs font-bold text-emerald-600">{checklistProgress}%</p>
        </div>
      </div>
      <div className="mt-4 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700" style={{ width: `${checklistProgress}%` }} />
      </div>
      <div className="mt-5 space-y-3">
        {checklistItems.map((item) => (
          <div key={item.label} className={`rounded-xl border p-3.5 flex items-center gap-3 transition-colors ${item.complete ? "border-emerald-100 bg-emerald-50/50" : "border-gray-100 bg-gray-50"}`}>
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${item.complete ? "bg-emerald-100 text-emerald-600" : "bg-gray-200 text-gray-400"}`}>
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{item.label}</p>
              <p className="text-xs text-gray-500 truncate">{item.detail}</p>
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
