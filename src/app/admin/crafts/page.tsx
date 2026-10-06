"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { AdminButton, Notice, PageHeader, Panel } from "@/components/admin/ui";
import { DEFAULT_CRAFT_PRODUCTS, normalizeCraftProducts, type CraftProduct } from "@/data/artisans";
import { loadCraftProducts, saveCraftProducts } from "@/lib/admin/crafts";

export default function CraftsAdminPage() {
  const [items, setItems] = useState<CraftProduct[]>(() =>
    normalizeCraftProducts(null, DEFAULT_CRAFT_PRODUCTS),
  );
  const [note, setNote] = useState("");
  // Starts busy so Remove / Reset can't save over stored crafts before they've loaded.
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    // The editor sends its "Saved …" message here; show it once, then tidy the URL.
    const url = new URL(window.location.href);
    const passed = url.searchParams.get("note");
    if (passed) {
      url.searchParams.delete("note");
      window.history.replaceState(null, "", url.pathname + url.search);
    }

    let cancelled = false;
    loadCraftProducts()
      .then((next) => {
        if (cancelled) return;
        setItems(next);
        if (passed) setNote(passed);
      })
      .catch(() => {
        if (!cancelled) setNote("Could not load crafts — showing the defaults.");
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = async (next: CraftProduct[], done: string) => {
    setBusy(true);
    setNote("");
    const res = await saveCraftProducts(next);
    setBusy(false);
    if (res.ok) {
      setItems(res.crafts);
      setNote(done);
    } else {
      setNote(res.error);
    }
  };

  const remove = (craft: CraftProduct) => {
    if (items.length <= 1) {
      // An empty list falls back to the defaults, so hiding is done with "Show on site" instead.
      setNote("Keep at least one craft. To hide it, open it and untick “Show on site”.");
      return;
    }
    if (!confirm(`Remove ${craft.name}? It disappears from the site right away.`)) return;
    void persist(
      items.filter((row) => row.slug !== craft.slug),
      `${craft.name} removed — the Artisan’s Hub page updates within a minute.`,
    );
  };

  const reset = () => {
    if (!confirm("Replace every craft with the original default list? Your edits will be lost.")) return;
    void persist(
      DEFAULT_CRAFT_PRODUCTS.map((row) => ({ ...row })),
      "Crafts reset to the default list.",
    );
  };

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Crafts"
        description="The craft cards on the Artisan’s Hub page — add, edit, hide or remove pieces from the maker network."
        actions={
          <Link href="/admin/crafts/new">
            <AdminButton>
              <Plus size={14} className="mr-1 inline" />
              Add craft
            </AdminButton>
          </Link>
        }
      />

      {note ? (
        <div className="mb-4">
          <Notice>{note}</Notice>
        </div>
      ) : null}

      <Panel>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[#4a5a50]">
            Public page:{" "}
            <Link href="/artisans" className="font-semibold text-[#364037] underline" target="_blank">
              Artisan’s Hub
            </Link>
          </p>
          <AdminButton type="button" variant="ghost" onClick={reset} disabled={busy}>
            Reset to defaults
          </AdminButton>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.slug}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d5dbc8] bg-[#fbfcf8] p-4"
            >
              <Link
                href={`/admin/crafts/${encodeURIComponent(item.slug)}`}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <div className="h-14 w-16 shrink-0 overflow-hidden rounded-xl bg-[#eef1e6]">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-[9px] font-semibold text-[#8a9a8c] uppercase">
                      No photo
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-lg text-[#26352b]">{item.name}</p>
                  <p className="text-xs text-[#4a5a50]">
                    {item.active === false ? "Hidden · " : ""}
                    {!item.image ? "No photo, not shown · " : ""}
                    {item.bestSeller ? "Featured · " : ""}
                    {item.category}
                  </p>
                </div>
              </Link>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/crafts/${encodeURIComponent(item.slug)}`}
                  className="rounded-full border border-[#c5cbb8] px-3 py-1.5 text-xs font-semibold text-[#364037]"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => remove(item)}
                  className="inline-flex items-center gap-1 rounded-full border border-[#c5cbb8] px-3 py-1.5 text-xs font-semibold text-[#c96a3d] disabled:opacity-50"
                >
                  <Trash2 size={12} />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
