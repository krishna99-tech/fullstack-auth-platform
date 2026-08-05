import { listPublishedPosts } from '@/lib/blog-client';
import { BlogCard } from '@/components/blog/blog-card';

export const metadata = {
  title: 'Blog — Platform',
  description: 'Articles and updates from the Platform team.',
};

export default async function BlogIndexPage() {
  const posts = await listPublishedPosts();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Blog</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-10">
        Insights, tutorials, and product updates.
      </p>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center">
          <p className="text-zinc-500">No posts published yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
