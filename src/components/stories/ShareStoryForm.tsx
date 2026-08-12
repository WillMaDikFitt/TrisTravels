"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormInput, FormSuccess, FormTextarea } from "@/components/ui/Form";
import { submitEnquiry } from "@/lib/actions/enquiries";
import { X } from "lucide-react";

const MAX_FILES = 5;
const MAX_MB = 8;

export function ShareStoryForm() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([]);

  if (sent) {
    return (
      <FormSuccess
        compact
        title="Story received"
        body="Thank you. We’ll read it and be in touch if we publish it in the journal."
      >
        <Button href="/stories" variant="ghost">
          Back to stories
        </Button>
      </FormSuccess>
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        setBusy(true);
        const form = e.currentTarget;
        const data = new FormData(form);
        const files = [...((data.getAll("photos") as File[]) ?? [])].filter((f) => f.size > 0);

        if (files.length > MAX_FILES) {
          setBusy(false);
          setError(`Up to ${MAX_FILES} photos.`);
          return;
        }

        const photoUrls: string[] = [];
        for (const file of files) {
          if (!file.type.startsWith("image/")) {
            setBusy(false);
            setError("Photos only — JPG, PNG, or WebP.");
            return;
          }
          if (file.size > MAX_MB * 1024 * 1024) {
            setBusy(false);
            setError(`Each photo must be under ${MAX_MB}MB.`);
            return;
          }
          const body = new FormData();
          body.append("file", file);
          body.append("purpose", "story");
          const res = await fetch("/api/upload", { method: "POST", body });
          const json = await res.json();
          if (!res.ok || !json.url) {
            setBusy(false);
            setError(json.error || "Could not upload photos. Try smaller files, or send without photos.");
            return;
          }
          photoUrls.push(json.url);
        }

        const result = await submitEnquiry({
          source: "story",
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          phone: String(data.get("phone") ?? ""),
          message: String(data.get("story") ?? ""),
          payload: {
            title: String(data.get("title") ?? ""),
            place: String(data.get("place") ?? ""),
            travelled: String(data.get("travelled") ?? ""),
            photos: photoUrls,
          },
        });
        setBusy(false);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setSent(true);
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FormInput label="Your name" name="name" required autoComplete="name" />
        <FormInput label="Email" name="email" type="email" required autoComplete="email" />
      </div>
      <FormInput label="Phone" name="phone" type="tel" autoComplete="tel" hint="If you’d rather we WhatsApp" />
      <FormInput
        label="Story title"
        name="title"
        required
        placeholder="A few words that hold the memory"
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormInput label="Where in Meghalaya" name="place" placeholder="Sohra, Dawki, Mawlynnong…" />
        <FormInput label="When you travelled" name="travelled" placeholder="March 2026" />
      </div>
      <FormTextarea
        label="Your story"
        name="story"
        required
        rows={8}
        placeholder="What stayed with you — a host, a meal, the rain, a path…"
      />

      <div>
        <p className="text-sm font-medium text-primary">
          Photos <span className="ml-1.5 text-xs font-normal text-on-surface-variant">(optional, up to {MAX_FILES})</span>
        </p>
        <p className="mt-1 text-xs text-on-surface-variant">JPG, PNG or WebP · {MAX_MB}MB each</p>
        <input
          name="photos"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          multiple
          className="mt-2 block w-full text-sm text-on-surface-variant file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-xs file:font-bold file:tracking-wider file:text-on-accent file:uppercase"
          onChange={(e) => {
            const next = [...(e.target.files ?? [])].slice(0, MAX_FILES).map((f) => ({
              name: f.name,
              url: URL.createObjectURL(f),
            }));
            setPreviews((prev) => {
              prev.forEach((p) => URL.revokeObjectURL(p.url));
              return next;
            });
          }}
        />
        {previews.length > 0 && (
          <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {previews.map((p) => (
              <li key={p.url} className="relative aspect-square overflow-hidden rounded-xl bg-surface-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="h-full w-full object-cover" />
                <span className="sr-only">{p.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p className="flex items-start gap-2 text-sm text-red-800">
          <X size={16} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      <Button type="submit" disabled={busy}>
        {busy ? "Sending…" : "Submit story"}
      </Button>
    </form>
  );
}
