"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { submitEnquiry } from "@/lib/actions/enquiries";
import type { EnquirySource } from "@/lib/types";
import { useAuth } from "@/components/auth/AuthProvider";

type Props = {
  source: EnquirySource;
  extra?: Record<string, string | number | string[]>;
  children: React.ReactNode;
  onSuccess?: () => void;
  submitLabel?: string;
};

export function EnquiryForm({ source, extra, children, onSuccess, submitLabel = "Submit" }: Props) {
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const phone = String(data.get("phone") || "");
    const message = String(data.get("message") || data.get("notes") || data.get("about") || "");
    const payload: Record<string, string> = {};
    data.forEach((v, k) => {
      if (typeof v === "string") payload[k] = v;
    });
    setBusy(true);
    setError("");
    try {
      const res = await submitEnquiry({
        source,
        name,
        email,
        phone,
        message,
        payload: { ...payload, ...extra },
        uid: user?.uid,
      });
      if (!res.ok) {
        setError("error" in res ? res.error : "Could not send. Try again.");
        return;
      }
      onSuccess?.();
    } catch {
      setError("Could not send. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      {children}
      {error && <p className="text-sm text-primary">{error}</p>}
      <Button type="submit" size="lg" disabled={busy}>
        {busy ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
}
