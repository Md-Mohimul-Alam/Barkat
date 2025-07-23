const { Branch } = require('../models');

// 🔍 Get all branches
exports.getBranches = async (req, res) => {
  try {
    const branches = await Branch.findAll();
    res.json(branches);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve branches', error: err.message });
  }
};

// ➕ Create a new branch
exports.createBranch = async (req, res) => {
  try {
    const branch = await Branch.create(req.body);
    res.status(201).json(branch);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create branch', error: err.message });
  }
};

// 🔍 Get single branch by ID
exports.getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    res.json(branch);
  } catch (err) {
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
    res.status(500).json({ message: 'Error deleting branch', error: err.message });
  }
};
