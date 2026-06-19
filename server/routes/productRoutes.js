import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getProducts,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getCategories,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer storage config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `product-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.route('/').get(getProducts).post(protect, admin, upload.array('images', 5), createProduct);
router
  .route('/:id')
  .get(getProductById)
  .put(protect, admin, upload.array('images', 5), updateProduct)
  .delete(protect, admin, deleteProduct);
router.post('/:id/reviews', protect, addReview);

export default router;
