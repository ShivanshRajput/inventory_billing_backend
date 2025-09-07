# Inventory & Billing Management Backend (Node.js, Express, MongoDB, JWT)

This is a starter backend for an Inventory & Billing Management system, built as an assessment project. It provides a RESTful API for managing users, contacts, products, and transactions, with JWT-based authentication and MongoDB for data storage.

## Features
- User authentication (register, login, logout) with JWT
- CRUD operations for contacts (customers/vendors)
- CRUD operations for products with stock management
- Transaction management (sales/purchases) with product and contact associations
- Data seeding for testing with dummy data
- Input validation and error handling
- MongoDB with Mongoose for data modeling

## Tech Stack
- **Node.js**: v18+ recommended
- **Express.js**: Web framework for API routes
- **MongoDB**: Database (local or MongoDB Atlas)
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication via JSON Web Tokens
- **bcrypt**: Password hashing
- **validator**: Input validation for emails and other fields
- **dotenv**: Environment variable management

## Project Structure
```
src
├── app.js                    # Main application entry point
├── config
│   ├── db.js                # MongoDB connection setup
│   └── serverConfig.js      # Server configuration (port, etc.)
├── controllers
│   ├── auth_controller.js   # User authentication endpoints
│   ├── contact_controller.js # Contact CRUD endpoints
│   ├── product_controller.js # Product CRUD and stock endpoints
│   └── transaction_controller.js # Transaction CRUD endpoints
├── middlewares
│   └── auth_middleware.js   # JWT authentication middleware
├── models
│   ├── contact.js           # Contact schema
│   ├── index.js             # Model exports
│   ├── product.js           # Product schema
│   ├── transaction.js       # Transaction schema
│   └── user.js              # User schema
├── routes
│   ├── index.js             # Main router
│   └── v1
│       └── index.js         # API v1 routes
├── seeds
│   └── seed.js              # Data seeding script
└── utils                    # Utility functions (empty for now)
```

## Prerequisites
- **Node.js**: v18 or higher
- **MongoDB**: Local installation or MongoDB Atlas account
- **Git**: For cloning the repository
- **npm**: For dependency installation

## Setup Instructions
### 1. Clone the Repository
Clone the project to your local machine:
```bash
git clone git@github.com:ShivanshRajput/inventory_billing_backend.git
cd inventory-billing-backend
```

### 2. Install Dependencies
Install the required Node.js packages:
```bash
npm install
```
Required dependencies (included in `package.json`):
- `express`
- `mongoose`
- `jsonwebtoken`
- `bcrypt`
- `validator`
- `dotenv`

### 3. Configure Environment Variables
- Copy the `.env.example` file to create a `.env` file:
  ```bash
  cp .env.example .env
  ```
- Edit `.env` with your configuration:
  ```env
  PORT=3000
  MONGO_URI=mongodb://localhost:27017/inventory
  JWT_SECRET=your_jwt_secret_here
  ```
  - `PORT`: Port for the Express server (default: 3000).
  - `MONGO_URI`: MongoDB connection string (use `mongodb://localhost:27017/inventory` for local MongoDB or your Atlas URI).
  - `JWT_SECRET`: A secure string for JWT signing (e.g., generate with `openssl rand -base64 32`).

### 4. Start MongoDB
- **Local MongoDB**: Ensure MongoDB is running:
  ```bash
  mongod
  ```
- **MongoDB Atlas**: Ensure your `MONGO_URI` in `.env` points to your Atlas cluster.

### 5. Seed the Database
Populate the database with dummy data (users, contacts, products, transactions):
```bash
npm run seed
```
This runs `src/seeds/seed.js`, which:
- Clears existing data.
- Creates 2 users, 4 contacts, 5 products, and 3 transactions.
- Logs success or errors to the console.

### 6. Start the Server
Run the application:
```bash
npm start
```
The server will start at `http://localhost:3000/api/v1` (or the port specified in `.env`).

