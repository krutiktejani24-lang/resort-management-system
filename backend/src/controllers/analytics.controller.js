import prisma from '../config/prisma.js';

export const getDashboardStats = async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalBookings, monthBookings, lastMonthBookings,
    totalRevenue, monthRevenue, lastMonthRevenue,
    totalGuests, monthGuests,
    totalRooms, availableRooms, occupiedRooms,
    pendingLeads, totalReviews, recentBookings, topRooms
  ] = await Promise.all([
    prisma.booking.count({ where: { status: { not: 'CANCELLED' } } }),
    prisma.booking.count({ where: { createdAt: { gte: startOfMonth }, status: { not: 'CANCELLED' } } }),
    prisma.booking.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }, status: { not: 'CANCELLED' } } }),
    prisma.booking.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { finalAmount: true } }),
    prisma.booking.aggregate({ where: { paymentStatus: 'PAID', createdAt: { gte: startOfMonth } }, _sum: { finalAmount: true } }),
    prisma.booking.aggregate({ where: { paymentStatus: 'PAID', createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } }, _sum: { finalAmount: true } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: startOfMonth } } }),
    prisma.room.count(),
    prisma.room.count({ where: { status: 'AVAILABLE' } }),
    prisma.room.count({ where: { status: 'OCCUPIED' } }),
    prisma.lead.count({ where: { status: 'NEW' } }),
    prisma.review.count({ where: { isApproved: true } }),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { room: { select: { name: true } }, user: { select: { firstName: true, lastName: true } } }
    }),
    prisma.booking.groupBy({
      by: ['roomId'],
      where: { status: { not: 'CANCELLED' } },
      _count: { roomId: true },
      _sum: { finalAmount: true },
      orderBy: { _count: { roomId: 'desc' } },
      take: 5
    })
  ]);

  const topRoomsWithDetails = await Promise.all(
    topRooms.map(async (item) => {
      const room = await prisma.room.findUnique({
        where: { id: item.roomId },
        select: { name: true, roomNumber: true, images: true }
      });
      return { ...room, bookings: item._count.roomId, revenue: item._sum.finalAmount };
    })
  );

  // Monthly revenue for chart (last 6 months)
  const monthlyRevenue = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const rev = await prisma.booking.aggregate({
      where: { paymentStatus: 'PAID', createdAt: { gte: start, lte: end } },
      _sum: { finalAmount: true }
    });
    monthlyRevenue.push({
      month: start.toLocaleString('default', { month: 'short' }),
      revenue: rev._sum.finalAmount || 0,
      year: start.getFullYear()
    });
  }

  const bookingGrowth = lastMonthBookings > 0
    ? ((monthBookings - lastMonthBookings) / lastMonthBookings * 100).toFixed(1) : 0;
  const revenueGrowth = (lastMonthRevenue._sum.finalAmount || 0) > 0
    ? (((monthRevenue._sum.finalAmount || 0) - (lastMonthRevenue._sum.finalAmount || 0)) / (lastMonthRevenue._sum.finalAmount || 0) * 100).toFixed(1) : 0;

  res.json({
    success: true,
    data: {
      stats: {
        totalBookings, monthBookings, bookingGrowth,
        totalRevenue: totalRevenue._sum.finalAmount || 0,
        monthRevenue: monthRevenue._sum.finalAmount || 0,
        revenueGrowth,
        totalGuests, monthGuests,
        totalRooms, availableRooms, occupiedRooms,
        occupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0,
        pendingLeads, totalReviews
      },
      monthlyRevenue,
      recentBookings,
      topRooms: topRoomsWithDetails
    }
  });
};

export const getRevenueReport = async (req, res) => {
  const { year = new Date().getFullYear() } = req.query;
  const monthlyData = [];

  for (let month = 0; month < 12; month++) {
    const start = new Date(Number(year), month, 1);
    const end = new Date(Number(year), month + 1, 0);

    const [bookings, revenue, guests] = await Promise.all([
      prisma.booking.count({ where: { status: { not: 'CANCELLED' }, createdAt: { gte: start, lte: end } } }),
      prisma.booking.aggregate({
        where: { paymentStatus: 'PAID', createdAt: { gte: start, lte: end } },
        _sum: { finalAmount: true }
      }),
      prisma.booking.aggregate({
        where: { status: { not: 'CANCELLED' }, createdAt: { gte: start, lte: end } },
        _sum: { adults: true, children: true }
      })
    ]);

    monthlyData.push({
      month: start.toLocaleString('default', { month: 'long' }),
      monthNum: month + 1,
      bookings,
      revenue: revenue._sum.finalAmount || 0,
      guests: (guests._sum.adults || 0) + (guests._sum.children || 0)
    });
  }

  res.json({ success: true, data: monthlyData });
};

export const getOccupancyReport = async (req, res) => {
  const { startDate, endDate } = req.query;
  const rooms = await prisma.room.findMany({
    select: { id: true, name: true, roomNumber: true, status: true },
    where: { status: { not: 'MAINTENANCE' } }
  });

  const occupancyData = await Promise.all(rooms.map(async (room) => {
    const bookings = await prisma.booking.count({
      where: {
        roomId: room.id,
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] },
        ...(startDate && endDate ? { checkIn: { gte: new Date(startDate) }, checkOut: { lte: new Date(endDate) } } : {})
      }
    });
    return { ...room, totalBookings: bookings };
  }));

  res.json({ success: true, data: occupancyData });
};
