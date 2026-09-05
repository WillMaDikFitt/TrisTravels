"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { experiences as staticExperiences, type Experience } from "@/data/experiences";
import { fetchExperiencesAdmin } from "@/lib/actions/content-read";
import { deleteDocument, saveDocument } from "@/lib/actions/cms";
import { sortExperiences } from "@/lib/experience-meta";
import { Badge, EmptyState, PageHeader, AdminButton, inputClass } from "@/components/admin/ui";
import { VisibilityToggle } from "@/components/admin/VisibilityToggle";
import { formatINR } from "@/lib/utils";

function statusTone(status?: string) {
  if (status === "active" || !status) return "green" as const;
  if (status === "seasonal") return "olive" as const;
  if (status === "soldOut") return "amber" as const;
  if (status === "draft" || status === "hidden") return "slate" as const;
  return "neutral" as const;
}

function statusLabel(status?: string) {
  if (!status || status === "active") return "Live";
  if (status === "soldOut") return "Sold out";
  if (status === "draft") return "Draft";
  if (status === "hidden") return "Hidden";
  if (status === "seasonal") return "Seasonal";
  return status;
}

export default function AdminExperiencesPage() {
  const [rows, setRows] = useState<Experience[]>(staticExperiences);
  const [q, setQ] = useState("");
  const [reordering, setReordering] = useState<string | null>(null);

  useEffect(() => {
    fetchExperiencesAdmin()
      .then(setRows)
      .catch(() => setRows(staticExperiences));
  }, []);

  const filtered = useMemo(() => {
    const sorted = sortExperiences(rows);
    const s = q.trim().toLowerCase();
    if (!s) return sorted;
    return sorted.filter(
      (e) =>
        e.name.toLowerCase().includes(s) ||
        e.category.toLowerCase().includes(s) ||
        e.location.toLowerCase().includes(s),
    );
  }, [rows, q]);

  const moveExperience = async (slug: string, direction: "up" | "down") => {
    const sorted = sortExperiences(rows);
    const index = sorted.findIndex((row) => row.slug === slug);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || swapIndex < 0 || swapIndex >= sorted.length) return;

    const current = sorted[index];
    const swap = sorted[swapIndex];
    const currentOrder = current.sortOrder ?? index * 10;
    const swapOrder = swap.sortOrder ?? swapIndex * 10;

    setReordering(slug);
    await Promise.all([
      saveDocument("experiences", current.slug, { sortOrder: swapOrder }),
      saveDocument("experiences", swap.slug, { sortOrder: currentOrder }),
    ]);
    setRows((prev) =>
      sortExperiences(
        prev.map((row) => {
          if (row.slug === current.slug) return { ...row, sortOrder: swapOrder };
          if (row.slug === swap.slug) return { ...row, sortOrder: currentOrder };
          return row;
        }),
      ),
    );
    setReordering(null);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Experiences"
        description="Day immersions travellers can book or request. Use the arrows to control browse order."
        actions={
          <Link href="/admin/experiences/new">
            <AdminButton>New experience</AdminButton>
          </Link>
        }
      />
      <label className="mb-5 block max-w-md">
        <span className="sr-only">Search experiences</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, type, place…"
          className={`${inputClass} bg-white`}
        />
      </label>
      {filtered.length ? (
        <div className="overflow-hidden rounded-2xl border border-[#c5cbb8] bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#f8f6f1] text-[11px] font-semibold tracking-wider text-[#4a5a50] uppercase">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Experience</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, index) => (
                <tr key={e.slug} className="border-t border-[#dde1d0]">
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        aria-label={`Move ${e.name} up`}
                        disabled={index === 0 || reordering === e.slug}
                        onClick={() => moveExperience(e.slug, "up")}
                        className="rounded border border-[#c5cbb8] p-1 text-[#364037] disabled:opacity-30"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Move ${e.name} down`}
                        disabled={index === filtered.length - 1 || reordering === e.slug}
                        onClick={() => moveExperience(e.slug, "down")}
                        className="rounded border border-[#c5cbb8] p-1 text-[#364037] disabled:opacity-30"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 overflow-hidden rounded-lg bg-[#efeae1]">
                        {e.image ? (
                          <Image src={e.image} alt="" fill className="object-cover" sizes="64px" />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-medium">{e.name}</p>
                        <p className="text-xs text-[#4a5a50]">
                          {e.location} · {e.duration}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#4a5a50]">{e.category}</td>
                  <td className="px-4 py-3">{formatINR(e.priceFrom)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={statusTone(e.status)}>{statusLabel(e.status)}</Badge>
                      <VisibilityToggle
                        collection="experiences"
                        id={e.slug}
                        status={e.status}
                        onChange={(status) =>
                          setRows((prev) =>
                            prev.map((row) => (row.slug === e.slug ? { ...row, status } : row)),
                          )
                        }
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/experiences/${e.slug}`} className="text-xs font-semibold text-[#364037]">
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="text-xs text-rose-700"
                        onClick={async () => {
                          if (!confirm(`Remove “${e.name}” from the catalogue?`)) return;
                          await deleteDocument("experiences", e.slug);
                          setRows((prev) => prev.filter((r) => r.slug !== e.slug));
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No experiences match" body="Try another search, or create a new day immersion." />
      )}
    </div>
  );
}
