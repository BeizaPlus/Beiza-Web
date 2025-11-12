import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { SectionHeader } from "@/components/framer/SectionHeader";
import { useBlogPost } from "@/hooks/usePublicContent";

const formatDisplayDate = (value?: string | null) => {
  if (!value) return undefined;
  try {
    return format(new Date(value), "dd MMM yyyy");
  } catch (error) {
    return undefined;
  }
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: blogPost, isLoading, isError } = useBlogPost(slug);
  const publishedOn = formatDisplayDate(blogPost?.publishedAt);

  useEffect(() => {
    if (blogPost?.title) {
      document.title = `${blogPost.title} | Blog`;
    }
  }, [blogPost?.title]);

  if (!slug) {
    return <Navigate to="/blog" replace />;
  }

  if (isError || (!isLoading && !blogPost)) {
    return <Navigate to="/blog" replace />;
  }

  if (isLoading || !blogPost) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="flex flex-col pb-24 pt-4 lg:pb-32">
          <section className="mx-auto w-full max-w-4xl px-6 py-8">
            <div className="glass-panel flex flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 p-16 text-center">
              <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
              <p className="max-w-md text-sm text-subtle">Loading blog post...</p>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="flex flex-col pb-24 pt-4 lg:pb-32">
        <section className="mx-auto w-full max-w-4xl px-6">
          <div className="flex items-center justify-between gap-4 py-8">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-subtle transition-colors hover:text-white"
            >
              <span aria-hidden>←</span>
              All blog posts
            </Link>
          </div>
          <SectionHeader
            eyebrow="Blog"
            title={blogPost.title}
            description={blogPost.excerpt ?? undefined}
            align="center"
          />
        </section>

        {blogPost.featuredImage?.src ? (
          <section className="mx-auto w-full max-w-4xl px-6 py-8">
            <div className="relative h-96 overflow-hidden rounded-3xl border border-white/10">
              <img
                src={blogPost.featuredImage.src}
                alt={blogPost.featuredImage.alt ?? blogPost.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </section>
        ) : null}

        <section className="mx-auto w-full max-w-4xl px-6 py-12">
          <div className="glass-panel rounded-[32px] border border-white/10 p-8 md:p-12">
            <div className="mb-8 flex items-center justify-between text-sm text-subtle">
              {publishedOn ? <span className="text-xs uppercase tracking-[0.3em]">Published {publishedOn}</span> : null}
            </div>
            <div
              className="prose prose-invert max-w-none text-base leading-relaxed md:text-lg prose-headings:text-white prose-p:text-subtle prose-a:text-primary prose-strong:text-white prose-code:text-white prose-pre:bg-black/40 prose-blockquote:border-primary prose-blockquote:text-subtle"
              dangerouslySetInnerHTML={{ __html: blogPost.content }}
            />
          </div>
        </section>

        <section className="mx-auto w-full max-w-4xl px-6 py-12">
          <div className="flex items-center justify-center">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              <span aria-hidden>←</span>
              Back to all blog posts
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;

