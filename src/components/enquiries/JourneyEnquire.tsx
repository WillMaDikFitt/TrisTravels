"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormInput, FormTextarea } from "@/components/ui/Form";
import { submitEnquiry } from "@/lib/actions/enquiries";
import { useAuth } from "@/components/auth/AuthProvider";

export function JourneyEnquire({
  journeyName,
  journeySlug,
}: {
  journeyName: string;
  journeySlug: string;
}) {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile?.name) setName((n) => n || profile.name);
    if (profile?.email) setEmail((e) => e || profile.email);
  }, [profile]);

  if (sent) {
    return (
      <p id="enquire" className="mt-4 scroll-mt-header text-sm text-primary">
        Enquiry sent. We’ll reply within 1–2 working days.
      </p>
    );
  }

  if (!open) {
    return (
      <div id="enquire" className="scroll-mt-header">
        <Button className="mt-6 w-full" onClick={() => setOpen(true)}>
          Enquire about this journey
        </Button>
      </div>
    );
  }

  return (
    <form
      id="enquire"
      className="mt-6 scroll-mt-header space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          const res = await submitEnquiry({
            source: "journey",
            name,
            email,
            phone,
            message: message || `Enquiry for ${journeyName}`,
            payload: { journeySlug, journeyName },
            uid: user?.uid,
          });
          if (!res.ok) setError(res.error);
          else setSent(true);
        } catch {
          setError("Could not send. Try again.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <FormInput label="Name" name="name" value={name} onChange={setName} required />
      <FormInput label="Email" name="email" type="email" value={email} onChange={setEmail} required />
      <FormInput label="Phone" name="phone" type="tel" value={phone} onChange={setPhone} />
      <FormTextarea
        label="Notes"
        name="message"
        rows={3}
        value={message}
        onChange={setMessage}
        placeholder="Dates, group size, stay preferences…"
      />
      {error && <p className="text-sm text-primary">{error}</p>}
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Sending…" : "Send enquiry"}
      </Button>
    </form>
  );
}
