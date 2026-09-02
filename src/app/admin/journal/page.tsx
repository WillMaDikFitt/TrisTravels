"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { stories as staticStories, type Story } from "@/data/stories";
import { fetchStoriesAdmin } from "@/lib/actions/content-read";
import { deleteDocument, saveDocument } from "@/lib/actions/cms";
import { slugify } from "@/lib/slug";
import { AdminButton, Field, Notice, PageHeader, Panel, inputClass } from "@/components/admin/ui";
import { ImageField } from "@/components/admin/ImageField";
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
  const [stories, setStories] = useState(staticStories);
  const [story, setStory] = useState<Story | null>(null);
  const [creating, setCreating] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchStoriesAdmin().then(setStories);
  }, []);

  const editing = creating ? blank() : story;

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Journal"
        description="Published stories on the public site. Incoming submissions live under Guest stories."
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
              onClick={() => {
                setCreating(true);
                setStory(null);
                setNote("");
              }}
            >
              New story
            </AdminButton>
          </div>
        }
      />
      <div className="space-y-6">
        <Panel className="overflow-x-auto">
          <p className="mb-3 text-xs font-semibold tracking-wider text-[#4a5a50] uppercase">Published</p>
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-[#f8f6f1] text-[11px] font-semibold tracking-wider text-[#4a5a50] uppercase">
              <tr>
                <th className="px-3 py-2.5">Story</th>
                <th className="px-3 py-2.5">Author</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5">Published</th>
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
                <td className="px-3 py-3 text-[#4a5a50]">{s.date}</td>
                <td className="px-3 py-3 text-right">
                  <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setStory(s);
                    setNote("");
                  }}
                  className="text-xs font-semibold text-[#364037]"
                >
                  Edit
                </button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </Panel>

        {editing ? (
          <form
            key={creating ? "new" : editing.slug}
            onSubmit={async (e) => {
              e.preventDefault();
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
              };
              setBusy(true);
              const res = await saveDocument("stories", slug, next as unknown as Record<string, unknown>);
              setBusy(false);
              setNote(res.ok ? `Saved ${next.title}` : res.error ?? "Could not save.");
              if (res.ok) {
                setCreating(false);
                setStory(next);
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
              <ImageField name="image" label="Cover image" defaultValue={editing.image} />
              <div className="flex flex-wrap gap-2">
                <AdminButton type="submit" disabled={busy}>
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
                        setStories((prev) => prev.filter((s) => s.slug !== story.slug));
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
      {note && (
        <div className="mt-6">
          <Notice tone={note.startsWith("Saved") || note.startsWith("Removed") ? "ok" : "warn"}>{note}</Notice>
        </div>
      )}
    </div>
  );
}
