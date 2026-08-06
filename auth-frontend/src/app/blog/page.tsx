 import { Suspense } from 'react';
import Link from 'next/link';
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
  searchParams: Promise<{ q?: string; tag?: string; category?: string; page?: string }>;
}) {
  const { q, tag, category, page: pageStr } = await searchParams;
  const page = parseInt(pageStr || '1', 10) || 1;
  const limit = 5;
  let { posts, total, totalPages } = await listPublishedPosts({ q, tag, category, page, limit });

  const allPostsResult = tag || q || category ? await listPublishedPosts({ limit: 1000 }) : { posts };
  const allPosts = allPostsResult.posts;
  const tags = Array.from(
    new Set(allPosts.flatMap((p) => p.tags || []))
  ).sort();
  const categories = Array.from(
    new Set(allPosts.map((p) => p.category).filter(Boolean) as string[])
  ).sort();

  // Fallback for older API versions that don't support pagination natively
  if (total === 0 && posts.length > 0) {
    total = posts.length;
    totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    posts = posts.slice(skip, skip + limit);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Blog</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6">
        Insights, tutorials, and product updates.
      </p>

      <Suspense fallback={<div className="mb-8 h-10 bg-zinc-100 dark:bg-[#111] rounded-lg animate-pulse" />}>
        <BlogSearch tags={tags} categories={categories} />
      </Suspense>

      {(q || tag || category) && (
        <p className="text-sm text-zinc-500 mb-6">
          {total} result{total !== 1 ? 's' : ''}
          {q && <> for &ldquo;{q}&rdquo;</>}
          {tag && <> tagged #{tag}</>}
          {category && <> in {category}</>}
        </p>
      )}

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center">
          <p className="text-zinc-500">
            {q || tag || category ? 'No posts match your search.' : 'No posts published yet. Check back soon.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-6">
          {page > 1 ? (
            <Link
              href={`/blog?page=${page - 1}${q ? `&q=${q}` : ''}${tag ? `&tag=${tag}` : ''}${category ? `&category=${category}` : ''}`}
              className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
            >
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-zinc-500">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/blog?page=${page + 1}${q ? `&q=${q}` : ''}${tag ? `&tag=${tag}` : ''}${category ? `&category=${category}` : ''}`}
              className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
            >
              Next →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
