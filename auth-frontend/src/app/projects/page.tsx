import { listPublishedProjects } from '@/lib/project-client';
import { ProjectCard } from '@/components/projects/project-card';
import { MarketingLayout } from '@/components/marketing/marketing-layout';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Projects — Platform',
  description: 'Featured projects from the Platform community.',
};

export default async function ProjectsIndexPage() {
  const projects = await listPublishedProjects();

  return (
    <MarketingLayout>
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Projects</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-10">
          Explore what our community is building.
        </p>

        {projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center">
            <p className="text-zinc-500">No projects published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </MarketingLayout>
  );
}
