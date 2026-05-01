const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validateProduct } = require('../middleware/validate');

router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProduct);
router.get('/flash-sales', productController.getFlashSales);
router.get('/related/:id', productController.getRelatedProducts);
router.get('/:id', productController.getProductById);
router.post('/', verifyToken, requireAdmin, upload.array('images', 5), validateProduct, productController.createProduct);
router.post('/bulk-import', verifyToken, requireAdmin, upload.single('file'), productController.bulkImport);
router.put('/:id', verifyToken, requireAdmin, upload.array('images', 5), productController.updateProduct);
router.delete('/:id', verifyToken, requireAdmin, productController.deleteProduct);

module.exports = router;
