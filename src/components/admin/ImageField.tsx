"use client";

import { useState } from "react";
import { inputClass } from "./ui";

function friendlyUploadError(raw: string) {
  const lower = raw.toLowerCase();
  if (lower.includes("cloudinary") || lower.includes("not configured")) {
    return "Uploads aren’t available right now. Try again later or paste an image link.";
  }
  if (lower.includes("images only") || lower.includes("file must")) {
    return raw;
  }
  return "Couldn’t upload that image. Try another file.";
}

export function ImageField({
  name,
  label,
  defaultValue,
  onChange,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  onChange?: (url: string) => void;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return (
    <div>
      <label htmlFor={`img-${name}`} className="text-sm font-medium text-[#26352b]">
        {label}
      </label>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center rounded-full border border-[#c5cbb8] bg-white px-3 py-1.5 text-xs font-semibold text-[#26352b]">
          {busy ? "Uploading…" : "Upload image"}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={busy}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setBusy(true);
              setError("");
              const body = new FormData();
              body.append("file", file);
              try {
                const res = await fetch("/api/upload", { method: "POST", body });
                const json = await res.json();
                if (json.url) {
                  setUrl(json.url);
                  onChange?.(json.url);
                } else {
                  setError(friendlyUploadError(json.error || "Upload failed"));
                }
              } catch {
                setError("Couldn’t upload that image. Try again.");
              } finally {
                setBusy(false);
              }
            }}
          />
        </label>
        <span className="text-xs text-[#4a5a50]">or paste a link below</span>
      </div>
      <input
        id={`img-${name}`}
        name={name}
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          onChange?.(e.target.value);
        }}
        placeholder="Paste an image link"
        className={`${inputClass} mt-2`}
      />
      {error && <span className="mt-2 block text-xs text-rose-700">{error}</span>}
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="mt-3 h-28 w-44 rounded-xl object-cover ring-1 ring-[#c5cbb8]" />
      )}
    </div>
  );
}
