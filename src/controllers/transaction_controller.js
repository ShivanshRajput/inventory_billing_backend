const { Transaction, Product, Contact } = require('../models');
const validator = require('validator');

const createTransaction = async (req, res) => {
  try {
    const { type, customerId, vendorId, products, totalAmount } = req.body;

    if (!type || !['sale', 'purchase'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Type must be either "sale" or "purchase"' });
    }
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: 'Products array is required and must not be empty' });
    }
    if (!totalAmount || !validator.isFloat(String(totalAmount), { min: 0 })) {
      return res.status(400).json({ success: false, message: 'Total amount must be a non-negative number' });
    }
    if ((type === 'sale' && !customerId) || (type === 'purchase' && !vendorId)) {
      return res.status(400).json({ success: false, message: `${type === 'sale' ? 'Customer ID' : 'Vendor ID'} is required` });
    }

    for (const item of products) {
      if (!item.productId || !item.quantity || !Number.isInteger(Number(item.quantity)) || item.quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Each product must have a valid productId and positive integer quantity' });
      }
      if (!item.price || !validator.isFloat(String(item.price), { min: 0 })) {
        return res.status(400).json({ success: false, message: 'Each product must have a non-negative price' });
      }
      const product = await Product.findOne({ _id: item.productId, businessId: req.user.id });
      if (!product) {
        return res.status(404).json({ success: false, message: `Product with ID ${item.productId} not found` });
      }
      if (type === 'sale' && product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for product ${product.name}` });
      }
    }

    if (customerId) {
      const customer = await Contact.findOne({ _id: customerId, businessId: req.user.id, type: 'customer' });
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found or not a customer type' });
      }
    }
    if (vendorId) {
      const vendor = await Contact.findOne({ _id: vendorId, businessId: req.user.id, type: 'vendor' });
      if (!vendor) {
        return res.status(404).json({ success: false, message: 'Vendor not found or not a vendor type' });
      }
    }

    const transaction = await Transaction.create({
      type,
      customerId,
      vendorId,
      products,
      totalAmount: Number(totalAmount),
      businessId: req.user.id,
    });

    if (type === 'sale') {
      for (const item of products) {
        await Product.findOneAndUpdate(
          { _id: item.productId, businessId: req.user.id },
          { $inc: { stock: -item.quantity } }
        );
      }
    } else if (type === 'purchase') {
      for (const item of products) {
        await Product.findOneAndUpdate(
          { _id: item.productId, businessId: req.user.id },
          { $inc: { stock: item.quantity } }
        );
      }
    }

    return res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    console.error('Create transaction error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ businessId: req.user.id })
      .populate('customerId', 'name email')
      .populate('vendorId', 'name email')
      .populate('products.productId', 'name price');
    return res.status(200).json({ success: true, data: transactions });
  } catch (err) {
    console.error('Get transactions error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, businessId: req.user.id })
      .populate('customerId', 'name email')
      .populate('vendorId', 'name email')
      .populate('products.productId', 'name price');
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    return res.status(200).json({ success: true, data: transaction });
  } catch (err) {
    console.error('Get transaction error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { type, customerId, vendorId, products, totalAmount } = req.body;

    if (type && !['sale', 'purchase'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Type must be either "sale" or "purchase"' });
    }
    if (products && (!Array.isArray(products) || products.length === 0)) {
      return res.status(400).json({ success: false, message: 'Products array must not be empty' });
    }
    if (totalAmount && !validator.isFloat(String(totalAmount), { min: 0 })) {
      return res.status(400).json({ success: false, message: 'Total amount must be a non-negative number' });
    }
    if (customerId) {
      const customer = await Contact.findOne({ _id: customerId, businessId: req.user.id, type: 'customer' });
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found or not a customer type' });
      }
    }
    if (vendorId) {
      const vendor = await Contact.findOne({ _id: vendorId, businessId: req.user.id, type: 'vendor' });
      if (!vendor) {
        return res.status(404).json({ success: false, message: 'Vendor not found or not a vendor type' });
      }
    }

    if (products) {
      for (const item of products) {
        if (!item.productId || !item.quantity || !Number.isInteger(Number(item.quantity)) || item.quantity <= 0) {
          return res.status(400).json({ success: false, message: 'Each product must have a valid productId and positive integer quantity' });
        }
        if (!item.price || !validator.isFloat(String(item.price), { min: 0 })) {
          return res.status(400).json({ success: false, message: 'Each product must have a non-negative price' });
        }
        const product = await Product.findOne({ _id: item.productId, businessId: req.user.id });
        if (!product) {
          return res.status(404).json({ success: false, message: `Product with ID ${item.productId} not found` });
        }
      }
    }

    const updateData = {
      ...(type && { type }),
      ...(customerId && { customerId }),
      ...(vendorId && { vendorId }),
      ...(products && { products }),
      ...(totalAmount && { totalAmount: Number(totalAmount) }),
    };

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.id },
      updateData,
      { new: true }
    );
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    return res.status(200).json({ success: true, data: transaction });
  } catch (err) {
    console.error('Update transaction error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, businessId: req.user.id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    return res.status(200).json({ success: true, message: 'Transaction deleted successfully' });
  } catch (err) {
    console.error('Delete transaction error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
};