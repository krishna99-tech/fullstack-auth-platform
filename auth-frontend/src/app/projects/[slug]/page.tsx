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
    title: project.metaTitle || `${project.title} — Platform Projects`,
    description: project.metaDescription || project.excerpt || project.title,
    keywords: project.keywords || undefined,
    openGraph: project.ogImage ? { images: [project.ogImage] } : undefined,
    alternates: project.canonicalUrl ? { canonical: project.canonicalUrl } : undefined,
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
        <header className="mb-10 text-center max-w-3xl mx-auto">
          {project.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.logo} alt="Logo" className="w-20 h-20 rounded-2xl mx-auto mb-6 shadow-sm object-cover bg-white" />
          ) : (
            <div className="w-16 h-16 rounded-2xl mx-auto mb-6 bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-2xl font-bold">
              {project.title.charAt(0)}
            </div>
          )}
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">{project.title}</h1>
          {project.excerpt && (
            <p className="text-lg text-zinc-600 dark:text-zinc-400">{project.excerpt}</p>
          )}
          
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-500">
            {project.category && (
              <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-[#111] text-zinc-700 dark:text-zinc-300 font-medium">{project.category}</span>
            )}
            <span>By {project.author.name}</span>
            <span>·</span>
            <span>{date}</span>
          </div>
          
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {project.projectUrl && (
              <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Live Demo
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-[#111]">
                GitHub
              </a>
            )}
            {project.documentationUrl && (
              <a href={project.documentationUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-[#111]">
                Docs
              </a>
            )}
          </div>
        </header>

        {project.featuredImage && (
          <div className="mb-16 rounded-2xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 aspect-video w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.featuredImage} alt={project.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            
            {project.technologies && project.technologies.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">Technologies</h2>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map(tech => (
                    <span key={tech} className="px-3 py-1 rounded-full text-sm font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/30">
                      {tech}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {project.features && project.features.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">Key Features</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.features.map(feature => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span className="text-zinc-700 dark:text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {project.content && (
              <section>
                <h2 className="text-xl font-semibold mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">Description</h2>
                <div className="prose prose-zinc dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
                  {project.content}
                </div>
              </section>
            )}
            
            {project.richSections && Object.entries(project.richSections).map(([sectionTitle, content]) => content && (
              <section key={sectionTitle}>
                <h2 className="text-xl font-semibold mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">{sectionTitle}</h2>
                <div className="prose prose-zinc dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
                  {content}
                </div>
              </section>
            ))}

            {project.gallery && project.gallery.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">Gallery</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.gallery.map((img, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={img} alt={`Gallery ${i}`} className="w-full h-48 object-cover rounded-xl border border-zinc-200 dark:border-zinc-800" />
                  ))}
                </div>
              </section>
            )}
            
          </div>
          
          <div className="space-y-8">
            <div className="bg-zinc-50 dark:bg-[#0a0a0a] rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
              <h3 className="font-semibold text-lg mb-4">Project Details</h3>
              <dl className="space-y-4 text-sm">
                {project.projectType && (
                  <div>
                    <dt className="text-zinc-500 mb-1">Type</dt>
                    <dd className="font-medium">{project.projectType}</dd>
                  </div>
                )}
                {project.difficulty && (
                  <div>
                    <dt className="text-zinc-500 mb-1">Difficulty</dt>
                    <dd className="font-medium">{project.difficulty}</dd>
                  </div>
                )}
                {project.teamSize && (
                  <div>
                    <dt className="text-zinc-500 mb-1">Team Size</dt>
                    <dd className="font-medium">{project.teamSize}</dd>
                  </div>
                )}
                {project.duration && (
                  <div>
                    <dt className="text-zinc-500 mb-1">Duration</dt>
                    <dd className="font-medium">{project.duration}</dd>
                  </div>
                )}
                {project.client && (
                  <div>
                    <dt className="text-zinc-500 mb-1">Client / Company</dt>
                    <dd className="font-medium">{project.client} {project.company ? `(${project.company})` : ''}</dd>
                  </div>
                )}
                {project.license && (
                  <div>
                    <dt className="text-zinc-500 mb-1">License</dt>
                    <dd className="font-medium">{project.license}</dd>
                  </div>
                )}
                {(project.startDate || project.endDate) && (
                  <div>
                    <dt className="text-zinc-500 mb-1">Timeline</dt>
                    <dd className="font-medium">
                      {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Present'}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="bg-zinc-50 dark:bg-[#0a0a0a] rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
              <h3 className="font-semibold text-lg mb-4">Health</h3>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-zinc-500">Status</span>
                <span className="font-medium capitalize text-emerald-600 dark:text-emerald-400">{project.status}</span>
              </div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-zinc-500">Progress</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2.5 mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
              </div>
            </div>

            {project.tags && project.tags.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 rounded bg-zinc-100 dark:bg-[#111] text-zinc-600 dark:text-zinc-400 text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    </MarketingLayout>
  );
}
