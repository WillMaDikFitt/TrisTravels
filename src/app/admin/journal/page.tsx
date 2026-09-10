"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { stories as staticStories, type Story } from "@/data/stories";
import { fetchStoriesAdmin, fetchStoryAdmin } from "@/lib/actions/content-read";
import { deleteDocument, saveDocument } from "@/lib/actions/cms";
import { slugify } from "@/lib/slug";
import { AdminButton, Field, Notice, PageHeader, Panel, inputClass } from "@/components/admin/ui";
import { ImageField } from "@/components/admin/ImageField";
import { VisibilityToggle } from "@/components/admin/VisibilityToggle";
import { cn } from "@/lib/utils";

function blank(): Story {
  return {
    slug: "",
    title: "",
    excerpt: "",
    author: "",
    category: "Guest",
    date: new Date().toISOString().slice(0, 10),
    image: "",
    body: [],
  };
}

export default function AdminJournalPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [listReady, setListReady] = useState(false);
  const [story, setStory] = useState<Story | null>(null);
  const [creating, setCreating] = useState(false);
  const [editorEpoch, setEditorEpoch] = useState(0);
  const [openingSlug, setOpeningSlug] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchStoriesAdmin()
      .then((rows) => {
        if (cancelled) return;
        setStories(rows);
        setListReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setStories(staticStories);
        setListReady(true);
        setNote(
          "Could not reach live Journal data — showing local fallback. Prefer not to save until live load works.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const editing = creating ? blank() : story;

  const openEditor = async (row: Story) => {
    setCreating(false);
    setOpeningSlug(row.slug);
    setNote("");
    try {
      const fresh = await fetchStoryAdmin(row.slug);
      if (fresh?.removedFromCatalogue) {
        setStory(null);
        setNote("This story was removed from the catalogue.");
        const next = await fetchStoriesAdmin().catch(() => null);
        if (next) setStories(next);
      } else {
        setStory(fresh ?? row);
        setEditorEpoch((n) => n + 1);
      }
    } catch {
      setStory(row);
      setEditorEpoch((n) => n + 1);
      setNote("Could not refresh this story from live data — check carefully before saving.");
    } finally {
      setOpeningSlug(null);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Journal"
        description="Published stories on the public site. Editors open from live Studio data so seed defaults cannot overwrite your work. Incoming submissions live under Guest stories."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/story-submissions"
              className="rounded-full border border-[#c5cbb8] px-4 py-2 text-xs font-bold tracking-wider text-[#26352b] uppercase"
            >
              Guest stories
            </Link>
            <AdminButton
              type="button"
              disabled={!listReady}
              onClick={() => {
                setCreating(true);
                setStory(null);
                setEditorEpoch((n) => n + 1);
                setNote("");
              }}
            >
              New story
            </AdminButton>
          </div>
        }
      />
      {!listReady ? (
        <p className="text-sm text-[#4a5a50]">Loading saved stories…</p>
      ) : (
        <div className="space-y-6">
          <Panel className="overflow-x-auto">
            <p className="mb-3 text-xs font-semibold tracking-wider text-[#4a5a50] uppercase">Published</p>
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-[#f8f6f1] text-[11px] font-semibold tracking-wider text-[#4a5a50] uppercase">
                <tr>
                  <th className="px-3 py-2.5">Story</th>
                  <th className="px-3 py-2.5">Author</th>
                  <th className="px-3 py-2.5">Category</th>
                  <th className="px-3 py-2.5">Front</th>
                  <th className="px-3 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {stories.map((s) => (
                  <tr
                    key={s.slug}
                    className={cn(
                      "border-t border-[#dde1d0]",
                      !creating && story?.slug === s.slug ? "bg-[#eef0e3]" : "hover:bg-[#faf8f3]",
                    )}
                  >
                    <td className="max-w-[28rem] px-3 py-3 font-medium">{s.title}</td>
                    <td className="px-3 py-3 text-[#4a5a50]">{s.author || "—"}</td>
                    <td className="px-3 py-3 text-[#4a5a50]">{s.category}</td>
                    <td className="px-3 py-3">
                      <VisibilityToggle
                        collection="stories"
                        id={s.slug}
                        status={s.status}
                        onChange={(status) =>
                          setStories((prev) =>
                            prev.map((row) => (row.slug === s.slug ? { ...row, status } : row)),
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        type="button"
                        disabled={openingSlug === s.slug}
                        onClick={() => void openEditor(s)}
                        className="text-xs font-semibold text-[#364037] disabled:opacity-50"
                      >
                        {openingSlug === s.slug ? "Opening…" : "Edit"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          {editing ? (
            <form
              key={`${creating ? "new" : editing.slug}-${editorEpoch}`}
              onSubmit={async (e) => {
                e.preventDefault();
                if (!listReady) {
                  setNote("Still loading saved stories — wait, then try Save again.");
                  return;
                }
                const fd = new FormData(e.currentTarget);
                const title = String(fd.get("title"));
                const slug = creating ? slugify(String(fd.get("slug") || title)) : editing.slug;
                if (!slug) {
                  setNote("Add a title first.");
                  return;
                }
                const next: Story = {
                  ...editing,
                  slug,
                  title,
                  excerpt: String(fd.get("excerpt")),
                  author: String(fd.get("author")),
                  category: String(fd.get("category")),
                  date: String(fd.get("date") || editing.date),
                  image: String(fd.get("image")),
                  body: String(fd.get("body") || "")
                    .split("\n\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                  removedFromCatalogue: false,
                };
                setBusy(true);
                const res = await saveDocument("stories", slug, next as unknown as Record<string, unknown>);
                setBusy(false);
                setNote(res.ok ? `Saved ${next.title}` : res.error ?? "Could not save.");
                if (res.ok) {
                  setCreating(false);
                  setStory(next);
                  setEditorEpoch((n) => n + 1);
                  setStories((prev) => {
                    const i = prev.findIndex((s) => s.slug === slug);
                    if (i >= 0) {
                      const copy = [...prev];
                      copy[i] = next;
                      return copy;
                    }
                    return [next, ...prev];
                  });
                }
              }}
            >
              <Panel className="space-y-4">
                <p className="font-display text-xl">{creating ? "New journal story" : editing.title}</p>
                <Field label="Title">
                  <input name="title" required defaultValue={editing.title} className={inputClass} />
                </Field>
                {creating && (
                  <Field label="URL slug" hint="auto from title if blank">
                    <input name="slug" placeholder="rain-in-mawsynram" className={inputClass} />
                  </Field>
                )}
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Author">
                    <input name="author" defaultValue={editing.author} className={inputClass} />
                  </Field>
                  <Field label="Category">
                    <input name="category" defaultValue={editing.category} className={inputClass} />
                  </Field>
                  <Field label="Date">
                    <input name="date" type="date" defaultValue={editing.date} className={inputClass} />
                  </Field>
                </div>
                <Field label="Excerpt">
                  <textarea name="excerpt" rows={3} defaultValue={editing.excerpt} className={inputClass} />
                </Field>
                <Field label="Body" hint="paragraphs separated by a blank line">
                  <textarea name="body" rows={10} defaultValue={editing.body.join("\n\n")} className={inputClass} />
                </Field>
                <ImageField
                  key={`cover-${creating ? "new" : editing.slug}-${editing.image}-${editorEpoch}`}
                  name="image"
                  label="Cover image"
                  defaultValue={editing.image}
                />
                <div className="flex flex-wrap gap-2">
                  <AdminButton type="submit" disabled={busy || !listReady}>
                    {busy ? "Saving…" : "Save story"}
                  </AdminButton>
                  {!creating && story && (
                    <AdminButton
                      type="button"
                      variant="ghost"
                      onClick={async () => {
                        if (!confirm(`Remove “${story.title}” from the journal?`)) return;
                        const res = await deleteDocument("stories", story.slug);
                        setNote(res.ok ? `Removed ${story.title}` : res.error ?? "Could not remove.");
                        if (res.ok) {
                          const next = await fetchStoriesAdmin().catch(() => null);
                          if (next) setStories(next);
                          else setStories((prev) => prev.filter((s) => s.slug !== story.slug));
                          setStory(null);
                        }
                      }}
                    >
                      Remove
                    </AdminButton>
                  )}
                </div>
              </Panel>
            </form>
          ) : (
            <Panel>
              <p className="text-sm text-[#4a5a50]">Select a story to edit, or create a new one.</p>
            </Panel>
          )}
        </div>
      )}
      {note && (
        <div className="mt-6">
          <Notice tone={note.startsWith("Saved") || note.startsWith("Removed") ? "ok" : "warn"}>{note}</Notice>
        </div>
      )}
    </div>
  );
}
