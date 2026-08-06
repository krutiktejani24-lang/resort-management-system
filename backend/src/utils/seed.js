import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  log: ['error', 'warn']
});

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const hashedPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mangotreeresort.com' },
    update: {},
    create: {
      email: 'admin@mangotreeresort.com',
      password: hashedPassword,
      firstName: 'Resort',
      lastName: 'Admin',
      role: 'ADMIN'
    }
  });

  // Customer user
  const customer = await prisma.user.upsert({
    where: { email: 'guest@example.com' },
    update: {},
    create: {
      email: 'guest@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      role: 'CUSTOMER'
    }
  });

  // ==========================================================
  // Room categories — only 2: Couple Room & Family Room
  // ==========================================================

  const oldCategoryNames = ['Deluxe Room', 'Premium Suite', 'Ocean Villa', 'Presidential Suite'];

  // Clean up old sample categories/rooms from earlier seed runs.
  // Skipped safely (with a warning) if bookings/reviews already
  // reference them — we never want the seed script to crash.
  for (const name of oldCategoryNames) {
    const oldCategory = await prisma.roomCategory.findUnique({ where: { name } });
    if (!oldCategory) continue;
    try {
      const oldRooms = await prisma.room.findMany({ where: { categoryId: oldCategory.id } });
      for (const r of oldRooms) {
        await prisma.room.delete({ where: { id: r.id } });
      }
      await prisma.roomCategory.delete({ where: { id: oldCategory.id } });
      console.log(`🧹 Removed old category "${name}" and its rooms`);
    } catch (err) {
      console.warn(`⚠️  Could not fully remove old category "${name}" (likely has existing bookings) — leaving it in place.`);
    }
  }

  const [coupleCategory, familyCategory] = await Promise.all([
    prisma.roomCategory.upsert({
      where: { name: 'Couple Room' },
      update: {},
      create: { name: 'Couple Room', description: 'Cosy rooms designed for two, with a king bed.' },
    }),
    prisma.roomCategory.upsert({
      where: { name: 'Family Room' },
      update: {},
      create: { name: 'Family Room', description: 'Spacious rooms for families, with a king bed and a single bed.' },
    }),
  ]);

  // ==========================================================
  // Rooms — 25 Couple Rooms (capacity 2, 1 King bed)
  //       + 25 Family Rooms (capacity 3, 1 King + 1 Single bed)
  // ==========================================================

  const coupleImages = [
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
  ];
  const familyImages = [
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
  ];

  const rooms = [];

  for (let i = 1; i <= 25; i++) {
    const floor = Math.ceil(i / 5); // 5 rooms per floor
    const roomNumber = `C${100 + i}`;
    rooms.push({
      name: `Couple Room ${roomNumber}`,
      slug: `couple-room-${roomNumber.toLowerCase()}`,
      description: 'A cosy, beautifully appointed room designed for two, featuring a plush king bed and all modern comforts.',
      shortDescription: 'Cosy room for two with a king bed',
      categoryId: coupleCategory.id,
      pricePerNight: 6500,
      capacity: 2,
      bedType: '1 King Bed',
      size: 32,
      floor,
      roomNumber,
      amenities: ['WiFi', 'AC', 'Mini Bar', 'TV', 'Safe', 'Balcony'],
      images: coupleImages,
      featured: i === 1,
    });
  }

  for (let i = 1; i <= 25; i++) {
    const floor = Math.ceil(i / 5);
    const roomNumber = `F${100 + i}`;
    rooms.push({
      name: `Family Room ${roomNumber}`,
      slug: `family-room-${roomNumber.toLowerCase()}`,
      description: 'A spacious room designed for families, with a king bed and a single bed, plus extra room to relax.',
      shortDescription: 'Spacious room for families — king + single bed',
      categoryId: familyCategory.id,
      pricePerNight: 8500,
      capacity: 3,
      bedType: '1 King Bed + 1 Single Bed',
      size: 42,
      floor,
      roomNumber,
      amenities: ['WiFi', 'AC', 'Mini Bar', 'TV', 'Safe', 'Balcony', 'Kids Area'],
      images: familyImages,
      featured: i === 1,
    });
  }

  for (const room of rooms) {
    const existing = await prisma.room.findUnique({ where: { slug: room.slug } });
    if (existing) {
      await prisma.room.update({ where: { slug: room.slug }, data: room });
    } else {
      await prisma.room.create({ data: room });
    }
  }

  // Gallery items
  const galleryItems = [
    { title: 'Infinity Pool', category: 'pool', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', featured: true },
    { title: 'Resort Exterior', category: 'resort', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', featured: true },
    { title: 'Spa & Wellness', category: 'spa', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', featured: true },
    { title: 'Fine Dining', category: 'dining', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800' },
    { title: 'Beach View', category: 'beach', url: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800' },
    { title: 'Luxury Suite', category: 'rooms', url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800' },
    { title: 'Garden Walk', category: 'resort', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800' },
    { title: 'Water Sports', category: 'activities', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800' }
  ];

  for (const item of galleryItems) {
    await prisma.galleryItem.create({ data: item });
  }

  // Blog posts
  const posts = [
    { title: 'The Art of Tropical Luxury: What Makes Mango Tree Unique', slug: 'art-of-tropical-luxury', excerpt: 'Discover what sets Mango Tree Resort apart in the world of luxury hospitality.', content: '<h2>A New Standard of Excellence</h2><p>At Mango Tree, we believe luxury is not about excess but about perfectly curated experiences that connect you with the natural beauty of paradise...</p>', author: 'Sarah Mitchell', tags: ['luxury', 'resort', 'experience'], isPublished: true, coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' },
    { title: 'Top 10 Things to Do at Mango Tree This Season', slug: 'top-10-things-to-do', excerpt: 'From sunrise yoga on the beach to twilight cocktail cruises, here are the must-do experiences.', content: '<h2>Make the Most of Your Stay</h2><p>Every season at Mango Tree brings new adventures and timeless pleasures...</p>', author: 'James Hartwell', tags: ['activities', 'tips', 'travel'], isPublished: true, coverImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800' },
    { title: 'A Culinary Journey Through Our Award-Winning Restaurants', slug: 'culinary-journey-restaurants', excerpt: 'Explore the flavors of paradise across our five distinct dining experiences.', content: '<h2>Dining at Mango Tree</h2><p>Our culinary team, led by Chef Marco Valentini, crafts seasonal menus inspired by local ingredients...</p>', author: 'Chef Marco Valentini', tags: ['dining', 'food', 'culinary'], isPublished: true, coverImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800' }
  ];

  for (const post of posts) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } });
    if (!existing) await prisma.blogPost.create({ data: post });
  }

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin: admin@mangotreeresort.com / Admin@123');
  console.log('👤 Guest: guest@example.com / Admin@123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
