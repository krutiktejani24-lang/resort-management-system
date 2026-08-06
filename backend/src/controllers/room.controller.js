import prisma from '../config/prisma.js';
import slugify from 'slug';

export const getRooms = async (req, res) => {
  const {
    page = 1, limit = 12, category, minPrice, maxPrice,
    capacity, status, featured, search, sortBy = 'createdAt', sortOrder = 'desc'
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const where = {};

  if (category) where.categoryId = category;
  if (status) where.status = status;
  if (featured === 'true') where.featured = true;
  if (capacity) where.capacity = { gte: Number(capacity) };
  if (minPrice || maxPrice) {
    where.pricePerNight = {};
    if (minPrice) where.pricePerNight.gte = Number(minPrice);
    if (maxPrice) where.pricePerNight.lte = Number(maxPrice);
  }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } }
    ];
  }

  const [rooms, total] = await Promise.all([
    prisma.room.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { [sortBy]: sortOrder },
      include: {
        category: true,
        _count: { select: { reviews: true, bookings: true } },
        reviews: {
          where: { isApproved: true },
          select: { rating: true }
        }
      }
    }),
    prisma.room.count({ where })
  ]);

  const roomsWithRating = rooms.map(room => ({
    ...room,
    avgRating: room.reviews.length
      ? room.reviews.reduce((sum, r) => sum + r.rating, 0) / room.reviews.length
      : 0,
    reviews: undefined
  }));

  res.json({
    success: true,
    data: roomsWithRating,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
};

export const getRoomBySlug = async (req, res) => {
  const room = await prisma.room.findUnique({
    where: { slug: req.params.slug },
    include: {
      category: true,
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
        orderBy: { createdAt: 'desc' }
      },
      _count: { select: { bookings: true } }
    }
  });

  if (!room) return res.status(404).json({ error: 'Room not found' });

  const avgRating = room.reviews.length
    ? room.reviews.reduce((sum, r) => sum + r.rating, 0) / room.reviews.length : 0;

  res.json({ success: true, data: { ...room, avgRating } });
};

export const getRoomAvailability = async (req, res) => {
  const { roomId, checkIn, checkOut } = req.query;

  const conflictingBookings = await prisma.booking.count({
    where: {
      roomId,
      status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
      OR: [
        { checkIn: { lte: new Date(checkOut) }, checkOut: { gte: new Date(checkIn) } }
      ]
    }
  });

  res.json({ success: true, available: conflictingBookings === 0 });
};

export const createRoom = async (req, res) => {
  try {
    const {
      name,
      description,
      shortDescription,
      categoryId,
      pricePerNight,
      capacity,
      bedType,
      size,
      floor,
      roomNumber,
      status,
      featured,
      amenities,
      images,
    } = req.body;

    const slug = slugify(name, { lower: true });

    const existingSlug = await prisma.room.findUnique({
      where: { slug },
    });

    const finalSlug = existingSlug
      ? `${slug}-${Date.now()}`
      : slug;

    const room = await prisma.room.create({
      data: {
        name,
        slug: finalSlug,

        description: description || "",
        shortDescription: shortDescription || "",

        categoryId,

        pricePerNight: Number(pricePerNight),

        capacity: Number(capacity),

        bedType,

        size:
          size === "" || size === null || size === undefined
            ? null
            : parseFloat(size),

        floor:
          floor === "" || floor === null || floor === undefined
            ? null
            : parseInt(floor),

        roomNumber,

        status: status || "AVAILABLE",

        featured: featured === true || featured === "true",

        amenities: Array.isArray(amenities) ? amenities : [],

        images: Array.isArray(images) ? images : [],
      },

      include: {
        category: true,
      },
    });

    return res.status(201).json({
      success: true,
      data: room,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const body = req.body;

    const room = await prisma.room.update({
      where: {
        id: req.params.id,
      },

      data: {
        ...body,

        pricePerNight: Number(body.pricePerNight),

        capacity: Number(body.capacity),

        size:
          body.size === "" || body.size == null
            ? null
            : parseFloat(body.size),

        floor:
          body.floor === "" || body.floor == null
            ? null
            : parseInt(body.floor),
      },

      include: {
        category: true,
      },
    });

    res.json({
      success: true,
      data: room,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteRoom = async (req, res) => {
  await prisma.room.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Room deleted successfully' });
};

export const getRoomTypes = async (req, res) => {
  const categories = await prisma.roomCategory.findMany({
    include: {
      rooms: {
        orderBy: { roomNumber: 'asc' },
        include: {
          reviews: { where: { isApproved: true }, select: { rating: true } }
        }
      }
    }
  });

  const roomTypes = categories
    .filter(c => c.rooms.length > 0)
    .map(c => {
      const rep = c.rooms[0]; // representative room used for photo/price/description
      const allRatings = c.rooms.flatMap(r => r.reviews.map(rv => rv.rating));
      const avgRating = allRatings.length
        ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
        : 0;

      return {
        categoryId: c.id,
        categoryName: c.name,
        slug: rep.slug,
        name: c.name,
        description: rep.description,
        shortDescription: rep.shortDescription,
        pricePerNight: rep.pricePerNight,
        capacity: rep.capacity,
        bedType: rep.bedType,
        size: rep.size,
        amenities: rep.amenities,
        images: rep.images,
        totalRooms: c.rooms.length,
        avgRating,
        reviewCount: allRatings.length
      };
    });

  res.json({ success: true, data: roomTypes });
};

export const getRoomCategories = async (req, res) => {
  const categories = await prisma.roomCategory.findMany({
    include: { _count: { select: { rooms: true } } }
  });
  res.json({ success: true, data: categories });
};

export const createRoomCategory = async (req, res) => {
  const category = await prisma.roomCategory.create({ data: req.body });
  res.status(201).json({ success: true, data: category });
};
