import prisma from '../config/prisma.js';

// ---- REVIEWS ----
export const createReview = async (req, res) => {
  const { roomId, rating, title, comment } = req.body;
  const review = await prisma.review.create({
    data: { userId: req.user.id, roomId, rating: Number(rating), title, comment },
    include: { user: { select: { firstName: true, lastName: true, avatar: true } } }
  });
  res.status(201).json({ success: true, data: review });
};

export const getReviews = async (req, res) => {
  const { roomId, page = 1, limit = 10, approved } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const where = {};
  if (roomId) where.roomId = roomId;
  if (approved !== 'all') where.isApproved = true;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where, skip, take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, avatar: true } },
        room: { select: { name: true } }
      }
    }),
    prisma.review.count({ where })
  ]);
  res.json({ success: true, data: reviews, pagination: { page: Number(page), total } });
};

export const approveReview = async (req, res) => {
  const review = await prisma.review.update({
    where: { id: req.params.id },
    data: { isApproved: true }
  });
  res.json({ success: true, data: review });
};

export const respondToReview = async (req, res) => {
  const review = await prisma.review.update({
    where: { id: req.params.id },
    data: { response: req.body.response }
  });
  res.json({ success: true, data: review });
};

export const deleteReview = async (req, res) => {
  await prisma.review.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Review deleted' });
};

// ---- GALLERY ----
export const getGallery = async (req, res) => {
  const { category, type, featured } = req.query;
  const where = {};
  if (category) where.category = category;
  if (type) where.type = type;
  if (featured === 'true') where.featured = true;

  const items = await prisma.galleryItem.findMany({
    where, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
  });
  res.json({ success: true, data: items });
};

export const createGalleryItem = async (req, res) => {
  const item = await prisma.galleryItem.create({ data: req.body });
  res.status(201).json({ success: true, data: item });
};

export const updateGalleryItem = async (req, res) => {
  const item = await prisma.galleryItem.update({ where: { id: req.params.id }, data: req.body });
  res.json({ success: true, data: item });
};

export const deleteGalleryItem = async (req, res) => {
  await prisma.galleryItem.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Gallery item deleted' });
};

// ---- LEADS ----
export const createLead = async (req, res) => {
  const lead = await prisma.lead.create({
    data: { ...req.body, userId: req.user?.id || null }
  });
  res.status(201).json({ success: true, data: lead });
};

export const getLeads = async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const where = {};
  if (status) {
  const validStatuses = [
    "NEW",
    "CONTACTED",
    "FOLLOW_UP",
    "CONVERTED",
    "CLOSED",
  ];

  const normalized = status.toUpperCase();

  if (validStatuses.includes(normalized)) {
    where.status = normalized;
  }
}
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } }
    ];
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
    prisma.lead.count({ where })
  ]);
  res.json({ success: true, data: leads, pagination: { page: Number(page), total } });
};

export const updateLead = async (req, res) => {
  const lead = await prisma.lead.update({ where: { id: req.params.id }, data: req.body });
  res.json({ success: true, data: lead });
};

// ---- USERS ----
export const getUsers = async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const where = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { email: { contains: search } }
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where, skip, take: Number(limit),
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, role: true, isActive: true, avatar: true, createdAt: true,
        _count: { select: { bookings: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count({ where })
  ]);
  res.json({ success: true, data: users, pagination: { page: Number(page), total, pages: Math.ceil(total / Number(limit)) } });
};

export const getUserById = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      phone: true, role: true, isActive: true, avatar: true, createdAt: true,
      bookings: { take: 5, orderBy: { createdAt: 'desc' }, include: { room: { select: { name: true } } } },
      _count: { select: { bookings: true, reviews: true } }
    }
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ success: true, data: user });
};

export const updateUser = async (req, res) => {
  const { password, ...data } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data,
    select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true }
  });
  res.json({ success: true, data: user });
};
