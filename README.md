# ◈ Lumora — Full-Stack MERN E-Commerce Store

> A vibrant, modern e-commerce application built with MongoDB, Express.js, React 18 (Vite), and Node.js.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-7C3AED?style=for-the-badge)
![Stripe](https://img.shields.io/badge/Payments-Stripe_TEST-EC4899?style=for-the-badge)

---

## ✨ Features

- 🛍️ **Product catalog** — 30+ products across 6 categories with filter, search & pagination
- 🛒 **Shopping cart** — Persistent cart with GST calculation and free shipping threshold
- 💳 **Stripe Payments** — Card payments in TEST MODE + Cash on Delivery
- 📦 **Order tracking** — Animated stepper (Processing → Shipped → Out for Delivery → Delivered)
- ♡ **Wishlist** — Backend-synced wishlist for logged-in users
- ⭐ **Reviews** — Star rating + comment reviews per product
- 👤 **User profiles** — Orders, wishlist, addresses, and settings tabs
- ⚙️ **Admin panel** — Dashboard with charts, product CRUD, order status management
- 🎉 **Confetti** — Canvas confetti burst on every "Add to Cart"
- 📱 **Mobile-first** — Fully responsive at 375px, 768px, 1024px+

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local) or MongoDB Atlas
- Stripe test account (free at stripe.com)

### 1. Clone and install all dependencies
```bash
cd "e:\project\e commerce"
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables

**Server** — copy `.env.example` to `.env` and fill in:
```bash
cp server/.env.example server/.env
```
```
MONGO_URI=mongodb://localhost:27017/lumora
JWT_SECRET=your_super_secret_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
PORT=5000
NODE_ENV=development
```

**Client** — edit `client/.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

> ⚠️ Both `.env` files are already in `.gitignore` — never commit real keys.

### 3. Seed the database
```bash
# From project root
npm run seed
```
This creates:
- **Admin**: `admin@lumora.com` / `Admin@123`
- **User**: `test@lumora.com` / `Test@123`
- 30 sample products across 6 categories

To clear the database:
```bash
npm run seed:destroy
```

### 4. Start development servers
```bash
# From project root — starts both client (port 5173) and server (port 5000)
npm run dev
```

Then open: **http://localhost:5173**

---

## 🧪 Stripe Test Cards

| Card Number | Scenario |
|---|---|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0000 0000 0002` | ❌ Declined |
| `4000 0025 0000 3155` | 🔐 3D Secure |

Use any future expiry date and any 3-digit CVC.

---

## 📁 Project Structure

```
lumora/
├── package.json          ← Root (concurrently dev script)
├── server/               ← Express API
│   ├── server.js
│   ├── config/db.js
│   ├── models/           ← User, Product, Order
│   ├── controllers/      ← Auth, Product, Order, Wishlist
│   ├── routes/
│   ├── middleware/
│   ├── utils/            ← generateToken, asyncHandler, seeder
│   └── uploads/          ← Local product images (multer)
└── client/               ← React 18 + Vite
    └── src/
        ├── context/       ← Auth, Cart, Wishlist, Toast
        ├── services/      ← Axios API calls
        ├── components/    ← Navbar, Footer, ProductCard, etc.
        └── pages/         ← Customer + Admin pages
```

---

## 🔌 API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register |
| POST | `/api/auth/login` | — | Login |
| GET/PUT | `/api/auth/me` | 🔒 | Profile |
| GET | `/api/products` | — | List (filter/search/sort/page) |
| GET | `/api/products/:id` | — | Single product |
| POST | `/api/products` | 👑 Admin | Create with image upload |
| PUT | `/api/products/:id` | 👑 Admin | Update |
| DELETE | `/api/products/:id` | 👑 Admin | Delete |
| POST | `/api/products/:id/reviews` | 🔒 | Add review |
| POST | `/api/orders` | 🔒 | Create order |
| GET | `/api/orders/myorders` | 🔒 | My orders |
| PUT | `/api/orders/:id/pay` | 🔒 | Pay (returns Stripe clientSecret) |
| PUT | `/api/orders/:id/pay/confirm` | 🔒 | Confirm Stripe payment |
| PUT | `/api/orders/:id/status` | 👑 Admin | Update status |
| GET | `/api/orders/stats` | 👑 Admin | Dashboard stats |
| GET/POST | `/api/wishlist` | 🔒 | Get/Add wishlist |
| DELETE | `/api/wishlist/:productId` | 🔒 | Remove from wishlist |

---

## 🎨 Design System

- **Font**: Outfit (Google Fonts)
- **Primary gradient**: `#7C3AED` → `#EC4899` (purple → pink)
- **Accent**: `#3B82F6` (electric blue)
- **CTA**: `#F97316` (coral)
- **Cards**: Glassmorphism (`backdrop-filter: blur(20px)`)
- **Background**: Deep dark `#0B0714`
