/** Browser-only Razorpay Checkout helpers. */

export type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type RazorpayCheckoutResult =
  | { paid: true; paymentId: string; orderId: string }
  | { paid: false; reason: "dismissed" | "unavailable" | "failed"; message?: string };

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

export function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(input: {
  amountInr: number;
  receipt: string;
  description: string;
  notes?: Record<string, string>;
  prefill?: { name?: string; email?: string; contact?: string };
}): Promise<RazorpayCheckoutResult> {
  const orderRes = await fetch("/api/razorpay/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amountInr: input.amountInr,
      receipt: input.receipt,
      notes: input.notes,
    }),
  });
  const order = (await orderRes.json()) as {
    ok?: boolean;
    configured?: boolean;
    orderId?: string;
    amount?: number;
    currency?: string;
    keyId?: string;
    error?: string;
  };

  if (!orderRes.ok || !order.ok || !order.orderId || !order.keyId) {
    return {
      paid: false,
      reason: "unavailable",
      message: order.error || "Payment is temporarily unavailable",
    };
  }

  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    return {
      paid: false,
      reason: "unavailable",
      message: "Could not load payment checkout",
    };
  }

  return new Promise((resolve) => {
    const rzp = new window.Razorpay!({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency || "INR",
      name: "TRIS Travels",
      description: input.description,
      order_id: order.orderId,
      prefill: input.prefill,
      theme: { color: "#364037" },
      handler: async (response: RazorpaySuccessResponse) => {
        try {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          });
          const verified = (await verifyRes.json()) as { ok?: boolean };
          if (!verifyRes.ok || !verified.ok) {
            resolve({
              paid: false,
              reason: "failed",
              message: "Payment verification failed",
            });
            return;
          }
          resolve({
            paid: true,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
          });
        } catch {
          resolve({
            paid: false,
            reason: "failed",
            message: "Payment verification failed",
          });
        }
      },
      modal: {
        ondismiss: () => resolve({ paid: false, reason: "dismissed" }),
      },
    });
    rzp.on("payment.failed", () => {
      resolve({
        paid: false,
        reason: "failed",
        message: "Payment failed",
      });
    });
    rzp.open();
  });
}
