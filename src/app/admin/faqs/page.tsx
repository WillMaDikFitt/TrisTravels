"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import {
  blankFaqItem,
  DEFAULT_CURATED_JOURNEY_FAQS,
  DEFAULT_EXPERIENCE_FAQS,
  normalizeSharedFaqs,
  type SharedFaqItem,
  type SharedFaqKind,
} from "@/data/shared-faqs";
import { fetchSettingsAdmin } from "@/lib/actions/content-read";
import { saveSettings } from "@/lib/actions/cms";
import { DEFAULT_SETTINGS } from "@/lib/catalog";
import type { PlatformSettings } from "@/lib/types";
import { AdminButton, Field, Notice, PageHeader, Panel, inputClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const TABS: { id: SharedFaqKind; label: string; publicPath: string; seed: SharedFaqItem[] }[] = [
  {
    id: "experiences",
    label: "Experiences",
    publicPath: "/experiences/faqs",
    seed: DEFAULT_EXPERIENCE_FAQS,
  },
  {
    id: "curatedJourneys",
    label: "Curated journeys",
    publicPath: "/journeys/faqs",
    seed: DEFAULT_CURATED_JOURNEY_FAQS,
  },
];

function readList(settings: PlatformSettings, kind: SharedFaqKind) {
  return kind === "experiences"
    ? normalizeSharedFaqs(settings.experienceFaqs, DEFAULT_EXPERIENCE_FAQS)
    : normalizeSharedFaqs(settings.curatedJourneyFaqs, DEFAULT_CURATED_JOURNEY_FAQS);
}

export default function FaqsAdminPage() {
  const [tab, setTab] = useState<SharedFaqKind>("experiences");
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [items, setItems] = useState<SharedFaqItem[]>(DEFAULT_EXPERIENCE_FAQS);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next = await fetchSettingsAdmin();
      if (cancelled) return;
      setSettings(next);
      setItems(readList(next, tab));
      const expEmpty = !next.experienceFaqs?.length;
      const journeyEmpty = !next.curatedJourneyFaqs?.length;
      if (expEmpty || journeyEmpty) {
        const patched: PlatformSettings = {
          ...next,
          experienceFaqs: expEmpty
            ? DEFAULT_EXPERIENCE_FAQS.map((row) => ({ ...row }))
            : normalizeSharedFaqs(next.experienceFaqs, DEFAULT_EXPERIENCE_FAQS),
          curatedJourneyFaqs: journeyEmpty
            ? DEFAULT_CURATED_JOURNEY_FAQS.map((row) => ({ ...row }))
            : normalizeSharedFaqs(next.curatedJourneyFaqs, DEFAULT_CURATED_JOURNEY_FAQS),
        };
        const res = await saveSettings(patched);
        if (!cancelled && res.ok) {
          setSettings(patched);
          setItems(readList(patched, tab));
          setNote("Loaded default FAQ catalogues into Studio. Edit anytime.");
        }
      }
    })().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setItems(readList(settings, tab));
  }, [tab, settings]);

  const save = async (nextItems: SharedFaqItem[]) => {
    setBusy(true);
    setNote("");
    const cleaned = normalizeSharedFaqs(nextItems, []);
    const next: PlatformSettings = {
      ...settings,
      ...(tab === "experiences"
        ? { experienceFaqs: cleaned }
        : { curatedJourneyFaqs: cleaned }),
    };
    const res = await saveSettings(next);
    setBusy(false);
    if (res.ok) {
      setSettings(next);
      setItems(cleaned);
      setNote(
        tab === "experiences"
          ? "Experience FAQs saved. All experience pages link to this list."
          : "Curated journey FAQs saved. All curated journey pages link to this list.",
      );
    } else {
      setNote(res.error ?? "Could not save.");
    }
  };

  const activeTab = TABS.find((t) => t.id === tab)!;

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="FAQs"
        description="Shared Q&A for guests — one list for all experiences, one for all curated journeys. Listing pages only show a View FAQs card."
        actions={
          <AdminButton onClick={() => void save(items)} disabled={busy}>
            {busy ? "Saving…" : "Save FAQs"}
          </AdminButton>
        }
      />

      {note ? (
        <div className="mb-4">
          <Notice>{note}</Notice>
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setTab(option.id)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition",
              tab === option.id
                ? "border-[#364037] bg-[#364037] text-[#f8f6f1]"
                : "border-[#c5cbb8] bg-white text-[#364037] hover:border-[#8fa183]",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <Panel>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[#4a5a50]">
            Public page:{" "}
            <Link href={activeTab.publicPath} className="font-semibold text-[#364037] underline" target="_blank">
              {activeTab.publicPath}
            </Link>
          </p>
          <div className="flex flex-wrap gap-2">
            <AdminButton
              type="button"
              variant="ghost"
              onClick={() => {
                if (!confirm(`Replace this list with the default ${activeTab.label.toLowerCase()} FAQs?`)) {
                  return;
                }
                setItems(activeTab.seed.map((row) => ({ ...row })));
              }}
            >
              Reset to defaults
            </AdminButton>
            <AdminButton
              type="button"
              variant="ghost"
              onClick={() => setItems((prev) => [...prev, blankFaqItem(prev.length)])}
            >
              <Plus size={14} className="mr-1 inline" />
              Add question
            </AdminButton>
          </div>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[#d5dbc8] bg-[#fbfcf8] p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold tracking-wide text-[#4a5a50] uppercase">
                  Question {index + 1}
                </p>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-medium text-[#364037]">
                    <input
                      type="checkbox"
                      checked={item.active !== false}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((row, i) =>
                            i === index ? { ...row, active: e.target.checked } : row,
                          ),
                        )
                      }
                    />
                    Published
                  </label>
                  <AdminButton
                    type="button"
                    variant="ghost"
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <Trash2 size={14} />
                  </AdminButton>
                </div>
              </div>
              <div className="grid gap-3">
                <Field label="Question">
                  <input
                    value={item.q}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((row, i) => (i === index ? { ...row, q: e.target.value } : row)),
                      )
                    }
                    className={inputClass}
                    placeholder="e.g. How far ahead should I book?"
                  />
                </Field>
                <Field label="Answer">
                  <textarea
                    rows={3}
                    value={item.a}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((row, i) => (i === index ? { ...row, a: e.target.value } : row)),
                      )
                    }
                    className={inputClass}
                    placeholder="Clear guest-facing answer"
                  />
                </Field>
                <Field label="Sort order" hint="Lower numbers appear first">
                  <input
                    type="number"
                    value={item.sortOrder ?? index + 1}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((row, i) =>
                          i === index
                            ? { ...row, sortOrder: Math.round(Number(e.target.value) || index + 1) }
                            : row,
                        ),
                      )
                    }
                    className={cn(inputClass, "max-w-[8rem]")}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <AdminButton onClick={() => void save(items)} disabled={busy}>
            {busy ? "Saving…" : "Save FAQs"}
          </AdminButton>
          <AdminButton
            type="button"
            variant="ghost"
            onClick={() => setItems((prev) => [...prev, blankFaqItem(prev.length)])}
          >
            Add question
          </AdminButton>
        </div>
      </Panel>
    </div>
  );
}
