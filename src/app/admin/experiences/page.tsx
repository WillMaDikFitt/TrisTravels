"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { experiences as staticExperiences, type Experience } from "@/data/experiences";
import { fetchExperiencesAdmin } from "@/lib/actions/content-read";
import { deleteDocument } from "@/lib/actions/cms";
import { Badge, EmptyState, PageHeader, AdminButton, inputClass } from "@/components/admin/ui";
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

  useEffect(() => {
    fetchExperiencesAdmin()
      .then(setRows)
      .catch(() => setRows(staticExperiences));
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (e) =>
        e.name.toLowerCase().includes(s) ||
        e.category.toLowerCase().includes(s) ||
        e.location.toLowerCase().includes(s),
    );
  }, [rows, q]);

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Experiences"
        description="Day immersions travellers can book or request. Status controls what appears on the public site."
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
        <div className="overflow-hidden rounded-2xl border border-[#e4dfd4] bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#f7f4ee] text-[11px] font-semibold tracking-wider text-[#6b734f] uppercase">
              <tr>
                <th className="px-4 py-3">Experience</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.slug} className="border-t border-[#f0ebe3]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 overflow-hidden rounded-lg bg-[#efeae1]">
                        {e.image ? (
                          <Image src={e.image} alt="" fill className="object-cover" sizes="64px" />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-medium">{e.name}</p>
                        <p className="text-xs text-[#8a917c]">
                          {e.location} · {e.duration}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#5c6350]">{e.category}</td>
                  <td className="px-4 py-3">{formatINR(e.priceFrom)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone(e.status)}>{statusLabel(e.status)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/experiences/${e.slug}`} className="text-xs font-semibold text-[#4a5a28]">
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
