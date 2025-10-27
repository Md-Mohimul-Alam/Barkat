// controllers/cnfController.js
const db = require('../models');
const CNF = db.CNF;

// ✅ Create new CNF
const createCNF = async (req, res) => {
  try {
    const { name, contact, address, establishedAt } = req.body;

    // Check if CNF already exists
    const existingCNF = await CNF.findOne({ where: { name } });
    if (existingCNF) {
      return res.status(400).json({
        success: false,
        message: 'CNF with this name already exists'
      });
    }

    const cnf = await CNF.create({
      name,
      contact,
      address,
      establishedAt
    });

    res.status(201).json({
      success: true,
      message: 'CNF created successfully',
      data: cnf
    });
  } catch (error) {
    console.error('Create CNF Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// ✅ Get all CNFs - ensure consistent response
const getAllCNFs = async (req, res) => {
  try {
    const cnfs = await CNF.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });

    // ✅ Return consistent format
    res.json({
      success: true,
      data: cnfs,
      count: cnfs.length
    });
  } catch (error) {
    console.error('Get CNFs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// ✅ Get single CNF by ID
const getCNFById = async (req, res) => {
  try {
    const { id } = req.params;
    const cnf = await CNF.findByPk(id);

    if (!cnf) {
      return res.status(404).json({
        success: false,
        message: 'CNF not found'
      });
    }

    res.json({
      success: true,
      data: cnf
    });
  } catch (error) {
    console.error('Get CNF by ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// ✅ Update CNF
const updateCNF = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, address, establishedAt } = req.body;

    const cnf = await CNF.findByPk(id);
    if (!cnf) {
      return res.status(404).json({
        success: false,
        message: 'CNF not found'
      });
    }

    // Check if name is being changed and if it conflicts with existing CNF
    if (name && name !== cnf.name) {
      const existingCNF = await CNF.findOne({ where: { name } });
      if (existingCNF) {
        return res.status(400).json({
          success: false,
          message: 'CNF with this name already exists'
        });
      }
    }

    await cnf.update({
      name: name || cnf.name,
      contact: contact || cnf.contact,
      address: address || cnf.address,
      establishedAt: establishedAt || cnf.establishedAt
    });

    res.json({
      success: true,
      message: 'CNF updated successfully',
      data: cnf
    });
  } catch (error) {
    console.error('Update CNF Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// ✅ Delete CNF (soft delete)
const deleteCNF = async (req, res) => {
  try {
    const { id } = req.params;

    const cnf = await CNF.findByPk(id);
    if (!cnf) {
      return res.status(404).json({
        success: false,
        message: 'CNF not found'
      });
    }

    await cnf.update({ isActive: false });

    res.json({
      success: true,
      message: 'CNF deleted successfully'
    });
  } catch (error) {
    console.error('Delete CNF Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createCNF,
  getAllCNFs,
  getCNFById,
  updateCNF,
  deleteCNF
};