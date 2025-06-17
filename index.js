require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/uniknaturals', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Placeholder route
app.get('/', (req, res) => {
  res.send('UnikNaturals Backend API');
});

const productsRouter = require('./routes/products');
const authRouter = require('./routes/auth');
const ordersRouter = require('./routes/orders');

app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
