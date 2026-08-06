# PostgreSQL → MySQL Migration

Data model / logic is unchanged. What changed is only what MySQL forces to be different, since it doesn't have native array/text-length behaviour identical to Postgres. Summary below, then the steps you need to run.

## What changed in the code

1. **`backend/prisma/schema.prisma`**
   - `datasource db { provider = "postgresql" }` → `provider = "mysql"`
   - `Room.amenities`, `Room.images`, `BlogPost.tags` were Postgres-native arrays (`String[]`) — MySQL has no array column type, so these are now `Json`. Your application code doesn't need to change: these still read/write as plain JS arrays (`["WiFi","AC"]`), Prisma handles the JSON conversion transparently.
   - Added `@db.Text` to long free-text fields (`Room.description`, `BlogPost.excerpt`/`content`, `Review.comment`/`response`, `Lead.message`, `Transaction.notes`, `TransactionItem.description`, `GalleryItem.description`, `Setting.value`, `Booking.specialRequests`, `ActivityLog.description`). Without this, MySQL would default those columns to `VARCHAR(191)` and **silently truncate** anything longer — Postgres doesn't have that limit, so this is the one place behaviour could otherwise quietly differ.
   - Everything else (Decimal, UUID ids, enums, relations, indexes) works the same on both providers — no changes needed there.

2. **Code fixes required by the schema change**
   - `blog.controller.js`: the tag filter used `{ has: tag }` (a Postgres-array-only operator). Since `tags` is now `Json`, changed to `{ array_contains: tag }` — same behaviour, correct operator for the new column type.
   - Removed `mode: 'insensitive'` from every `contains` search filter (`room.controller.js`, `booking.controller.js`, `blog.controller.js`, `shared.controller.js`, `transaction.controller.js`) — MySQL doesn't support that Prisma option and would throw at runtime. MySQL's default collation (`utf8mb4_general_ci`/`unicode_ci`) is already case-insensitive, so search behaves the same as before.

3. **`backend/prisma/migrations/`** — the old migration history was Postgres-specific SQL and can't run against MySQL, so it's been cleared. You'll generate a fresh MySQL migration in step 3 below.

4. **`backend/render.yaml`** — Render only offers managed PostgreSQL, not MySQL, so the `databases:` block (which auto-provisioned a Postgres DB) was removed. `DATABASE_URL` is now a plain env var you set yourself, pointing at whatever MySQL host you use (PlanetScale, Railway, AWS RDS, a VPS, etc).

5. **`README.md`** / **`backend/.env.example`** — updated to describe MySQL and use `mysql://user:password@host:3306/db` connection strings.

## What you need to do

1. **Get a MySQL 8+ database** (local install, Docker, or a hosted one — PlanetScale/Railway/AWS RDS all work).

2. **Update `backend/.env`**:
   ```
   DATABASE_URL="mysql://user:password@localhost:3306/resort_db"
   ```

3. **Generate a fresh migration against MySQL** (run from `backend/`):
   ```bash
   npx prisma migrate dev --name init_mysql
   ```
   This creates a brand-new MySQL-compatible migration and applies it to your database. Since the old Postgres data lived in a different database, this starts with empty tables.

4. **Bring your data back**:
   - If this is a **fresh setup**, just run `npm run db:seed` to repopulate the two room types (Couple Room / Family Room) and other seed data.
   - If you have **real production data in the old Postgres DB**, there's now a dedicated script for that — see the "Migrating real data" section below.

5. **Regenerate the Prisma client** (usually automatic on `npm install`, but just in case):
   ```bash
   npx prisma generate
   ```

That's it — the rest of the app (routes, controllers, frontend) doesn't know or care which database is behind Prisma, so nothing else needed to change.

---

## Migrating real data from the old Postgres database

A script now exists at `backend/scripts/migrate-postgres-to-mysql.js` that copies every row across, table by table, in an order that respects foreign keys. It's safe to re-run — it uses `skipDuplicates`, so a second run just fills in whatever didn't make it across the first time rather than erroring or duplicating rows.

**Steps** (run from `backend/`):

1. Make sure your old Postgres database is still reachable (don't tear it down until this is done and verified).

2. Add the source connection string to `.env`, alongside your new MySQL one:
   ```env
   SOURCE_DATABASE_URL="postgresql://user:password@old-host:5432/resort_db"
   DATABASE_URL="mysql://user:password@new-host:3306/resort_db"
   ```

3. Generate a Prisma client for the *old* schema — this is a separate, read-only client used only to read from Postgres with its original column types (e.g. real array columns), kept at `backend/prisma/legacy-postgres/schema.prisma`:
   ```bash
   npm run db:generate-legacy
   ```

4. Make sure the new MySQL database already has empty tables — i.e. you've already run `npx prisma migrate dev --name init_mysql` against it (step 3 earlier in this doc).

5. Run the migration:
   ```bash
   npm run db:migrate-data
   ```
   You'll see a per-table progress line, then a summary table at the end. If anything came up short (row count copied < row count found), it prints a warning table showing exactly which table needs a look — usually because a parent row was missing (e.g. a booking whose user was deleted) rather than anything MySQL-specific.

6. Spot-check the important tables afterwards (`Users`, `Bookings`, `Transactions`) via `npx prisma studio` pointed at the new MySQL database, then update your app's `.env` to only use the MySQL `DATABASE_URL` going forward and retire `SOURCE_DATABASE_URL`.

7. Once you've confirmed everything looks right, you can decommission the old Postgres database.
