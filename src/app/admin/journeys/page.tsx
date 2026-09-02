"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { journeys as staticJourneys, type Journey } from "@/data/journeys";
import { fetchJourneysAdmin } from "@/lib/actions/content-read";
import { deleteDocument } from "@/lib/actions/cms";
import { AdminButton, Badge, EmptyState, PageHeader } from "@/components/admin/ui";
import { formatINR } from "@/lib/utils";
import { nextOpenDeparture, seatsLeft } from "@/lib/journey-seats";

function statusLabel(status?: Journey["status"]) {
  if (status === "draft") return "Draft";
  if (status === "hidden") return "Hidden";
  return "Live";
}

export default function AdminJourneysPage() {
  const [rows, setRows] = useState<Journey[]>(staticJourneys);

  useEffect(() => {
    fetchJourneysAdmin()
      .then(setRows)
      .catch(() => setRows(staticJourneys));
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Journeys"
        description="Curated packages (enquire) and small-group departures with seat tracking."
        actions={
          <Link href="/admin/journeys/new">
            <AdminButton>New journey</AdminButton>
          </Link>
        }
      />
      {rows.length ? (
        <div className="overflow-hidden rounded-2xl border border-[#c5cbb8] bg-white">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-[#f8f6f1] text-[11px] font-semibold tracking-wider text-[#4a5a50] uppercase">
              <tr>
                <th className="px-4 py-3">Journey</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">Next seats</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((j) => {
                const next = nextOpenDeparture(j.departureSeats);
                return (
                  <tr key={j.slug} className="border-t border-[#dde1d0]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 overflow-hidden rounded-lg bg-[#efeae1]">
                          {j.image ? (
                            <Image src={j.image} alt="" fill className="object-cover" sizes="64px" />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-medium">{j.name}</p>
                          <p className="text-xs text-[#4a5a50]">
                            {j.days}D / {j.nights}N
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={j.type === "small-group" ? "olive" : "neutral"}>
                        {j.type === "small-group" ? "Small group" : "Curated"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={
                          j.status === "draft" ? "amber" : j.status === "hidden" ? "slate" : "green"
                        }
                      >
                        {statusLabel(j.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{formatINR(j.priceFrom)}</td>
                    <td className="px-4 py-3 text-[#4a5a50]">
                      {next ? (
                        <>
                          {next.date}
                          <span className="mt-0.5 block text-xs text-[#4a5a50]">
                            {seatsLeft(next)} left
                          </span>
                        </>
                      ) : (
                        j.nextDeparture || "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/journeys/${j.slug}`}
                        className="mr-3 text-xs font-semibold text-[#364037]"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="text-xs text-rose-700"
                        onClick={async () => {
                          if (!confirm(`Remove “${j.name}”?`)) return;
                          await deleteDocument("journeys", j.slug);
                          setRows((prev) => prev.filter((r) => r.slug !== j.slug));
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No journeys yet" body="Create a curated package or a small-group departure." />
      )}
    </div>
  );
}
