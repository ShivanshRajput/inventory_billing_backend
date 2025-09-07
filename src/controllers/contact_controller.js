const { Contact } = require('../models');
const validator = require('validator'); 

const createContact = async (req, res) => {
  try {
    const { name, email, phone, address, type } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters long' });
    }
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }
    if (!phone || phone.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Phone number must be at least 5 characters long' });
    }
    if (!type || !['customer', 'vendor'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Type must be either "customer" or "vendor"' });
    }
    if (address && address.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Address, if provided, must be at least 3 characters long' });
    }

    const contact = await Contact.create({
      name: name.trim(),
      email: email.toLowerCase(),
      phone: phone.trim(),
      address: address ? address.trim() : undefined,
      type,
      businessId: req.user.id, 
    });

    return res.status(201).json({ success: true, data: contact });
  } catch (err) {
    console.error('Create contact error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ businessId: req.user.id });
    return res.status(200).json({ success: true, data: contacts });
  } catch (err) {
    console.error('Get contacts error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getContact = async (req, res) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, businessId: req.user.id });
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    return res.status(200).json({ success: true, data: contact });
  } catch (err) {
    console.error('Get contact error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateContact = async (req, res) => {
  try {
    const { name, email, phone, address, type } = req.body;

    if (name && name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters long' });
    }
    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }
    if (phone && phone.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Phone number must be at least 5 characters long' });
    }
    if (type && !['customer', 'vendor'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Type must be either "customer" or "vendor"' });
    }
    if (address && address.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Address, if provided, must be at least 3 characters long' });
    }

    const contact = await Contact.findOne({ _id: req.params.id, businessId: req.user.id });
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    const updateData = {
      ...(name && { name: name.trim() }),
      ...(email && { email: email.toLowerCase() }),
      ...(phone && { phone: phone.trim() }),
      ...(address && { address: address.trim() }),
      ...(type && { type }),
    };

    await contact.updateOne(updateData);
    const updatedContact = await Contact.findById(req.params.id);
    return res.status(200).json({ success: true, data: updatedContact });
  } catch (err) {
    console.error('Update contact error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, businessId: req.user.id });
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    await contact.deleteOne();
    return res.status(200).json({ success: true, message: 'Contact deleted successfully' });
  } catch (err) {
    console.error('Delete contact error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
};