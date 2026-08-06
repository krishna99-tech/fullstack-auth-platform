import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, formatBlogDate } from '@/lib/blog-client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Post not found' };
  return {
    title: `${post.title} — Platform Blog`,
    description: post.excerpt || post.title,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const date = formatBlogDate(post.publishedAt || post.createdAt);

  return (
    <article>
      <Link href="/blog" className="text-sm text-purple-600 dark:text-purple-400 hover:underline mb-6 inline-block">
        ← Back to blog
      </Link>
      <header className="mb-8">
        {post.featuredImage && (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.featuredImage} alt={post.title} className="w-full h-auto max-h-[500px] object-cover" />
          </div>
        )}
        <p className="text-sm text-zinc-500 mb-3">
          {post.category && <span className="font-medium text-purple-600 dark:text-purple-400 mr-2">{post.category}</span>}
          {date} · {post.author.name}
          {post.author.username && (
            <> · <span className="text-zinc-400">@{post.author.username}</span></>
          )}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{post.title}</h1>
        {post.excerpt && (
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">{post.excerpt}</p>
        )}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-500">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>
      <div className="prose prose-zinc dark:prose-invert max-w-none leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
