"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { addEnquiryNote, listEnquiries, updateEnquiryStatus } from "@/lib/actions/enquiries";
import type { EnquiryRecord, EnquirySource } from "@/lib/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { AdminButton, Badge, EmptyState, Field, PageHeader, Panel, inputClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const sources: Array<"all" | Exclude<EnquirySource, "story">> = [
  "all",
  "craft-my-journey",
  "journey",
  "contact",
  "partner",
];

const labels: Record<(typeof sources)[number], string> = {
  all: "All",
  "craft-my-journey": "Craft my journey",
  journey: "Journey",
  contact: "Contact",
  partner: "Partner",
};

const statusLabels = {
  new: "New",
  "in-progress": "In progress",
  closed: "Closed",
} as const;

export default function AdminEnquiriesPage() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<EnquiryRecord[]>([]);
  const [source, setSource] = useState<(typeof sources)[number]>("all");
  const [status, setStatus] = useState<"all" | EnquiryRecord["status"]>("new");
  const [open, setOpen] = useState<EnquiryRecord | null>(null);
  const [noteText, setNoteText] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = () =>
    listEnquiries().then((all) => {
      setRows(all);
      setOpen((prev) => (prev ? all.find((e) => e.id === prev.id) ?? null : null));
    });

  useEffect(() => {
    refresh();
  }, []);

  const inbox = useMemo(() => rows.filter((e) => e.source !== "story"), [rows]);

  const visible = useMemo(() => {
    return inbox.filter((e) => {
      if (source !== "all" && e.source !== source) return false;
      if (status !== "all" && e.status !== status) return false;
      return true;
    });
  }, [inbox, source, status]);

  const replyTemplate = open
    ? `Hi ${open.name},\n\nThanks for writing to TRIS Travels.\n\nRegarding your ${labels[open.source as Exclude<EnquirySource, "story">] ?? "enquiry".toLowerCase()}:\n\n\n\nWarm regards,\nTRIS Travels`
    : "";

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Enquiries"
        description="Craft briefs, journey asks, contact notes, and partner applications. Guest stories have their own inbox."
      />

      <div className="mb-3 flex flex-wrap gap-2">
        {sources.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSource(s)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold",
              source === s ? "bg-[#4a5a28] text-[#f7f4ee]" : "bg-white text-[#5c6350] ring-1 ring-[#d4cec0]",
            )}
          >
            {labels[s]}
          </button>
        ))}
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        {(["all", "new", "in-progress", "closed"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold",
              status === s ? "bg-[#c2643a] text-[#f7f4ee]" : "bg-white text-[#5c6350] ring-1 ring-[#d4cec0]",
            )}
          >
            {s === "all" ? "Any status" : statusLabels[s]}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {visible.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => {
                setOpen(e);
                setNoteText("");
              }}
              className={cn(
                "w-full rounded-2xl border bg-white p-4 text-left transition",
                open?.id === e.id ? "border-[#4a5a28]" : "border-[#e4dfd4] hover:border-[#c8c2b4]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold tracking-wider text-[#6b734f] uppercase">
                    {labels[e.source as Exclude<EnquirySource, "story">] ?? e.source}
                  </p>
                  <p className="mt-1 font-medium">
                    {e.name} · {e.email}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-[#5c6350]">{e.message}</p>
                </div>
                <Badge tone={e.status === "new" ? "amber" : e.status === "closed" ? "slate" : "olive"}>
                  {statusLabels[e.status]}
                </Badge>
              </div>
            </button>
          ))}
          {!visible.length && <EmptyState title="Nothing here" body="No enquiries in this filter." />}
        </div>

        {open && (
          <Panel className="h-fit space-y-4">
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-[#6b734f] uppercase">
                {labels[open.source as Exclude<EnquirySource, "story">] ?? open.source}
              </p>
              <h2 className="mt-2 font-display text-xl">{open.name}</h2>
              <p className="text-sm text-[#5c6350]">
                {open.email}
                {open.phone ? ` · ${open.phone}` : ""}
              </p>
              {open.source === "journey" && typeof open.payload?.journeySlug === "string" && (
                <Link
                  href={`/admin/journeys/${open.payload.journeySlug}`}
                  className="mt-2 inline-block text-xs font-semibold text-[#4a5a28] underline-offset-2 hover:underline"
                >
                  Open related journey
                </Link>
              )}
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{open.message}</p>
            {open.payload && (
              <dl className="space-y-1 text-sm">
                {Object.entries(open.payload)
                  .filter(([k]) => k !== "photos")
                  .map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 border-t border-[#f0ebe3] pt-1">
                      <dt className="text-[#8a917c]">{k}</dt>
                      <dd className="max-w-[60%] text-right break-words">
                        {Array.isArray(v) ? v.join(", ") : String(v)}
                      </dd>
                    </div>
                  ))}
              </dl>
            )}

            <label className="block text-sm font-medium">
              Status
              <select
                value={open.status}
                className={`${inputClass} mt-1.5 bg-white`}
                onChange={async (ev) => {
                  const next = ev.target.value as EnquiryRecord["status"];
                  await updateEnquiryStatus(open.id, next);
                  refresh();
                }}
              >
                <option value="new">New</option>
                <option value="in-progress">In progress</option>
                <option value="closed">Closed</option>
              </select>
            </label>

            <div>
              <p className="text-sm font-medium">Reply draft</p>
              <textarea readOnly rows={5} value={replyTemplate} className={`${inputClass} mt-1.5`} />
              <AdminButton
                type="button"
                variant="ghost"
                className="mt-2"
                onClick={() => navigator.clipboard.writeText(replyTemplate)}
              >
                Copy reply draft
              </AdminButton>
            </div>

            <Field label="Staff note">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={3}
                className={inputClass}
                placeholder="Call log, next step, what you emailed…"
              />
            </Field>
            <AdminButton
              type="button"
              variant="ghost"
              disabled={busy || !noteText.trim()}
              onClick={async () => {
                setBusy(true);
                await addEnquiryNote(open.id, noteText, profile?.name || profile?.email);
                setNoteText("");
                setBusy(false);
                refresh();
              }}
            >
              Add note
            </AdminButton>

            <div>
              <p className="text-[11px] font-semibold tracking-wider text-[#6b734f] uppercase">Trail</p>
              <ul className="mt-2 space-y-2">
                {(open.notes ?? []).length === 0 && (
                  <li className="text-sm text-[#8a917c]">No notes yet.</li>
                )}
                {[...(open.notes ?? [])].reverse().map((n, i) => (
                  <li key={`${n.at}-${i}`} className="rounded-xl border border-[#f0ebe3] px-3 py-2 text-sm">
                    <p>{n.text}</p>
                    <p className="mt-1 text-xs text-[#8a917c]">
                      {new Date(n.at).toLocaleString("en-IN")}
                      {n.by ? ` · ${n.by}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
