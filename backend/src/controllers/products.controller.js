
const fs = require('fs');
const path = require('path');
const productsModel = require('../models/products.model');

const CATEGORIES = ['pescado', 'hielo', 'esmoquin'];

// GET /products, muestra todos los productos
async function listProducts(req, res) {
  try {
    const products = await productsModel.findAll();   //se pide al model todos los prod

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

// GET /products/new, muestra el formulario vacio para crear un producto nuevo
function showNewForm(req, res) {
  res.render('products/new', {
    title: 'New Product - Admin Panel',
    username: req.session.username,
    categories: CATEGORIES,
    error: null,
  });
}

// POST /products, crea un nuevo producto
async function createProduct(req, res) {
  const { name, description, price, stock, category } = req.body;

  const priceNumber = Number(price);  //convierte string a num
  const stockNumber = Number(stock);

  //validacion de campos de texto obligatorios
  if (!name || !description || !category) {
    return res.render('products/new', {
      title: 'New Product - Admin Panel',
      username: req.session.username,
      categories: CATEGORIES,
      error: 'All fields are required.',
    });
  }
  //validacion del precio
  if (isNaN(priceNumber) || priceNumber <= 0) {   //si el precio no es un num val y menor o igual  a cero
    return res.render('products/new', {
      title: 'New Product - Admin Panel',
      username: req.session.username,
      categories: CATEGORIES,
      error: 'Price must be a number greater than 0.',
    });
  }
  //validacion del stock
  if (isNaN(stockNumber) || stockNumber < 0) {
    return res.render('products/new', {
      title: 'New Product - Admin Panel',
      username: req.session.username,
      categories: CATEGORIES,
      error: 'Stock must be a number greater than or equal to 0.',
    });
  }
  //validacion de que haya imagen
  if (!req.file) {
    return res.render('products/new', {
      title: 'New Product - Admin Panel',
      username: req.session.username,
      categories: CATEGORIES,
      error: 'Product image is required.',
    });
  }
  //donde se guarda el producto
  try {
    const imageUrl = `/uploads/${req.file.filename}`;   //ruta relativa que se va a guardar en la bd

    await productsModel.create({     //para insertar el producto
      name,
      description,
      price: priceNumber,
      stock: stockNumber,
      category,
      imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.redirect('/products');   //redirige al listado completo de productos
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

//funcion para editar un producto
async function showEditForm(req, res) {
  try {
    const product = await productsModel.findById(req.params.id);

    if (!product) {
      return res.status(404).send('Product not found');
    }

    res.render('products/edit', {        //si el producto si existe, renderiza
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

  const priceNumber = Number(price);     //conversion de texto a numero
  const stockNumber = Number(stock);

  try {
    const existingProduct = await productsModel.findById(id);    //se busca el producto en la base de datos

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

    await productsModel.updateById(id, updateData);

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
    const product = await productsModel.findById(id);

    if (!product) {
      return res.status(404).send('Product not found');
    }

    await productsModel.deleteById(id);

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