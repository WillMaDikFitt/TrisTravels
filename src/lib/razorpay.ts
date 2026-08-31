import crypto from "crypto";

export function razorpayConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() && process.env.RAZORPAY_KEY_SECRET?.trim(),
  );
}

export function getRazorpayKeyId() {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || "";
}

export function getRazorpayKeySecret() {
  return process.env.RAZORPAY_KEY_SECRET?.trim() || "";
}

/** Create a Razorpay order (amount in INR rupees → paise). */
export async function createRazorpayOrder(input: {
  amountInr: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const keyId = getRazorpayKeyId();
  const secret = getRazorpayKeySecret();
  if (!keyId || !secret) {
    throw new Error("Razorpay is not configured");
  }

  const amountPaise = Math.round(input.amountInr * 100);
  if (amountPaise < 100) {
    throw new Error("Amount too small for Razorpay");
  }

  const auth = Buffer.from(`${keyId}:${secret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt: input.receipt.slice(0, 40),
      notes: input.notes,
    }),
  });

  const data = (await res.json()) as {
    id?: string;
    amount?: number;
    currency?: string;
    error?: { description?: string };
  };

  if (!res.ok || !data.id) {
    throw new Error(data.error?.description || "Could not create Razorpay order");
  }

  return {
    orderId: data.id,
    amount: data.amount ?? amountPaise,
    currency: data.currency ?? "INR",
    keyId,
  };
}

export function verifyRazorpayPaymentSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const secret = getRazorpayKeySecret();
  if (!secret) return false;
  const body = `${input.orderId}|${input.paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === input.signature;
}
