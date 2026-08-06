import Link from 'next/link';
import type { ProjectSummary } from '@/lib/project-client';
import { formatBlogDate } from '@/lib/blog-client';

export function ProjectCard({ project }: { project: ProjectSummary }) {
  const date = formatBlogDate(project.publishedAt || project.createdAt);
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block rounded-xl border border-zinc-200 dark:border-[#333] bg-white dark:bg-[#0a0a0a] p-6 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
    >
      {project.featuredImage && (
        <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={project.featuredImage} alt={project.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        </div>
      )}
      <p className="text-xs text-zinc-500 mb-2">
        {project.category && <span className="font-medium text-purple-600 dark:text-purple-400 mr-2">{project.category}</span>}
        {date} · {project.author.name}
      </p>
      <h2 className="text-lg font-semibold text-black dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
        {project.title}
      </h2>
      {project.excerpt && (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">{project.excerpt}</p>
      )}
      {project.technologies && project.technologies.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 4).map((tech) => (
            <span key={tech} className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              {tech}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
              +{project.technologies.length - 4}
            </span>
          )}
        </div>
      )}
      <span className="inline-block mt-5 text-sm font-medium text-purple-600 dark:text-purple-400">
        View project →
      </span>
    </Link>
  );
}
