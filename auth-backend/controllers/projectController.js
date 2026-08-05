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
    projectUrl: project.projectUrl || '',
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
          projectUrl: p.projectUrl || '',
          publishedAt: p.publishedAt,
          createdAt: p.createdAt,
          author: author ? { name: author.name || author.email, username: author.username } : { name: 'Author' },
        };
      })
    );
    res.json({ projects: withAuthors });
  } catch (err) {
    console.error('listPublished projects error:', err);
    res.status(500).json({ error: 'Failed to load projects' });
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
        projectUrl: p.projectUrl || '',
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
    const { title, content, excerpt, status, projectUrl } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });

    let baseSlug = slugify(title);
    let slug = baseSlug;
    let n = 1;
    while (await prisma.project.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${n++}`;
    }

    const now = new Date().toISOString();
    const isPublished = status === 'published';
    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        slug,
        content: content || '',
        excerpt: excerpt || '',
        projectUrl: projectUrl || '',
        authorId: req.user.userId,
        status: isPublished ? 'published' : 'draft',
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

    const { title, content, excerpt, status, projectUrl } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (content !== undefined) updates.content = content;
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (projectUrl !== undefined) updates.projectUrl = projectUrl;
    if (status !== undefined) {
      updates.status = status === 'published' ? 'published' : 'draft';
      if (status === 'published' && project.status !== 'published') {
        updates.publishedAt = new Date().toISOString();
      }
      if (status === 'draft') updates.publishedAt = null;
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
