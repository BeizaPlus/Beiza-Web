import { Link } from "react-router-dom";
import { Archive, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/components/ui/use-toast";
import { ConfirmDialog } from "@/admin/components/crud";
import {
  useDeleteBlogPostMutation,
  useUpdateBlogPostStatusMutation,
  type BlogPostStatus,
} from "../hooks/useAdminMutations";
import { useBlogPostsAdmin } from "../hooks/useAdminData";

const BlogPosts = () => {
  const { data: blogPosts = [], isLoading, isError, error } = useBlogPostsAdmin();
  const errorMessage = error instanceof Error ? error.message : "Unable to load blog posts.";
  const updateBlogPostStatus = useUpdateBlogPostStatusMutation();
  const deleteBlogPost = useDeleteBlogPostMutation();

  const statusStyles: Record<BlogPostStatus, string> = {
    draft: "bg-slate-100 text-slate-700",
    published: "bg-emerald-100 text-emerald-700",
    archived: "bg-slate-200 text-slate-600",
  };

  const handleArchive = (blogPost: (typeof blogPosts)[number]) => {
    const previousStatus = blogPost.status as BlogPostStatus;
    updateBlogPostStatus.mutate(
      { id: blogPost.id, status: "archived" },
      {
        onSuccess: () => {
          toast({
            title: "Blog post archived",
            description: `"${blogPost.title}" moved to archived.`,
            action: (
              <ToastAction altText="Undo archive" onClick={() => updateBlogPostStatus.mutate({ id: blogPost.id, status: previousStatus })}>
                Undo
              </ToastAction>
            ),
          });
        },
      },
    );
  };

  const handleRestoreStatus = (blogPost: (typeof blogPosts)[number]) => {
    updateBlogPostStatus.mutate(
      { id: blogPost.id, status: "draft" },
      {
        onSuccess: () => {
          toast({
            title: "Blog post restored",
            description: `"${blogPost.title}" returned to draft.`,
          });
        },
      },
    );
  };

  const handleDelete = async (blogPost: (typeof blogPosts)[number]) => {
    try {
      await deleteBlogPost.mutateAsync({ id: blogPost.id });
      toast({
        title: "Blog post deleted",
        description: `"${blogPost.title}" was deleted.`,
      });
    } catch (mutationError) {
      // Error toast handled inside mutation via useSafeMutation
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Blog Posts</h1>
          <p className="text-sm text-slate-600">Create and manage blog posts with rich content editing.</p>
        </div>
        <Button asChild className="rounded-full">
          <Link to="/admin/blog-posts/new">Create blog post</Link>
        </Button>
      </header>

      <Card className="overflow-hidden border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-slate-700">Blog post catalogue</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
            <thead className="bg-slate-100 uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-6 py-4 text-left font-medium">Title</th>
                <th className="px-6 py-4 text-left font-medium">Slug</th>
                <th className="px-6 py-4 text-left font-medium">Status</th>
                <th className="px-6 py-4 text-left font-medium">Published</th>
                <th className="px-6 py-4 text-left font-medium">Updated</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-slate-500">
                    Loading blog posts…
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-red-500">
                    {errorMessage}
                  </td>
                </tr>
              ) : blogPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-slate-500">
                    No blog posts yet. Create one to get started.
                  </td>
                </tr>
              ) : (
                blogPosts.map((blogPost) => (
                  <tr key={blogPost.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{blogPost.title}</td>
                    <td className="px-6 py-4 text-slate-600">{blogPost.slug}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[blogPost.status as BlogPostStatus]}`}>
                        {blogPost.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {blogPost.published_at
                        ? new Date(blogPost.published_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(blogPost.updated_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button asChild variant="secondary" className="rounded-full">
                          <Link to={`/admin/blog-posts/${blogPost.slug}`}>Open</Link>
                        </Button>
                        {blogPost.status === "archived" ? (
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                            onClick={() => handleRestoreStatus(blogPost)}
                            disabled={updateBlogPostStatus.isPending}
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Restore
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-full text-slate-700 hover:bg-slate-100"
                            onClick={() => handleArchive(blogPost)}
                            disabled={updateBlogPostStatus.isPending}
                          >
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                          </Button>
                        )}
                        <ConfirmDialog
                          title="Delete blog post?"
                          description={`"${blogPost.title}" will be permanently removed. This action cannot be undone.`}
                          onConfirm={() => handleDelete(blogPost)}
                          isConfirming={deleteBlogPost.isPending && deleteBlogPost.variables?.id === blogPost.id}
                          variant="danger"
                          trigger={
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="rounded-full border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                              disabled={deleteBlogPost.isPending}
                              aria-label={`Delete ${blogPost.title}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogPosts;

