# 🌴 Mango Tree destination wedding lawn and weekend stay — Full-Stack Management Platform

A premium luxury resort management and CRM platform built with React.js, Tailwind CSS, Node.js, Express.js, Prisma ORM, and MySQL.

---

## ✨ Features

### Guest-Facing
| Feature | Details |
|---|---|
| **Hero Video** | 10-second autoplay background video with overlay CTAs |
| **Room Listings** | Filter by category, price, capacity, amenities |
| **Room Detail** | Image gallery, amenities, reviews, booking widget |
| **Online Booking** | Date picker, guest selection, real-time availability |
| **Stripe Payments** | Secure card payment with payment intent flow |
| **Review System** | Star ratings, written reviews, management responses |
| **Gallery** | Masonry grid, category/type filters, lightbox viewer |
| **Blog / Journal** | SEO-optimised URLs, rich HTML content, tags |
| **Contact / CRM** | Form → automatic lead creation in admin CRM |
| **Auth** | JWT register/login, role-based access |

### Admin CRM
| Module | Details |
|---|---|
| **Dashboard** | KPI cards, revenue bar chart, occupancy pie, recent bookings |
| **Room Management** | CRUD rooms with amenities, images, categories, status |
| **Booking Management** | View all, search/filter, update status (confirm/check-in/out) |
| **Customer Management** | Guest list, booking history, account status |
| **CRM Leads** | All contact-form submissions, status pipeline |
| **Gallery Manager** | Add/edit/delete photos & videos, mark featured |
| **Blog Manager** | Rich HTML editor, publish/draft toggle, tags |
| **Revenue Analytics** | Annual revenue, monthly bookings/guests, occupancy % per room |

---

## 🗂 Project Structure

```
resort-platform/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # DB schema (10 models)
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.js          # Prisma client singleton
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── room.controller.js
│   │   │   ├── booking.controller.js
│   │   │   ├── analytics.controller.js
│   │   │   ├── blog.controller.js
│   │   │   └── shared.controller.js  # reviews, gallery, leads, users
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js     # JWT protect + authorize
│   │   │   └── error.middleware.js    # Global error handler
│   │   ├── routes/                    # One file per resource
│   │   ├── utils/
│   │   │   └── seed.js               # Dev seed data
│   │   └── index.js                   # Express app entry
│   ├── .env.example
│   ├── render.yaml                    # Render deploy config
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── auth/ProtectedRoute.js
    │   │   └── layout/
    │   │       ├── Layout.js          # Navbar + Footer
    │   │       └── AdminLayout.js     # Sidebar + topbar
    │   ├── pages/
    │   │   ├── HomePage.js            # Hero video, sliders, amenities
    │   │   ├── RoomsPage.js           # Listing with filters
    │   │   ├── RoomDetailPage.js      # Gallery, booking widget, reviews
    │   │   ├── BookingPage.js         # Stripe payment checkout
    │   │   ├── GalleryPage.js         # Masonry + lightbox
    │   │   ├── BlogPage.js            # Listing + detail (SEO meta)
    │   │   ├── ContactPage.js         # Form → lead creation
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── customer/
    │   │   │   ├── MyBookingsPage.js  # Bookings + review modal
    │   │   │   └── ProfilePage.js
    │   │   └── admin/
    │   │       ├── AdminDashboard.js  # Charts + KPIs
    │   │       ├── AdminRooms.js      # Full CRUD modal
    │   │       ├── AdminBookings.js   # Status management
    │   │       ├── AdminCustomers.js
    │   │       ├── AdminLeads.js      # CRM pipeline
    │   │       ├── AdminGallery.js
    │   │       ├── AdminBlog.js
    │   │       └── AdminAnalytics.js  # Revenue + occupancy charts
    │   ├── services/
    │   │   └── api.js                 # Axios + all service functions
    │   ├── store/
    │   │   └── authStore.js           # Zustand persistent auth
    │   ├── App.js
    │   ├── index.js
    │   └── index.css                  # Tailwind + custom design system
    ├── tailwind.config.js
    ├── vercel.json
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8+
- Cloudinary account
- Stripe account

### 1. Clone & Install

```bash
git clone https://github.com/your-org/mango-tree-resort.git
cd mango-tree-resort

