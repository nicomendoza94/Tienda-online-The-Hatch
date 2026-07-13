// Handles product browsing for the public store (read-only, no auth needed).
// Data access is delegated to the products model.

const productsModel = require('../models/products.model');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

// Helper: turns a relative imageUrl ("/uploads/xxx.jpg") into a full URL
// pointing at the backend, since images are physically stored there.
function toFullImageUrl(product) {
  return {
    ...product,
    imageUrl: `${BACKEND_URL}${product.imageUrl}`,
  };
}

// GET / - list all products available in the store
async function listProducts(req, res) {
  try {
    const products = await productsModel.findAll();
    const productsWithFullImages = products.map(toFullImageUrl);

    res.render('index', {
      title: 'Larry Penguin Store 🐧',
      products: productsWithFullImages,
    });
  } catch (error) {
    console.error('❌ Error listing products:', error.message);
    res.status(500).send('Error loading products');
  }
}

// GET /products/:id - show a single product's detail page
async function showProduct(req, res) {
  try {
    const product = await productsModel.findById(req.params.id);

    if (!product) {
      return res.status(404).send('Product not found');
    }

    res.render('product', {
      title: `${product.name} - Larry Penguin Store`,
      product: toFullImageUrl(product),
    });
  } catch (error) {
    console.error('❌ Error loading product:', error.message);
    res.status(500).send('Error loading product');
  }
}

module.exports = { listProducts, showProduct };