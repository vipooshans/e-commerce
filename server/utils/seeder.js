import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import connectDB from '../config/db.js';

connectDB();

const users = [
  {
    name: 'Admin User',
    email: 'admin@lumora.com',
    password: 'Admin@123',
    isAdmin: true,
  },
  {
    name: 'Test User',
    email: 'test@lumora.com',
    password: 'Test@123',
    isAdmin: false,
  },
];

const products = [
  // ─── Electronics (8 products) ───
  {
    name: 'ProSound X1 Wireless Headphones',
    description: 'Premium over-ear headphones with 40-hour battery life, active noise cancellation, and studio-quality sound. Foldable design with memory foam ear cushions.',
    price: 4999,
    originalPrice: 7999,
    category: 'Electronics',
    brand: 'ProSound',
    stock: 45,
    rating: 4.7,
    numReviews: 128,
    isFeatured: true,
    tags: ['headphones', 'wireless', 'noise cancellation', 'bluetooth'],
    images: [],
  },
  {
    name: 'Nexus Ultra Smartwatch',
    description: 'Advanced smartwatch with AMOLED display, blood oxygen monitoring, GPS, 7-day battery, and 100+ workout modes. Water resistant up to 50m.',
    price: 8499,
    originalPrice: 12999,
    category: 'Electronics',
    brand: 'Nexus',
    stock: 30,
    rating: 4.5,
    numReviews: 89,
    isFeatured: true,
    tags: ['smartwatch', 'fitness', 'gps', 'health tracking'],
    images: [],
  },
  {
    name: 'PixelCam Mini Wireless Earbuds',
    description: 'True wireless earbuds with 8-hour playback, 32-hour total with charging case, IPX5 waterproof rating, and customizable EQ via app.',
    price: 2499,
    originalPrice: 3999,
    category: 'Electronics',
    brand: 'PixelCam',
    stock: 80,
    rating: 4.3,
    numReviews: 214,
    isFeatured: false,
    tags: ['earbuds', 'wireless', 'waterproof', 'tws'],
    images: [],
  },
  {
    name: 'ZenBook Air 15 Laptop',
    description: 'Ultra-thin laptop with 12th Gen Intel Core i7, 16GB RAM, 512GB NVMe SSD, 15.6" FHD IPS display, and all-day 10-hour battery.',
    price: 74999,
    originalPrice: 89999,
    category: 'Electronics',
    brand: 'ZenBook',
    stock: 15,
    rating: 4.6,
    numReviews: 62,
    isFeatured: true,
    tags: ['laptop', 'ultrabook', 'intel', 'work from home'],
    images: [],
  },
  {
    name: 'VoltCharge 65W GaN Charger',
    description: 'Compact 65W GaN charger with 3 ports (2x USB-C PD + 1x USB-A), charges laptop, phone, and tablet simultaneously. Half the size of a standard charger.',
    price: 1999,
    originalPrice: 2999,
    category: 'Electronics',
    brand: 'VoltCharge',
    stock: 120,
    rating: 4.4,
    numReviews: 183,
    isFeatured: false,
    tags: ['charger', 'gan', 'usb-c', 'fast charging'],
    images: [],
  },
  {
    name: 'ClearView 4K Webcam',
    description: '4K Ultra HD webcam with autofocus, built-in stereo mic, privacy shutter, and wide 90° field of view. Plug & play, compatible with all major video platforms.',
    price: 5499,
    originalPrice: 7499,
    category: 'Electronics',
    brand: 'ClearView',
    stock: 40,
    rating: 4.2,
    numReviews: 97,
    isFeatured: false,
    tags: ['webcam', '4k', 'work from home', 'streaming'],
    images: [],
  },
  {
    name: 'BassBoom Portable Speaker',
    description: '360° surround sound portable speaker with 20W output, 24-hour battery, IPX7 waterproof, and built-in powerbank. Perfect for outdoor adventures.',
    price: 3299,
    originalPrice: 4999,
    category: 'Electronics',
    brand: 'BassBoom',
    stock: 60,
    rating: 4.5,
    numReviews: 145,
    isFeatured: true,
    tags: ['speaker', 'bluetooth', 'waterproof', 'portable'],
    images: [],
  },
  {
    name: 'FlashDrive Pro 256GB SSD',
    description: 'Portable SSD with USB 3.2 Gen 2 (10Gbps), read speeds up to 1050MB/s, military-grade shock resistance, and compact aluminum body.',
    price: 3799,
    originalPrice: 5499,
    category: 'Electronics',
    brand: 'FlashDrive',
    stock: 75,
    rating: 4.6,
    numReviews: 211,
    isFeatured: false,
    tags: ['ssd', 'portable', 'storage', 'usb 3.2'],
    images: [],
  },

  // ─── Fashion (6 products) ───
  {
    name: 'Urban Drift Premium Sneakers',
    description: 'Lightweight chunky sneakers with breathable mesh upper, EVA foam midsole for all-day comfort, and non-slip rubber outsole. Available in multiple colorways.',
    price: 2799,
    originalPrice: 4500,
    category: 'Fashion',
    brand: 'Urban Drift',
    stock: 50,
    rating: 4.4,
    numReviews: 178,
    isFeatured: true,
    tags: ['sneakers', 'casual', 'streetwear', 'unisex'],
    images: [],
  },
  {
    name: 'LuxeWear Oversized Hoodie',
    description: 'Premium 400 GSM cotton-blend oversized hoodie with kangaroo pocket, ribbed cuffs, and a brushed fleece interior. Pre-shrunk, pill-resistant fabric.',
    price: 1599,
    originalPrice: 2499,
    category: 'Fashion',
    brand: 'LuxeWear',
    stock: 90,
    rating: 4.6,
    numReviews: 256,
    isFeatured: false,
    tags: ['hoodie', 'oversized', 'cotton', 'winter wear'],
    images: [],
  },
  {
    name: 'Eclipse Polarised Sunglasses',
    description: 'UV400 polarised aviator sunglasses with scratch-resistant lenses, lightweight stainless steel frame, and carry pouch included. Reduces glare by 99%.',
    price: 1299,
    originalPrice: 2200,
    category: 'Fashion',
    brand: 'Eclipse',
    stock: 100,
    rating: 4.3,
    numReviews: 92,
    isFeatured: false,
    tags: ['sunglasses', 'polarised', 'uv400', 'summer'],
    images: [],
  },
  {
    name: 'Milo Structured Backpack 28L',
    description: '28L laptop backpack with dedicated 15.6" padded compartment, USB charging port, anti-theft zipper, and water-resistant 900D polyester fabric.',
    price: 2199,
    originalPrice: 3500,
    category: 'Fashion',
    brand: 'Milo',
    stock: 65,
    rating: 4.5,
    numReviews: 134,
    isFeatured: false,
    tags: ['backpack', 'laptop bag', 'travel', 'college'],
    images: [],
  },
  {
    name: 'TrueFit Slim Chinos',
    description: 'Stretch cotton slim-fit chinos with elasticated waistband, two side pockets, and two rear pockets. Machine washable, wrinkle-resistant fabric.',
    price: 1099,
    originalPrice: 1799,
    category: 'Fashion',
    brand: 'TrueFit',
    stock: 110,
    rating: 4.2,
    numReviews: 88,
    isFeatured: false,
    tags: ['chinos', 'pants', 'slim fit', 'formal casual'],
    images: [],
  },
  {
    name: 'Velvet Bloom Floral Dress',
    description: 'Elegant midi-length floral wrap dress in soft rayon fabric. Adjustable tie waist, flutter sleeves, and a flowy A-line silhouette perfect for summer occasions.',
    price: 1699,
    originalPrice: 2800,
    category: 'Fashion',
    brand: 'Velvet Bloom',
    stock: 55,
    rating: 4.7,
    numReviews: 201,
    isFeatured: true,
    tags: ['dress', 'floral', 'summer', 'midi dress'],
    images: [],
  },

  // ─── Home & Kitchen (5 products) ───
  {
    name: 'BrewMaster Espresso Machine',
    description: '15-bar pressure espresso maker with built-in steam wand, 1.5L removable water tank, dual thermostats for perfect extraction temperature, and stainless steel body.',
    price: 9999,
    originalPrice: 15000,
    category: 'Home & Kitchen',
    brand: 'BrewMaster',
    stock: 20,
    rating: 4.6,
    numReviews: 74,
    isFeatured: true,
    tags: ['espresso', 'coffee machine', 'kitchen appliance', 'barista'],
    images: [],
  },
  {
    name: 'Zen Knife Set (6-Piece)',
    description: 'Professional 6-piece German stainless steel knife set with full tang construction, Pakkawood handles, and an elegant magnetic acacia wood block.',
    price: 4299,
    originalPrice: 6500,
    category: 'Home & Kitchen',
    brand: 'Zen Chef',
    stock: 35,
    rating: 4.8,
    numReviews: 112,
    isFeatured: false,
    tags: ['knives', 'kitchen', 'cooking', 'german steel'],
    images: [],
  },
  {
    name: 'AirPurify HEPA Room Purifier',
    description: 'True HEPA + activated carbon filter removes 99.97% of particles, allergens, and odors. Covers 400 sq ft, ultra-quiet sleep mode, and auto-adjusting fan speed.',
    price: 7499,
    originalPrice: 10999,
    category: 'Home & Kitchen',
    brand: 'AirPurify',
    stock: 25,
    rating: 4.5,
    numReviews: 93,
    isFeatured: false,
    tags: ['air purifier', 'hepa', 'allergens', 'home'],
    images: [],
  },
  {
    name: 'GlowNook LED Desk Lamp',
    description: 'Smart LED desk lamp with 5 color temperatures, 10 brightness levels, wireless charging pad, USB-A port, and touch-control dimmer. Eye-care certified.',
    price: 2499,
    originalPrice: 3799,
    category: 'Home & Kitchen',
    brand: 'GlowNook',
    stock: 55,
    rating: 4.4,
    numReviews: 166,
    isFeatured: false,
    tags: ['lamp', 'led', 'desk lamp', 'wireless charging'],
    images: [],
  },
  {
    name: 'Nordic Nest Modular Organiser',
    description: 'Stackable 9-cube closet organiser in Scandinavian oak finish. Includes 4 fabric drawers, assembly in under 30 minutes, and holds up to 25kg per cube.',
    price: 5999,
    originalPrice: 8999,
    category: 'Home & Kitchen',
    brand: 'Nordic Nest',
    stock: 18,
    rating: 4.3,
    numReviews: 58,
    isFeatured: false,
    tags: ['organiser', 'storage', 'closet', 'nordic'],
    images: [],
  },

  // ─── Beauty & Personal Care (4 products) ───
  {
    name: 'Glow Lab Vitamin C Serum 30ml',
    description: '20% stabilised Vitamin C + Hyaluronic Acid + Niacinamide serum. Brightens dark spots, boosts collagen, and provides deep hydration. Fragrance-free, dermatologist tested.',
    price: 899,
    originalPrice: 1499,
    category: 'Beauty & Personal Care',
    brand: 'Glow Lab',
    stock: 150,
    rating: 4.7,
    numReviews: 389,
    isFeatured: true,
    tags: ['serum', 'vitamin c', 'skincare', 'brightening'],
    images: [],
  },
  {
    name: 'Noir Oud Eau de Parfum 100ml',
    description: 'A rich oriental fragrance with top notes of bergamot, heart of oud and rose, and base notes of sandalwood and amber. Long-lasting 8-12 hour projection.',
    price: 2499,
    originalPrice: 3999,
    category: 'Beauty & Personal Care',
    brand: 'Maison Noir',
    stock: 40,
    rating: 4.6,
    numReviews: 145,
    isFeatured: false,
    tags: ['perfume', 'oud', 'eau de parfum', 'fragrance'],
    images: [],
  },
  {
    name: 'Elite Grooming Kit (7-in-1)',
    description: '7-in-1 mens grooming set with precision trimmer, nose trimmer, foil shaver, 3 guide combs, cleaning brush, and travel pouch. 4-hour charge, 60-min runtime.',
    price: 1799,
    originalPrice: 2999,
    category: 'Beauty & Personal Care',
    brand: 'EliteGroom',
    stock: 70,
    rating: 4.4,
    numReviews: 207,
    isFeatured: false,
    tags: ['grooming', 'trimmer', 'shaver', 'mens care'],
    images: [],
  },
  {
    name: 'HydraGlow SPF50 Sunscreen 75ml',
    description: 'Lightweight, non-greasy SPF50 PA++++ sunscreen with hyaluronic acid and ceramides. Invisible finish, suitable for all skin types, and reef-safe formula.',
    price: 499,
    originalPrice: 799,
    category: 'Beauty & Personal Care',
    brand: 'HydraGlow',
    stock: 200,
    rating: 4.5,
    numReviews: 512,
    isFeatured: true,
    tags: ['sunscreen', 'spf50', 'skincare', 'uv protection'],
    images: [],
  },

  // ─── Sports & Fitness (4 products) ───
  {
    name: 'FlexCore Non-Slip Yoga Mat 6mm',
    description: 'Premium 6mm thick TPE yoga mat with superior grip on both sides, alignment lines, and a carry strap. Eco-friendly, latex-free, and sweat-resistant.',
    price: 1499,
    originalPrice: 2200,
    category: 'Sports & Fitness',
    brand: 'FlexCore',
    stock: 85,
    rating: 4.6,
    numReviews: 273,
    isFeatured: false,
    tags: ['yoga mat', 'fitness', 'tpe', 'non-slip'],
    images: [],
  },
  {
    name: 'IronForge Adjustable Dumbbells 2-20kg',
    description: 'Space-saving adjustable dumbbell set that replaces 9 pairs of weights. Quick dial selector, secure locking mechanism, and includes a storage tray.',
    price: 14999,
    originalPrice: 22000,
    category: 'Sports & Fitness',
    brand: 'IronForge',
    stock: 15,
    rating: 4.7,
    numReviews: 88,
    isFeatured: true,
    tags: ['dumbbells', 'adjustable', 'home gym', 'strength training'],
    images: [],
  },
  {
    name: 'HydroFlow Insulated Water Bottle 1L',
    description: 'Triple-layer vacuum insulated stainless steel bottle keeps drinks cold 24 hours and hot 12 hours. Wide-mouth, BPA-free lid, and fits most car cup holders.',
    price: 999,
    originalPrice: 1599,
    category: 'Sports & Fitness',
    brand: 'HydroFlow',
    stock: 130,
    rating: 4.5,
    numReviews: 445,
    isFeatured: false,
    tags: ['water bottle', 'insulated', 'gym', 'bpa free'],
    images: [],
  },
  {
    name: 'PowerBand Resistance Set (5 levels)',
    description: 'Set of 5 latex resistance bands (10-50 lbs) with door anchor, ankle straps, and exercise guide. Perfect for full-body workouts, physical therapy, and stretching.',
    price: 799,
    originalPrice: 1299,
    category: 'Sports & Fitness',
    brand: 'PowerBand',
    stock: 110,
    rating: 4.3,
    numReviews: 192,
    isFeatured: false,
    tags: ['resistance bands', 'home workout', 'latex', 'fitness set'],
    images: [],
  },

  // ─── Books (3 products) ───
  {
    name: 'Atomic Habits — James Clear',
    description: 'The instant Sunday Times bestseller. An easy and proven way to build good habits and break bad ones. Over 10 million copies sold worldwide.',
    price: 399,
    originalPrice: 599,
    category: 'Books',
    brand: 'Penguin Random House',
    stock: 200,
    rating: 4.9,
    numReviews: 1204,
    isFeatured: true,
    tags: ['self-help', 'habits', 'productivity', 'bestseller'],
    images: [],
  },
  {
    name: 'Clean Code — Robert C. Martin',
    description: 'A handbook of agile software craftsmanship. Teaches programmers how to write readable, maintainable, and elegant code through practical examples and principles.',
    price: 549,
    originalPrice: 799,
    category: 'Books',
    brand: 'Pearson Education',
    stock: 80,
    rating: 4.7,
    numReviews: 683,
    isFeatured: false,
    tags: ['programming', 'software engineering', 'coding', 'agile'],
    images: [],
  },
  {
    name: 'The Psychology of Money — Morgan Housel',
    description: 'Timeless lessons on wealth, greed, and happiness. 19 short stories exploring the strange ways people think about money and teaches you how to make better sense of it.',
    price: 349,
    originalPrice: 499,
    category: 'Books',
    brand: 'Harriman House',
    stock: 160,
    rating: 4.8,
    numReviews: 879,
    isFeatured: true,
    tags: ['finance', 'investing', 'personal finance', 'bestseller'],
    images: [],
  },
];

const importData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    // Hash passwords manually so pre-save runs
    const createdUsers = await User.insertMany(
      await Promise.all(
        users.map(async (u) => {
          const salt = await bcrypt.genSalt(10);
          return { ...u, password: await bcrypt.hash(u.password, salt) };
        })
      )
    );

    console.log(`✅ Created ${createdUsers.length} users`);
    console.log('   Admin : admin@lumora.com  / Admin@123');
    console.log('   Test  : test@lumora.com   / Test@123');

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);

    console.log('\n🌱 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeder error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    console.log('🗑️  Database cleared!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Destroy error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  destroyData();
} else {
  console.log('Usage: node seeder.js -i (import) | -d (destroy)');
  process.exit(1);
}
