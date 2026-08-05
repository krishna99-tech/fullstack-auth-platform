import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectBySlug } from '@/lib/project-client';
import { formatBlogDate } from '@/lib/blog-client';
import { MarketingLayout } from '@/components/marketing/marketing-layout';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: 'Project not found' };
  return {
    title: `${project.title} — Platform Projects`,
    description: project.excerpt || project.title,
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const date = formatBlogDate(project.publishedAt || project.createdAt);

  return (
    <MarketingLayout>
      <article>
        <Link href="/projects" className="text-sm text-purple-600 dark:text-purple-400 hover:underline mb-6 inline-block">
          ← Back to projects
        </Link>
        <header className="mb-8">
          <p className="text-sm text-zinc-500 mb-3">
            {date} · {project.author.name}
            {project.author.username && (
              <> · <span className="text-zinc-400">@{project.author.username}</span></>
            )}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{project.title}</h1>
          {project.excerpt && (
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">{project.excerpt}</p>
          )}
          {project.projectUrl && (
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex mt-4 text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
            >
              Visit project →
            </a>
          )}
        </header>
        <div className="prose prose-zinc dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
          {project.content}
        </div>
      </article>
    </MarketingLayout>
  );
}
