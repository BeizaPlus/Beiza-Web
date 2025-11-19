import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { SectionHeader } from "@/components/framer/SectionHeader";
import { useBlogPosts, type BlogPost } from "@/hooks/usePublicContent";
import { AdZone } from "@/components/AdZone";

const formatDisplayDate = (value?: string | null) => {
  if (!value) return undefined;
  try
  {
    return format(new Date(value), "dd MMM yyyy");
  } catch (error)
  {
    return undefined;
  }
};

const BlogPostCard = ({ blogPost }: { blogPost: BlogPost }) => {
  const publishedOn = formatDisplayDate(blogPost.publishedAt);

  return (
    <Link to={`/blog/${blogPost.slug}`} className="group block" aria-label={`Read blog post: ${blogPost.title}`}>
      <article className="glass-panel flex h-full flex-col overflow-hidden rounded-lg border border-white/10 transition-transform duration-300 group-hover:-translate-y-1">
        {blogPost.featuredImage?.src ? (
          <div className="relative h-64 overflow-hidden">
            <img
              src={blogPost.featuredImage.src}
              alt={blogPost.featuredImage.alt ?? blogPost.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center bg-muted text-muted-foreground">
            <span className="text-sm uppercase tracking-[0.3em]">Blog Post</span>
          </div>
        )}
        <div className="flex flex-1 flex-col gap-4 p-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-subtle">Blog</p>
            <h3 className="text-xl font-semibold leading-tight text-white">{blogPost.title}</h3>
            {blogPost.excerpt ? <p className="text-sm text-subtle leading-relaxed">{blogPost.excerpt}</p> : null}
          </div>
          <div className="mt-auto flex items-center justify-between text-sm text-subtle">
            <span className="inline-flex items-center gap-2 font-medium text-primary transition-colors group-hover:text-primary/80">
              Read more
              <span aria-hidden>→</span>
            </span>
            {publishedOn ? <span className="text-xs uppercase tracking-[0.3em]">Published {publishedOn}</span> : null}
          </div>
        </div>
      </article>
    </Link>
  );
};

const BlogPosts = () => {
  const { data: blogPosts = [], isLoading, isError } = useBlogPosts();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="flex flex-col pb-24 pt-4 lg:pb-32">
        <section className="mx-auto max-w-4xl px-6 py-8 lg:py-12">
          <SectionHeader
            eyebrow="Blog"
            title="Stories and insights"
            description="Read our latest blog posts about memorial celebrations, tribute memoirs, and meaningful storytelling."
            align="center"
          />
        </section>
        <section className="mx-auto w-full max-w-6xl px-6 py-8 lg:py-12">
          {isLoading && blogPosts.length === 0 ? (
            <div className="glass-panel flex flex-col items-center justify-center gap-4 rounded-lg border border-white/10 p-16 text-center">
              <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
              <p className="max-w-md text-sm text-subtle">Loading blog posts...</p>
            </div>
          ) : null}
          {!isLoading && blogPosts.length === 0 ? (
            <div className="glass-panel flex flex-col items-center justify-center gap-4 rounded-lg border border-white/10 p-16 text-center">
              <p className="text-lg font-semibold text-white">No blog posts yet</p>
              <p className="max-w-md text-sm text-subtle">
                Check back soon for new blog posts, or reach out to us if you have questions.
              </p>
            </div>
          ) : null}
          {isError ? (
            <div className="glass-panel flex flex-col items-center justify-center gap-4 rounded-lg border border-white/10 p-16 text-center">
              <p className="text-lg font-semibold text-white">Unable to load blog posts</p>
              <p className="max-w-md text-sm text-subtle">Please try again later.</p>
            </div>
          ) : null}
          {blogPosts.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map((blogPost) => (
                <BlogPostCard key={blogPost.id} blogPost={blogPost} />
              ))}
            </div>
          ) : null}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPosts;

