import { useState } from "react";
import { CheckCircle2, CreditCard, Loader2, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { initiatePayment, verifyPayment } from "@/services/paymentApi";
import { useCurrency } from "@/context/CurrencyContext";

interface PaystackCheckoutProps {
  orderId: string;
  orderAmount: number;
  foodName: string;
  onClose: () => void;
  onSuccess: (reference: string) => void;
}

type Step = "confirm" | "redirecting" | "verifying" | "success" | "error";

export function PaystackCheckout({ orderId, orderAmount, foodName, onClose, onSuccess }: PaystackCheckoutProps) {
  const { symbol } = useCurrency();
  const [step, setStep] = useState<Step>("confirm");
  const [errorMsg, setErrorMsg] = useState("");
  const platformFee = Math.round(orderAmount * 0.05);
  const total = orderAmount + platformFee;

  const handlePay = async () => {
    setStep("redirecting");
    try {
      const { authorization_url, reference } = await initiatePayment(orderId);

      // Open Paystack in a new tab
      const popup = window.open(authorization_url, "_blank", "width=600,height=700");

      // Poll for window close to trigger verification
      setStep("verifying");
      const pollInterval = setInterval(async () => {
        if (popup?.closed) {
          clearInterval(pollInterval);
          try {
            const result = await verifyPayment(reference);
            if (result.status === "success" || result.status === "already_processed") {
              setStep("success");
              onSuccess(reference);
            } else {
              setErrorMsg("Payment was not completed. Please try again.");
              setStep("error");
            }
          } catch {
            setErrorMsg("Could not verify payment. Please contact support.");
            setStep("error");
          }
        }
      }, 1500);

      // Timeout after 10 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        if (step === "verifying") {
          setErrorMsg("Payment window timed out. If you paid, please contact support.");
          setStep("error");
        }
      }, 600_000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to initiate payment.");
      setStep("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Secure checkout</p>
            <h2 className="text-2xl font-semibold text-gray-900">Pay with Paystack</h2>
          </div>
          {step !== "redirecting" && step !== "verifying" && (
            <button type="button" onClick={onClose} className="rounded-full bg-gray-100 p-1.5 text-gray-500 hover:bg-gray-200">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Confirm step */}
        {step === "confirm" && (
          <>
            <div className="mt-6 rounded-2xl border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Order</p>
              <p className="text-lg font-semibold text-gray-900">{foodName}</p>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Food cost</span>
                  <span className="font-semibold text-gray-900">{symbol}{orderAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform fee (5%)</span>
                  <span className="font-semibold text-gray-900">{symbol}{platformFee.toLocaleString()}</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-gray-100 pt-2 text-base font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{symbol}{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Funds held in escrow — released to vendor only after delivery</span>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1 border-gray-200" onClick={onClose}>Cancel</Button>
              <Button className="flex-1 bg-orange-500 text-white" onClick={handlePay}>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay {symbol}{total.toLocaleString()}
              </Button>
            </div>
          </>
        )}

        {/* Redirecting */}
        {step === "redirecting" && (
          <div className="mt-10 flex flex-col items-center gap-4 pb-6 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
            <p className="text-lg font-semibold text-gray-900">Opening Paystack…</p>
            <p className="text-sm text-gray-500">Complete your payment in the new window.</p>
          </div>
        )}

        {/* Verifying */}
        {step === "verifying" && (
          <div className="mt-10 flex flex-col items-center gap-4 pb-6 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
            <p className="text-lg font-semibold text-gray-900">Verifying payment…</p>
            <p className="text-sm text-gray-500">We're confirming your transaction. This takes a few seconds.</p>
          </div>
        )}

        {/* Success */}
        {step === "success" && (
          <div className="mt-10 flex flex-col items-center gap-4 pb-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <p className="text-xl font-semibold text-gray-900">Payment confirmed!</p>
            <p className="text-sm text-gray-500">Your order is now active. The vendor will start cooking shortly.</p>
            <Button className="mt-2 bg-orange-500 text-white" onClick={onClose}>View order</Button>
          </div>
        )}

        {/* Error */}
        {step === "error" && (
          <div className="mt-6 flex flex-col gap-4">
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{errorMsg}</div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 border-gray-200" onClick={onClose}>Close</Button>
              <Button className="flex-1 bg-orange-500 text-white" onClick={() => setStep("confirm")}>Try again</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
