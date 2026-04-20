"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { InkButton } from "@/components/ui/InkButton";
import { api } from "@/lib/api";

interface DraftResponse {
  id: string;
}

type Visibility = "private" | "editors_only" | "public";

export default function NewDraftPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Fiction");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const createRes = await api.post<DraftResponse>("/drafts", {
        title,
        genre,
        content,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
          .slice(0, 12),
      });
      const draftId = createRes.data?.id;
      if (!draftId) throw new Error("Draft could not be created");

      if (visibility !== "private") {
        await api.post(`/drafts/${draftId}/share`, { visibility });
      }
      router.push(`/studio/${draftId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create draft");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <Link href="/studio" className="text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100">
          Back to Studio
        </Link>
        <GlassCard className="p-8 mt-4 space-y-6">
          <div>
            <h1 className="text-3xl font-serif font-black italic">Create New Draft</h1>
            <p className="text-sm opacity-60">Start your next manuscript and set visibility up front.</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Draft title"
              className="w-full px-4 py-3 rounded-xl bg-[#4a5033]/5 border border-[#4a5033]/10"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="px-4 py-3 rounded-xl bg-[#4a5033]/5 border border-[#4a5033]/10"
              >
                {["Fiction", "Non-Fiction", "Poetry", "Sci-Fi", "Fantasy", "Memoir", "Thriller"].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as Visibility)}
                className="px-4 py-3 rounded-xl bg-[#4a5033]/5 border border-[#4a5033]/10"
              >
                <option value="private">Private</option>
                <option value="editors_only">Shared with editors</option>
                <option value="public">Public</option>
              </select>
            </div>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tags (comma-separated, e.g. mystery, noir, first-person)"
              className="w-full px-4 py-3 rounded-xl bg-[#4a5033]/5 border border-[#4a5033]/10"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              placeholder="Write your opening lines..."
              className="w-full px-4 py-3 rounded-xl bg-[#4a5033]/5 border border-[#4a5033]/10"
            />
            {error ? <p className="text-xs text-rose-600 font-semibold">{error}</p> : null}
            <InkButton type="submit" className="px-6 py-3 rounded-xl" disabled={loading}>
              {loading ? "Creating..." : "Create Draft"}
            </InkButton>
          </form>
        </GlassCard>
      </div>
    </MainLayout>
  );
}
