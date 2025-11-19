import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Save, ArrowLeft, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { z } from "zod";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/tiptap/rich-text-editor";
import { toast } from "@/components/ui/use-toast";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { useImageUpload } from "@/hooks/use-image-upload";
import { useUpsertBlogPostMutation, type BlogPostStatus } from "../hooks/useAdminMutations";

const blogPostStatusEnum = z.enum(["draft", "published", "archived"] as const);

type BlogPostStatusType = z.infer<typeof blogPostStatusEnum>;

const statusOptions: ReadonlyArray<{ value: BlogPostStatusType; label: string }> = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const BLOG_POST_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const blogPostMetadataSchema = z.object({
  title: z.string().min(2, "Title is required."),
  slug: z
    .string()
    .min(2, "Slug is required.")
    .regex(BLOG_POST_SLUG_PATTERN, "Slug can only contain lowercase letters, numbers, and hyphens."),
  status: blogPostStatusEnum,
});

const DEFAULT_CONTENT = "<p>Start writing your blog post...</p>";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const BlogPostEditor = () => {
  const { slug: slugParam } = useParams<{ slug: string }>();
  const isNewBlogPost = !slugParam;
  const navigate = useNavigate();
  const { session } = useSupabaseSession();

  const [blogPostId, setBlogPostId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slugValue, setSlugValue] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImageSrc, setFeaturedImageSrc] = useState("");
  const [featuredImageAlt, setFeaturedImageAlt] = useState("");
  const [status, setStatus] = useState<BlogPostStatusType>("draft");
  const [content, setContent] = useState<string>(DEFAULT_CONTENT);

  const [loading, setLoading] = useState(!isNewBlogPost);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!isNewBlogPost);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const upsertBlogPost = useUpsertBlogPostMutation();

  // Featured image upload
  const getFeaturedImageInitialUrl = useMemo(() => {
    if (featuredImageSrc) {
      // If it's already a full URL, return it
      if (featuredImageSrc.startsWith("http")) {
        return featuredImageSrc;
      }
      // If it's a storage path, get the public URL
      const client = getSupabaseClient();
      if (!client) return null;
      const { data } = client.storage.from("public-assets").getPublicUrl(featuredImageSrc);
      return data.publicUrl;
    }
    return null;
  }, [featuredImageSrc]);

  const {
    previewUrl: featuredImagePreview,
    handleThumbnailClick: handleFeaturedImageClick,
    handleFileChange: handleFeaturedImageFileChange,
    handleRemove: handleFeaturedImageRemove,
    fileInputRef: featuredImageFileInputRef,
    uploading: featuredImageUploading,
    error: featuredImageUploadError,
  } = useImageUpload({
    folder: (slugParam ?? slugValue) ? `blog-posts/${slugParam ?? slugValue}/featured` : "blog-posts/featured",
    onUpload: ({ url, path }) => {
      // Use the storage path for featured_image.src
      setFeaturedImageSrc(path || url);
      setDirty(true);
    },
    onRemove: () => {
      setFeaturedImageSrc("");
      setFeaturedImageAlt("");
      setDirty(true);
    },
    initialUrl: getFeaturedImageInitialUrl,
  });

  useEffect(() => {
    if (isNewBlogPost) {
      setBlogPostId(null);
      setTitle("");
      setSlugValue("");
      setExcerpt("");
      setFeaturedImageSrc("");
      setFeaturedImageAlt("");
      setStatus("draft");
      setContent(DEFAULT_CONTENT);
      setDirty(false);
      setLoadError(null);
      setSlugTouched(false);
      return;
    }

    const client = getSupabaseClient({ privileged: true }) ?? getSupabaseClient();
    if (!client) {
      setLoadError("Supabase client is not configured. Check environment variables.");
      return;
    }

    let isMounted = true;

    const loadBlogPost = async () => {
      setLoading(true);
      setLoadError(null);

      const { data: blogPostData, error: blogPostError } = await client
        .from("blog_posts")
        .select("id, slug, title, excerpt, content, status, featured_image")
        .eq("slug", slugParam)
        .maybeSingle();

      if (!isMounted) return;

      if (blogPostError || !blogPostData) {
        setLoadError(blogPostError?.message ?? "Blog post not found.");
        setLoading(false);
        return;
      }

      setBlogPostId(blogPostData.id);
      setTitle(blogPostData.title ?? "");
      setExcerpt(blogPostData.excerpt ?? "");
      setStatus((blogPostData.status as BlogPostStatusType) ?? "draft");
      setSlugValue(blogPostData.slug ?? "");
      setSlugTouched(true);
      setContent(blogPostData.content ?? DEFAULT_CONTENT);

      // Parse featured_image
      const featuredImage = blogPostData.featured_image as { src?: string; alt?: string } | null;
      if (featuredImage && typeof featuredImage === "object") {
        setFeaturedImageSrc(featuredImage.src ?? "");
        setFeaturedImageAlt(featuredImage.alt ?? "");
      } else {
        setFeaturedImageSrc("");
        setFeaturedImageAlt("");
      }

      setDirty(false);
      setLoading(false);
    };

    void loadBlogPost();

    return () => {
      isMounted = false;
    };
  }, [isNewBlogPost, slugParam]);

  useEffect(() => {
    if (!isNewBlogPost && slugParam) {
      setSlugTouched(true);
    }
  }, [isNewBlogPost, slugParam]);

  useEffect(() => {
    if (!isNewBlogPost || slugTouched) {
      return;
    }

    if (!title.trim()) {
      setSlugValue("");
      return;
    }

    setSlugValue(slugify(title));
  }, [isNewBlogPost, slugTouched, title]);

  useEffect(() => {
    if (dirty) {
      setLastSavedAt(null);
    }
  }, [dirty]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setDirty(true);
    if (isNewBlogPost && !slugTouched) {
      setSlugValue(slugify(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setSlugValue(value);
    setDirty(true);
  };

  const handleSlugBlur = () => {
    setSlugValue((current) => {
      const sanitized = slugify(current);
      if (sanitized !== current) {
        setDirty(true);
      }
      return sanitized;
    });
  };

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    const trimmedSlug = slugify(slugValue);

    const validation = blogPostMetadataSchema.safeParse({ title: trimmedTitle, slug: trimmedSlug, status });
    if (!validation.success) {
      setFormError(validation.error.issues[0]?.message ?? "Please review the highlighted fields.");
      return;
    }

    if (!session?.user?.id) {
      setFormError("You must be signed in to save blog posts.");
      return;
    }

    setFormError(null);

    try {
      // Prepare featured_image
      const featuredImage = featuredImageSrc.trim()
        ? {
            src: featuredImageSrc.trim(),
            alt: featuredImageAlt.trim() || trimmedTitle,
          }
        : null;

      const result = await upsertBlogPost.mutateAsync({
        id: blogPostId ?? undefined,
        title: trimmedTitle,
        slug: trimmedSlug,
        excerpt: excerpt.trim() || null,
        content: content ?? "",
        featured_image: featuredImage,
        status: status as BlogPostStatus,
        updated_by: session.user.id,
      });

      setBlogPostId(result.id);
      setSlugValue(result.slug);
      setDirty(false);
      toast({
        title: "Blog post saved",
        description: "Your changes have been stored successfully.",
      });

      if (isNewBlogPost) {
        navigate(`/admin/blog-posts/${result.slug}`, { replace: true });
      }
      setLastSavedAt(new Date());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save blog post.";
      setFormError(message);
      toast({
        title: "Save failed",
        description: message,
      });
    }
  };

  const memoisedStatusOptions = useMemo(() => statusOptions, []);
  const canSave = dirty && !upsertBlogPost.isPending && !featuredImageUploading;
  const saveStatusLabel = upsertBlogPost.isPending
    ? "Saving…"
    : dirty
      ? "Unsaved changes"
      : lastSavedAt
        ? `Saved ${formatDistanceToNow(lastSavedAt, { addSuffix: true })}`
        : "All changes saved";
  const saveStatusTone = upsertBlogPost.isPending
    ? "text-white"
    : dirty
      ? "text-amber-300"
      : "text-emerald-300";

  const body = loadError ? (
    <Card className="border-rose-500/30 bg-rose-500/10 text-rose-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-rose-100">
          <AlertCircle className="h-5 w-5" />
          Unable to load blog post
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>{loadError}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" className="rounded-full" onClick={() => navigate(-1)}>
            Go back
          </Button>
          <Button
            className="rounded-full bg-white text-black hover:bg-white/90"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </CardContent>
    </Card>
  ) : loading ? (
    <Card className="border-white/10 bg-white/5 text-white/70">
      <CardContent className="flex items-center gap-3 py-10 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading blog post…
      </CardContent>
    </Card>
  ) : (
    <>
      {formError ? (
        <div className="flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          <AlertCircle className="h-4 w-4" />
          <span>{formError}</span>
        </div>
      ) : null}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Blog Post Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-white/70">
                  Title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  onBlur={handleSlugBlur}
                  className="bg-white/5 text-white"
                />
              </div>
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-white/70">
                  Slug
                </label>
                <Input
                  id="slug"
                  value={slugValue}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  onBlur={handleSlugBlur}
                  className="bg-white/5 text-white"
                />
              </div>
              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-white/70">
                  Excerpt
                </label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => {
                    setExcerpt(e.target.value);
                    setDirty(true);
                  }}
                  placeholder="A short summary of the blog post..."
                  className="bg-white/5 text-white"
                  rows={3}
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-white/70">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as BlogPostStatusType);
                    setDirty(true);
                  }}
                  className="bg-white/5 text-white"
                >
                  {memoisedStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Featured Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-white/70">
                Upload a featured image that will be displayed with the blog post.
              </p>
              <div className="space-y-3 rounded-lg border border-dashed border-white/20 bg-white/5 p-4">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex h-48 w-full items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/40 md:w-1/2">
                    {featuredImagePreview ? (
                      <img src={featuredImagePreview} alt="Featured image preview" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs uppercase tracking-[0.3em] text-white/40">No image selected</span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <input
                      ref={featuredImageFileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleFeaturedImageFileChange}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full border-white/20 text-white/80 hover:bg-white/10"
                        onClick={handleFeaturedImageClick}
                        disabled={featuredImageUploading}
                      >
                        {featuredImageUploading ? "Uploading…" : "Choose image"}
                      </Button>
                      {featuredImagePreview ? (
                        <Button
                          type="button"
                          variant="ghost"
                          className="rounded-full border border-white/20 text-white/70 hover:text-white"
                          onClick={handleFeaturedImageRemove}
                          disabled={featuredImageUploading}
                        >
                          Remove
                        </Button>
                      ) : null}
                    </div>
                    {featuredImageUploadError ? <p className="text-xs text-rose-200">{featuredImageUploadError}</p> : null}
                  </div>
                </div>
                {featuredImagePreview ? (
                  <div>
                    <label htmlFor="featured-image-alt" className="block text-sm font-medium text-white/70 mb-2">
                      Alt text
                    </label>
                    <Input
                      id="featured-image-alt"
                      value={featuredImageAlt}
                      onChange={(e) => {
                        setFeaturedImageAlt(e.target.value);
                        setDirty(true);
                      }}
                      placeholder="Descriptive text for the image"
                      className="bg-white/5 text-white"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Content</CardTitle>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              value={content}
              onChange={({ html }) => {
                setContent(html);
                setDirty(true);
              }}
              placeholder="Write your blog post content here..."
              className="border-white/10 bg-white/5"
            />
          </CardContent>
        </Card>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-white/5 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Blog Posts</p>
          <h1 className="text-3xl font-semibold text-white">{isNewBlogPost ? "Create blog post" : `Edit blog post`}</h1>
          <p className="text-sm text-white/70">Write and edit blog posts using the rich text editor.</p>
          <p className={`mt-2 text-xs font-semibold uppercase tracking-[0.2em] ${saveStatusTone}`}>{saveStatusLabel}</p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="rounded-full border-white/20 text-white/80" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button className="rounded-full bg-white text-black hover:bg-white/90" disabled={!canSave} onClick={handleSave}>
              {upsertBlogPost.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {upsertBlogPost.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </header>

      {body}
    </div>
  );
};

export default BlogPostEditor;

