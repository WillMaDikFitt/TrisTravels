"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { AdminButton, Notice, Panel } from "@/components/admin/ui";
import {
  DEFAULT_CRAFT_MAKERS,
  DEFAULT_CRAFT_PRODUCTS,
  makerCategoryLabels,
  normalizeCraftMakers,
  normalizeCraftProducts,
  type CraftMaker,
  type CraftProduct,
} from "@/data/artisans";
import {
  loadCraftMakers,
  loadCraftProducts,
  saveCraftMakers,
} from "@/lib/admin/crafts";

export function MakersTab() {
  const [items, setItems] = useState<CraftMaker[]>(() =>
    normalizeCraftMakers(null, DEFAULT_CRAFT_MAKERS),
  );
  const [crafts, setCrafts] = useState<CraftProduct[]>(() =>
    normalizeCraftProducts(null, DEFAULT_CRAFT_PRODUCTS),
  );
  const [note, setNote] = useState("");
  // Starts busy so Remove / Reset can't save over stored makers before they've loaded.
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    const url = new URL(window.location.href);
    const passed = url.searchParams.get("note");
    if (passed) {
      url.searchParams.delete("note");
      window.history.replaceState(null, "", url.pathname + url.search);
    }

    let cancelled = false;
    Promise.all([loadCraftMakers(), loadCraftProducts()])
      .then(([makers, products]) => {
        if (cancelled) return;
        setItems(makers);
        setCrafts(products);
        if (passed) setNote(passed);
      })
      .catch(() => {
        if (!cancelled)
          setNote("Could not load makers — showing the defaults.");
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = async (next: CraftMaker[], done: string) => {
    setBusy(true);
    setNote("");
    const res = await saveCraftMakers(next);
    setBusy(false);
    if (res.ok) {
      setItems(res.makers);
      setNote(done);
    } else {
      setNote(res.error);
    }
  };

  const remove = (maker: CraftMaker) => {
    if (items.length <= 1) {
      setNote(
        "Keep at least one maker. To hide it, open it and untick “Show on site”.",
      );
      return;
    }
    if (
      !confirm(`Remove ${maker.name}? It disappears from the site right away.`)
    )
      return;
    void persist(
      items.filter((row) => row.slug !== maker.slug),
      `${maker.name} removed — the makers page updates within a minute.`,
    );
  };

  const reset = () => {
    if (
      !confirm(
        "Replace every maker with the original default list? Your edits will be lost.",
      )
    )
      return;
    void persist(
      DEFAULT_CRAFT_MAKERS.map((row) => ({ ...row })),
      "Makers reset to the default list.",
    );
  };

  const craftImage = (slug: string) =>
    crafts.find((c) => c.slug === slug)?.image;

  return (
    <div>
      {note ? (
        <div className="mb-4">
          <Notice>{note}</Notice>
        </div>
      ) : null}

      <Panel>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-xl text-sm text-[#4a5a50]">
            Each maker is a card on the makers page and has its own profile page
            with photos, story and contact details.
          </p>
          <div className="flex flex-wrap gap-2">
            <AdminButton
              type="button"
              variant="ghost"
              onClick={reset}
              disabled={busy}
            >
              Reset to defaults
            </AdminButton>
            <Link href="/admin/crafts/makers/new">
              <AdminButton>
                <Plus size={14} className="mr-1 inline" />
                Add maker
              </AdminButton>
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          {items.map((item) => {
            const image =
              item.portrait || item.craftSlugs.map(craftImage).find(Boolean);
            const href = `/admin/crafts/makers/${encodeURIComponent(item.slug)}`;
            return (
              <div
                key={item.slug}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d5dbc8] bg-[#fbfcf8] p-4"
              >
                <Link
                  href={href}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <div className="h-14 w-16 shrink-0 overflow-hidden rounded-xl bg-[#eef1e6]">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-[9px] font-semibold text-[#8a9a8c] uppercase">
                        No photo
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-display text-lg text-[#26352b]">
                      {item.name}
                    </p>
                    <p className="text-xs text-[#4a5a50]">
                      {item.active === false ? "Hidden · " : ""}
                      {!image ? "No photo · " : ""}
                      {makerCategoryLabels[item.category]} ·{" "}
                      {item.craftSlugs.length} piece
                      {item.craftSlugs.length === 1 ? "" : "s"}
                      {item.location ? ` · ${item.location}` : ""}
                    </p>
                  </div>
                </Link>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/artisans/${encodeURIComponent(item.slug)}`}
                    target="_blank"
                    className="rounded-full border border-[#c5cbb8] px-3 py-1.5 text-xs font-semibold text-[#364037]"
                  >
                    View
                  </Link>
                  <Link
                    href={href}
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
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
