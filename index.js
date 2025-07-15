require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');

const app = express();
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://uniknaturals-main-2-m9lp-1cliqmar1.vercel.app',
    'https://www.uniknaturals.com'
  ],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://theunikstyle3:rBOoC9YVMqWBovt6@theunikstyle.pqkrbtn.mongodb.net/?retryWrites=true&w=majority&appName=theunikstyle', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB.');
});

// Ensure /public/uploads directory exists
const uploadDir = __dirname + '/public/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Placeholder route
app.get('/', (req, res) => {
  res.send('UnikNaturals Backend API');
});

const productsRouter = require('./routes/products');
const authRouter = require('./routes/auth');
const ordersRouter = require('./routes/orders');
const usersRouter = require('./routes/users');
const trendingProductsRouter = require('./routes/trending-products');
const moreProductsRouter = require('./routes/more-products');
const uploadRouter = require('./routes/upload');
const shiprocketRouter = require('./routes/shiprocket');

app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/users', usersRouter);
app.use('/api/trending-products', trendingProductsRouter);
app.use('/api/more-products', moreProductsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/shiprocket', shiprocketRouter);
app.use('/uploads', express.static(__dirname + '/public/uploads'));

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
