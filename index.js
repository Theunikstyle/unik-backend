require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const corsOptions = {
  origin: 'https://https://uniknaturals-main-2-kydp.vercel.app/',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://admin123:anuj12345@unik-cluster.xmizicj.mongodb.net/?retryWrites=true&w=majority&appName=unik-cluster', {
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
