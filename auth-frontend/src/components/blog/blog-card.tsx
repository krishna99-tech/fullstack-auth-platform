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
      {post.featuredImage && (
        <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        </div>
      )}
      <p className="text-xs text-zinc-500 mb-2">
        {post.category && <span className="font-medium text-purple-600 dark:text-purple-400 mr-2">{post.category}</span>}
        {date} · {post.author.name}
      </p>
      <h2 className="text-lg font-semibold text-black dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
        {post.title}
      </h2>
      {post.excerpt && (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">{post.excerpt}</p>
      )}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-500"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      <span className="inline-block mt-4 text-sm font-medium text-purple-600 dark:text-purple-400">
        Read more →
      </span>
    </Link>
  );
}
