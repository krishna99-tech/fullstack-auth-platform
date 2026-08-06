const prisma = require('../db');

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'project';
}

function publicProject(project, author) {
  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    excerpt: project.excerpt || '',
    content: project.content || '',
    richSections: project.richSections || {},
    
    featuredImage: project.featuredImage || null,
    logo: project.logo || null,
    gallery: project.gallery || [],
    videoDemo: project.videoDemo || null,
    thumbnail: project.thumbnail || null,

    technologies: project.technologies || [],
    features: project.features || [],
    screenshots: project.screenshots || [],
    tags: project.tags || [],
    category: project.category || null,
    
    projectType: project.projectType || null,
    difficulty: project.difficulty || null,
    teamSize: project.teamSize || null,
    duration: project.duration || null,
    client: project.client || null,
    company: project.company || null,
    license: project.license || null,
    
    startDate: project.startDate || null,
    endDate: project.endDate || null,
    
    githubUrl: project.githubUrl || '',
    projectUrl: project.projectUrl || '',
    documentationUrl: project.documentationUrl || '',
    apiDocsUrl: project.apiDocsUrl || '',
    downloadUrl: project.downloadUrl || '',
    
    metaTitle: project.metaTitle || '',
    metaDescription: project.metaDescription || '',
    keywords: project.keywords || '',
    canonicalUrl: project.canonicalUrl || '',
    ogImage: project.ogImage || '',
    
    visibility: project.visibility || 'public',
    featured: project.featured || false,
    pinned: project.pinned || false,
    
    views: project.views || 0,
    likes: project.likes || 0,
    downloads: project.downloads || 0,
    stars: project.stars || 0,
    forks: project.forks || 0,
    comments: project.comments || 0,
    
    progress: project.progress || 0,
    attachments: project.attachments || [],
    
    status: project.status,
    publishedAt: project.publishedAt || null,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    author: author
      ? { name: author.name || author.email, username: author.username }
      : { name: 'Author' },
  };
}

async function getAuthor(authorId) {
  return prisma.user.findUnique({ where: { id: authorId } });
}

exports.listPublished = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({ where: { status: 'published' }, orderBy: { createdAt: 'desc' } });
    const withAuthors = await Promise.all(
      projects.map(async (p) => {
        const author = await getAuthor(p.authorId);
        return {
          id: p.id,
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt || '',
          featuredImage: p.featuredImage || null,
          technologies: p.technologies || [],
          projectType: p.projectType || null,
          category: p.category || null,
          tags: p.tags || [],
          projectUrl: p.projectUrl || '',
          githubUrl: p.githubUrl || '',
          visibility: p.visibility || 'public',
          featured: p.featured || false,
          pinned: p.pinned || false,
          views: p.views || 0,
          likes: p.likes || 0,
          progress: p.progress || 0,
          status: p.status,
          publishedAt: p.publishedAt,
          createdAt: p.createdAt,
          author: author ? { name: author.name || author.email, username: author.username } : { name: 'Author' },
        };
      })
    );
    res.json({ projects: withAuthors });
  } catch (err) {
    console.error('listPublished error:', err);
    res.status(500).json({ error: 'Failed to load projects' });
  }
};

exports.listByUser = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) return res.status(400).json({ error: 'Username required' });
    
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const projects = await prisma.project.findMany({ 
      where: { authorId: user.id, status: 'published' }, 
      orderBy: { createdAt: 'desc' } 
    });
    
    const mapped = projects.map(p => publicProject(p, user));
    res.json({ projects: mapped, total: mapped.length });
  } catch (err) {
    console.error('listByUser error:', err);
    res.status(500).json({ error: 'Failed to load user projects' });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { slug: req.params.slug } });
    if (!project || project.status !== 'published') return res.status(404).json({ error: 'Project not found' });
    const author = await getAuthor(project.authorId);
    res.json({ project: publicProject(project, author) });
  } catch (err) {
    console.error('getBySlug project error:', err);
    res.status(500).json({ error: 'Failed to load project' });
  }
};

exports.listMine = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { authorId: req.user.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({
      projects: projects.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt || '',
        featuredImage: p.featuredImage || null,
        technologies: p.technologies || [],
        projectType: p.projectType || null,
        category: p.category || null,
        tags: p.tags || [],
        projectUrl: p.projectUrl || '',
        githubUrl: p.githubUrl || '',
        visibility: p.visibility || 'public',
        featured: p.featured || false,
        pinned: p.pinned || false,
        views: p.views || 0,
        likes: p.likes || 0,
        progress: p.progress || 0,
        status: p.status,
        publishedAt: p.publishedAt,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    });
  } catch (err) {
    console.error('listMine projects error:', err);
    res.status(500).json({ error: 'Failed to load your projects' });
  }
};

