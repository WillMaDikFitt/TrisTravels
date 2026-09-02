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
              source === s ? "bg-[#364037] text-[#f8f6f1]" : "bg-white text-[#4a5a50] ring-1 ring-[#c5cbb8]",
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
              status === s ? "bg-[#c96a3d] text-[#f8f6f1]" : "bg-white text-[#4a5a50] ring-1 ring-[#c5cbb8]",
            )}
          >
            {s === "all" ? "Any status" : statusLabels[s]}
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        {visible.length ? (
          <div className="overflow-x-auto rounded-2xl border border-[#c5cbb8] bg-white shadow-[0_8px_24px_rgba(42,46,31,0.05)]">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-[#f8f6f1] text-[11px] font-semibold tracking-wider text-[#4a5a50] uppercase">
                <tr>
                  <th className="px-4 py-3">Received</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Traveller / partner</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((e) => (
                  <tr
                    key={e.id}
                    onClick={() => {
                      setOpen(e);
                      setNoteText("");
                    }}
                    className={cn(
                      "cursor-pointer border-t border-[#dde1d0] transition hover:bg-[#faf8f3]",
                      open?.id === e.id && "bg-[#eef0e3]",
                    )}
                  >
                    <td className="px-4 py-3 text-[#4a5a50]">
                      {new Date(e.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                      <span className="mt-0.5 block text-xs text-[#4a5a50]">
                        {new Date(e.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold tracking-wide text-[#4a5a50] uppercase">
                      {labels[e.source as Exclude<EnquirySource, "story">] ?? e.source}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{e.name}</p>
                      <p className="mt-0.5 text-xs text-[#4a5a50]">{e.email}</p>
                    </td>
                    <td className="max-w-[20rem] px-4 py-3 text-[#4a5a50]">
                      <p className="line-clamp-2">{e.message}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={e.status === "new" ? "amber" : e.status === "closed" ? "slate" : "olive"}>
                        {statusLabels[e.status]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Nothing here" body="No enquiries in this filter." />
        )}

        {open && (
          <Panel className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-[#4a5a50] uppercase">
                {labels[open.source as Exclude<EnquirySource, "story">] ?? open.source}
              </p>
              <h2 className="mt-2 font-display text-xl">{open.name}</h2>
              <p className="text-sm text-[#4a5a50]">
                {open.email}
                {open.phone ? ` · ${open.phone}` : ""}
              </p>
              {open.source === "journey" && typeof open.payload?.journeySlug === "string" && (
                <Link
                  href={`/admin/journeys/${open.payload.journeySlug}`}
                  className="mt-2 inline-block text-xs font-semibold text-[#364037] underline-offset-2 hover:underline"
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
                    <div key={k} className="flex justify-between gap-3 border-t border-[#dde1d0] pt-1">
                      <dt className="text-[#4a5a50]">{k}</dt>
                      <dd className="min-w-0 flex-1 text-right break-words">
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

            {String(open.payload?.paymentStatus || "") === "advance-paid" ? (
              <AdminButton
                type="button"
                onClick={async () => {
                  setBusy(true);
                  const { markEnquiryFullyPaid } = await import("@/lib/actions/payments");
                  await markEnquiryFullyPaid(open.id);
                  setBusy(false);
                  refresh();
                }}
                disabled={busy}
              >
                Mark fully paid &amp; email guest
              </AdminButton>
            ) : null}

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
              <p className="text-[11px] font-semibold tracking-wider text-[#4a5a50] uppercase">Trail</p>
              <ul className="mt-2 space-y-2">
                {(open.notes ?? []).length === 0 && (
                  <li className="text-sm text-[#4a5a50]">No notes yet.</li>
                )}
                {[...(open.notes ?? [])].reverse().map((n, i) => (
                  <li key={`${n.at}-${i}`} className="rounded-xl border border-[#dde1d0] px-3 py-2 text-sm">
                    <p>{n.text}</p>
                    <p className="mt-1 text-xs text-[#4a5a50]">
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
