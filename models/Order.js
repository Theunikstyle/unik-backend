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
  address: {
    pincode: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    address2: { type: String, required: true },
    addressType: { type: String, enum: ['home', 'work'], required: true },
  },
  paymentId: String,
  shiprocketShipmentId: String, // Add this field to store Shiprocket shipment ID
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
