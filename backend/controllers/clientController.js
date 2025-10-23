// controllers/clientController.js
const { Client } = require('../models');
const { Op } = require('sequelize');

// 🔍 Get all clients with pagination and filtering
exports.getClients = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build where condition for search
    const whereCondition = {};
    if (search) {
      whereCondition[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { manager: { [Op.iLike]: `%${search}%` } },
        { contact: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: clients } = await Client.findAndCountAll({
      where: whereCondition,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      clients,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalClients: count,
        hasNext: page * limit < count,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('Error fetching clients:', err);
    res.status(500).json({ 
      message: 'Failed to retrieve clients', 
      error: err.message 
    });
  }
};

// ➕ Create a new client
exports.createClient = async (req, res) => {
  try {
    const { name, manager, contact, email, address, establishedAt } = req.body;
    
    // Validate required fields
    if (!name || !manager || !contact || !address || !establishedAt) {
      return res.status(400).json({ 
        message: 'All fields except email are required' 
      });
    }

    // Trim and validate input
    const trimmedName = name.trim();
    const trimmedManager = manager.trim();
    const trimmedContact = contact.trim();
    const trimmedAddress = address.trim();
    const trimmedEmail = email ? email.trim() : null;

    if (!trimmedName || !trimmedManager || !trimmedContact || !trimmedAddress) {
      return res.status(400).json({ 
        message: 'Required fields cannot be empty or contain only spaces' 
      });
    }

    // Validate contact format (10-15 digits)
    const contactRegex = /^[0-9]{10,15}$/;
    if (!contactRegex.test(trimmedContact)) {
      return res.status(400).json({ 
        message: 'Contact must be 10-15 digits' 
      });
    }

    // Validate email format if provided
    if (trimmedEmail && !/\S+@\S+\.\S+/.test(trimmedEmail)) {
      return res.status(400).json({ 
        message: 'Invalid email format' 
      });
    }

    // Check if client with same name already exists
    const existingClient = await Client.findOne({ 
      where: { name: trimmedName } 
    });
    
    if (existingClient) {
      return res.status(409).json({ 
        message: 'Client with this name already exists' 
      });
    }

    const client = await Client.create({
      name: trimmedName,
      manager: trimmedManager,
      contact: trimmedContact,
      email: trimmedEmail,
      address: trimmedAddress,
      establishedAt
    });
    
    res.status(201).json({
      message: 'Client created successfully',
      client
    });
  } catch (err) {
    console.error('Error creating client:', err);
    res.status(500).json({ 
      message: 'Failed to create client', 
      error: err.message 
    });
  }
};

// 🔍 Get single client by ID
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        message: 'Client ID is required' 
      });
    }

    const client = await Client.findByPk(id);
    
    if (!client) {
      return res.status(404).json({ 
        message: 'Client not found' 
      });
    }

    res.json(client);
  } catch (err) {
    console.error('Error fetching client:', err);
    res.status(500).json({ 
      message: 'Error retrieving client', 
      error: err.message 
    });
  }
};

// ✏️ Update client by ID
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, manager, contact, email, address, establishedAt } = req.body;

    if (!id) {
      return res.status(400).json({ 
        message: 'Client ID is required' 
      });
    }
    
    // Validate required fields
    if (!name || !manager || !contact || !address || !establishedAt) {
      return res.status(400).json({ 
        message: 'All fields except email are required' 
      });
    }

    // Trim and validate input
    const trimmedName = name.trim();
    const trimmedManager = manager.trim();
    const trimmedContact = contact.trim();
    const trimmedAddress = address.trim();
    const trimmedEmail = email ? email.trim() : null;

    if (!trimmedName || !trimmedManager || !trimmedContact || !trimmedAddress) {
      return res.status(400).json({ 
        message: 'Required fields cannot be empty or contain only spaces' 
      });
    }

    // Validate contact format
    const contactRegex = /^[0-9]{10,15}$/;
    if (!contactRegex.test(trimmedContact)) {
      return res.status(400).json({ 
        message: 'Contact must be 10-15 digits' 
      });
    }

    // Validate email format if provided
    if (trimmedEmail && !/\S+@\S+\.\S+/.test(trimmedEmail)) {
      return res.status(400).json({ 
        message: 'Invalid email format' 
      });
    }

    // Check if client exists
    const existingClient = await Client.findByPk(id);
    if (!existingClient) {
      return res.status(404).json({ 
        message: 'Client not found' 
      });
    }

    // Check if another client already has the same name
    const clientWithSameName = await Client.findOne({
      where: { 
        name: trimmedName,
        id: { [Op.ne]: id } // Exclude current client
      }
    });
    
    if (clientWithSameName) {
      return res.status(409).json({ 
        message: 'Another client with this name already exists' 
      });
    }

    const [updatedCount] = await Client.update({
      name: trimmedName,
      manager: trimmedManager,
      contact: trimmedContact,
      email: trimmedEmail,
      address: trimmedAddress,
      establishedAt
    }, {
      where: { id }
    });

    if (updatedCount === 0) {
      return res.status(404).json({ 
        message: 'Client not found or no changes made' 
      });
    }

    const updatedClient = await Client.findByPk(id);
    res.json({
      message: 'Client updated successfully',
      client: updatedClient
    });
  } catch (err) {
    console.error('Error updating client:', err);
    res.status(500).json({ 
      message: 'Error updating client', 
      error: err.message 
    });
  }
};

