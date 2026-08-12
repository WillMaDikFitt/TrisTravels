"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listEnquiries, updateEnquiryStatus } from "@/lib/actions/enquiries";
import { publishGuestStory } from "@/lib/actions/cms";
import type { EnquiryRecord } from "@/lib/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { AdminButton, Badge, EmptyState, PageHeader, Panel, inputClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

function titleOf(e: EnquiryRecord) {
  const t = e.payload?.title;
  return typeof t === "string" && t.trim() ? t.trim() : "Untitled story";
}

function placeOf(e: EnquiryRecord) {
  const p = e.payload?.place;
  return typeof p === "string" && p.trim() ? p.trim() : null;
}

function photosOf(e: EnquiryRecord) {
  const p = e.payload?.photos;
  return Array.isArray(p) ? p.filter((u): u is string => typeof u === "string") : [];
}

export default function AdminStorySubmissionsPage() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<EnquiryRecord[]>([]);
  const [open, setOpen] = useState<EnquiryRecord | null>(null);
  const [filter, setFilter] = useState<"new" | "in-progress" | "closed" | "all">("new");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const refresh = () =>
    listEnquiries().then((all) => {
      const stories = all.filter((e) => e.source === "story");
      setRows(stories);
      setOpen((prev) => (prev ? stories.find((s) => s.id === prev.id) ?? null : null));
    });

  useEffect(() => {
    refresh();
  }, []);

  const visible = filter === "all" ? rows : rows.filter((e) => e.status === filter);

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Guest stories"
        description="Stories people send from the site. Publish ones you want into the Journal — this inbox is not the public list."
        actions={
          <Link
            href="/admin/journal"
            className="rounded-full bg-[#4a5a28] px-4 py-2 text-xs font-bold tracking-wider text-[#f7f4ee] uppercase"
          >
            Published journal
          </Link>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {(
          [
            ["new", "New"],
            ["in-progress", "In review"],
            ["closed", "Done"],
            ["all", "All"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold",
              filter === id ? "bg-[#4a5a28] text-[#f7f4ee]" : "bg-white text-[#5c6350] ring-1 ring-[#d4cec0]",
            )}
          >
            {label}
            {id !== "all" && (
              <span className="ml-1.5 tabular-nums opacity-70">
                {rows.filter((r) => r.status === id).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {message && (
        <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {visible.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => {
                setOpen(e);
                setMessage("");
              }}
              className={cn(
                "w-full rounded-2xl border bg-white p-4 text-left transition",
                open?.id === e.id ? "border-[#4a5a28]" : "border-[#e4dfd4] hover:border-[#c8c2b4]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-lg text-[#2a2e1f]">{titleOf(e)}</p>
                  <p className="mt-1 text-sm text-[#5c6350]">
                    {e.name}
                    {placeOf(e) ? ` · ${placeOf(e)}` : ""}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-[#5c6350]">{e.message}</p>
                </div>
                <Badge tone={e.status === "new" ? "amber" : e.status === "closed" ? "slate" : "olive"}>
                  {e.status === "in-progress" ? "in review" : e.status}
                </Badge>
              </div>
            </button>
          ))}
          {!visible.length && (
            <EmptyState
              title={filter === "new" ? "No new stories" : "Nothing here"}
              body="When someone shares a story on the site, it shows up here."
            />
          )}
        </div>

        {open && (
          <Panel className="h-fit space-y-4">
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-[#6b734f] uppercase">
                Guest submission
              </p>
              <h2 className="mt-2 font-display text-2xl">{titleOf(open)}</h2>
              <p className="mt-2 text-sm text-[#5c6350]">
                {open.name} · {open.email}
                {open.phone ? ` · ${open.phone}` : ""}
              </p>
              {(placeOf(open) || open.payload?.travelled) && (
                <p className="mt-1 text-sm text-[#8a917c]">
                  {[placeOf(open), open.payload?.travelled].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-[#2a2e1f]">{open.message}</p>
            {photosOf(open).length > 0 && (
              <div>
                <p className="text-[11px] font-semibold tracking-wider text-[#6b734f] uppercase">Photos</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {photosOf(open).map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="block overflow-hidden rounded-xl"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="h-28 w-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <AdminButton
                type="button"
                disabled={busy || open.status === "closed"}
                onClick={async () => {
                  setBusy(true);
                  setMessage("");
                  const res = await publishGuestStory(open.id, {
                    by: profile?.name || profile?.email,
                  });
                  setBusy(false);
                  if (!res.ok) {
                    setMessage(res.error);
                    return;
                  }
                  setMessage(`Published to journal: ${res.title}`);
                  refresh();
                }}
              >
                Publish to journal
              </AdminButton>
              <AdminButton
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  await updateEnquiryStatus(open.id, "in-progress");
                  setBusy(false);
                  refresh();
                }}
              >
                Mark in review
              </AdminButton>
              <AdminButton
                type="button"
                variant="danger"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  await updateEnquiryStatus(open.id, "closed");
                  setBusy(false);
                  setMessage("Marked done without publishing.");
                  refresh();
                }}
              >
                Done / decline
              </AdminButton>
            </div>

            <label className="block text-sm font-medium">
              Status
              <select
                value={open.status}
                className={`${inputClass} mt-1.5 bg-white`}
                onChange={async (ev) => {
                  const status = ev.target.value as EnquiryRecord["status"];
                  await updateEnquiryStatus(open.id, status);
                  refresh();
                }}
              >
                <option value="new">New</option>
                <option value="in-progress">In review</option>
                <option value="closed">Done</option>
              </select>
            </label>
          </Panel>
        )}
      </div>
    </div>
  );
}
