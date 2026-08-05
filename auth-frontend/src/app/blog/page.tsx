import { Suspense } from 'react';
import { listPublishedPosts } from '@/lib/blog-client';
import { BlogCard } from '@/components/blog/blog-card';
import { BlogSearch } from '@/components/blog/blog-search';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Blog — Platform',
  description: 'Articles and updates from the Platform team.',
};

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const { q, tag } = await searchParams;
  const posts = await listPublishedPosts({ q, tag });

  const allPosts = tag || q ? await listPublishedPosts() : posts;
  const tags = Array.from(
    new Set(allPosts.flatMap((p) => p.tags || []))
  ).sort();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Blog</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6">
        Insights, tutorials, and product updates.
      </p>

      <Suspense fallback={<div className="mb-8 h-10 bg-zinc-100 dark:bg-[#111] rounded-lg animate-pulse" />}>
        <BlogSearch tags={tags} />
      </Suspense>

      {(q || tag) && (
        <p className="text-sm text-zinc-500 mb-6">
          {posts.length} result{posts.length !== 1 ? 's' : ''}
          {q && <> for &ldquo;{q}&rdquo;</>}
          {tag && <> tagged #{tag}</>}
        </p>
      )}

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center">
          <p className="text-zinc-500">
            {q || tag ? 'No posts match your search.' : 'No posts published yet. Check back soon.'}
          </p>
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
