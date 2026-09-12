import crypto from "crypto";
import { NextResponse } from "next/server";
import { getManualBookingByOrderId, markManualBookingPaid } from "@/lib/manual-bookings-store";

type RazorpayWebhookEvent = {
  event?: string;
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string; amount?: number; status?: string } };
    order?: { entity?: { id?: string } };
  };
};

/**
 * Backup for manual booking links: marks a link paid even if the client closes the tab
 * before the checkout callback runs. Set RAZORPAY_WEBHOOK_SECRET and point a Razorpay
 * webhook (payment.captured, order.paid) at /api/razorpay/webhook.
 */
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Webhook not configured" }, { status: 503 });
  }

  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const valid =
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(raw) as RazorpayWebhookEvent;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }
  if (event.event !== "payment.captured" && event.event !== "order.paid") {
    return NextResponse.json({ ok: true, ignored: event.event ?? "unknown" });
  }

  const payment = event.payload?.payment?.entity;
  const orderId = payment?.order_id || event.payload?.order?.entity?.id || "";
  const booking = orderId ? await getManualBookingByOrderId(orderId) : null;
  // Experience checkouts confirm through their own flow; only manual links are handled here.
  if (!booking) return NextResponse.json({ ok: true, ignored: "not a manual booking" });

  if (payment?.amount != null && payment.amount !== booking.paymentRequested * 100) {
    console.error(`Manual booking ${booking.id}: webhook amount ${payment.amount} ≠ expected`);
    return NextResponse.json({ ok: false, error: "Amount mismatch" }, { status: 400 });
  }

  await markManualBookingPaid(booking, { orderId, paymentId: payment?.id });
  return NextResponse.json({ ok: true });
}
