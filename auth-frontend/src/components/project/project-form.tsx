"use client";

import { useState } from 'react';
import type { ProjectInput, Project } from '@/lib/project-client';

export type ProjectFormData = Omit<ProjectInput, 'gallery' | 'technologies' | 'features' | 'screenshots' | 'tags' | 'attachments'> & {
  gallery: string;
  technologies: string;
  features: string;
  screenshots: string;
  tags: string;
  attachments: string;
};

const SECTIONS = [
  'Overview', 'Problem Statement', 'Solution', 'Architecture', 
  'Features', 'Database Design', 'API Endpoints', 
  'Installation', 'Usage', 'Future Improvements', 'Known Issues', 'Conclusion'
];

interface ProjectFormProps {
  initialData?: Project;
  onSubmit: (data: ProjectInput) => Promise<void>;
  isEditing?: boolean;
}

export function ProjectForm({ initialData, onSubmit, isEditing = false }: ProjectFormProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<ProjectFormData>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    richSections: initialData?.richSections || {},
    
    featuredImage: initialData?.featuredImage || '',
    logo: initialData?.logo || '',
    gallery: (initialData?.gallery || []).join(', '),
    videoDemo: initialData?.videoDemo || '',
    thumbnail: initialData?.thumbnail || '',
    
    technologies: (initialData?.technologies || []).join(', '),
    features: (initialData?.features || []).join(', '),
    screenshots: (initialData?.screenshots || []).join(', '),
    tags: (initialData?.tags || []).join(', '),
    category: initialData?.category || '',
    
    projectType: initialData?.projectType || '',
    difficulty: initialData?.difficulty || '',
    teamSize: initialData?.teamSize || '',
    duration: initialData?.duration || '',
    client: initialData?.client || '',
    company: initialData?.company || '',
    license: initialData?.license || '',
    
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    
    githubUrl: initialData?.githubUrl || '',
    projectUrl: initialData?.projectUrl || '',
    documentationUrl: initialData?.documentationUrl || '',
    apiDocsUrl: initialData?.apiDocsUrl || '',
    downloadUrl: initialData?.downloadUrl || '',
    
    metaTitle: initialData?.metaTitle || '',
    metaDescription: initialData?.metaDescription || '',
    keywords: initialData?.keywords || '',
    canonicalUrl: initialData?.canonicalUrl || '',
    ogImage: initialData?.ogImage || '',
    
    visibility: initialData?.visibility || 'public',
    featured: initialData?.featured || false,
    pinned: initialData?.pinned || false,
    progress: initialData?.progress || 0,
    attachments: (initialData?.attachments || []).join(', '),
    
    status: initialData?.status || 'draft',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSectionChange = (section: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      richSections: {
        ...(prev.richSections || {}),
        [section]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Parse comma-separated strings to arrays
    const toArray = (str: string) => str.split(',').map(s => s.trim()).filter(Boolean);
    
    const parsedData: ProjectInput = {
      ...formData,
      gallery: toArray(formData.gallery),
      technologies: toArray(formData.technologies),
      features: toArray(formData.features),
      screenshots: toArray(formData.screenshots),
      tags: toArray(formData.tags),
      attachments: toArray(formData.attachments),
      progress: Number(formData.progress)
    };
    
    try {
      await onSubmit(parsedData);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'media', label: 'Media' },
    { id: 'details', label: 'Details' },
    { id: 'links', label: 'Links & Timeline' },
    { id: 'rich', label: 'Rich Content' },
    { id: 'seo', label: 'SEO & Settings' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex overflow-x-auto border-b border-zinc-200 dark:border-zinc-800 pb-2 gap-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#111]'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="min-h-[600px]">
        {activeTab === 'basic' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input name="title" value={formData.title} onChange={handleChange} required className="input-field w-full" />
            </div>
            {isEditing && (
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input name="slug" value={formData.slug} onChange={handleChange} className="input-field w-full" disabled />
                <p className="text-xs text-zinc-500 mt-1">Slug is auto-generated and cannot be changed.</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Excerpt</label>
              <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} className="input-field w-full h-20 resize-y" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Main Description (Legacy)</label>
              <textarea name="content" value={formData.content} onChange={handleChange} className="input-field w-full h-40 resize-y font-mono text-sm" />
            </div>
          </div>
        )}
        
        {activeTab === 'media' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Featured Image URL</label>
              <input name="featuredImage" value={formData.featuredImage || ''} onChange={handleChange} className="input-field w-full" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Project Logo URL</label>
              <input name="logo" value={formData.logo || ''} onChange={handleChange} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Video Demo URL</label>
              <input name="videoDemo" value={formData.videoDemo || ''} onChange={handleChange} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
              <input name="thumbnail" value={formData.thumbnail || ''} onChange={handleChange} className="input-field w-full" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Gallery Images (Comma separated URLs)</label>
              <textarea name="gallery" value={formData.gallery} onChange={handleChange} className="input-field w-full h-24" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Screenshots (Comma separated URLs)</label>
              <textarea name="screenshots" value={formData.screenshots} onChange={handleChange} className="input-field w-full h-24" />
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1">Project Type</label>
              <input name="projectType" value={formData.projectType || ''} onChange={handleChange} className="input-field w-full" placeholder="e.g. Web App, Mobile" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input name="category" value={formData.category || ''} onChange={handleChange} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Difficulty</label>
              <select name="difficulty" value={formData.difficulty || ''} onChange={handleChange} className="input-field w-full">
                <option value="">Select...</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Team Size</label>
              <input name="teamSize" value={formData.teamSize || ''} onChange={handleChange} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration</label>
              <input name="duration" value={formData.duration || ''} onChange={handleChange} className="input-field w-full" placeholder="e.g. 3 Months" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Client Name</label>
              <input name="client" value={formData.client || ''} onChange={handleChange} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company</label>
              <input name="company" value={formData.company || ''} onChange={handleChange} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">License</label>
              <input name="license" value={formData.license || ''} onChange={handleChange} className="input-field w-full" placeholder="e.g. MIT" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Technologies Used (Comma separated)</label>
              <input name="technologies" value={formData.technologies} onChange={handleChange} className="input-field w-full" placeholder="React, Node, PostgreSQL" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Tags (Comma separated)</label>
              <input name="tags" value={formData.tags} onChange={handleChange} className="input-field w-full" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Key Features (Comma separated)</label>
              <textarea name="features" value={formData.features} onChange={handleChange} className="input-field w-full h-24" placeholder="Authentication, Dashboard, PDF Export" />
            </div>
          </div>
        )}

        {activeTab === 'links' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input type="date" name="startDate" value={formData.startDate || ''} onChange={handleChange} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input type="date" name="endDate" value={formData.endDate || ''} onChange={handleChange} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Live Demo / Project URL</label>
              <input type="url" name="projectUrl" value={formData.projectUrl || ''} onChange={handleChange} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">GitHub URL</label>
              <input type="url" name="githubUrl" value={formData.githubUrl || ''} onChange={handleChange} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Documentation URL</label>
              <input type="url" name="documentationUrl" value={formData.documentationUrl || ''} onChange={handleChange} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">API Docs URL</label>
              <input type="url" name="apiDocsUrl" value={formData.apiDocsUrl || ''} onChange={handleChange} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Download URL</label>
              <input type="url" name="downloadUrl" value={formData.downloadUrl || ''} onChange={handleChange} className="input-field w-full" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Attachments (Comma separated URLs for PDFs, etc.)</label>
              <textarea name="attachments" value={formData.attachments} onChange={handleChange} className="input-field w-full h-24" />
            </div>
          </div>
        )}

        {activeTab === 'rich' && (
          <div className="space-y-6">
            <p className="text-sm text-zinc-500">Fill out any of these specific sections to build a beautiful project page. Leave blank to hide.</p>
            {SECTIONS.map(section => (
              <div key={section}>
                <label className="block text-sm font-medium mb-1">{section}</label>
                <textarea 
                  value={formData.richSections?.[section] || ''} 
                  onChange={(e) => handleSectionChange(section, e.target.value)} 
                  className="input-field w-full h-32 resize-y font-mono text-sm" 
                  placeholder={`Write ${section.toLowerCase()} details in Markdown...`}
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2 border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-2 font-medium">Project Health & Status</div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="input-field w-full">
                <option value="draft">Draft (Hidden)</option>
                <option value="published">Published</option>
                <option value="planning">Planning</option>
                <option value="development">Development</option>
                <option value="testing">Testing</option>
                <option value="production">Production</option>
                <option value="maintenance">Maintenance</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Visibility</label>
              <select name="visibility" value={formData.visibility || 'public'} onChange={handleChange} className="input-field w-full">
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Progress (%)</label>
              <input type="number" min="0" max="100" name="progress" value={formData.progress || 0} onChange={handleChange} className="input-field w-full" />
            </div>
            <div className="flex items-center gap-4 mt-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="rounded border-zinc-300 text-black dark:border-zinc-700" />
                Featured Project
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" name="pinned" checked={formData.pinned} onChange={handleChange} className="rounded border-zinc-300 text-black dark:border-zinc-700" />
                Pinned Project
              </label>
            </div>

            <div className="sm:col-span-2 border-b border-zinc-200 dark:border-zinc-800 pb-4 mt-8 mb-2 font-medium">SEO Metadata</div>
            <div>
              <label className="block text-sm font-medium mb-1">Meta Title</label>
              <input name="metaTitle" value={formData.metaTitle || ''} onChange={handleChange} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Keywords</label>
              <input name="keywords" value={formData.keywords || ''} onChange={handleChange} className="input-field w-full" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Meta Description</label>
              <textarea name="metaDescription" value={formData.metaDescription || ''} onChange={handleChange} className="input-field w-full h-20" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Open Graph Image URL</label>
              <input name="ogImage" value={formData.ogImage || ''} onChange={handleChange} className="input-field w-full" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Canonical URL</label>
              <input name="canonicalUrl" value={formData.canonicalUrl || ''} onChange={handleChange} className="input-field w-full" />
            </div>
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex gap-4">
        <button type="submit" className="btn-primary" disabled={loading || !formData.title.trim()}>
          {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Create project'}
        </button>
      </div>
    </form>
  );
}