# Install all dependencies
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="mysql://user:password@localhost:3306/resort_db"
JWT_SECRET="your-super-secret-key-at-least-32-characters"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development

# Cloudinary (https://cloudinary.com)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Stripe (https://stripe.com)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"
```

### 3. Configure Frontend

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:

```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
```

### 4. Set Up Database

```bash
cd backend

# Create DB and run migrations
npx prisma db push

# Seed with demo data
npm run db:seed
```

### 5. Run Development Servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm start
```

Visit **http://localhost:3000**

### Demo Credentials
| Role | Email | Password |
|---|---|---|
| Admin | `admin@mangotreeresort.com` | `Admin@123` |
| Guest | `guest@example.com` | `Admin@123` |

---

## 🌐 REST API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login → JWT token |
| GET | `/api/auth/me` | Bearer | Get current user |
| PUT | `/api/auth/profile` | Bearer | Update profile |
| PUT | `/api/auth/change-password` | Bearer | Change password |

### Rooms
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/rooms` | Public | List rooms (filters + pagination) |
| GET | `/api/rooms/:slug` | Public | Room detail with reviews |
| GET | `/api/rooms/availability` | Public | Check date availability |
| GET | `/api/rooms/categories` | Public | All room categories |
| POST | `/api/rooms` | Admin/Staff | Create room |
| PUT | `/api/rooms/:id` | Admin/Staff | Update room |
| DELETE | `/api/rooms/:id` | Admin | Delete room |

### Bookings
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/bookings` | Bearer | Create booking |
| GET | `/api/bookings/my` | Bearer | My bookings |
| GET | `/api/bookings/:id` | Bearer | Booking detail |
| GET | `/api/bookings` | Admin/Staff | All bookings |
| PUT | `/api/bookings/:id/status` | Admin/Staff | Update status |
| PUT | `/api/bookings/:id/cancel` | Bearer | Cancel booking |

### Payments
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/payments/create-intent` | Bearer | Create Stripe payment intent |
| POST | `/api/payments/confirm` | Bearer | Confirm payment |
| POST | `/api/payments/webhook` | Public | Stripe webhook handler |

### Reviews
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/reviews` | Public | List approved reviews |
| POST | `/api/reviews` | Bearer | Submit review |
| PUT | `/api/reviews/:id/approve` | Admin/Staff | Approve review |
| PUT | `/api/reviews/:id/respond` | Admin/Staff | Add response |
| DELETE | `/api/reviews/:id` | Admin | Delete review |

### Blog
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/blog` | Public | List published posts |
| GET | `/api/blog/:slug` | Public | Post by SEO slug |
| POST | `/api/blog` | Admin/Staff | Create post |
| PUT | `/api/blog/:id` | Admin/Staff | Update post |
| DELETE | `/api/blog/:id` | Admin | Delete post |

### Gallery
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/gallery` | Public | List gallery items |
| POST | `/api/gallery` | Admin/Staff | Create item |
| PUT | `/api/gallery/:id` | Admin/Staff | Update item |
| DELETE | `/api/gallery/:id` | Admin | Delete item |

### Leads (CRM)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/leads` | Public | Submit contact form |
| GET | `/api/leads` | Admin/Staff | All leads |
| PUT | `/api/leads/:id` | Admin/Staff | Update lead status |

### Analytics
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/analytics/dashboard` | Admin/Staff | Full dashboard stats |
| GET | `/api/analytics/revenue` | Admin | Annual revenue by month |
| GET | `/api/analytics/occupancy` | Admin/Staff | Occupancy per room |

### Upload
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/upload/image` | Admin/Staff | Upload image → Cloudinary |
| POST | `/api/upload/video` | Admin/Staff | Upload video → Cloudinary |
| DELETE | `/api/upload/:publicId` | Admin | Delete from Cloudinary |

---

## 🗄 Database Schema

```
User            → bookings[], reviews[], leads[]
RoomCategory    → rooms[]
Room            → bookings[], reviews[], category
Booking         → user, room
Review          → user, room
BlogPost
GalleryItem
Lead            → user?
Amenity
Setting
```

### Enums
- **Role:** `ADMIN | STAFF | CUSTOMER`
- **BookingStatus:** `PENDING | CONFIRMED | CHECKED_IN | CHECKED_OUT | CANCELLED`
- **PaymentStatus:** `PENDING | PAID | REFUNDED | FAILED`
- **RoomStatus:** `AVAILABLE | OCCUPIED | MAINTENANCE | RESERVED`

