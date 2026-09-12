"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import {
  blankFaqItem,
  DEFAULT_CURATED_JOURNEY_FAQS,
  DEFAULT_EXPERIENCE_FAQS,
  DEFAULT_HOME_FAQS,
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

type FaqSettingsKey = "experienceFaqs" | "curatedJourneyFaqs" | "homeFaqs";

const TABS: {
  id: SharedFaqKind;
  label: string;
  publicPath: string;
  publicLabel: string;
  settingsKey: FaqSettingsKey;
  seed: SharedFaqItem[];
  savedNote: string;
}[] = [
  {
    id: "experiences",
    label: "Experiences",
    publicPath: "/experiences/faqs",
    publicLabel: "/experiences/faqs",
    settingsKey: "experienceFaqs",
    seed: DEFAULT_EXPERIENCE_FAQS,
    savedNote: "Experience FAQs saved. All experience pages link to this list.",
  },
  {
    id: "curatedJourneys",
    label: "Curated journeys",
    publicPath: "/journeys/faqs",
    publicLabel: "/journeys/faqs",
    settingsKey: "curatedJourneyFaqs",
    seed: DEFAULT_CURATED_JOURNEY_FAQS,
    savedNote: "Curated journey FAQs saved. All curated journey pages link to this list.",
  },
  {
    id: "home",
    label: "Home page",
    publicPath: "/faqs",
    publicLabel: "/faqs (the homepage shows the first 6)",
    settingsKey: "homeFaqs",
    seed: DEFAULT_HOME_FAQS,
    savedNote:
      "Home page FAQs saved. The first 6 show on the homepage; the full list is on /faqs.",
  },
];

function tabFor(kind: SharedFaqKind) {
  return TABS.find((t) => t.id === kind) ?? TABS[0];
}

function readList(settings: PlatformSettings, kind: SharedFaqKind) {
  const tab = tabFor(kind);
  return normalizeSharedFaqs(settings[tab.settingsKey], tab.seed);
}

export default function FaqsAdminPage() {
  const [tab, setTab] = useState<SharedFaqKind>("experiences");
  // The settings load is async, so it reads the tab from a ref rather than a stale closure.
  const tabRef = useRef<SharedFaqKind>("experiences");
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
      setItems(readList(next, tabRef.current));
      if (TABS.some((t) => !next[t.settingsKey]?.length)) {
        const patched: PlatformSettings = { ...next };
        for (const t of TABS) patched[t.settingsKey] = normalizeSharedFaqs(next[t.settingsKey], t.seed);
        const res = await saveSettings(patched);
        if (!cancelled && res.ok) {
          setSettings(patched);
          setItems(readList(patched, tabRef.current));
          setNote("Loaded default FAQ lists into Studio. Edit anytime.");
        }
      }
    })().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const chooseTab = (next: SharedFaqKind) => {
    tabRef.current = next;
    setTab(next);
    setItems(readList(settings, next));
    setNote("");
  };

  const activeTab = tabFor(tab);

  const save = async (nextItems: SharedFaqItem[]) => {
    setBusy(true);
    setNote("");
    const cleaned = normalizeSharedFaqs(nextItems, []);
    const next: PlatformSettings = { ...settings, [activeTab.settingsKey]: cleaned };
    const res = await saveSettings(next);
    setBusy(false);
    if (res.ok) {
      setSettings(next);
      setItems(cleaned);
      setNote(activeTab.savedNote);
    } else {
      setNote(res.error ?? "Could not save.");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="FAQs"
        description="Shared Q&A for guests — one list for the homepage, one for all experiences, one for all curated journeys."
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
            onClick={() => chooseTab(option.id)}
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
              {activeTab.publicLabel}
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
