// Handles order creation from the public store (no auth, no cart — direct order flow).
// Data access is delegated to the products and orders models.

const productsModel = require('../models/products.model');
const ordersModel = require('../models/orders.model');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

function toFullImageUrl(product) {
  return { ...product, imageUrl: `${BACKEND_URL}${product.imageUrl}` };
}

// GET /checkout/:productId - show the order form for a single product
async function showCheckoutForm(req, res) {
  try {
    const product = await productsModel.findById(req.params.productId);

    if (!product) {
      return res.status(404).send('Product not found');
    }

    if (product.stock <= 0) {
      return res.status(400).send('This product is out of stock');
    }

    res.render('checkout', {
      title: `Order ${product.name} - Larry Penguin Store`,
      product: toFullImageUrl(product),
      error: null,
    });
  } catch (error) {
    console.error('❌ Error loading checkout form:', error.message);
    res.status(500).send('Error loading checkout form');
  }
}

// POST /orders - create a new order for a single product
async function createOrder(req, res) {
  const { productId, customerName, iglooAddress, quantity } = req.body;
  const quantityNumber = Number(quantity);

  try {
    const product = await productsModel.findById(productId);

    if (!product) {
      return res.status(404).send('Product not found');
    }

    if (!customerName || !iglooAddress || isNaN(quantityNumber) || quantityNumber <= 0) {
      return res.render('checkout', {
        title: `Order ${product.name} - Larry Penguin Store`,
        product: toFullImageUrl(product),
        error: 'Please fill in your name, igloo address, and a valid quantity.',
      });
    }

    if (quantityNumber > product.stock) {
      return res.render('checkout', {
        title: `Order ${product.name} - Larry Penguin Store`,
        product: toFullImageUrl(product),
        error: `Only ${product.stock} unit(s) available.`,
      });
    }

    const total = product.price * quantityNumber;

    const order = {
      customerName,
      iglooAddress,
      items: [
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: quantityNumber,
        },
      ],
      total,
      status: 'pendiente',
      createdAt: new Date(),
    };

    const result = await ordersModel.create(order);

    // Reduce stock accordingly, now that the order is confirmed
    await productsModel.decreaseStock(product._id, quantityNumber);

    res.redirect(`/orders/${result.insertedId}/confirmation`);
  } catch (error) {
    console.error('❌ Error creating order:', error.message);
    res.status(500).send('Error creating order');
  }
}

// GET /orders/:id/confirmation - show the confirmation page for a created order
async function showConfirmation(req, res) {
  try {
    const order = await ordersModel.findById(req.params.id);

    if (!order) {
      return res.status(404).send('Order not found');
    }

    res.render('confirmation', {
      title: 'Order Confirmed - Larry Penguin Store',
      order,
    });
  } catch (error) {
    console.error('❌ Error loading confirmation:', error.message);
    res.status(500).send('Error loading confirmation');
  }
}

module.exports = { showCheckoutForm, createOrder, showConfirmation };