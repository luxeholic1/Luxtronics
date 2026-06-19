import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Edit3, Loader2, Plus, Save, Tag, Trash2, X } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type BlogPost = {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  date: string;
  image?: string;
  background?: string;
  foreground?: string;
  content: string[];
};

type FormState = {
  title: string;
  excerpt: string;
  tag: string;
  date: string;
  image: string;
  background: string;
  foreground: string;
  content: string;
};

const SWATCHES = [
  { background: "#fd5200", foreground: "#ffffff", label: "Orange" },
  { background: "#000000", foreground: "#ffffff", label: "Black" },
  { background: "#F5F0E8", foreground: "#000000", label: "Cream" },
  { background: "#1A3DE8", foreground: "#ffffff", label: "Blue" },
];

const EMPTY_FORM: FormState = {
  title: "",
  excerpt: "",
  tag: "",
  date: "",
  image: "",
  background: SWATCHES[0].background,
  foreground: SWATCHES[0].foreground,
  content: "",
};

const toFormState = (post: BlogPost): FormState => ({
  title: post.title,
  excerpt: post.excerpt,
  tag: post.tag,
  date: post.date,
  image: post.image || "",
  background: post.background || SWATCHES[0].background,
  foreground: post.foreground || SWATCHES[0].foreground,
  content: post.content.join("\n\n"),
});

export default function AdminBlogs() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const { toast } = useToast();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/blogs");
      const json = await response.json();
      setPosts(json.success ? json.data : []);
    } catch {
      toast({ title: "Failed to load posts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const startCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const startEdit = (post: BlogPost) => {
    setEditingId(post._id);
    setForm(toFormState(post));
  };

  const handleSave = async () => {
    const content = form.content
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (!form.title.trim() || !form.excerpt.trim() || !form.tag.trim() || content.length === 0) {
      toast({ title: "Title, excerpt, tag, and content are required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        tag: form.tag.trim(),
        date: form.date.trim() || undefined,
        image: form.image.trim() || undefined,
        background: form.background,
        foreground: form.foreground,
        content,
      };

      const response = await fetch(editingId ? `/api/blogs/${editingId}` : "/api/blogs", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || "Failed to save post");
      }

      toast({ title: editingId ? "Post updated" : "Post published" });
      startCreate();
      fetchPosts();
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed to save post", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (post: BlogPost) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    try {
      const response = await fetch(`/api/blogs/${post._id}`, { method: "DELETE" });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Failed to delete post");
      toast({ title: "Post deleted" });
      if (editingId === post._id) startCreate();
      fetchPosts();
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed to delete post", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <SEO title="Admin — Blog Posts" description="Admin-only blog publishing panel." url="/admin/blogs" noindex nofollow />

      <section className="container py-8">
        <div className="mb-7 flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
          <div>
            <Link to="/admin" className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to admin
            </Link>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Admin only</p>
            <h1 className="mt-2 font-display text-3xl font-black tracking-tight text-foreground md:text-4xl">
              Blog Posts
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Publish, edit, or remove articles. Changes appear live on /blog immediately.
            </p>
          </div>
          <Button onClick={startCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            New post
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{editingId ? "Edit post" : "Create post"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="GaN Wall Chargers: Fast, Compact, and Built for Daily Carry"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="tag">Tag</Label>
                  <Input
                    id="tag"
                    value={form.tag}
                    onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
                    placeholder="Charging"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    placeholder="Jun 19, 2026 (defaults to today)"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  placeholder="One or two sentences shown on the blog card."
                />
              </div>

              <div>
                <Label htmlFor="image">Image URL (optional)</Label>
                <Input
                  id="image"
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <Label>Section color</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {SWATCHES.map((swatch) => (
                    <button
                      key={swatch.label}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, background: swatch.background, foreground: swatch.foreground }))}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                        form.background === swatch.background ? "border-primary ring-2 ring-primary/30" : "border-border"
                      }`}
                    >
                      <span
                        className="h-4 w-4 rounded-full border border-black/10"
                        style={{ backgroundColor: swatch.background }}
                      />
                      {swatch.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="content">Content (separate paragraphs with a blank line)</Label>
                <Textarea
                  id="content"
                  rows={10}
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder={"First paragraph...\n\nSecond paragraph..."}
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {editingId ? "Save changes" : "Publish post"}
                </Button>
                {editingId && (
                  <Button variant="outline" onClick={startCreate} className="gap-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Published posts ({posts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : posts.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No posts yet. Create the first one.</p>
              ) : (
                <div className="space-y-3">
                  {posts.map((post) => (
                    <div key={post._id} className="rounded-xl border border-border bg-background/60 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-foreground">{post.title}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {post.tag}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {post.date}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => startEdit(post)}>
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(post)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <Link to={`/blog/${post.slug}`} target="_blank" className="mt-2 inline-block text-xs font-semibold text-primary hover:underline">
                        View live →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
