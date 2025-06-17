const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 },
      price: Number,
    }
  ],
  total: Number,
  status: { type: String, default: 'pending' },
  address: String,
  paymentId: String,
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
