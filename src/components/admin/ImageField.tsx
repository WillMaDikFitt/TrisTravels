"use client";

import { useId, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Link2, Trash2, Upload } from "lucide-react";
import { inputClass } from "./ui";
import { cn } from "@/lib/utils";

function friendlyUploadError(raw: string) {
  const lower = raw.toLowerCase();
  if (lower.includes("cloudinary") || lower.includes("not configured")) {
    return "Uploads aren’t available right now. Try again later or paste an image link.";
  }
  if (lower.includes("images only") || lower.includes("file must") || lower.includes("under 8mb")) {
    return raw;
  }
  return "Couldn’t upload that image. Try another file.";
}

async function uploadImageFile(file: File, purpose?: string) {
  const body = new FormData();
  body.append("file", file);
  if (purpose) body.append("purpose", purpose);
  const res = await fetch("/api/upload", { method: "POST", body });
  const json = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !json.url) {
    throw new Error(friendlyUploadError(json.error || "Upload failed"));
  }
  return json.url;
}

function PreviewThumb({
  url,
  className,
}: {
  url: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      className={cn("rounded-xl object-cover ring-1 ring-[#c5cbb8]", className)}
    />
  );
}

/** Single cover / hero image: upload, replace, remove, optional paste URL. */
export function ImageField({
  name,
  label,
  defaultValue,
  hint,
  purpose,
  onChange,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  hint?: string;
  purpose?: string;
  onChange?: (url: string) => void;
}) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showLink, setShowLink] = useState(false);

  const setValue = (next: string) => {
    setUrl(next);
    onChange?.(next);
  };

  const onPick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const next = await uploadImageFile(file, purpose);
      setValue(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn’t upload that image. Try again.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <label htmlFor={inputId} className="text-sm font-medium text-[#26352b]">
          {label}
        </label>
        {hint ? <p className="text-xs text-[#4a5a50]">{hint}</p> : null}
      </div>

      <input type="hidden" name={name} value={url} />

      <div className="mt-3 overflow-hidden rounded-2xl border border-[#dde1d0] bg-[#f8f6f1]/p-4">
        {url ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <PreviewThumb url={url} className="h-36 w-full sm:h-32 sm:w-48" />
            <div className="min-w-0 flex-1 space-y-3">
              <p className="truncate text-xs text-[#4a5a50]" title={url}>
                {url}
              </p>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#c5cbb8] bg-white px-3 py-1.5 text-xs font-semibold text-[#26352b] transition hover:bg-white/80">
                  <Upload size={14} />
                  {busy ? "Uploading…" : "Replace"}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={busy}
                    onChange={(e) => void onPick(e.target.files?.[0])}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setShowLink((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#c5cbb8] bg-white px-3 py-1.5 text-xs font-semibold text-[#26352b]"
                >
                  <Link2 size={14} />
                  Paste link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setValue("");
                    setError("");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-[#364037] ring-1 ring-[#c5cbb8]">
              <ImagePlus size={22} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#26352b]">Add a cover image</p>
              <p className="mt-1 text-xs text-[#4a5a50]">JPG, PNG, or WebP up to 8MB</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#364037] px-4 py-2 text-xs font-semibold text-white">
                <Upload size={14} />
                {busy ? "Uploading…" : "Upload image"}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={busy}
                  onChange={(e) => void onPick(e.target.files?.[0])}
                />
              </label>
              <button
                type="button"
                onClick={() => setShowLink(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#c5cbb8] bg-white px-4 py-2 text-xs font-semibold text-[#26352b]"
              >
                <Link2 size={14} />
                Paste link
              </button>
            </div>
          </div>
        )}

        {showLink ? (
          <div className="mt-4 border-t border-[#dde1d0] pt-4">
            <label htmlFor={inputId} className="text-xs font-semibold tracking-wider text-[#4a5a50] uppercase">
              Image URL
            </label>
            <input
              id={inputId}
              value={url}
              onChange={(e) => setValue(e.target.value)}
              placeholder="https://… or /images/…"
              className={`${inputClass} mt-2`}
            />
          </div>
        ) : null}
      </div>

      {error ? <span className="mt-2 block text-xs text-rose-700">{error}</span> : null}
    </div>
  );
}

/** Multi-image gallery: upload several, reorder, replace, remove. */
export function GalleryField({
  name = "gallery",
  label = "Gallery images",
  defaultValue = [],
  hint = "Shown in the detail photo carousel. Cover image is separate.",
  purpose,
  onChange,
}: {
  name?: string;
  label?: string;
  defaultValue?: string[];
  hint?: string;
  purpose?: string;
  onChange?: (urls: string[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [urls, setUrls] = useState(() => (defaultValue ?? []).filter(Boolean));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteValue, setPasteValue] = useState("");

  const commit = (next: string[]) => {
    setUrls(next);
    onChange?.(next);
  };

  const uploadMany = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/") || !f.type);
    if (!list.length) return;
    setBusy(true);
    setError("");
    try {
      const uploaded: string[] = [];
      for (const file of list) {
        uploaded.push(await uploadImageFile(file, purpose));
      }
      commit([...urls, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn’t upload one or more images.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const replaceAt = async (index: number, file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const nextUrl = await uploadImageFile(file, purpose);
      const next = urls.map((u, i) => (i === index ? nextUrl : u));
      commit(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn’t replace that image.");
    } finally {
      setBusy(false);
    }
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= urls.length) return;
    const next = [...urls];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    commit(next);
  };

  const removeAt = (index: number) => {
    commit(urls.filter((_, i) => i !== index));
  };

  const addPasted = () => {
    const next = pasteValue
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!next.length) return;
    commit([...urls, ...next]);
    setPasteValue("");
    setPasteOpen(false);
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <p className="text-sm font-medium text-[#26352b]">{label}</p>
        <p className="text-xs text-[#4a5a50]">
          {urls.length} image{urls.length === 1 ? "" : "s"}
        </p>
      </div>
      {hint ? <p className="mt-1 text-xs text-[#4a5a50]">{hint}</p> : null}

      <input type="hidden" name={name} value={urls.join("\n")} />

      <div className="mt-3 space-y-3">
        {urls.length > 0 ? (
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {urls.map((url, index) => (
              <li
                key={`${url}-${index}`}
                className="overflow-hidden rounded-xl border border-[#dde1d0] bg-white shadow-sm"
              >
                <div className="relative aspect-square bg-[#eef0e3]">
                  <PreviewThumb url={url} className="absolute inset-0 h-full w-full rounded-none ring-0" />
                  <span className="absolute top-1.5 left-1.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-white uppercase">
                    {index + 1}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 p-1.5">
                  <button
                    type="button"
                    disabled={index === 0 || busy}
                    onClick={() => move(index, -1)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#c5cbb8] text-[#26352b] disabled:opacity-35"
                    aria-label="Move earlier"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    disabled={index === urls.length - 1 || busy}
                    onClick={() => move(index, 1)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#c5cbb8] text-[#26352b] disabled:opacity-35"
                    aria-label="Move later"
                  >
                    <ArrowDown size={12} />
                  </button>
                  <label className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-md border border-[#c5cbb8] px-1.5 text-[10px] font-semibold text-[#26352b]">
                    <Upload size={11} />
                    Swap
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={busy}
                      onChange={(e) => void replaceAt(index, e.target.files?.[0])}
                    />
                  </label>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => removeAt(index)}
                    className="ml-auto inline-flex h-7 items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-1.5 text-[10px] font-semibold text-rose-800"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#c5cbb8] bg-[#f8f6f1] px-4 py-8 text-center">
            <p className="text-sm font-medium text-[#26352b]">No gallery images yet</p>
            <p className="mt-1 text-xs text-[#4a5a50]">Upload one or more photos for the detail page.</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#364037] px-4 py-2 text-xs font-semibold text-white">
            <ImagePlus size={14} />
            {busy ? "Uploading…" : "Upload images"}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                if (e.target.files?.length) void uploadMany(e.target.files);
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => setPasteOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#c5cbb8] bg-white px-4 py-2 text-xs font-semibold text-[#26352b]"
          >
            <Link2 size={14} />
            Add by link
          </button>
          {urls.length > 0 ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (!confirm("Remove all gallery images?")) return;
                commit([]);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-800"
            >
              <Trash2 size={14} />
              Clear all
            </button>
          ) : null}
        </div>

        {pasteOpen ? (
          <div className="rounded-2xl border border-[#dde1d0] bg-white p-4">
            <p className="text-xs font-semibold tracking-wider text-[#4a5a50] uppercase">
              Paste image URLs
            </p>
            <textarea
              rows={3}
              value={pasteValue}
              onChange={(e) => setPasteValue(e.target.value)}
              placeholder={"One URL per line\nhttps://…"}
              className={`${inputClass} mt-2`}
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={addPasted}
                className="rounded-full bg-[#364037] px-3 py-1.5 text-xs font-semibold text-white"
              >
                Add links
              </button>
              <button
                type="button"
                onClick={() => {
                  setPasteOpen(false);
                  setPasteValue("");
                }}
                className="rounded-full border border-[#c5cbb8] px-3 py-1.5 text-xs font-semibold text-[#26352b]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {error ? <span className="mt-2 block text-xs text-rose-700">{error}</span> : null}
    </div>
  );
}
