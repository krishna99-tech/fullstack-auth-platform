import Link from 'next/link';
import type { BlogPostSummary } from '@/lib/blog-client';
import { formatBlogDate } from '@/lib/blog-client';

export function BlogCard({ post }: { post: BlogPostSummary }) {
  const date = formatBlogDate(post.publishedAt || post.createdAt);
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-xl border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#0a0a0a] p-6 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
    >
      <p className="text-xs text-zinc-500 mb-2">{date} · {post.author.name}</p>
      <h2 className="text-lg font-semibold text-black dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
        {post.title}
      </h2>
      {post.excerpt && (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">{post.excerpt}</p>
      )}
      <span className="inline-block mt-4 text-sm font-medium text-purple-600 dark:text-purple-400">
        Read more →
      </span>
    </Link>
  );
}
