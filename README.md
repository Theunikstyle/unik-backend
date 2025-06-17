# UnikNaturals Backend

## How to run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up your `.env` file (see `.env` in this repo for example)
3. Start MongoDB locally (or use MongoDB Atlas)
4. Start the server:
   ```bash
   node index.js
   ```

## API Endpoints

- `POST   /api/auth/register`   Register a new user
- `POST   /api/auth/login`      Login and get JWT
- `GET    /api/products`        Get all products
- `GET    /api/products/:slug`  Get product by slug
- `POST   /api/products`        Create product (admin)
- `PUT    /api/products/:id`    Update product (admin)
- `DELETE /api/products/:id`    Delete product (admin)
- `POST   /api/orders`          Create order (auth)
- `GET    /api/orders/my`       Get my orders (auth)
- `GET    /api/orders`          Get all orders (admin)

## Models
- Product
- User
- Order

---

You can now connect your Next.js frontend to this backend for all product, user, and order operations.
