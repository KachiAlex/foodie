import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { useCurrency } from "@/context/CurrencyContext";
import type { CreateRequestPayload } from "@/services/requestApi";

interface NewRequestModalProps {
  onClose: () => void;
}

export function NewRequestModal({ onClose }: NewRequestModalProps) {
  const { addRequest } = useApp();
  const { symbol } = useCurrency();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CreateRequestPayload>({
    title: "",
    cuisine: "Nigerian",
    portionType: "Pot",
    uom: "Plate",
    servings: 10,
    budget: 200,
    deliveryWindow: "Today, 6:00 PM",
  });

  const steps = ["Details", "Portion & Budget", "Review"];

  const handleNext = () => {
    if (step < steps.length - 1) setStep((s) => s + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setIsSubmitting(true);
    try {
      await addRequest(form);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const update = <K extends keyof CreateRequestPayload>(
    key: K,
    value: CreateRequestPayload[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">New Request</h3>
            <p className="text-sm text-gray-500">{steps[step]} — Step {step + 1} of {steps.length}</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`flex-1 rounded-full py-1 text-center text-xs font-semibold transition ${
                i === step
                  ? "bg-orange-500 text-white"
                  : i < step
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {s}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-gray-700">
              Request title
              <input
                type="text"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. Party Jollof & Fried Chicken"
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </label>
            <label className="block text-sm font-semibold text-gray-700">
              Cuisine type
              <select
                value={form.cuisine}
                onChange={(e) => update("cuisine", e.target.value)}
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option>Nigerian</option>
                <option>Ghanaian</option>
                <option>African Fusion</option>
                <option>Healthy</option>
                <option>Continental</option>
                <option>Other</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-gray-700">
              Delivery window
              <input
                type="text"
                value={form.deliveryWindow}
                onChange={(e) => update("deliveryWindow", e.target.value)}
                placeholder="e.g. Today, 6:00 PM"
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-gray-700">
              Portion type
              <div className="mt-2 flex gap-2">
                {(["Pot", "Portion", "Tray"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => update("portionType", type)}
                    className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      form.portionType === type
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </label>
            <label className="block text-sm font-semibold text-gray-700">
              Unit of measurement (UoM)
              <select
                value={form.uom}
                onChange={(e) => update("uom", e.target.value)}
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <optgroup label="Single Orders">
                  <option value="Plate">Plate</option>
                  <option value="Pack">Pack</option>
                  <option value="Bowl">Bowl</option>
                  <option value="Portion">Portion</option>
                </optgroup>
                <optgroup label="Bulk Orders">
                  <option value="Half Pot">Half Pot</option>
                  <option value="Full Pot">Full Pot</option>
                  <option value="Bucket">Bucket</option>
                  <option value="Cooler">Cooler</option>
                  <option value="Tray">Tray</option>
                </optgroup>
                <optgroup label="Quantitative">
                  <option value="Piece">Piece</option>
                  <option value="Dozen">Dozen</option>
                  <option value="Litre">Litre</option>
                </optgroup>
              </select>
            </label>
            <label className="block text-sm font-semibold text-gray-700">
              Servings
              <input
                type="number"
                min={1}
                max={500}
                value={form.servings}
                onChange={(e) => update("servings", parseInt(e.target.value) || 1)}
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </label>
            <label className="block text-sm font-semibold text-gray-700">
              Budget ({symbol})
              <input
                type="number"
                min={10}
                value={form.budget}
                onChange={(e) => update("budget", parseInt(e.target.value) || 10)}
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 space-y-4 rounded-2xl bg-gray-50 p-4">
            <h4 className="text-sm font-semibold text-gray-900">Review your request</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium text-gray-900">Title:</span> {form.title || "—"}</p>
              <p><span className="font-medium text-gray-900">Cuisine:</span> {form.cuisine}</p>
              <p><span className="font-medium text-gray-900">Portion:</span> {form.portionType}</p>
              <p><span className="font-medium text-gray-900">UoM:</span> {form.uom}</p>
              <p><span className="font-medium text-gray-900">Servings:</span> {form.servings}</p>
              <p><span className="font-medium text-gray-900">Budget:</span> {symbol}{form.budget}</p>
              <p><span className="font-medium text-gray-900">Delivery:</span> {form.deliveryWindow}</p>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-gray-200 text-gray-700"
            onClick={step === 0 ? onClose : handleBack}
            disabled={isSubmitting}
          >
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          <Button
            className="flex-1 bg-orange-500 text-white"
            onClick={handleNext}
            disabled={isSubmitting || (step === 0 && !form.title.trim())}
          >
            {step === steps.length - 1
              ? isSubmitting
                ? "Creating..."
                : "Create Request"
              : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
