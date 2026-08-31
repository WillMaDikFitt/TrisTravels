import { NextResponse } from "next/server";
import { verifyRazorpayPaymentSignature } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      orderId?: string;
      paymentId?: string;
      signature?: string;
    };

    if (!body.orderId || !body.paymentId || !body.signature) {
      return NextResponse.json({ ok: false, error: "Missing payment fields" }, { status: 400 });
    }

    const valid = verifyRazorpayPaymentSignature({
      orderId: body.orderId,
      paymentId: body.paymentId,
      signature: body.signature,
    });

    if (!valid) {
      return NextResponse.json({ ok: false, error: "Invalid payment signature" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("razorpay verify:", err);
    return NextResponse.json({ ok: false, error: "Verification failed" }, { status: 500 });
  }
}
