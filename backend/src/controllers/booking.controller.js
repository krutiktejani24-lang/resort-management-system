import prisma from '../config/prisma.js';
import { v4 as uuidv4 } from 'uuid';

const generateBookingNumber = () => {
  return `BK${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
};

const calculateBookingAmounts = (pricePerNight, nights) => {
  const totalAmount = pricePerNight * nights;
  const taxAmount = totalAmount * 0.12;
  const finalAmount = totalAmount + taxAmount;
  return { totalAmount, taxAmount, finalAmount };
};

export const createBooking = async (req, res) => {
  try {
    const {

      roomId,

      categoryId,

      checkIn,

      checkOut,

      adults,

      children,

      specialRequests,

      guestName,

      guestEmail,

      guestPhone

    } = req.body;

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

  if (nights < 1) return res.status(400).json({ error: 'Check-out must be after check-in' });

  let room;

  if (categoryId) {
    // Auto-allocate: pick the first physical room in this category
    // that isn't already booked for the requested dates.
    const candidateRooms = await prisma.room.findMany({
      where: { categoryId, status: 'AVAILABLE' },
      orderBy: { roomNumber: 'asc' },
    });

    if (candidateRooms.length === 0) {
      return res.status(404).json({ error: 'No rooms found for this room type' });
    }

    const conflictingRoomIds = await prisma.booking.findMany({
      where: {
        roomId: { in: candidateRooms.map((r) => r.id) },
        status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
        checkIn: { lt: checkOutDate },
        checkOut: { gt: checkInDate },
      },
      select: { roomId: true },
    }).then((rows) => new Set(rows.map((r) => r.roomId)));

    room = candidateRooms.find((r) => !conflictingRoomIds.has(r.id));

    if (!room) {
      return res.status(400).json({
        error: 'All rooms of this type are booked for the selected dates. Please try different dates.',
      });
    }
  } else {
    // Legacy path: booking against one specific room id
    room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.status !== 'AVAILABLE') return res.status(400).json({ error: 'Room is not available' });

    const conflict = await prisma.booking.findFirst({
      where: {
        roomId: room.id,
        status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
        checkIn: { lt: checkOutDate },
        checkOut: { gt: checkInDate },
      },
    });

    if (conflict) {
      return res.status(400).json({
        error: "Room is not available for these dates",
        booking: conflict
      });
    }
  }

  const { totalAmount, taxAmount, finalAmount } = calculateBookingAmounts(room.pricePerNight, nights);

  const booking = await prisma.booking.create({
    data: {
      bookingNumber: generateBookingNumber(),
      userId: req.user.id,
      roomId: room.id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      adults: Number(adults),
      children: Number(children || 0),
      totalNights: nights,
      pricePerNight: room.pricePerNight,
      totalAmount,
      taxAmount,
      discountAmount: 0,
      finalAmount,
      guestName, guestEmail, guestPhone, specialRequests
    },
    include: {
      room: { include: { category: true } },
      user: { select: { firstName: true, lastName: true, email: true } }
    }
  });

     res.status(201).json({
      success: true,
      data: booking,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: err.message,
    });
  }
};
export const getMyBookings = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const where = { userId: req.user.id};
  if (status) where.status = status;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where, skip, take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: { room: { include: { category: true } } }
    }),
    prisma.booking.count({ where })
  ]);

  res.json({ success: true, data: bookings, pagination: { page: Number(page), limit: Number(limit), total } });
};

export const getBookingById = async (req, res) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id: req.params.id,
      ...(req.user.role === 'CUSTOMER' ? { userId: req.user.id } : {})
    },
    include: {
      room: { include: { category: true } },
      user: { select: { firstName: true, lastName: true, email: true, phone: true } }
    }
  });

  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json({ success: true, data: booking });
};

export const getAllBookings = async (req, res) => {
  const { page = 1, limit = 20, status, paymentStatus, search, startDate, endDate } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const where = {};

  if (status) where.status = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (startDate || endDate) {
    where.checkIn = {};
    if (startDate) where.checkIn.gte = new Date(startDate);
    if (endDate) where.checkIn.lte = new Date(endDate);
  }
  if (search) {
    where.OR = [
      { bookingNumber: { contains: search } },
      { guestName: { contains: search } },
      { guestEmail: { contains: search } }
    ];
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where, skip, take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        room: { select: { name: true, roomNumber: true } },
        user: { select: { firstName: true, lastName: true, email: true } }
      }
    }),
    prisma.booking.count({ where })
  ]);

  res.json({
    success: true, data: bookings,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
  });
};

export const updateBookingStatus = async (req, res) => {
  const { status, paymentStatus } = req.body;
  const booking = await prisma.booking.update({
    where: { id: req.params.id },
    data: { ...(status && { status }), ...(paymentStatus && { paymentStatus }) },
    include: { room: true, user: { select: { firstName: true, email: true } } }
  });
  res.json({ success: true, data: booking });
};

export const cancelBooking = async (req, res) => {
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, userId: req.user.id }
  });
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
    return res.status(400).json({ error: 'Booking cannot be cancelled' });
  }

  const updated = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status: 'CANCELLED' }
  });
  res.json({ success: true, data: updated });
};
