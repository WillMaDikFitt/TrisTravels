import { NextResponse } from "next/server";
import { runBalanceReminders } from "@/lib/actions/payments";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = req.headers.get("authorization") || "";
  const url = new URL(req.url);
  const querySecret = url.searchParams.get("secret") || "";

  if (secret) {
    const ok =
      auth === `Bearer ${secret}` || querySecret === secret;
    if (!ok) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await runBalanceReminders();
    return NextResponse.json(result);
  } catch (err) {
    console.error("balance reminders:", err);
    return NextResponse.json({ ok: false, error: "Cron failed" }, { status: 500 });
  }
}
