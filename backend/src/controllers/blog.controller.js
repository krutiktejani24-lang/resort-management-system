import prisma from '../config/prisma.js';
import slugify from 'slug';

export const getPosts = async (req, res) => {
  const { page = 1, limit = 9, tag, search, published } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const where = {};

  if (published !== 'all') where.isPublished = true;
  if (tag) where.tags = { array_contains: tag };
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { excerpt: { contains: search } }
    ];
  }

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where, skip, take: Number(limit),
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, author: true, tags: true, views: true, createdAt: true, isPublished: true }
    }),
    prisma.blogPost.count({ where })
  ]);

  res.json({ success: true, data: posts, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
};

export const getPostBySlug = async (req, res) => {
  const post = await prisma.blogPost.findUnique({
    where: { slug: req.params.slug }
  });
  if (!post || (!post.isPublished && req.user?.role !== 'ADMIN')) {
    return res.status(404).json({ error: 'Post not found' });
  }
  await prisma.blogPost.update({ where: { id: post.id }, data: { views: { increment: 1 } } });
  res.json({ success: true, data: post });
};

export const createPost = async (req, res) => {
  const { title, ...rest } = req.body;
  const baseSlug = slugify(title, { lower: true });
  const existing = await prisma.blogPost.findUnique({ where: { slug: baseSlug } });
  const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

  const post = await prisma.blogPost.create({ data: { title, slug, ...rest } });
  res.status(201).json({ success: true, data: post });
};

export const updatePost = async (req, res) => {
  const post = await prisma.blogPost.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json({ success: true, data: post });
};

export const deletePost = async (req, res) => {
  await prisma.blogPost.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Post deleted' });
};
