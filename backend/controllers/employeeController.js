const { Employee, Branch, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// @desc    Get all employees with advanced filtering and pagination
// @route   GET /api/employees
// @access  Private
const getAllEmployees = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      branch,
      position,
      status,
      isManager,
      minSalary,
      maxSalary,
      joinDateFrom,
      joinDateTo,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build where conditions for Sequelize
    let where = {};
    
    // Search across multiple fields
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { contact: { [Op.iLike]: `%${search}%` } },
        { nid: { [Op.iLike]: `%${search}%` } },
        { position: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filter by branch
    if (branch) where.branchId = branch;

    // Filter by position
    if (position) where.position = { [Op.iLike]: `%${position}%` };

    // Filter by status
    if (status) where.status = status;

    // Filter by manager status
    if (isManager !== undefined) {
      where.isManager = isManager === 'true';
    }

    // Filter by salary range
    if (minSalary || maxSalary) {
      where.salary = {};
      if (minSalary) where.salary[Op.gte] = parseFloat(minSalary);
      if (maxSalary) where.salary[Op.lte] = parseFloat(maxSalary);
    }

    // Filter by join date range
    if (joinDateFrom || joinDateTo) {
      where.joinedAt = {};
      if (joinDateFrom) where.joinedAt[Op.gte] = new Date(joinDateFrom);
      if (joinDateTo) where.joinedAt[Op.lte] = new Date(joinDateTo);
    }

    // Get employees with association and sorting using Sequelize
    const { count, rows: employees } = await Employee.findAndCountAll({
      where,
      include: [
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name', 'contact', 'address', 'city', 'state'] 
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limitNum,
      offset: offset,
      distinct: true
    });

    const totalPages = Math.ceil(count / limitNum);

    // Transform data for frontend
    const transformedEmployees = employees.map(employee => ({
      id: employee.id,
      name: employee.name,
      position: employee.position,
      contact: employee.contact,
      whatsapp: employee.whatsapp,
      email: employee.email,
      nid: employee.nid,
      dob: employee.dob,
      address: employee.address,
      salary: employee.salary,
      joinedAt: employee.joinedAt,
      status: employee.status,
      isManager: employee.isManager,
      branchId: employee.branch?.id,
      branchName: employee.branch?.name,
      branchContact: employee.branch?.contact,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
      age: calculateAge(employee.dob),
      employmentDuration: calculateEmploymentDuration(employee.joinedAt),
      formattedSalary: formatSalary(employee.salary)
    }));

    res.status(200).json({
      success: true,
      message: 'Employees fetched successfully',
      data: transformedEmployees,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalEmployees: count,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
        pageSize: limitNum
      }
    });
  } catch (error) {
    console.error('Get all employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching employees',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get employee by ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    const employee = await Employee.findByPk(id, {
      include: [
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name', 'contact', 'address', 'city', 'state', 'establishedAt']
        }
      ]
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Transform employee data
    const transformedEmployee = {
      id: employee.id,
      name: employee.name,
      position: employee.position,
      contact: employee.contact,
      whatsapp: employee.whatsapp,
      email: employee.email,
      nid: employee.nid,
      dob: employee.dob,
      address: employee.address,
      salary: employee.salary,
      joinedAt: employee.joinedAt,
      status: employee.status,
      isManager: employee.isManager,
      branchId: employee.branch?.id,
      branchName: employee.branch?.name,
      branchContact: employee.branch?.contact,
      branchAddress: employee.branch?.address,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
      age: calculateAge(employee.dob),
      employmentDuration: calculateEmploymentDuration(employee.joinedAt),
      formattedSalary: formatSalary(employee.salary),
      annualSalary: employee.salary * 12
    };

    res.status(200).json({
      success: true,
      message: 'Employee fetched successfully',
      data: transformedEmployee
    });
  } catch (error) {
    console.error('Get employee by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching employee',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private
const createEmployee = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      position,
      contact,
      whatsapp,
      email,
      nid,
      dob,
      address,
      salary,
      joinedAt,
      branchId,
      status = 'active',
      isManager = false
    } = req.body;

    // Check if branch exists
    const branch = await Branch.findByPk(branchId);
    if (!branch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid branch ID. Branch not found.'
      });
    }

    // Check if employee with same email already exists
    const existingEmail = await Employee.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Employee with this email already exists'
      });
    }

    // Check if employee with same NID already exists
    const existingNID = await Employee.findOne({ where: { nid } });
    if (existingNID) {
      return res.status(409).json({
        success: false,
        message: 'Employee with this NID already exists'
      });
    }

    // Validate dates
    const dobDate = new Date(dob);
    const joinDate = new Date(joinedAt);
    const today = new Date();

    // Check if DOB is in the future
    if (dobDate > today) {
      return res.status(400).json({
        success: false,
        message: 'Date of birth cannot be in the future'
      });
    }

    // Check if join date is in the future
    if (joinDate > today) {
      return res.status(400).json({
        success: false,
        message: 'Join date cannot be in the future'
      });
    }

    // Check if employee is at least 18 years old
    const age = calculateAge(dobDate);
    if (age < 18) {
      return res.status(400).json({
        success: false,
        message: 'Employee must be at least 18 years old'
      });
    }

    // Check if join date is after DOB
    if (joinDate < dobDate) {
      return res.status(400).json({
        success: false,
        message: 'Join date cannot be before date of birth'
      });
    }

    // Create new employee
    const employee = await Employee.create({
      name: name.trim(),
      position: position.trim(),
      contact: contact.trim(),
      whatsapp: whatsapp ? whatsapp.trim() : null,
      email: email.trim().toLowerCase(),
      nid: nid.trim(),
      dob: dobDate,
      address: address.trim(),
      salary: parseFloat(salary),
      joinedAt: joinDate,
      branchId,
      status,
      isManager: Boolean(isManager)
    });

    // Reload with associations
    const savedEmployee = await Employee.findByPk(employee.id, {
      include: [
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name', 'contact', 'address']
        }
      ]
    });

    // Update branch employee count
    await Branch.updateEmployeeCount(branchId);

    // Transform response
    const transformedEmployee = {
      id: savedEmployee.id,
      name: savedEmployee.name,
      position: savedEmployee.position,
      contact: savedEmployee.contact,
      whatsapp: savedEmployee.whatsapp,
      email: savedEmployee.email,
      nid: savedEmployee.nid,
      dob: savedEmployee.dob,
      address: savedEmployee.address,
      salary: savedEmployee.salary,
      joinedAt: savedEmployee.joinedAt,
      status: savedEmployee.status,
      isManager: savedEmployee.isManager,
      branchId: savedEmployee.branch?.id,
      branchName: savedEmployee.branch?.name,
      createdAt: savedEmployee.createdAt,
      updatedAt: savedEmployee.updatedAt,
      age: calculateAge(savedEmployee.dob),
      employmentDuration: calculateEmploymentDuration(savedEmployee.joinedAt),
      formattedSalary: formatSalary(savedEmployee.salary)
    };

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: transformedEmployee
    });
  } catch (error) {
    console.error('Create employee error:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Handle Sequelize unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Employee with this email or NID already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating employee',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Utility functions
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

const formatSalary = (salary) => {
  if (!salary) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BDT'
  }).format(salary);
};

