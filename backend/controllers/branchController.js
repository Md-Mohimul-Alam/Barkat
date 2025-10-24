const { Branch } = require('../models');

// 🔍 Get all branches
exports.getBranches = async (req, res) => {
  try {
    const branches = await Branch.findAll({
      order: [['name', 'ASC']]
    });
    res.json(branches);
  } catch (err) {
    console.error('Get branches error:', err);
    res.status(500).json({ message: 'Failed to retrieve branches', error: err.message });
  }
};

// ➕ Create a new branch
exports.createBranch = async (req, res) => {
  try {
    console.log('Creating branch with data:', req.body);
    
    const { name, contact, address, establishedAt, status = 'active' } = req.body;
    
    const branch = await Branch.create({
      name: name?.trim(),
      contact: contact?.trim(),
      address: address?.trim(),
      establishedAt,
      status
    });
    
    console.log('Branch created successfully:', branch.id);
    res.status(201).json(branch);
  } catch (err) {
    console.error('Create branch error details:', err);
    
    // Handle validation errors
    if (err.name === 'SequelizeValidationError') {
      const errors = err.errors.map(error => ({
        field: error.path,
        message: error.message,
        value: error.value
      }));
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors,
        type: 'validation_error'
      });
    }
    
    // Handle unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        message: 'Branch with this name already exists',
        type: 'unique_constraint'
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to create branch', 
      error: err.message,
      type: 'server_error'
    });
  }
};

// 🔍 Get single branch by ID
exports.getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    res.json(branch);
  } catch (err) {
    console.error('Get branch by ID error:', err);
    res.status(500).json({ message: 'Error retrieving branch', error: err.message });
  }
};

// ✏️ Update branch by ID
exports.updateBranch = async (req, res) => {
  try {
    const [updated] = await Branch.update(req.body, {
      where: { id: req.params.id }
    });

    if (!updated) return res.status(404).json({ message: 'Branch not found' });

    const updatedBranch = await Branch.findByPk(req.params.id);
    res.json(updatedBranch);
  } catch (err) {
    console.error('Update branch error:', err);
    
    if (err.name === 'SequelizeValidationError') {
      const errors = err.errors.map(error => error.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors 
      });
    }
    
    res.status(500).json({ message: 'Error updating branch', error: err.message });
  }
};

// ❌ Delete branch
exports.deleteBranch = async (req, res) => {
  try {
    const deleted = await Branch.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) return res.status(404).json({ message: 'Branch not found' });
    res.json({ message: 'Branch deleted' });
  } catch (err) {
    console.error('Delete branch error:', err);
    res.status(500).json({ message: 'Error deleting branch', error: err.message });
  }
};