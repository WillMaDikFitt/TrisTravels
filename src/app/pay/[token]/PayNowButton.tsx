"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import { startManualBookingPayment, verifyManualBookingPayment } from "@/lib/actions/manual-bookings";
import { loadRazorpayScript, type RazorpaySuccessResponse } from "@/lib/razorpay-client";
import { formatINR } from "@/lib/utils";

export function PayNowButton({ token, amount }: { token: string; amount: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pay = async () => {
    setBusy(true);
    setError("");
    const order = await startManualBookingPayment(token);
    if (!order.ok) {
      setError(order.error);
      setBusy(false);
      return;
    }
    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      setError("Couldn’t open the payment window. Check your connection and try again.");
      setBusy(false);
      return;
    }

    const checkout = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "TRIS Travels",
      description: order.description,
      order_id: order.orderId,
      prefill: order.prefill,
      theme: { color: "#364037" },
      handler: async (response: RazorpaySuccessResponse) => {
        try {
          const result = await verifyManualBookingPayment(token, {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
          if (!result.ok) setError(result.error);
        } catch {
          setError("Your payment went through but we couldn’t confirm it here. We’ll update it shortly.");
        }
        setBusy(false);
        router.refresh();
      },
      modal: { ondismiss: () => setBusy(false) },
    });
    checkout.on("payment.failed", () => {
      setError("The payment didn’t go through. You can try again.");
      setBusy(false);
    });
    checkout.open();
  };

  return (
    <div>
      <button
        type="button"
        onClick={pay}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-semibold tracking-[0.08em] text-white uppercase transition hover:brightness-110 disabled:opacity-60"
      >
        <CreditCard size={18} />
        {busy ? "Opening payment…" : `Pay ${formatINR(amount)} now`}
      </button>
      {error ? <p className="mt-3 text-center text-sm text-terracotta">{error}</p> : null}
    </div>
  );
}
