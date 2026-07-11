// Handles order creation from the public store (no auth, no cart — direct order flow).

const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

// GET /checkout/:productId - show the order form for a single product
async function showCheckoutForm(req, res) {
  try {
    const db = getDB();
    const product = await db.collection('products').findOne({ _id: new ObjectId(req.params.productId) });

    if (!product) {
      return res.status(404).send('Product not found');
    }

    if (product.stock <= 0) {
      return res.status(400).send('This product is out of stock');
    }

    res.render('checkout', {
      title: `Order ${product.name} - Larry Penguin Store`,
      product: { ...product, imageUrl: `${BACKEND_URL}${product.imageUrl}` },
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
    const db = getDB();
    const product = await db.collection('products').findOne({ _id: new ObjectId(productId) });

    if (!product) {
      return res.status(404).send('Product not found');
    }

    // Basic server-side validation
    if (!customerName || !iglooAddress || isNaN(quantityNumber) || quantityNumber <= 0) {
      return res.render('checkout', {
        title: `Order ${product.name} - Larry Penguin Store`,
        product: { ...product, imageUrl: `${BACKEND_URL}${product.imageUrl}` },
        error: 'Please fill in your name, igloo address, and a valid quantity.',
      });
    }

    if (quantityNumber > product.stock) {
      return res.render('checkout', {
        title: `Order ${product.name} - Larry Penguin Store`,
        product: { ...product, imageUrl: `${BACKEND_URL}${product.imageUrl}` },
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

    const result = await db.collection('orders').insertOne(order);

    // Reduce stock accordingly, now that the order is confirmed
    await db.collection('products').updateOne(
      { _id: product._id },
      { $inc: { stock: -quantityNumber } }
    );

    res.redirect(`/orders/${result.insertedId}/confirmation`);
  } catch (error) {
    console.error('❌ Error creating order:', error.message);
    res.status(500).send('Error creating order');
  }
}

// GET /orders/:id/confirmation - show the confirmation page for a created order
async function showConfirmation(req, res) {
  try {
    const db = getDB();
    const order = await db.collection('orders').findOne({ _id: new ObjectId(req.params.id) });

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