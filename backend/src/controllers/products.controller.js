// Handles all CRUD operations for products.
// Uses the native MongoDB driver directly (no ODM).

const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const { getDB } = require('../config/db');

const CATEGORIES = ['pescado', 'hielo', 'esmoquin'];

// GET /products - list all products
async function listProducts(req, res) {
  try {
    const db = getDB();
    const products = await db.collection('products')
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.render('products/list', {
      title: 'Products - Admin Panel',
      username: req.session.username,
      products,
    });
  } catch (error) {
    console.error('❌ Error listing products:', error.message);
    res.status(500).send('Error loading products');
  }
}

// GET /products/new - show the "create product" form
function showNewForm(req, res) {
  res.render('products/new', {
    title: 'New Product - Admin Panel',
    username: req.session.username,
    categories: CATEGORIES,
    error: null,
  });
}

// POST /products - create a new product
async function createProduct(req, res) {
  const { name, description, price, stock, category } = req.body;

  // Basic server-side validation
  const priceNumber = Number(price);
  const stockNumber = Number(stock);

  if (!name || !description || !category) {
    return res.render('products/new', {
      title: 'New Product - Admin Panel',
      username: req.session.username,
      categories: CATEGORIES,
      error: 'All fields are required.',
    });
  }

  if (isNaN(priceNumber) || priceNumber <= 0) {
    return res.render('products/new', {
      title: 'New Product - Admin Panel',
      username: req.session.username,
      categories: CATEGORIES,
      error: 'Price must be a number greater than 0.',
    });
  }

  if (isNaN(stockNumber) || stockNumber < 0) {
    return res.render('products/new', {
      title: 'New Product - Admin Panel',
      username: req.session.username,
      categories: CATEGORIES,
      error: 'Stock must be a number greater than or equal to 0.',
    });
  }

  // Image is required (per project decision)
  if (!req.file) {
    return res.render('products/new', {
      title: 'New Product - Admin Panel',
      username: req.session.username,
      categories: CATEGORIES,
      error: 'Product image is required.',
    });
  }

  try {
    const db = getDB();
    const imageUrl = `/uploads/${req.file.filename}`;

    await db.collection('products').insertOne({
      name,
      description,
      price: priceNumber,
      stock: stockNumber,
      category,
      imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.redirect('/products');
  } catch (error) {
    console.error('❌ Error creating product:', error.message);
    res.render('products/new', {
      title: 'New Product - Admin Panel',
      username: req.session.username,
      categories: CATEGORIES,
      error: 'Something went wrong while saving the product.',
    });
  }
}

// GET /products/:id/edit - show the "edit product" form
async function showEditForm(req, res) {
  try {
    const db = getDB();
    const product = await db.collection('products').findOne({ _id: new ObjectId(req.params.id) });

    if (!product) {
      return res.status(404).send('Product not found');
    }

    res.render('products/edit', {
      title: 'Edit Product - Admin Panel',
      username: req.session.username,
      categories: CATEGORIES,
      product,
      error: null,
    });
  } catch (error) {
    console.error('❌ Error loading product for edit:', error.message);
    res.status(500).send('Error loading product');
  }
}

// PUT /products/:id (via method-override) - update an existing product
async function updateProduct(req, res) {
  const { id } = req.params;
  const { name, description, price, stock, category } = req.body;

  const priceNumber = Number(price);
  const stockNumber = Number(stock);

  try {
    const db = getDB();
    const existingProduct = await db.collection('products').findOne({ _id: new ObjectId(id) });

    if (!existingProduct) {
      return res.status(404).send('Product not found');
    }

    if (!name || !description || !category || isNaN(priceNumber) || priceNumber <= 0 || isNaN(stockNumber) || stockNumber < 0) {
      return res.render('products/edit', {
        title: 'Edit Product - Admin Panel',
        username: req.session.username,
        categories: CATEGORIES,
        product: { ...existingProduct, name, description, price, stock, category },
        error: 'Please check that all fields are valid (price > 0, stock >= 0).',
      });
    }

    // Build the update object. If a new image was uploaded, replace it
    // and delete the old file from disk to avoid orphaned files.
    const updateData = {
      name,
      description,
      price: priceNumber,
      stock: stockNumber,
      category,
      updatedAt: new Date(),
    };

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;

      // Delete old image file if it exists
      const oldImagePath = path.join(__dirname, '..', 'public', existingProduct.imageUrl);
      fs.unlink(oldImagePath, (err) => {
        if (err) console.warn('⚠️  Could not delete old image:', err.message);
      });
    }

    await db.collection('products').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    res.redirect('/products');
  } catch (error) {
    console.error('❌ Error updating product:', error.message);
    res.status(500).send('Error updating product');
  }
}

// DELETE /products/:id (via method-override) - delete a product
async function deleteProduct(req, res) {
  const { id } = req.params;

  try {
    const db = getDB();
    const product = await db.collection('products').findOne({ _id: new ObjectId(id) });

    if (!product) {
      return res.status(404).send('Product not found');
    }

    await db.collection('products').deleteOne({ _id: new ObjectId(id) });

    // Clean up the image file from disk
    const imagePath = path.join(__dirname, '..', 'public', product.imageUrl);
    fs.unlink(imagePath, (err) => {
      if (err) console.warn('⚠️  Could not delete image file:', err.message);
    });

    res.redirect('/products');
  } catch (error) {
    console.error('❌ Error deleting product:', error.message);
    res.status(500).send('Error deleting product');
  }
}

module.exports = {
  listProducts,
  showNewForm,
  createProduct,
  showEditForm,
  updateProduct,
  deleteProduct,
};