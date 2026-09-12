"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { createManualBooking, listManualBookingProducts } from "@/lib/actions/manual-bookings";
import {
  MANUAL_PAYMENT_TYPES,
  MANUAL_PRODUCT_TYPES,
  manualAmounts,
  type ManualProductCatalogue,
} from "@/lib/manual-bookings";
import type { ManualPaymentType, ManualProductType } from "@/lib/types";
import { cn, formatINR } from "@/lib/utils";
import { AdminButton, Field, Notice, PageHeader, Panel, inputClass } from "@/components/admin/ui";

export default function NewManualBookingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [catalogue, setCatalogue] = useState<ManualProductCatalogue | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [productType, setProductType] = useState<ManualProductType>("experience");
  const [productSlug, setProductSlug] = useState("");
  const [productName, setProductName] = useState("");
  const [productSubheading, setProductSubheading] = useState("");
  const [travellerName, setTravellerName] = useState("");
  const [travellerEmail, setTravellerEmail] = useState("");
  const [travellerPhone, setTravellerPhone] = useState("");
  const [journeyDate, setJourneyDate] = useState("");
  const [adults, setAdults] = useState("1");
  const [children, setChildren] = useState("0");
  const [totalAmount, setTotalAmount] = useState("");
  const [paymentType, setPaymentType] = useState<ManualPaymentType>("advance");
  const [paymentRequested, setPaymentRequested] = useState("");
  const [requestedEdited, setRequestedEdited] = useState(false);
  const [paymentDueDate, setPaymentDueDate] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (loading) return;
    (async () => {
      const token = (await user?.getIdToken()) ?? "";
      const res = await listManualBookingProducts(token);
      if (res.ok) setCatalogue(res.products);
      else setError(res.error);
    })();
  }, [user, loading]);

  const listings = productType === "craft" ? [] : (catalogue?.[productType] ?? []);
  const total = Math.max(0, Math.round(Number(totalAmount) || 0));
  const amounts = manualAmounts(total, paymentType, Number(paymentRequested) || 0);
  const requestedTooHigh = paymentType !== "full" && (Number(paymentRequested) || 0) > total;

  const chooseType = (next: ManualProductType) => {
    setProductType(next);
    setProductSlug("");
    setProductName("");
    setProductSubheading("");
  };

  const chooseListing = (slug: string) => {
    const match = listings.find((o) => o.slug === slug);
    setProductSlug(slug);
    setProductName(match?.name ?? "");
    setProductSubheading(match?.subheading ?? "");
  };

  // Advance links default to half the total until staff type their own amount.
  const changeTotal = (value: string) => {
    setTotalAmount(value);
    if (paymentType === "advance" && !requestedEdited) {
      const next = Math.round((Number(value) || 0) * 0.5);
      setPaymentRequested(next ? String(next) : "");
    }
  };

  const choosePaymentType = (next: ManualPaymentType) => {
    setPaymentType(next);
    setRequestedEdited(false);
    if (next === "advance") setPaymentRequested(total ? String(Math.round(total * 0.5)) : "");
    else if (next === "full") setPaymentRequested(total ? String(total) : "");
    else setPaymentRequested("");
  };

  const ready =
    (productType === "craft" ? productName.trim() !== "" : productSlug !== "") &&
    travellerName.trim() !== "" &&
    travellerPhone.trim() !== "" &&
    journeyDate !== "" &&
    Number(adults) >= 1 &&
    total >= 1 &&
    amounts.paymentRequested >= 1 &&
    !requestedTooHigh;

  const submit = async () => {
    if (!ready || busy) return;
    setBusy(true);
    setError("");
    const token = (await user?.getIdToken()) ?? "";
    const res = await createManualBooking(token, {
      productType,
      productSlug: productSlug || undefined,
      productName,
      productSubheading,
      travellerName,
      travellerEmail,
      travellerPhone,
      journeyDate,
      adults: Number(adults),
      children: Number(children) || 0,
      totalAmount: total,
      paymentType,
      paymentRequested: amounts.paymentRequested,
      paymentDueDate: paymentDueDate || undefined,
      remarks,
    });
    if (!res.ok) {
      setError(res.error);
      setBusy(false);
      return;
    }
    router.push(`/admin/manual-bookings/${encodeURIComponent(res.booking.id)}`);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Manual booking"
        title="New manual booking"
        description="Enter a booking that came in directly. You’ll get a private link to send the client so they can pay online."
        actions={
          <AdminButton variant="ghost" onClick={() => router.push("/admin/manual-bookings")}>
            Back to list
          </AdminButton>
        }
      />

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Panel>
          <h2 className="mb-4 font-display text-lg">Product</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Product">
              <select
                value={productType}
                onChange={(e) => chooseType(e.target.value as ManualProductType)}
                className={inputClass}
              >
                {MANUAL_PRODUCT_TYPES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>
            {productType === "craft" ? (
              <Field label="Trip name" hint="Craft My Journey trips aren’t listings, so name this one">
                <input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. 6-day Meghalaya family trip"
                  className={inputClass}
                />
              </Field>
            ) : (
              <Field label="Listing">
                <select
                  value={productSlug}
                  onChange={(e) => chooseListing(e.target.value)}
                  className={inputClass}
                  disabled={!catalogue}
                >
                  <option value="">{catalogue ? "Choose a listing…" : "Loading listings…"}</option>
                  {listings.map((o) => (
                    <option key={o.slug} value={o.slug}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <div className="md:col-span-2">
              <Field
                label="Product subheading"
                hint={
                  productType === "craft"
                    ? "One line shown under the trip name"
                    : "Filled in from the listing — edit it if you like"
                }
              >
                <input
                  value={productSubheading}
                  onChange={(e) => setProductSubheading(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-4 font-display text-lg">Traveller</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Traveller name">
              <input
                value={travellerName}
                onChange={(e) => setTravellerName(e.target.value)}
                required
                className={inputClass}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={travellerEmail}
                onChange={(e) => setTravellerEmail(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Phone / WhatsApp">
              <input
                type="tel"
                value={travellerPhone}
                onChange={(e) => setTravellerPhone(e.target.value)}
                required
                placeholder="e.g. 98765 43210"
                className={inputClass}
              />
            </Field>
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-4 font-display text-lg">Trip</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Journey date">
              <input
                type="date"
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                required
                className={inputClass}
              />
            </Field>
            <Field label="No. of adults">
              <input
                type="number"
                min={1}
                value={adults}
                onChange={(e) => setAdults(e.target.value)}
                required
                className={inputClass}
              />
            </Field>
            <Field label="No. of children">
              <input
                type="number"
                min={0}
                value={children}
                onChange={(e) => setChildren(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-4 font-display text-lg">Payment</h2>
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Total booking amount (₹)">
                <input
                  type="number"
                  min={1}
                  value={totalAmount}
                  onChange={(e) => changeTotal(e.target.value)}
                  required
                  className={inputClass}
                />
              </Field>
              <Field label="Payment due date" hint="Optional">
                <input
                  type="date"
                  value={paymentDueDate}
                  onChange={(e) => setPaymentDueDate(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground">Payment type</p>
              <div className="mt-1.5 grid gap-2 sm:grid-cols-4">
                {MANUAL_PAYMENT_TYPES.map((option) => {
                  const active = paymentType === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => choosePaymentType(option.id)}
                      className={cn(
                        "rounded-2xl border p-3 text-left transition",
                        active
                          ? "border-[#364037] bg-[#364037] text-[#f8f6f1]"
                          : "border-[#c5cbb8] bg-[#faf8f3] text-[#26352b] hover:border-[#8fa183]",
                      )}
                    >
                      <p className="text-sm font-semibold">{option.label}</p>
                      <p className={cn("mt-1 text-xs", active ? "text-[#d8e2cf]" : "text-[#4a5a50]")}>
                        {option.hint}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field
                label="Payment requested (₹)"
                hint={paymentType === "full" ? "The full total" : "Collected through this link"}
              >
                <input
                  type="number"
                  min={1}
                  value={paymentType === "full" ? String(amounts.paymentRequested || "") : paymentRequested}
                  onChange={(e) => {
                    setPaymentRequested(e.target.value);
                    setRequestedEdited(true);
                  }}
                  disabled={paymentType === "full"}
                  className={inputClass}
                />
              </Field>
              {paymentType === "balance" ? (
                <Field label="Already paid (auto)" hint="Total minus this balance payment">
                  <input value={formatINR(amounts.alreadyPaid)} readOnly className={inputClass} />
                </Field>
              ) : null}
              <Field label="Balance amount (auto)" hint="Still due after this payment">
                <input value={formatINR(amounts.balanceAmount)} readOnly className={inputClass} />
              </Field>
            </div>
            {requestedTooHigh ? (
              <Notice tone="warn">The payment requested can’t be more than the total.</Notice>
            ) : null}
          </div>
        </Panel>

        <Panel>
          <Field label="Remarks / additional information" hint="For your team — not shown on the client page">
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className={inputClass}
            />
          </Field>
        </Panel>

        {error ? <Notice tone="warn">{error}</Notice> : null}

        <div className="flex flex-wrap items-center justify-end gap-3">
          <p className="text-sm text-[#4a5a50]">
            {ready
              ? `Link will collect ${formatINR(amounts.paymentRequested)} of ${formatINR(total)}`
              : "Fill in the product, traveller, date and amounts to continue"}
          </p>
          <AdminButton type="submit" disabled={!ready || busy}>
            {busy ? "Creating…" : "Create booking & generate payment link"}
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
