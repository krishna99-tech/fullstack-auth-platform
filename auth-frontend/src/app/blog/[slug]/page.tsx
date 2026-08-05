import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, formatBlogDate } from '@/lib/blog-client';

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
        <p className="text-sm text-zinc-500 mb-3">
          {date} · {post.author.name}
          {post.author.username && (
            <> · <span className="text-zinc-400">@{post.author.username}</span></>
          )}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{post.title}</h1>
        {post.excerpt && (
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">{post.excerpt}</p>
        )}
      </header>
      <div className="prose prose-zinc dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
        {post.content}
      </div>
    </article>
  );
}