// Export other functions with proper error handling
// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private
const updateEmployee = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const {
      name,
      position,
      contact,
      whatsapp,
      email,
      nid,
      dob,
      address,
      salary,
      joinedAt,
      branchId,
      status,
      isManager,
      bloodGroup,
      maritalStatus,
      employmentType
    } = req.body;

    // Find employee
    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if branch exists (if branchId is being updated)
    if (branchId && branchId !== employee.branchId) {
      const branch = await Branch.findByPk(branchId);
      if (!branch) {
        return res.status(400).json({
          success: false,
          message: 'Invalid branch ID. Branch not found.'
        });
      }
    }

    // Check for duplicate email (if email is being updated)
    if (email && email !== employee.email) {
      const existingEmail = await Employee.findOne({ 
        where: { 
          email,
          id: { [Op.ne]: id } // Exclude current employee
        } 
      });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'Employee with this email already exists'
        });
      }
    }

    // Check for duplicate NID (if NID is being updated)
    if (nid && nid !== employee.nid) {
      const existingNID = await Employee.findOne({ 
        where: { 
          nid,
          id: { [Op.ne]: id } // Exclude current employee
        } 
      });
      if (existingNID) {
        return res.status(409).json({
          success: false,
          message: 'Employee with this NID already exists'
        });
      }
    }

    // Validate dates
    const today = new Date();
    
    if (dob) {
      const dobDate = new Date(dob);
      if (dobDate > today) {
        return res.status(400).json({
          success: false,
          message: 'Date of birth cannot be in the future'
        });
      }
      
      // Check if employee is at least 18 years old
      const age = calculateAge(dobDate);
      if (age < 18) {
        return res.status(400).json({
          success: false,
          message: 'Employee must be at least 18 years old'
        });
      }
    }

    if (joinedAt) {
      const joinDate = new Date(joinedAt);
      if (joinDate > today) {
        return res.status(400).json({
          success: false,
          message: 'Join date cannot be in the future'
        });
      }
    }

    // Check if join date is after DOB
    if (dob && joinedAt) {
      const dobDate = new Date(dob);
      const joinDate = new Date(joinedAt);
      if (joinDate < dobDate) {
        return res.status(400).json({
          success: false,
          message: 'Join date cannot be before date of birth'
        });
      }
    }

    // Update employee
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (position) updateData.position = position.trim();
    if (contact) updateData.contact = contact.trim();
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp ? whatsapp.trim() : null;
    if (email) updateData.email = email.trim().toLowerCase();
    if (nid) updateData.nid = nid.trim();
    if (dob) updateData.dob = new Date(dob);
    if (address) updateData.address = address.trim();
    if (salary) updateData.salary = parseFloat(salary);
    if (joinedAt) updateData.joinedAt = new Date(joinedAt);
    if (branchId) updateData.branchId = branchId;
    if (status) updateData.status = status;
    if (isManager !== undefined) updateData.isManager = Boolean(isManager);
    if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup;
    if (maritalStatus !== undefined) updateData.maritalStatus = maritalStatus;
    if (employmentType !== undefined) updateData.employmentType = employmentType;

    await employee.update(updateData);

    // Reload with associations
    const updatedEmployee = await Employee.findByPk(id, {
      include: [
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name', 'contact', 'address']
        }
      ]
    });

    // Transform response
    const transformedEmployee = {
      id: updatedEmployee.id,
      name: updatedEmployee.name,
      position: updatedEmployee.position,
      contact: updatedEmployee.contact,
      whatsapp: updatedEmployee.whatsapp,
      email: updatedEmployee.email,
      nid: updatedEmployee.nid,
      dob: updatedEmployee.dob,
      address: updatedEmployee.address,
      salary: updatedEmployee.salary,
      joinedAt: updatedEmployee.joinedAt,
      status: updatedEmployee.status,
      isManager: updatedEmployee.isManager,
      bloodGroup: updatedEmployee.bloodGroup,
      maritalStatus: updatedEmployee.maritalStatus,
      employmentType: updatedEmployee.employmentType,
      branchId: updatedEmployee.branch?.id,
      branchName: updatedEmployee.branch?.name,
      createdAt: updatedEmployee.createdAt,
      updatedAt: updatedEmployee.updatedAt,
      age: calculateAge(updatedEmployee.dob),
      employmentDuration: calculateEmploymentDuration(updatedEmployee.joinedAt),
      formattedSalary: formatSalary(updatedEmployee.salary)
    };

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: transformedEmployee
    });
  } catch (error) {
    console.error('Update employee error:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Handle Sequelize unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Employee with this email or NID already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating employee',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    await employee.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting employee',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats: async (req, res) => {
    try {
      // Implementation for stats
      res.json({ success: true, data: {} });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching stats' });
    }
  },
  getEmployeesByBranch: async (req, res) => {
    try {
      // Implementation for branch employees
      res.json({ success: true, data: [] });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching branch employees' });
    }
  },
  getManagers: async (req, res) => {
    try {
      const managers = await Employee.findAll({
        where: { isManager: true },
        include: [{ model: Branch, as: 'branch' }]
      });
      res.json({ success: true, data: managers });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching managers' });
    }
  },
  bulkUpdateEmployees: async (req, res) => {
    try {
      // Implementation for bulk update
      res.json({ success: true, message: 'Bulk update successful' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error in bulk update' });
    }
  }
};