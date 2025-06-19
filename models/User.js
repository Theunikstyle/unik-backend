const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: function() { return !this.isAdmin; }
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  phone: {
    type: String,
    required: function() { return !this.isAdmin; }
    // unique removed, handled by partial index
  },
  address: {
    pincode: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    name: { type: String, required: false },
    address: { type: String, required: false },
    address2: { type: String, required: false },
    addressType: { type: String, enum: ['home', 'work'], required: false },
  },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
