import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Edit3,
  FileText,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Tag,
  Trash2,
  Video,
  X,
} from "lucide-react";
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
  video?: string;
  images?: string[];
  bodyHtml?: string;
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
  video: string;
  images: string[];
  bodyHtml: string;
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
  video: "",
  images: [],
  bodyHtml: "",
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
  video: post.video || "",
  images: post.images || [],
  bodyHtml: post.bodyHtml || "",
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingGalleryImage, setUploadingGalleryImage] = useState(false);
  const [importingPdf, setImportingPdf] = useState(false);
  const [importingHtml, setImportingHtml] = useState(false);
  const { toast } = useToast();

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const htmlInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // no-store: the public /api/blogs response is cached for 60s for shoppers,
      // but the admin list must reflect deletes/edits immediately or a delete
      // can look like it silently failed when it actually succeeded.
      const response = await fetch("/api/blogs", { cache: "no-store" });
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

  const handleMediaUpload = async (file: File, kind: "image" | "video") => {
    const setUploading = kind === "image" ? setUploadingImage : setUploadingVideo;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/blogs/upload", { method: "POST", body });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Upload failed");
      setForm((f) => (kind === "image" ? { ...f, image: json.data.url } : { ...f, video: json.data.url }));
      toast({ title: `${kind === "image" ? "Image" : "Video"} uploaded` });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (files: FileList) => {
    setUploadingGalleryImage(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        const response = await fetch("/api/blogs/upload", { method: "POST", body });
        const json = await response.json();
        if (!response.ok || !json.success) throw new Error(json.error || "Upload failed");
        uploaded.push(json.data.url);
      }
      setForm((f) => ({ ...f, images: [...f.images, ...uploaded] }));
      toast({ title: `${uploaded.length} image(s) added to gallery` });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Upload failed", variant: "destructive" });
    } finally {
      setUploadingGalleryImage(false);
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  const handlePdfImport = async (file: File) => {
    setImportingPdf(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/blogs/parse-pdf", { method: "POST", body });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Could not read this PDF");
      setForm((f) => ({
        ...f,
        title: f.title.trim() ? f.title : json.data.suggestedTitle,
        excerpt: f.excerpt.trim() ? f.excerpt : json.data.suggestedExcerpt,
        content: json.data.content.join("\n\n"),
      }));
      toast({
        title: `Imported ${json.data.content.length} paragraph(s) from PDF`,
        description: "Review and edit before publishing — text-only extraction, images aren't pulled from the PDF.",
      });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Could not read this PDF", variant: "destructive" });
    } finally {
      setImportingPdf(false);
    }
  };

  const handleHtmlImport = async (file: File) => {
    setImportingHtml(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/blogs/parse-html", { method: "POST", body });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Could not read this HTML file");
      setForm((f) => ({
        ...f,
        title: f.title.trim() ? f.title : json.data.suggestedTitle,
        excerpt: f.excerpt.trim() ? f.excerpt : json.data.suggestedExcerpt,
        content: json.data.content.join("\n\n"),
        bodyHtml: json.data.bodyHtml || "",
      }));
      toast({
        title: "Imported from HTML",
        description: json.data.bodyHtml
          ? "Original formatting and inline CSS will be shown as-is on the blog page. Edit the plain text fields below only if you want a fallback."
          : "Review and edit before publishing — text-only extraction, images aren't pulled from the file.",
      });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Could not read this HTML file", variant: "destructive" });
    } finally {
      setImportingHtml(false);
    }
  };

  const handleSave = async () => {
    const content = form.content
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (!form.title.trim() || !form.excerpt.trim() || !form.tag.trim() || (content.length === 0 && !form.bodyHtml.trim())) {
      toast({ title: "Title, excerpt, tag, and content (or imported HTML) are required", variant: "destructive" });
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
        video: form.video.trim() || undefined,
        images: form.images,
        bodyHtml: form.bodyHtml.trim() || undefined,
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
    if (!window.confirm(`Delete "${post.title || "Untitled post"}"? This cannot be undone.`)) return;
    try {
      const response = await fetch(`/api/blogs/${post._id}`, { method: "DELETE" });
      const json = await response.json();
      // A 404 here means the post is already gone (e.g. a previous delete
      // succeeded but this list was showing a stale cached copy) — that's
      // the outcome the admin wanted, so treat it as success, not an error.
      if (!response.ok && response.status !== 404) throw new Error(json.error || "Failed to delete post");
      if (!json.success && response.status !== 404) throw new Error(json.error || "Failed to delete post");
      toast({ title: "Post deleted" });
      if (editingId === post._id) startCreate();
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
      fetchPosts();
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed to delete post", variant: "destructive" });
    }
  };

  const previewContent = form.content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const previewDividerClass = form.foreground === "#000000" ? "border-black/40" : "border-white/40";

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
              <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-foreground">Import from PDF</p>
                    <p className="text-xs text-muted-foreground">
                      Pulls text into title/excerpt/content. Images aren't extracted — upload those separately below.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={importingPdf}
                    onClick={() => pdfInputRef.current?.click()}
                  >
                    {importingPdf ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                    Choose PDF
                  </Button>
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePdfImport(file);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-foreground">Import from HTML</p>
                    <p className="text-xs text-muted-foreground">
                      Keeps your team's original layout and inline CSS — shown as-is on the blog page.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={importingHtml}
                    onClick={() => htmlInputRef.current?.click()}
                  >
                    {importingHtml ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                    Choose HTML
                  </Button>
                  <input
                    ref={htmlInputRef}
                    type="file"
                    accept="text/html,.html,.htm"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleHtmlImport(file);
                      e.target.value = "";
                    }}
                  />
                </div>
                {form.bodyHtml && (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
                    <p className="text-xs font-semibold text-primary">
                      Rich HTML imported — this will be shown on the blog page instead of the plain content below.
                    </p>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, bodyHtml: "" }))}
                      className="shrink-0 text-xs font-semibold text-muted-foreground hover:text-destructive"
                    >
                      Remove, use plain text
                    </button>
                  </div>
                )}
              </div>

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
                <Label htmlFor="image">Background image (optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="image"
                    value={form.image}
                    onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                    placeholder="https://images.unsplash.com/... or upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={uploadingImage}
                    onClick={() => imageInputRef.current?.click()}
                    title="Upload image"
                  >
                    {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                  </Button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleMediaUpload(file, "image");
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="video">Background video (optional, overrides image)</Label>
                <div className="flex gap-2">
                  <Input
                    id="video"
                    value={form.video}
                    onChange={(e) => setForm((f) => ({ ...f, video: e.target.value }))}
                    placeholder="https://... .mp4 or upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={uploadingVideo}
                    onClick={() => videoInputRef.current?.click()}
                    title="Upload video"
                  >
                    {uploadingVideo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                  </Button>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleMediaUpload(file, "video");
                      e.target.value = "";
                    }}
                  />
                </div>
                {form.video && (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, video: "" }))}
                    className="mt-1 text-xs font-semibold text-muted-foreground hover:text-destructive"
                  >
                    Remove video
                  </button>
                )}
              </div>

              <div>
                <Label>Gallery images (optional)</Label>
                <p className="text-xs text-muted-foreground">
                  Upload as many as you need — used as backgrounds for the content sections on the post page.
                </p>
                <div className="mt-2 flex flex-wrap gap-3">
                  {form.images.map((src, index) => (
                    <div key={src + index} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border">
                      <img src={src} alt={`Gallery ${index + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(index)}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        title="Remove"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="h-20 w-20 flex-col gap-1 text-xs"
                    disabled={uploadingGalleryImage}
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    {uploadingGalleryImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                    Add
                  </Button>
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) handleGalleryUpload(files);
                      e.target.value = "";
                    }}
                  />
                </div>
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

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Live preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl p-6"
                  style={{ backgroundColor: form.background || "#000", color: form.foreground || "#fff" }}
                >
                  {(form.video || form.image) && (
                    <div className="absolute inset-0">
                      {form.video ? (
                        <video src={form.video} muted loop autoPlay playsInline className="h-full w-full object-cover opacity-25" />
                      ) : (
                        <img src={form.image} alt="" className="h-full w-full object-cover opacity-25" />
                      )}
                      <div className="absolute inset-0" style={{ backgroundColor: form.background || "#000", opacity: 0.72 }} />
                    </div>
                  )}
                  <div className="relative flex h-full flex-col">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">
                      {form.tag || "Tag"}
                    </p>
                    <hr className={`my-3 border-none border-t ${previewDividerClass}`} />
                    <h3 className="font-display text-2xl font-bold uppercase leading-[0.95] tracking-tight">
                      {form.title || "Your headline"}
                    </h3>
                    <hr className={`my-3 border-none border-t ${previewDividerClass}`} />
                    <p className="line-clamp-3 text-sm leading-relaxed opacity-90">
                      {form.excerpt || "Excerpt preview will appear here."}
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold opacity-80">
                        <Calendar className="h-3 w-3" />
                        {form.date || "Today"}
                      </span>
                      <span className="rounded-full border border-current/30 bg-black/10 px-3 py-1.5 text-xs font-bold">
                        Read full article
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {previewContent.length} paragraph{previewContent.length === 1 ? "" : "s"} of content ready.
                </p>
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
        </div>
      </section>
    </Layout>
  );
}
