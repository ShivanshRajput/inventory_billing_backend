const express = require('express');
const auth = require('../../middlewares/auth_middleware');
const authController = require('../../controllers/auth_controller');
const productController = require('../../controllers/product_controller');
const contactController = require('../../controllers/contact_controller');
const transactionController = require('../../controllers/transaction_controller');

const router = express.Router();

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/logout', authController.logout);

// Product routes
router.get("/products", auth, productController.list);
router.post("/products", auth, productController.create);
router.put("/products/:id", auth, productController.update);
router.delete("/products/:id", auth, productController.remove);
router.patch("/products/:id/stock", auth, productController.adjustStock);

// Contact routes
router.post('/contacts', auth, contactController.createContact);
router.get('/contacts', auth, contactController.getContacts);
router.get('/contacts/:id', auth, contactController.getContact);
router.put('/contacts/:id', auth, contactController.updateContact);
router.delete('/contacts/:id', auth, contactController.deleteContact);

// Transaction routes
router.post('/transactions', auth, transactionController.createTransaction);
router.get('/transactions', auth, transactionController.getTransactions);
router.get('/transactions/:id', auth, transactionController.getTransaction);
router.put('/transactions/:id', auth, transactionController.updateTransaction);
router.delete('/transactions/:id', auth, transactionController.deleteTransaction);

module.exports = router;
