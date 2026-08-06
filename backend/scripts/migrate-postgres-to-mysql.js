/**
 * migrate-postgres-to-mysql.js
 * -----------------------------------------------------------------------
 * One-time data migration: copies every row from the OLD PostgreSQL
 * database into the NEW MySQL database.
 *
 * It does NOT touch your schema — that's already been converted
 * (see ../prisma/schema.prisma). This script only moves the data.
 *
 * SETUP
 * -----
 * 1. In backend/.env, make sure both of these are set:
 *      SOURCE_DATABASE_URL="postgresql://user:pass@old-host:5432/resort_db"
 *      DATABASE_URL="mysql://user:pass@new-host:3306/resort_db"
 *
 * 2. Generate a Prisma client for the OLD Postgres schema (read-only source):
 *      npx prisma generate --schema=prisma/legacy-postgres/schema.prisma
 *
 * 3. Make sure the NEW MySQL database already has the schema applied
 *    (i.e. you've already run `npx prisma migrate dev --name init_mysql`
 *    against it, so the empty tables exist).
 *
 * 4. Run:
 *      node scripts/migrate-postgres-to-mysql.js
 *
 * SAFE TO RE-RUN
 * --------------
 * Every insert uses `skipDuplicates: true`, so re-running after a partial
 * failure just fills in whatever wasn't copied yet — it won't create
 * duplicates or error out on rows that already made it across.
 *
 * ORDER MATTERS
 * -------------
 * Tables are copied in an order that respects foreign keys (parents
 * before children). Don't reorder the steps below.
 * -----------------------------------------------------------------------
 */

import "dotenv/config";
import { PrismaClient as SourcePrismaClient } from "../node_modules/.prisma/legacy-postgres-client/index.js";
import { PrismaClient as TargetPrismaClient } from "@prisma/client";

const source = new SourcePrismaClient({
  datasources: { db: { url: process.env.SOURCE_DATABASE_URL } },
});

const target = new TargetPrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

async function copyTable(label, { fetch, insert }) {
  process.stdout.write(`→ ${label}... `);
  const rows = await fetch();

  if (rows.length === 0) {
    console.log("nothing to copy");
    return { table: label, count: 0 };
  }

  const result = await insert(rows);
  console.log(`${result.count}/${rows.length} rows copied`);
  return { table: label, count: result.count, total: rows.length };
}

async function main() {
  console.log("Starting Postgres → MySQL data migration\n");

  const summary = [];

  // 1. Users (no dependencies)
  summary.push(
    await copyTable("Users", {
      fetch: () => source.user.findMany(),
      insert: (rows) => target.user.createMany({ data: rows, skipDuplicates: true }),
    })
  );

  // 2. Room categories (no dependencies)
  summary.push(
    await copyTable("Room categories", {
      fetch: () => source.roomCategory.findMany(),
      insert: (rows) => target.roomCategory.createMany({ data: rows, skipDuplicates: true }),
    })
  );

  // 3. Rooms (depends on RoomCategory). amenities/images were Postgres
  //    arrays on the source and are Json on the target — both come
  //    through Prisma as plain JS arrays, so no conversion is needed.
  summary.push(
    await copyTable("Rooms", {
      fetch: () => source.room.findMany(),
      insert: (rows) => target.room.createMany({ data: rows, skipDuplicates: true }),
    })
  );

  // 4. Bookings (depends on User, Room)
  summary.push(
    await copyTable("Bookings", {
      fetch: () => source.booking.findMany(),
      insert: (rows) => target.booking.createMany({ data: rows, skipDuplicates: true }),
    })
  );

  // 5. Reviews (depends on User, Room)
  summary.push(
    await copyTable("Reviews", {
      fetch: () => source.review.findMany(),
      insert: (rows) => target.review.createMany({ data: rows, skipDuplicates: true }),
    })
  );

  // 6. Blog posts (no dependencies). tags: array → Json, same as rooms.
  summary.push(
    await copyTable("Blog posts", {
      fetch: () => source.blogPost.findMany(),
      insert: (rows) => target.blogPost.createMany({ data: rows, skipDuplicates: true }),
    })
  );

  // 7. Gallery items (no dependencies)
  summary.push(
    await copyTable("Gallery items", {
      fetch: () => source.galleryItem.findMany(),
      insert: (rows) => target.galleryItem.createMany({ data: rows, skipDuplicates: true }),
    })
  );

  // 8. Leads (depends on User, optional)
  summary.push(
    await copyTable("Leads", {
      fetch: () => source.lead.findMany(),
      insert: (rows) => target.lead.createMany({ data: rows, skipDuplicates: true }),
    })
  );

  // 9. Amenities (no dependencies)
  summary.push(
    await copyTable("Amenities", {
      fetch: () => source.amenity.findMany(),
      insert: (rows) => target.amenity.createMany({ data: rows, skipDuplicates: true }),
    })
  );

  // 10. Settings (no dependencies)
  summary.push(
    await copyTable("Settings", {
      fetch: () => source.setting.findMany(),
      insert: (rows) => target.setting.createMany({ data: rows, skipDuplicates: true }),
    })
  );

  // 11. Transactions (depends on Booking, User)
  summary.push(
    await copyTable("Transactions", {
      fetch: () => source.transaction.findMany(),
      insert: (rows) => target.transaction.createMany({ data: rows, skipDuplicates: true }),
    })
  );

  // 12. Transaction items (depends on Transaction)
  summary.push(
    await copyTable("Transaction items", {
      fetch: () => source.transactionItem.findMany(),
      insert: (rows) => target.transactionItem.createMany({ data: rows, skipDuplicates: true }),
    })
  );

  // 13. Activity logs (depends on User, optional)
  summary.push(
    await copyTable("Activity logs", {
      fetch: () => source.activityLog.findMany(),
      insert: (rows) => target.activityLog.createMany({ data: rows, skipDuplicates: true }),
    })
  );

  console.log("\nDone. Summary:");
  console.table(summary);

  const shortfall = summary.filter((s) => s.total && s.count < s.total);
  if (shortfall.length) {
    console.warn(
      "\n⚠️  Some rows were skipped (likely already existed from a previous run, or a foreign key was missing):"
    );
    console.table(shortfall);
  }
}

main()
  .catch((err) => {
    console.error("\n❌ Migration failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await source.$disconnect();
    await target.$disconnect();
  });