---

## ☁️ Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build

# Install Vercel CLI
npm i -g vercel
vercel --prod

# Set environment variables in Vercel dashboard:
# REACT_APP_API_URL = https://your-api.onrender.com/api
# REACT_APP_STRIPE_PUBLIC_KEY = pk_live_...
```

### Backend → Render

1. Push code to GitHub
2. Create new **Web Service** on [render.com](https://render.com)
3. Connect your GitHub repo → select `backend/` folder
4. **Build command:** `npm install && npx prisma generate && npx prisma migrate deploy`
5. **Start command:** `npm start`
6. Provision a **MySQL** database (Render has no managed MySQL — use PlanetScale, Railway, or AWS RDS) → copy connection string
7. Set all environment variables from `.env.example`
8. Deploy → seed via shell: `npm run db:seed`

### Stripe Webhook (Production)
```bash
# Add webhook endpoint in Stripe Dashboard:
# https://your-api.onrender.com/api/payments/webhook
# Events: payment_intent.succeeded
```

---

## 🎨 Design System

### Colors
| Token | Hex | Usage |
|---|---|---|
| `resort-600` | `#16a34a` | Primary green — buttons, accents |
| `resort-700` | `#15803d` | Hover states, prices |
| `forest-dark` | `#0a2e1a` | Footer, dark sections |
| `gold-500` | `#f59e0b` | Ratings, dividers, CTA gold |

### Typography
| Family | Usage |
|---|---|
| Playfair Display | Headings, display text |
| Cormorant Garamond | Italic accents, quotes |
| Inter | Body text, UI elements |

### Custom Classes
```css
.btn-primary      /* Green filled CTA */
.btn-outline      /* Green bordered */
.btn-gold         /* Gold filled */
.section-title    /* Large display heading */
.section-subtitle /* Green uppercase label */
.card-luxury      /* White card with hover shadow */
.input-field      /* Styled form input */
.badge-green      /* Green pill */
.badge-gold       /* Gold pill */
.table-resort     /* Styled admin table */
.glass-effect     /* Frosted glass */
```

---

## 🔐 Security

- **Helmet.js** — HTTP security headers
- **CORS** — Whitelist frontend origin only
- **Rate limiting** — 100 req/15 min per IP
- **JWT** — HS256 tokens, 7-day expiry
- **bcrypt** — 12 salt rounds for passwords
- **Role-based auth** — `ADMIN | STAFF | CUSTOMER`
- **Input validation** — Express-validator on sensitive routes
- **Prisma** — Parameterised queries (SQL injection protection)

---

## 📦 Tech Stack

### Backend
| Package | Version | Purpose |
|---|---|---|
| Express | 4.18 | HTTP framework |
| Prisma | 5.7 | ORM + migrations |
| MySQL | 8 | Primary database |
| JWT | 9.0 | Authentication tokens |
| bcryptjs | 2.4 | Password hashing |
| Stripe | 14 | Payment processing |
| Cloudinary | 1.41 | Media storage & CDN |
| Multer | 1.4 | File upload middleware |
| Helmet | 7 | Security headers |
| Morgan | 1.10 | HTTP request logger |

### Frontend
| Package | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| React Router | 6 | Client-side routing |
| TanStack Query | 5 | Server state + caching |
| Zustand | 4 | Auth state management |
| Tailwind CSS | 3 | Utility-first styling |
| Recharts | 2 | Analytics charts |
| Stripe.js | 2 | Payment Elements |
| Framer Motion | 10 | Animations |
| React Hot Toast | 2 | Notifications |
| React Helmet | 2 | SEO meta tags |
| date-fns | 3 | Date formatting |
| react-datepicker | 6 | Date selection |

---

## 🧪 Development Tips

```bash
# View DB in browser
cd backend && npm run db:studio

# Reset DB and re-seed
cd backend && npx prisma db push --force-reset && npm run db:seed

# Generate Prisma client after schema changes
cd backend && npx prisma generate

# Run frontend with mock API
REACT_APP_API_URL=http://localhost:8000/api npm start
```

---

## 📄 License

MIT © 2024 Mango Tree Resort Platform
# resort-management-system
