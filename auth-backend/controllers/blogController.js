const prisma = require('../db');

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'post';
}

function publicPost(post, author) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || '',
    featuredImage: post.featuredImage || null,
    category: post.category || null,
    tags: post.tags || [],
    content: post.content || '',
    status: post.status,
    publishedAt: post.publishedAt || null,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: author
      ? { name: author.name || author.email, username: author.username }
      : { name: 'Author' },
  };
}

async function getAuthor(authorId) {
  return prisma.user.findUnique({ where: { id: authorId } });
}

function parseTags(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input.map((t) => String(t).trim().toLowerCase()).filter(Boolean);
  return String(input).split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
}

function matchesQuery(post, q, tag, category) {
  if (category) {
    if ((post.category || '').toLowerCase() !== category.toLowerCase()) return false;
  }
  if (tag) {
    const tags = post.tags || [];
    if (!tags.includes(tag.toLowerCase())) return false;
  }
  if (q) {
    const hay = `${post.title} ${post.excerpt || ''} ${post.content || ''}`.toLowerCase();
    if (!hay.includes(q.toLowerCase())) return false;
  }
  return true;
}

exports.listPublished = async (req, res) => {
  try {
    const q = req.query.q || '';
    const tag = req.query.tag || '';
    const category = req.query.category || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    let posts = await prisma.blog.findMany({ where: { status: 'published' }, orderBy: { createdAt: 'desc' } });
    posts = posts.filter((p) => matchesQuery(p, q, tag, category));

    const total = posts.length;
    posts = posts.slice(skip, skip + limit);
    const withAuthors = await Promise.all(
      posts.map(async (post) => {
        const author = await getAuthor(post.authorId);
        return {
          id: post.id,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt || '',
          featuredImage: post.featuredImage || null,
          category: post.category || null,
          tags: post.tags || [],
          publishedAt: post.publishedAt,
          createdAt: post.createdAt,
          author: author
            ? { name: author.name || author.email, username: author.username }
            : { name: 'Author' },
        };
      })
    );
    res.json({ 
      posts: withAuthors,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('listPublished error:', err);
    res.status(500).json({ error: 'Failed to load posts' });
  }
};

exports.listByUser = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) return res.status(400).json({ error: 'Username required' });
    
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const posts = await prisma.blog.findMany({ 
      where: { authorId: user.id, status: 'published' }, 
      orderBy: { createdAt: 'desc' } 
    });
    
    const mapped = posts.map(p => publicPost(p, user));
    res.json({ posts: mapped, total: mapped.length });
  } catch (err) {
    console.error('listByUser error:', err);
    res.status(500).json({ error: 'Failed to load user posts' });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const post = await prisma.blog.findUnique({ where: { slug: req.params.slug } });
    if (!post || post.status !== 'published') return res.status(404).json({ error: 'Post not found' });
    const author = await getAuthor(post.authorId);
    res.json({ post: publicPost(post, author) });
  } catch (err) {
    console.error('getBySlug error:', err);
    res.status(500).json({ error: 'Failed to load post' });
  }
};

exports.listMine = async (req, res) => {
  try {
    const posts = await prisma.blog.findMany({
      where: { authorId: req.user.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({
      posts: posts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt || '',
        featuredImage: p.featuredImage || null,
        category: p.category || null,
        tags: p.tags || [],
        status: p.status,
        publishedAt: p.publishedAt,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    });
  } catch (err) {
    console.error('listMine error:', err);
    res.status(500).json({ error: 'Failed to load your posts' });
  }
};

exports.getById = async (req, res) => {
  try {
    const post = await prisma.blog.findUnique({ where: { id: req.params.id } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.authorId !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });
    res.json({ post });
  } catch (err) {
    console.error('getById error:', err);
    res.status(500).json({ error: 'Failed to load post' });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, content, excerpt, status, tags, featuredImage, category } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });

    let baseSlug = slugify(title);
    let slug = baseSlug;
    let n = 1;
    while (await prisma.blog.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${n++}`;
    }

    const now = new Date().toISOString();
    const isPublished = status === 'published';
    const post = await prisma.blog.create({
      data: {
        title: title.trim(),
        slug,
        content: content || '',
        excerpt: excerpt || '',
        featuredImage: featuredImage || null,
        category: category || null,
        tags: parseTags(tags),
        authorId: req.user.userId,
        status: ['published', 'draft', 'archived'].includes(status) ? status : 'draft',
        publishedAt: status === 'published' ? now : null,
      },
    });
    res.status(201).json({ post });
  } catch (err) {
    console.error('create error:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

exports.update = async (req, res) => {
  try {
    const post = await prisma.blog.findUnique({ where: { id: req.params.id } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.authorId !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });

    const { title, content, excerpt, status, tags, featuredImage, category } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (content !== undefined) updates.content = content;
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (featuredImage !== undefined) updates.featuredImage = featuredImage;
    if (category !== undefined) updates.category = category;
    if (tags !== undefined) updates.tags = parseTags(tags);
    if (status !== undefined) {
      updates.status = ['published', 'draft', 'archived'].includes(status) ? status : 'draft';
      if (updates.status === 'published' && post.status !== 'published') {
        updates.publishedAt = new Date().toISOString();
      }
      if (updates.status === 'draft') updates.publishedAt = null;
    }

    const updated = await prisma.blog.update({ where: { id: post.id }, data: updates });
    res.json({ post: updated });
  } catch (err) {
    console.error('update error:', err);
    res.status(500).json({ error: 'Failed to update post' });
  }
};

exports.remove = async (req, res) => {
  try {
    const post = await prisma.blog.findUnique({ where: { id: req.params.id } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.authorId !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });
    await prisma.blog.delete({ where: { id: post.id } });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('remove error:', err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};