exports.getById = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.authorId !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });
    res.json({ project });
  } catch (err) {
    console.error('getById project error:', err);
    res.status(500).json({ error: 'Failed to load project' });
  }
};

exports.create = async (req, res) => {
  try {
    const data = req.body;
    if (!data.title?.trim()) return res.status(400).json({ error: 'Title is required' });

    let baseSlug = slugify(title);
    let slug = baseSlug;
    let n = 1;
    while (await prisma.project.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${n++}`;
    }

    const now = new Date().toISOString();
    const isPublished = data.status === 'published';
    const statusValues = ['planning', 'development', 'testing', 'production', 'maintenance', 'archived', 'draft', 'published'];
    const finalStatus = statusValues.includes(data.status?.toLowerCase()) ? data.status.toLowerCase() : 'draft';

    const project = await prisma.project.create({
      data: {
        title: data.title.trim(),
        slug,
        excerpt: data.excerpt || '',
        content: data.content || '',
        richSections: data.richSections || {},
        
        featuredImage: data.featuredImage || null,
        logo: data.logo || null,
        gallery: Array.isArray(data.gallery) ? data.gallery : [],
        videoDemo: data.videoDemo || null,
        thumbnail: data.thumbnail || null,

        technologies: Array.isArray(data.technologies) ? data.technologies : [],
        features: Array.isArray(data.features) ? data.features : [],
        screenshots: Array.isArray(data.screenshots) ? data.screenshots : [],
        tags: Array.isArray(data.tags) ? data.tags : [],
        category: data.category || null,
        
        projectType: data.projectType || null,
        difficulty: data.difficulty || null,
        teamSize: data.teamSize || null,
        duration: data.duration || null,
        client: data.client || null,
        company: data.company || null,
        license: data.license || null,
        
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        
        githubUrl: data.githubUrl || '',
        projectUrl: data.projectUrl || '',
        documentationUrl: data.documentationUrl || '',
        apiDocsUrl: data.apiDocsUrl || '',
        downloadUrl: data.downloadUrl || '',
        
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        keywords: data.keywords || '',
        canonicalUrl: data.canonicalUrl || '',
        ogImage: data.ogImage || '',
        
        visibility: ['private', 'public'].includes(data.visibility) ? data.visibility : 'public',
        featured: Boolean(data.featured),
        pinned: Boolean(data.pinned),
        
        views: 0,
        likes: 0,
        downloads: 0,
        stars: 0,
        forks: 0,
        comments: 0,
        
        progress: typeof data.progress === 'number' ? data.progress : 0,
        attachments: Array.isArray(data.attachments) ? data.attachments : [],
        
        authorId: req.user.userId,
        status: finalStatus,
        publishedAt: isPublished ? now : null,
      },
    });
    res.status(201).json({ project });
  } catch (err) {
    console.error('create project error:', err);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

exports.update = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.authorId !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });

    const data = req.body;
    const updates = {};
    
    // Copy all allowed fields if they exist in request body
    const fields = [
      'title', 'content', 'excerpt', 'richSections',
      'featuredImage', 'logo', 'gallery', 'videoDemo', 'thumbnail',
      'technologies', 'features', 'screenshots', 'tags', 'category',
      'projectType', 'difficulty', 'teamSize', 'duration', 'client', 'company', 'license',
      'startDate', 'endDate',
      'githubUrl', 'projectUrl', 'documentationUrl', 'apiDocsUrl', 'downloadUrl',
      'metaTitle', 'metaDescription', 'keywords', 'canonicalUrl', 'ogImage',
      'visibility', 'featured', 'pinned', 'progress', 'attachments'
    ];

    for (const field of fields) {
      if (data[field] !== undefined) {
        updates[field] = data[field];
      }
    }
    
    if (data.status !== undefined) {
      const statusValues = ['planning', 'development', 'testing', 'production', 'maintenance', 'archived', 'draft', 'published'];
      updates.status = statusValues.includes(data.status?.toLowerCase()) ? data.status.toLowerCase() : 'draft';
      
      if (updates.status === 'published' && project.status !== 'published') {
        updates.publishedAt = new Date().toISOString();
      }
      if (updates.status === 'draft') updates.publishedAt = null;
    }

    const updated = await prisma.project.update({ where: { id: project.id }, data: updates });
    res.json({ project: updated });
  } catch (err) {
    console.error('update project error:', err);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

exports.remove = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.authorId !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });
    await prisma.project.delete({ where: { id: project.id } });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error('remove project error:', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};
