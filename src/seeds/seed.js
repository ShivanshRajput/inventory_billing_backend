const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { User, Contact, Product, Transaction } = require('../models');
const connectDB = require('../config/db');
require('dotenv').config();

const seedData = async () => {
  try {

    await connectDB();

    // clearing existing data if any 
    await User.deleteMany({});
    await Contact.deleteMany({});
    await Product.deleteMany({});
    await Transaction.deleteMany({});

    // Seed Users
    const users = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: await bcrypt.hash('SecurePass123!', 12),
        businessName: 'Johns Business',
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        username: 'janesmith',
        password: await bcrypt.hash('SecurePass123!', 12),
        businessName: 'Janes Enterprises',
      },
    ];
    const createdUsers = await User.insertMany(users);

    // Seed Contacts
    const contacts = [
      {
        name: 'Alice Brown',
        email: 'alice@example.com',
        phone: '1234567890',
        address: '123 Main St',
        type: 'customer',
        businessId: createdUsers[0]._id,
      },
      {
        name: 'Bob Wilson',
        email: 'bob@example.com',
        phone: '0987654321',
        address: '456 Oak Ave',
        type: 'vendor',
        businessId: createdUsers[0]._id,
      },
      {
        name: 'Charlie Davis',
        email: 'charlie@example.com',
        phone: '5551234567',
        address: '789 Pine Rd',
        type: 'customer',
        businessId: createdUsers[1]._id,
      },
      {
        name: 'Diana Evans',
        email: 'diana@example.com',
        phone: '4449876543',
        address: '321 Cedar Ln',
        type: 'vendor',
        businessId: createdUsers[1]._id,
      },
    ];
    const createdContacts = await Contact.insertMany(contacts);

    // Seed Products
    const products = [
      {
        name: 'Laptop',
        description: 'High-end laptop',
        price: 999.99,
        stock: 10,
        category: 'Electronics',
        businessId: createdUsers[0]._id,
      },
      {
        name: 'Smartphone',
        description: 'Latest model smartphone',
        price: 699.99,
        stock: 15,
        category: 'Electronics',
        businessId: createdUsers[0]._id,
      },
      {
        name: 'Desk Chair',
        description: 'Ergonomic office chair',
        price: 149.99,
        stock: 20,
        category: 'Furniture',
        businessId: createdUsers[0]._id,
      },
      {
        name: 'Headphones',
        description: 'Wireless headphones',
        price: 89.99,
        stock: 30,
        category: 'Electronics',
        businessId: createdUsers[1]._id,
      },
      {
        name: 'Monitor',
        description: '27-inch 4K monitor',
        price: 299.99,
        stock: 8,
        category: 'Electronics',
        businessId: createdUsers[1]._id,
      },
    ];
    const createdProducts = await Product.insertMany(products);

    // Seed Transactions
    const transactions = [
      {
        type: 'sale',
        customerId: createdContacts[0]._id, // Alice (customer)
        products: [
          { productId: createdProducts[0]._id, quantity: 2, price: 999.99 }, // Laptop
          { productId: createdProducts[1]._id, quantity: 1, price: 699.99 }, // Smartphone
        ],
        totalAmount: 2699.97,
        businessId: createdUsers[0]._id,
      },
      {
        type: 'purchase',
        vendorId: createdContacts[1]._id, // Bob (vendor)
        products: [
          { productId: createdProducts[2]._id, quantity: 5, price: 149.99 }, // Desk Chair
        ],
        totalAmount: 749.95,
        businessId: createdUsers[0]._id,
      },
      {
        type: 'sale',
        customerId: createdContacts[2]._id, // Charlie (customer)
        products: [
          { productId: createdProducts[3]._id, quantity: 3, price: 89.99 }, // Headphones
        ],
        totalAmount: 269.97,
        businessId: createdUsers[1]._id,
      },
    ];
    await Transaction.insertMany(transactions);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();