// ❌ Delete client
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        message: 'Client ID is required' 
      });
    }

    const deletedCount = await Client.destroy({
      where: { id }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ 
        message: 'Client not found' 
      });
    }

    res.json({ 
      message: 'Client deleted successfully',
      deletedId: id
    });
  } catch (err) {
    console.error('Error deleting client:', err);
    res.status(500).json({ 
      message: 'Error deleting client', 
      error: err.message 
    });
  }
};

// 🔍 Search clients by name, manager, contact, or address
exports.searchClients = async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ 
        message: 'Search query is required' 
      });
    }

    const searchQuery = query.trim();
    
    const clients = await Client.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchQuery}%` } },
          { manager: { [Op.iLike]: `%${searchQuery}%` } },
          { contact: { [Op.iLike]: `%${searchQuery}%` } },
          { address: { [Op.iLike]: `%${searchQuery}%` } },
          { email: { [Op.iLike]: `%${searchQuery}%` } }
        ]
      },
      order: [['name', 'ASC']],
      limit: parseInt(limit)
    });

    res.json({
      clients,
      searchQuery,
      totalResults: clients.length
    });
  } catch (err) {
    console.error('Error searching clients:', err);
    res.status(500).json({ 
      message: 'Error searching clients', 
      error: err.message 
    });
  }
};

// 📊 Get clients statistics
exports.getClientStats = async (req, res) => {
  try {
    const totalClients = await Client.count();
    
    const clientsByMonth = await Client.findAll({
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['month'],
      order: [['month', 'ASC']],
      raw: true
    });

    const recentClients = await Client.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      totalClients,
      clientsByMonth,
      recentClients,
      stats: {
        total: totalClients,
        thisMonth: clientsByMonth.find(month => {
          const monthDate = new Date(month.month);
          const currentMonth = new Date();
          return monthDate.getMonth() === currentMonth.getMonth() && 
                 monthDate.getFullYear() === currentMonth.getFullYear();
        })?.count || 0
      }
    });
  } catch (err) {
    console.error('Error fetching client stats:', err);
    res.status(500).json({ 
      message: 'Error fetching client statistics', 
      error: err.message 
    });
  }
};

// 🔄 Bulk update clients
exports.bulkUpdateClients = async (req, res) => {
  try {
    const { clientIds, updateData } = req.body;

    if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
      return res.status(400).json({ 
        message: 'Client IDs array is required' 
      });
    }

    if (!updateData || typeof updateData !== 'object') {
      return res.status(400).json({ 
        message: 'Update data is required' 
      });
    }

    // Validate contact if provided
    if (updateData.contact) {
      const contactRegex = /^[0-9]{10,15}$/;
      if (!contactRegex.test(updateData.contact)) {
        return res.status(400).json({ 
          message: 'Contact must be 10-15 digits' 
        });
      }
    }

    // Validate email if provided
    if (updateData.email && !/\S+@\S+\.\S+/.test(updateData.email)) {
      return res.status(400).json({ 
        message: 'Invalid email format' 
      });
    }

    const [updatedCount] = await Client.update(updateData, {
      where: {
        id: {
          [Op.in]: clientIds
        }
      }
    });

    res.json({
      message: `Successfully updated ${updatedCount} clients`,
      updatedCount
    });
  } catch (err) {
    console.error('Error in bulk update:', err);
    res.status(500).json({ 
      message: 'Error performing bulk update', 
      error: err.message 
    });
  }
};

// 📋 Get clients with advanced filtering
exports.getClientsWithFilters = async (req, res) => {
  try {
    const {
      name,
      manager,
      contact,
      email,
      address,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereCondition = {};

    // Build filter conditions
    if (name) whereCondition.name = { [Op.iLike]: `%${name}%` };
    if (manager) whereCondition.manager = { [Op.iLike]: `%${manager}%` };
    if (contact) whereCondition.contact = { [Op.iLike]: `%${contact}%` };
    if (email) whereCondition.email = { [Op.iLike]: `%${email}%` };
    if (address) whereCondition.address = { [Op.iLike]: `%${address}%` };

    // Date range filter
    if (startDate || endDate) {
      whereCondition.establishedAt = {};
      if (startDate) whereCondition.establishedAt[Op.gte] = new Date(startDate);
      if (endDate) whereCondition.establishedAt[Op.lte] = new Date(endDate);
    }

    const { count, rows: clients } = await Client.findAndCountAll({
      where: whereCondition,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      clients,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalClients: count,
        hasNext: page * limit < count,
        hasPrev: page > 1
      },
      filters: {
        name,
        manager,
        contact,
        email,
        address,
        startDate,
        endDate
      }
    });
  } catch (err) {
    console.error('Error fetching filtered clients:', err);
    res.status(500).json({ 
      message: 'Error fetching clients with filters', 
      error: err.message 
    });
  }
};