### 7. Verify Seeded Data
Use the MongoDB shell (`mongosh`) to check the seeded data:
```bash
mongosh
use inventory
show collections
db.users.find().pretty()
db.contacts.find().pretty()
db.products.find().pretty()
db.transactions.find().pretty()
```
Alternatively, use MongoDB Compass or test API endpoints (see below).

## API Endpoints
All endpoints are prefixed with `/api/v1`. Protected endpoints require an `Authorization: Bearer <token>` header.

### Auth
- **POST /auth/register**: Register a new user
  ```bash
  curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","username":"johndoe","password":"SecurePass123!","businessName":"Johns Business"}'
  ```
  Response (201):
  ```json
  {"success":true,"user":{"id":"...","email":"john@example.com"},"token":"..."}
  ```

- **POST /auth/login**: Login and get JWT
  ```bash
  curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"john@example.com","password":"SecurePass123!"}'
  ```
  Response (200):
  ```json
  {"success":true,"user":{"id":"...","email":"john@example.com"},"token":"..."}
  ```

### Contacts
- **POST /contacts**: Create a contact
  ```bash
  curl -X POST http://localhost:3000/api/v1/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Jane Smith","email":"jane@example.com","phone":"1234567890","address":"123 Main St","type":"customer"}'
  ```
  Response (201):
  ```json
  {"success":true,"data":{"_id":"...","name":"Jane Smith","email":"jane@example.com",...}}
  ```

- **GET /contacts**: Get all contacts
  ```bash
  curl -X GET http://localhost:3000/api/v1/contacts \
  -H "Authorization: Bearer <token>"
  ```

- **GET /contacts/:id**: Get a single contact
- **PUT /contacts/:id**: Update a contact
- **DELETE /contacts/:id**: Delete a contact

### Products
- **POST /products**: Create a product
  ```bash
  curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Laptop","description":"High-end laptop","price":999.99,"stock":10,"category":"Electronics"}'
  ```

- **GET /products**: Get all products
- **PUT /products/:id**: Update a product
- **DELETE /products/:id**: Delete a product
- **PATCH /products/:id/stock**: Adjust product stock
  ```bash
  curl -X PATCH http://localhost:3000/api/v1/products/<product_id>/stock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"delta":5}'
  ```

### Transactions
- **POST /transactions**: Create a transaction
  ```bash
  curl -X POST http://localhost:3000/api/v1/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"type":"sale","customerId":"<contact_id>","products":[{"productId":"<product_id>","quantity":2,"price":999.99}],"totalAmount":1999.98}'
  ```

- **GET /transactions**: Get all transactions
- **GET /transactions/:id**: Get a single transaction
- **PUT /transactions/:id**: Update a transaction
- **DELETE /transactions/:id**: Delete a transaction

## Example .env
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/inventory
JWT_SECRET=your_jwt_secret_here
```

## Example package.json
```json
{
  "name": "inventory-billing-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node src/app.js",
    "seed": "node src/seeds/seed.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "validator": "^13.9.0",
    "dotenv": "^16.0.3"
  }
}
```

## Run & Deployment Notes
- **Development**:
  - Ensure MongoDB is running locally or configured with Atlas.
  - Use `npm start` to run the server.
  - Use `npm run seed` to populate dummy data.
- **Testing**:
  - Test endpoints using cURL, Postman, or similar tools.
  - Seeded data includes 2 users, 4 contacts, 5 products, and 3 transactions.
- **Deployment**:
  - Deploy on platforms like Render, Heroku, or AWS.
  - Ensure `MONGO_URI` points to a production database (e.g., MongoDB Atlas).
  - Secure `JWT_SECRET` and avoid exposing `.env` in version control.

## Troubleshooting
- **MongoDB Connection Error**: Verify `MONGO_URI` in `.env` and ensure MongoDB is running.
- **JWT Errors**: Ensure `JWT_SECRET` is set and matches in development/production.
- **Seeding Issues**: Check `src/seeds/seed.js` logs for errors. Re-run `npm run seed` if needed.
- **API Errors**: Use server logs (`console.error` in controllers) to debug 500 errors.