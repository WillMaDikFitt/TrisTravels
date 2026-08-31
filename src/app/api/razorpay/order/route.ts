import { NextResponse } from "next/server";
import { createRazorpayOrder, razorpayConfigured } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    if (!razorpayConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Razorpay is not configured", configured: false },
        { status: 503 },
      );
    }

    const body = (await req.json()) as {
      amountInr?: number;
      receipt?: string;
      notes?: Record<string, string>;
    };

    const amountInr = Math.round(Number(body.amountInr) || 0);
    if (amountInr < 1) {
      return NextResponse.json({ ok: false, error: "Invalid amount" }, { status: 400 });
    }

    const order = await createRazorpayOrder({
      amountInr,
      receipt: body.receipt || `tris_${Date.now()}`,
      notes: body.notes,
    });

    return NextResponse.json({ ok: true, ...order });
  } catch (err) {
    console.error("razorpay order:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Order failed" },
      { status: 500 },
    );
  }
}
