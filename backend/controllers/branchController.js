const { Branch, Employee, User } = require('../models');
const { Op } = require('sequelize');

// Utility functions
const calculateAgeInYears = (establishedAt) => {
  if (!establishedAt) return null;
  const established = new Date(establishedAt);
  const today = new Date();
  let age = today.getFullYear() - established.getFullYear();
  const monthDiff = today.getMonth() - established.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < established.getDate())) {
    age--;
  }
  return age;
};

const calculateAge = (dob) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const calculateEmploymentDuration = (joinDate) => {
  if (!joinDate) return null;
  const join = new Date(joinDate);
  const today = new Date();
  const diffTime = Math.abs(today - join);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  
  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''}${months > 0 ? `, ${months} month${months > 1 ? 's' : ''}` : ''}`;
  }
  return `${months} month${months > 1 ? 's' : ''}`;
};

// @desc    Get all branches with manager information
// @route   GET /api/branches
// @access  Private
const getBranches = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      search,
      status,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build where conditions
    let where = {};
    
    // Search across multiple fields
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } },
        { city: { [Op.iLike]: `%${search}%` } },
        { contact: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filter by status
    if (status) where.status = status;

    const { count, rows: branches } = await Branch.findAndCountAll({
      where,
      include: [
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'name', 'position', 'contact', 'email'],
          required: false
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limitNum,
      offset: offset,
      distinct: true
    });

    const totalPages = Math.ceil(count / limitNum);

    // Transform data for frontend
    const transformedBranches = branches.map(branch => ({
      id: branch.id,
      name: branch.name,
      code: branch.code,
      contact: branch.contact,
      email: branch.email,
      address: branch.address,
      city: branch.city,
      state: branch.state,
      country: branch.country,
      establishedAt: branch.establishedAt,
      status: branch.status,
      managerId: branch.managerId,
      manager: branch.manager ? {
        id: branch.manager.id,
        name: branch.manager.name,
        position: branch.manager.position,
        contact: branch.manager.contact
      } : null,
      totalEmployees: branch.totalEmployees || 0,
      openingTime: branch.openingTime,
      closingTime: branch.closingTime,
      workingDays: branch.workingDays,
      createdAt: branch.createdAt,
      updatedAt: branch.updatedAt,
      ageInYears: calculateAgeInYears(branch.establishedAt),
      isOperational: branch.status === 'active'
    }));

    res.status(200).json({
      success: true,
      message: 'Branches fetched successfully',
      data: transformedBranches,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalBranches: count,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
        pageSize: limitNum
      }
    });
  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching branches',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Get single branch by ID
// @route   GET /api/branches/:id
// @access  Private
const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Branch ID is required'
      });
    }

    const branch = await Branch.findByPk(id, {
      include: [
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'name', 'position', 'contact', 'email', 'department'],
          required: false
        },
        {
          model: Employee,
          as: 'employees',
          attributes: ['id', 'name', 'position', 'email', 'contact', 'status', 'department'],
          required: false
        }
      ]
    });

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    // Transform branch data
    const transformedBranch = {
      id: branch.id,
      name: branch.name,
      code: branch.code,
      contact: branch.contact,
      email: branch.email,
      address: branch.address,
      city: branch.city,
      state: branch.state,
      country: branch.country,
      establishedAt: branch.establishedAt,
      status: branch.status,
      managerId: branch.managerId,
      manager: branch.manager ? {
        id: branch.manager.id,
        name: branch.manager.name,
        position: branch.manager.position,
        contact: branch.manager.contact,
        email: branch.manager.email
      } : null,
      totalEmployees: branch.totalEmployees || 0,
      capacity: branch.capacity,
      openingTime: branch.openingTime,
      closingTime: branch.closingTime,
      workingDays: branch.workingDays,
      monthlyRent: branch.monthlyRent,
      utilitiesCost: branch.utilitiesCost,
      description: branch.description,
      employees: branch.employees || [],
      createdAt: branch.createdAt,
      updatedAt: branch.updatedAt,
      ageInYears: calculateAgeInYears(branch.establishedAt),
      isOperational: branch.status === 'active'
    };

    res.status(200).json({
      success: true,
      message: 'Branch fetched successfully',
      data: transformedBranch
    });
  } catch (error) {
    console.error('Get branch by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching branch',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Create new branch
// @route   POST /api/branches
// @access  Private
const createBranch = async (req, res) => {
  try {
    const {
      name,
      contact,
      email,
      address,
      city,
      state,
      country = 'Bangladesh',
      postalCode,
      establishedAt,
      status = 'active',
      managerId,
      phone,
      openingTime,
      closingTime,
      workingDays = 'Monday-Friday',
      capacity,
      monthlyRent,
      utilitiesCost,
      description
    } = req.body;

    // Check if branch with same name already exists
    const existingBranch = await Branch.findOne({ where: { name } });
    if (existingBranch) {
      return res.status(409).json({
        success: false,
        message: 'Branch with this name already exists'
      });
    }

    // Validate manager if provided
    if (managerId) {
      const manager = await Employee.findByPk(managerId);
      if (!manager) {
        return res.status(400).json({
          success: false,
          message: 'Invalid manager ID. Employee not found.'
        });
      }
    }

    // Validate establishment date
    const establishedDate = new Date(establishedAt);
    const today = new Date();

    if (establishedDate > today) {
      return res.status(400).json({
        success: false,
        message: 'Establishment date cannot be in the future'
      });
    }

    const branch = await Branch.create({
      name: name.trim(),
      contact: contact.trim(),
      email: email ? email.toLowerCase().trim() : null,
      address: address.trim(),
      city: city ? city.trim() : 'Unknown',
      state: state ? state.trim() : 'Unknown',
      country: country.trim(),
      postalCode: postalCode ? postalCode.trim() : null,
      establishedAt: establishedDate,
      status,
      managerId: managerId || null,
      phone: phone ? phone.trim() : null,
      openingTime,
      closingTime,
      workingDays: workingDays.trim(),
      capacity: capacity ? parseInt(capacity) : null,
      monthlyRent: monthlyRent ? parseFloat(monthlyRent) : null,
      utilitiesCost: utilitiesCost ? parseFloat(utilitiesCost) : null,
      description: description ? description.trim() : null,
      createdBy: req.user?.id
    });

    // Fetch the created branch with manager info
    const createdBranch = await Branch.findByPk(branch.id, {
      include: [
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'name', 'position', 'contact', 'email'],
          required: false
        }
      ]
    });

    // Transform response
    const transformedBranch = {
      id: createdBranch.id,
      name: createdBranch.name,
      code: createdBranch.code,
      contact: createdBranch.contact,
      email: createdBranch.email,
      address: createdBranch.address,
      city: createdBranch.city,
      state: createdBranch.state,
      country: createdBranch.country,
      establishedAt: createdBranch.establishedAt,
      status: createdBranch.status,
      managerId: createdBranch.managerId,
      manager: createdBranch.manager ? {
        id: createdBranch.manager.id,
        name: createdBranch.manager.name,
        position: createdBranch.manager.position
      } : null,
      totalEmployees: createdBranch.totalEmployees,
      openingTime: createdBranch.openingTime,
      closingTime: createdBranch.closingTime,
      workingDays: createdBranch.workingDays,
      createdAt: createdBranch.createdAt,
      updatedAt: createdBranch.updatedAt,
      ageInYears: calculateAgeInYears(createdBranch.establishedAt),
      isOperational: createdBranch.status === 'active'
    };

    res.status(201).json({
      success: true,
      message: 'Branch created successfully',
      data: transformedBranch
    });
  } catch (error) {
    console.error('Create branch error:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating branch',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Update branch by ID
// @route   PUT /api/branches/:id
// @access  Private
const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Branch ID is required'
      });
    }

    // Check if branch exists
    const existingBranch = await Branch.findByPk(id);
    if (!existingBranch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    // Check if name is being changed and conflicts with existing branch
    if (updateData.name && updateData.name !== existingBranch.name) {
      const existingBranchWithName = await Branch.findOne({
        where: { 
          name: updateData.name,
          id: { [Op.ne]: id }
        }
      });
      if (existingBranchWithName) {
        return res.status(409).json({
          success: false,
          message: 'Another branch with this name already exists'
        });
      }
    }

    // Validate manager if provided
    if (updateData.managerId && updateData.managerId !== existingBranch.managerId) {
      const manager = await Employee.findByPk(updateData.managerId);
      if (!manager) {
        return res.status(400).json({
          success: false,
          message: 'Invalid manager ID. Employee not found.'
        });
      }
    }

    // Validate establishment date if provided
    if (updateData.establishedAt) {
      const establishedDate = new Date(updateData.establishedAt);
      const today = new Date();

      if (establishedDate > today) {
        return res.status(400).json({
          success: false,
          message: 'Establishment date cannot be in the future'
        });
      }
    }

    // Trim string fields
    const stringFields = ['name', 'contact', 'email', 'address', 'city', 'state', 'country', 'postalCode', 'phone', 'workingDays', 'description'];
    stringFields.forEach(field => {
      if (updateData[field]) {
        updateData[field] = updateData[field].trim();
      }
    });

    // Convert numeric fields
    if (updateData.capacity) updateData.capacity = parseInt(updateData.capacity);
    if (updateData.monthlyRent) updateData.monthlyRent = parseFloat(updateData.monthlyRent);
    if (updateData.utilitiesCost) updateData.utilitiesCost = parseFloat(updateData.utilitiesCost);

    // Add updatedBy information
    updateData.updatedBy = req.user?.id;

    // Update branch
    await Branch.update(updateData, {
      where: { id },
      individualHooks: true
    });

    // Fetch updated branch with associations
    const updatedBranch = await Branch.findByPk(id, {
      include: [
        {
          model: Employee,
          as: 'manager',
          attributes: ['id', 'name', 'position', 'contact', 'email'],
          required: false
        }
      ]
    });

    // Transform response
    const transformedBranch = {
      id: updatedBranch.id,
      name: updatedBranch.name,
      code: updatedBranch.code,
      contact: updatedBranch.contact,
      email: updatedBranch.email,
      address: updatedBranch.address,
      city: updatedBranch.city,
      state: updatedBranch.state,
      country: updatedBranch.country,
      establishedAt: updatedBranch.establishedAt,
      status: updatedBranch.status,
      managerId: updatedBranch.managerId,
      manager: updatedBranch.manager ? {
        id: updatedBranch.manager.id,
        name: updatedBranch.manager.name,
        position: updatedBranch.manager.position
      } : null,
      totalEmployees: updatedBranch.totalEmployees,
      capacity: updatedBranch.capacity,
      openingTime: updatedBranch.openingTime,
      closingTime: updatedBranch.closingTime,
      workingDays: updatedBranch.workingDays,
      monthlyRent: updatedBranch.monthlyRent,
      utilitiesCost: updatedBranch.utilitiesCost,
      createdAt: updatedBranch.createdAt,
      updatedAt: updatedBranch.updatedAt,
      ageInYears: calculateAgeInYears(updatedBranch.establishedAt),
      isOperational: updatedBranch.status === 'active'
    };

    res.status(200).json({
      success: true,
      message: 'Branch updated successfully',
      data: transformedBranch
    });
  } catch (error) {
    console.error('Update branch error:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating branch',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Delete branch
// @route   DELETE /api/branches/:id
// @access  Private (Admin only)
const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Branch ID is required'
      });
    }

    const branch = await Branch.findByPk(id);
    
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    await Branch.destroy({ where: { id } });
    
    res.status(200).json({
      success: true,
      message: 'Branch deleted successfully',
      data: {
        id: branch.id,
        name: branch.name,
        code: branch.code
      }
    });
  } catch (error) {
    console.error('Delete branch error:', error);
    
    // Handle foreign key constraint errors
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete branch. There are employees assigned to this branch. Please reassign or delete employees first.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while deleting branch',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Get branch statistics
// @route   GET /api/branches/stats/overview
// @access  Private
const getBranchStats = async (req, res) => {
  try {
    const stats = await Branch.getStatistics();

    res.status(200).json({
      success: true,
      message: 'Branch statistics fetched successfully',
      data: stats
    });
  } catch (error) {
    console.error('Get branch stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching branch statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Get employees for a specific branch
// @route   GET /api/branches/:branchId/employees
// @access  Private
const getBranchEmployees = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { status, position, department } = req.query;

    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: 'Branch ID is required'
      });
    }

    // Check if branch exists
    const branch = await Branch.findByPk(branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    let where = { branchId };
    
    // Filter by status if provided
    if (status) where.status = status;
    
    // Filter by position if provided
    if (position) where.position = { [Op.iLike]: `%${position}%` };
    
    // Filter by department if provided
    if (department) where.department = { [Op.iLike]: `%${department}%` };

    const employees = await Employee.findAll({
      where,
      attributes: ['id', 'name', 'position', 'contact', 'email', 'department', 'status', 'joinedAt', 'dob'],
      order: [['name', 'ASC']]
    });

    const transformedEmployees = employees.map(employee => ({
      id: employee.id,
      name: employee.name,
      position: employee.position,
      contact: employee.contact,
      email: employee.email,
      department: employee.department,
      status: employee.status,
      joinedAt: employee.joinedAt,
      age: calculateAge(employee.dob),
      employmentDuration: calculateEmploymentDuration(employee.joinedAt)
    }));

    res.status(200).json({
      success: true,
      message: 'Branch employees fetched successfully',
      data: transformedEmployees,
      count: employees.length,
      branch: {
        id: branch.id,
        name: branch.name,
        totalEmployees: branch.totalEmployees
      }
    });
  } catch (error) {
    console.error('Get branch employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching branch employees',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Get branches by city
// @route   GET /api/branches/city/:city
// @access  Private
const getBranchesByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const { status } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'City name is required'
      });
    }

    let where = { 
      city: { [Op.iLike]: `%${city}%` }
    };

    if (status) where.status = status;

    const branches = await Branch.findAll({
      where,
      include: [{
        model: Employee,
        as: 'manager',
        attributes: ['id', 'name', 'position'],
        required: false
      }],
      order: [['name', 'ASC']]
    });

    const transformedBranches = branches.map(branch => ({
      id: branch.id,
      name: branch.name,
      code: branch.code,
      contact: branch.contact,
      address: branch.address,
      city: branch.city,
      state: branch.state,
      status: branch.status,
      manager: branch.manager ? {
        id: branch.manager.id,
        name: branch.manager.name,
        position: branch.manager.position
      } : null,
      totalEmployees: branch.totalEmployees,
      establishedAt: branch.establishedAt,
      ageInYears: calculateAgeInYears(branch.establishedAt)
    }));

    res.status(200).json({
      success: true,
      message: 'Branches fetched successfully',
      data: transformedBranches,
      count: branches.length,
      city: city
    });
  } catch (error) {
    console.error('Get branches by city error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching branches by city',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// @desc    Test endpoint - create sample data
// @route   GET /api/branches/test/test-branches
// @access  Private
const testBranches = async (req, res) => {
  try {
    // Create test branches if none exist
    const branchCount = await Branch.count();
    
    if (branchCount === 0) {
      await Branch.bulkCreate([
        {
          name: 'Main Branch Dhaka',
          contact: '01711234567',
          address: '123 Main Street, Dhaka, Bangladesh',
          city: 'Dhaka',
          state: 'Dhaka',
          country: 'Bangladesh',
          establishedAt: new Date('2020-01-01'),
          status: 'active'
        },
        {
          name: 'Chittagong Branch',
          contact: '01711234568',
          address: '456 Port Road, Chittagong, Bangladesh',
          city: 'Chittagong',
          state: 'Chittagong',
          country: 'Bangladesh',
          establishedAt: new Date('2021-03-15'),
          status: 'active'
        },
        {
          name: 'Sylhet Regional Office',
          contact: '01711234569',
          address: '789 Tea Garden Road, Sylhet, Bangladesh',
          city: 'Sylhet',
          state: 'Sylhet',
          country: 'Bangladesh',
          establishedAt: new Date('2022-06-20'),
          status: 'active'
        }
      ]);
    }

    const branches = await Branch.findAll({
      include: [{
        model: Employee,
        as: 'manager',
        attributes: ['id', 'name', 'position'],
        required: false
      }],
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      message: 'Test branches fetched successfully',
      data: branches,
      count: branches.length
    });
  } catch (error) {
    console.error('Test branches error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in test endpoint',
      error: error.message
    });
  }
};

module.exports = {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  getBranchStats,
  getBranchEmployees,
  getBranchesByCity,
  testBranches
};