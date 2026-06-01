import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VendorOpenRequest } from "@/types/domain";

interface BidRequestModalProps {
  request: VendorOpenRequest;
  onClose: () => void;
  isSubmitting: boolean;
  onSubmit: (values: { bidAmount: string; notes: string }) => void;
  bidSent: boolean;
}

export function BidRequestModal({ request, onClose, isSubmitting, onSubmit, bidSent }: BidRequestModalProps) {
  const wizardSteps = ["Proposal", "Attachments", "Review"] as const;
  const [activeStep, setActiveStep] = useState(0);
  const [bidAmount, setBidAmount] = useState(() => request.budget.replace(/[^0-9]/g, ""));
  const [notes, setNotes] = useState("Ready to personalize spice & plating per guest.");
  const [selectedAssets, setSelectedAssets] = useState<string[]>(["Signature menu.pdf"]);
  const attachmentLibrary = [
    "Signature menu.pdf",
    "Kitchen hygiene log.png",
    "Seasonal specials.docx",
    "Chef intro reel.mp4",
  ];

  const toggleAsset = (asset: string) => {
    setSelectedAssets((current) =>
      current.includes(asset) ? current.filter((item) => item !== asset) : [...current, asset],
    );
  };

  const handlePrimaryAction = () => {
    if (activeStep < wizardSteps.length - 1) {
      setActiveStep((prev) => prev + 1);
      return;
    }
    onSubmit({ bidAmount, notes });
  };

  const handleBack = () => {
    if (activeStep === 0) return;
    setActiveStep((prev) => prev - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{request.id}</p>
            <h3 className="text-2xl font-semibold text-gray-900">{request.title}</h3>
            <p className="text-sm text-gray-500">{request.location} • {request.servings}</p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-full bg-gray-100 p-1 text-gray-500">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-600">
          {wizardSteps.map((step, index) => (
            <div
              key={step}
              className={`flex items-center gap-2 rounded-full px-3 py-1 ${
                index === activeStep ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              <span className="text-[10px]">{index + 1}</span>
              {step}
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
          <p>Deadline: <span className="font-semibold text-gray-900">{request.deadline}</span></p>
          <p className="mt-2">Tags: {request.tags.join(", ")}</p>
        </div>

        {activeStep === 0 && (
          <div className="mt-4 space-y-3">
            <label className="text-sm font-semibold text-gray-700">
              Bid amount
              <input
                type="text"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 text-base text-gray-900"
              />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Kitchen notes
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 text-base text-gray-900"
              />
            </label>
            <p className="text-xs text-gray-500">Tip: mention prep timeline + plating style to win trust.</p>
          </div>
        )}

        {activeStep === 1 && (
          <div className="mt-4 space-y-4">
            <p className="text-sm font-semibold text-gray-700">Attach proof of work (optional)</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {attachmentLibrary.map((asset) => {
                const isSelected = selectedAssets.includes(asset);
                return (
                  <button
                    key={asset}
                    type="button"
                    onClick={() => toggleAsset(asset)}
                    className={`rounded-2xl border px-3 py-2 text-left text-sm ${
                      isSelected ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-700"
                    }`}
                  >
                    {asset}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500">These files help buyers pick you faster. Drop at least one hygiene proof.</p>
          </div>
        )}

        {activeStep === 2 && (
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-gray-100 p-4">
              <h4 className="text-sm font-semibold text-gray-900">Summary</h4>
              <p className="mt-2 text-sm text-gray-600">Bid: <span className="font-semibold text-gray-900">{bidAmount || "—"}</span></p>
              <p className="text-sm text-gray-600">Notes: <span className="font-semibold text-gray-900">{notes || "None"}</span></p>
            </div>
            <div className="rounded-2xl border border-gray-100 p-4">
              <h4 className="text-sm font-semibold text-gray-900">Attachments ({selectedAssets.length})</h4>
              {selectedAssets.length === 0 ? (
                <p className="mt-2 text-sm text-gray-500">No files attached.</p>
              ) : (
                <ul className="mt-2 list-inside list-disc text-sm text-gray-600">
                  {selectedAssets.map((asset) => <li key={asset}>{asset}</li>)}
                </ul>
              )}
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3 text-sm text-gray-600">
          <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-600">Escrow release 24h</span>
          <span className="rounded-full bg-gray-100 px-3 py-1">Buyer rating 4.8/5</span>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" className="flex-1 border-gray-200 text-gray-700" onClick={activeStep === 0 ? onClose : handleBack} disabled={isSubmitting}>
            {activeStep === 0 ? "Cancel" : "Back"}
          </Button>
          <Button
            className="flex-1 bg-orange-500 text-white"
            onClick={handlePrimaryAction}
            disabled={(activeStep === wizardSteps.length - 1 && (isSubmitting || bidSent)) || (activeStep === 0 && !bidAmount)}
          >
            {activeStep === wizardSteps.length - 1 ? (bidSent ? "Bid sent" : isSubmitting ? "Submitting…" : "Send bid") : "Next"}
          </Button>
        </div>
        {bidSent && (
          <p className="mt-3 rounded-2xl bg-emerald-50 px-3 py-2 text-center text-sm font-semibold text-emerald-700">
            Bid delivered to buyer inbox. We'll ping you when they respond.
          </p>
        )}
      </div>
    </div>
  );
}
