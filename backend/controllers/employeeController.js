// controllers/employeeController.js
const { Employee, Branch } = require('../models');
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
        { address: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Filter by branch
    if (branch) where.branchId = branch;

    // Filter by position
    if (position) where.position = { [Op.iLike]: `%${position}%` };

    // Filter by status
    if (status) where.status = status;

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
      include: [{
        model: Branch,
        as: 'branch',
        attributes: ['id', 'name', 'contact', 'address'] 
      }],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limitNum,
      offset: offset
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
      branchId: employee.branch?.id,
      branchName: employee.branch?.name,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
      age: calculateAge(employee.dob)
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
      error: process.env.NODE_ENV === 'production' ? null : error.message
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
      include: [{
        model: Branch,
        as: 'branch',
        attributes: ['id', 'name', 'contact', 'address', 'establishedAt']
      }]
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
      branchId: employee.branch?.id,
      branchName: employee.branch?.name,
      branchContact: employee.branch?.contact,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
      age: calculateAge(employee.dob),
      employmentDuration: calculateEmploymentDuration(employee.joinedAt)
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
      error: process.env.NODE_ENV === 'production' ? null : error.message
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
      status = 'active'
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
      status
    });

    // Reload with branch association
    const savedEmployee = await Employee.findByPk(employee.id, {
      include: [{
        model: Branch,
        as: 'branch',
        attributes: ['id', 'name', 'contact', 'address']
      }]
    });

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
      branchId: savedEmployee.branch?.id,
      branchName: savedEmployee.branch?.name,
      createdAt: savedEmployee.createdAt,
      updatedAt: savedEmployee.updatedAt,
      age: calculateAge(savedEmployee.dob)
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
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Handle Sequelize unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0]?.path;
      return res.status(409).json({
        success: false,
        message: `Employee with this ${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating employee',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

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
    const updateData = { ...req.body };

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    // Check if employee exists
    const existingEmployee = await Employee.findByPk(id);
    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // If branchId is being updated, validate the new branch
    if (updateData.branchId && updateData.branchId !== existingEmployee.branchId) {
      const branch = await Branch.findByPk(updateData.branchId);
      if (!branch) {
        return res.status(400).json({
          success: false,
          message: 'Invalid branch ID. Branch not found.'
        });
      }
    }

    // Check for duplicate email (excluding current employee)
    if (updateData.email && updateData.email !== existingEmployee.email) {
      const duplicateEmployee = await Employee.findOne({ 
        where: { 
          email: updateData.email.toLowerCase(),
          id: { [Op.ne]: id }
        }
      });
      if (duplicateEmployee) {
        return res.status(409).json({
          success: false,
          message: 'Another employee with this email already exists'
        });
      }
      updateData.email = updateData.email.toLowerCase();
    }

    // Check for duplicate NID (excluding current employee)
    if (updateData.nid && updateData.nid !== existingEmployee.nid) {
      const duplicateNID = await Employee.findOne({ 
        where: { 
          nid: updateData.nid,
          id: { [Op.ne]: id }
        }
      });
      if (duplicateNID) {
        return res.status(409).json({
          success: false,
          message: 'Another employee with this NID already exists'
        });
      }
    }

    // Validate dates if provided
    if (updateData.dob) {
      const dobDate = new Date(updateData.dob);
      const today = new Date();
      
      if (dobDate > today) {
        return res.status(400).json({
          success: false,
          message: 'Date of birth cannot be in the future'
        });
      }

      const age = calculateAge(dobDate);
      if (age < 18) {
        return res.status(400).json({
          success: false,
          message: 'Employee must be at least 18 years old'
        });
      }
    }

    if (updateData.joinedAt) {
      const joinDate = new Date(updateData.joinedAt);
      const today = new Date();
      
      if (joinDate > today) {
        return res.status(400).json({
          success: false,
          message: 'Join date cannot be in the future'
        });
      }
    }

    // Trim string fields
    if (updateData.name) updateData.name = updateData.name.trim();
    if (updateData.position) updateData.position = updateData.position.trim();
    if (updateData.contact) updateData.contact = updateData.contact.trim();
    if (updateData.whatsapp) updateData.whatsapp = updateData.whatsapp.trim();
    if (updateData.address) updateData.address = updateData.address.trim();

    // Convert salary to number if provided
    if (updateData.salary) {
      updateData.salary = parseFloat(updateData.salary);
    }

    // Update employee
    await Employee.update(updateData, {
      where: { id },
      individualHooks: true
    });

    // Get updated employee with branch
    const updatedEmployee = await Employee.findByPk(id, {
      include: [{
        model: Branch,
        as: 'branch',
        attributes: ['id', 'name', 'contact', 'address']
      }]
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
      branchId: updatedEmployee.branch?.id,
      branchName: updatedEmployee.branch?.name,
      createdAt: updatedEmployee.createdAt,
      updatedAt: updatedEmployee.updatedAt,
      age: calculateAge(updatedEmployee.dob),
      employmentDuration: calculateEmploymentDuration(updatedEmployee.joinedAt)
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
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Handle Sequelize unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0]?.path;
      return res.status(409).json({
        success: false,
        message: `Another employee with this ${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating employee',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin/Manager only)
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    const employee = await Employee.findByPk(id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    await Employee.destroy({ where: { id } });
    
    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
      data: {
        id: employee.id,
        name: employee.name,
        email: employee.email
      }
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting employee',
      error: process.env.NODE_ENV === 'production' ? null : error.message
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

// @desc    Bulk update employees
// @route   PATCH /api/employees/bulk
// @access  Private (Admin/Manager only)
const bulkUpdateEmployees = async (req, res) => {
  try {
    const { employeeIds, updateData } = req.body;

    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Employee IDs array is required'
      });
    }

    if (!updateData || typeof updateData !== 'object' || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Update data is required and cannot be empty'
      });
    }

    // Validate all employee IDs exist
    const existingEmployees = await Employee.findAll({ 
      where: { id: { [Op.in]: employeeIds } } 
    });
    
    if (existingEmployees.length !== employeeIds.length) {
      const foundIds = existingEmployees.map(emp => emp.id);
      const missingIds = employeeIds.filter(id => !foundIds.includes(id));
      
      return res.status(404).json({
        success: false,
        message: 'Some employee IDs not found',
        missingIds
      });
    }

    // Perform bulk update
    const [affectedCount] = await Employee.update(updateData, {
      where: { id: { [Op.in]: employeeIds } },
      individualHooks: true
    });

    // Get updated employees
    const updatedEmployees = await Employee.findAll({ 
      where: { id: { [Op.in]: employeeIds } },
      include: [{
        model: Branch,
        as: 'branch',
        attributes: ['id', 'name']
      }],
      attributes: ['id', 'name', 'email', 'position', 'status'] 
    });

    res.status(200).json({
      success: true,
      message: `Successfully updated ${affectedCount} employees`,
      data: {
        modifiedCount: affectedCount,
        updatedEmployees: updatedEmployees.map(emp => ({
          id: emp.id,
          name: emp.name,
          email: emp.email,
          position: emp.position,
          status: emp.status,
          branchName: emp.branch?.name
        }))
      }
    });
  } catch (error) {
    console.error('Bulk update employees error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed during bulk update',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while performing bulk update',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  bulkUpdateEmployees
};