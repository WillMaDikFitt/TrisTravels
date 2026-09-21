"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { destinations as staticDest, type Destination } from "@/data/destinations";
import { fetchDestinationsAdmin } from "@/lib/actions/content-read";
import { AdminButton, Notice, PageHeader, Panel } from "@/components/admin/ui";
import { VisibilityToggle } from "@/components/admin/VisibilityToggle";

export default function AdminPlacesPage() {
  const [dests, setDests] = useState<Destination[]>([]);
  const [listReady, setListReady] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchDestinationsAdmin()
      .then((rows) => {
        if (cancelled) return;
        setDests(rows);
        setListReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setDests(staticDest);
        setListReady(true);
        setNote("Could not reach live Places data — showing local fallback.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Places"
        description="Destinations shown on the public site. Open a place to edit it on its own page."
        actions={
          <Link href="/admin/places/new">
            <AdminButton>New place</AdminButton>
          </Link>
        }
      />
      {!listReady ? (
        <p className="text-sm text-[#4a5a50]">Loading saved places…</p>
      ) : (
        <Panel className="overflow-x-auto">
          <p className="mb-3 text-xs font-semibold tracking-wider text-[#4a5a50] uppercase">All places</p>
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-[#f8f6f1] text-[11px] font-semibold tracking-wider text-[#4a5a50] uppercase">
              <tr>
                <th className="px-3 py-2.5">Place</th>
                <th className="px-3 py-2.5">Region</th>
                <th className="px-3 py-2.5">From Shillong</th>
                <th className="px-3 py-2.5">Front</th>
                <th className="px-3 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {dests.map((d) => (
                <tr key={d.slug} className="border-t border-[#dde1d0] hover:bg-[#faf8f3]">
                  <td className="px-3 py-3 font-medium">{d.name}</td>
                  <td className="px-3 py-3 text-[#4a5a50]">{d.region}</td>
                  <td className="px-3 py-3 text-[#4a5a50]">{d.distances.shillong || "—"}</td>
                  <td className="px-3 py-3">
                    <VisibilityToggle
                      collection="destinations"
                      id={d.slug}
                      status={d.status}
                      onChange={(status) =>
                        setDests((prev) =>
                          prev.map((row) => (row.slug === d.slug ? { ...row, status } : row)),
                        )
                      }
                    />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Link
                      href={`/admin/places/${d.slug}`}
                      className="text-xs font-semibold text-[#364037]"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
      {note ? (
        <div className="mt-6">
          <Notice tone="warn">{note}</Notice>
        </div>
      ) : null}
    </div>
  );
}
