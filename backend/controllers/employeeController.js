const Employee = require('../models/Employee');
const Branch = require('../models/Branch');
const { validationResult } = require('express-validator');

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
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    let filter = {};
    
    // Search across multiple fields
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } },
        { nid: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by branch
    if (branch) filter.branchId = branch;

    // Filter by position
    if (position) filter.position = { $regex: position, $options: 'i' };

    // Filter by status
    if (status) filter.status = status;

    // Filter by salary range
    if (minSalary || maxSalary) {
      filter.salary = {};
      if (minSalary) filter.salary.$gte = parseFloat(minSalary);
      if (maxSalary) filter.salary.$lte = parseFloat(maxSalary);
    }

    // Filter by join date range
    if (joinDateFrom || joinDateTo) {
      filter.joinedAt = {};
      if (joinDateFrom) filter.joinedAt.$gte = new Date(joinDateFrom);
      if (joinDateTo) filter.joinedAt.$lte = new Date(joinDateTo);
    }

    // Get employees with population and sorting
    const employees = await Employee.find(filter)
      .populate('branchId', 'name location contact address')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Employee.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    // Transform data for frontend
    const transformedEmployees = employees.map(employee => ({
      id: employee._id,
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
      branchId: employee.branchId?._id,
      branchName: employee.branchId?.name,
      branchLocation: employee.branchId?.location,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
      // Calculate age from DOB
      age: calculateAge(employee.dob)
    }));

    res.status(200).json({
      success: true,
      message: 'Employees fetched successfully',
      data: transformedEmployees,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalEmployees: total,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
        pageSize: limitNum
      },
      filters: {
        search,
        branch,
        position,
        status,
        minSalary,
        maxSalary,
        joinDateFrom,
        joinDateTo
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

    const employee = await Employee.findById(id)
      .populate('branchId', 'name location contact address establishedAt');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Transform employee data
    const transformedEmployee = {
      id: employee._id,
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
      branchId: employee.branchId?._id,
      branchName: employee.branchId?.name,
      branchLocation: employee.branchId?.location,
      branchContact: employee.branchId?.contact,
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
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID format'
      });
    }

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
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid branch ID. Branch not found.'
      });
    }

    // Check if employee with same email already exists
    const existingEmail = await Employee.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Employee with this email already exists'
      });
    }

    // Check if employee with same NID already exists
    const existingNID = await Employee.findOne({ nid });
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
    const employee = new Employee({
      name: name.trim(),
      position: position.trim(),
      contact: contact.trim(),
      whatsapp: whatsapp ? whatsapp.trim() : undefined,
      email: email.trim().toLowerCase(),
      nid: nid.trim(),
      dob: dobDate,
      address: address.trim(),
      salary: parseFloat(salary),
      joinedAt: joinDate,
      branchId,
      status
    });

    const savedEmployee = await employee.save();
    await savedEmployee.populate('branchId', 'name location contact address');

    // Transform response
    const transformedEmployee = {
      id: savedEmployee._id,
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
      branchId: savedEmployee.branchId?._id,
      branchName: savedEmployee.branchId?.name,
      branchLocation: savedEmployee.branchId?.location,
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
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
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
    const existingEmployee = await Employee.findById(id);
    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // If branchId is being updated, validate the new branch
    if (updateData.branchId && updateData.branchId !== existingEmployee.branchId.toString()) {
      const branch = await Branch.findById(updateData.branchId);
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
        email: updateData.email.toLowerCase(),
        _id: { $ne: id }
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
        nid: updateData.nid,
        _id: { $ne: id }
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

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('branchId', 'name location contact address');

    // Transform response
    const transformedEmployee = {
      id: updatedEmployee._id,
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
      branchId: updatedEmployee.branchId?._id,
      branchName: updatedEmployee.branchId?.name,
      branchLocation: updatedEmployee.branchId?.location,
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
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID format'
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
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

    const employee = await Employee.findById(id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    await Employee.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
      data: {
        id: employee._id,
        name: employee.name,
        email: employee.email
      }
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while deleting employee',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Get employees by branch
// @route   GET /api/employees/branch/:branchId
// @access  Private
const getEmployeesByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { status, position, sortBy = 'name', sortOrder = 'asc' } = req.query;

    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: 'Branch ID is required'
      });
    }

    // Validate branch exists
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    // Build filter
    let filter = { branchId };
    if (status) filter.status = status;
    if (position) filter.position = { $regex: position, $options: 'i' };

    const employees = await Employee.find(filter)
      .populate('branchId', 'name location')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 });

    // Transform data
    const transformedEmployees = employees.map(employee => ({
      id: employee._id,
      name: employee.name,
      position: employee.position,
      contact: employee.contact,
      email: employee.email,
      nid: employee.nid,
      dob: employee.dob,
      salary: employee.salary,
      joinedAt: employee.joinedAt,
      status: employee.status,
      branchId: employee.branchId?._id,
      branchName: employee.branchId?.name,
      age: calculateAge(employee.dob),
      employmentDuration: calculateEmploymentDuration(employee.joinedAt)
    }));

    res.status(200).json({
      success: true,
      message: `Employees for branch "${branch.name}" fetched successfully`,
      data: transformedEmployees,
      branch: {
        id: branch._id,
        name: branch.name,
        location: branch.location,
        totalEmployees: employees.length
      }
    });
  } catch (error) {
    console.error('Get employees by branch error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid branch ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching employees by branch',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Search employees
// @route   GET /api/employees/search
// @access  Private
const searchEmployees = async (req, res) => {
  try {
    const { query, limit = 20, fields } = req.query;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchQuery = query.trim();
    const limitNum = parseInt(limit);

    // Determine which fields to search
    const searchFields = fields ? fields.split(',') : ['name', 'email', 'contact', 'nid', 'position'];

    // Build search conditions
    const searchConditions = searchFields.map(field => ({
      [field]: { $regex: searchQuery, $options: 'i' }
    }));

    const employees = await Employee.find({
      $or: searchConditions
    })
    .populate('branchId', 'name location')
    .limit(limitNum)
    .select('name email contact position branchId status dob joinedAt salary');

    // Transform data
    const transformedEmployees = employees.map(employee => ({
      id: employee._id,
      name: employee.name,
      email: employee.email,
      contact: employee.contact,
      position: employee.position,
      salary: employee.salary,
      status: employee.status,
      dob: employee.dob,
      joinedAt: employee.joinedAt,
      branchId: employee.branchId?._id,
      branchName: employee.branchId?.name,
      age: calculateAge(employee.dob),
      employmentDuration: calculateEmploymentDuration(employee.joinedAt)
    }));

    res.status(200).json({
      success: true,
      message: 'Employees search completed successfully',
      data: transformedEmployees,
      search: {
        query: searchQuery,
        fields: searchFields,
        totalResults: employees.length,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Search employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching employees',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

// @desc    Get employee statistics
// @route   GET /api/employees/stats
// @access  Private
const getEmployeeStats = async (req, res) => {
  try {
    // Basic counts
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'active' });
    const inactiveEmployees = await Employee.countDocuments({ status: 'inactive' });
    const onLeaveEmployees = await Employee.countDocuments({ status: 'on-leave' });

    // Employees by position
    const employeesByPosition = await Employee.aggregate([
      {
        $group: {
          _id: '$position',
          count: { $sum: 1 },
          avgSalary: { $avg: '$salary' },
          minSalary: { $min: '$salary' },
          maxSalary: { $max: '$salary' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Employees by branch
    const employeesByBranch = await Employee.aggregate([
      {
        $lookup: {
          from: 'branches',
          localField: 'branchId',
          foreignField: '_id',
          as: 'branch'
        }
      },
      {
        $unwind: '$branch'
      },
      {
        $group: {
          _id: '$branch.name',
          branchId: { $first: '$branch._id' },
          count: { $sum: 1 },
          location: { $first: '$branch.location' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Salary statistics
    const salaryStats = await Employee.aggregate([
      {
        $group: {
          _id: null,
          avgSalary: { $avg: '$salary' },
          minSalary: { $min: '$salary' },
          maxSalary: { $max: '$salary' },
          totalSalary: { $sum: '$salary' }
        }
      }
    ]);

    // Employees by join date (last 12 months)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const employeesByMonth = await Employee.aggregate([
      {
        $match: {
          joinedAt: { $gte: oneYearAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$joinedAt' },
            month: { $month: '$joinedAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Age distribution
    const ageDistribution = await Employee.aggregate([
      {
        $addFields: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$dob'] },
                31557600000 // milliseconds in a year
              ]
            }
          }
        }
      },
      {
        $bucket: {
          groupBy: '$age',
          boundaries: [18, 25, 35, 45, 55, 65, 100],
          default: '65+',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Employee statistics fetched successfully',
      data: {
        overview: {
          total: totalEmployees,
          active: activeEmployees,
          inactive: inactiveEmployees,
          onLeave: onLeaveEmployees
        },
        byPosition: employeesByPosition,
        byBranch: employeesByBranch,
        salary: salaryStats[0] || { avgSalary: 0, minSalary: 0, maxSalary: 0, totalSalary: 0 },
        recentHires: employeesByMonth,
        ageDistribution,
        summary: {
          activePercentage: totalEmployees > 0 ? ((activeEmployees / totalEmployees) * 100).toFixed(1) : 0,
          avgEmployeesPerBranch: employeesByBranch.length > 0 ? (totalEmployees / employeesByBranch.length).toFixed(1) : 0
        }
      }
    });
  } catch (error) {
    console.error('Get employee stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching employee statistics',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
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
    const existingEmployees = await Employee.find({ _id: { $in: employeeIds } });
    if (existingEmployees.length !== employeeIds.length) {
      const foundIds = existingEmployees.map(emp => emp._id.toString());
      const missingIds = employeeIds.filter(id => !foundIds.includes(id));
      
      return res.status(404).json({
        success: false,
        message: 'Some employee IDs not found',
        missingIds
      });
    }

    // Perform bulk update
    const result = await Employee.updateMany(
      { _id: { $in: employeeIds } },
      { $set: updateData },
      { runValidators: true }
    );

    // Get updated employees
    const updatedEmployees = await Employee.find({ _id: { $in: employeeIds } })
      .populate('branchId', 'name')
      .select('name email position status branchId');

    res.status(200).json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} employees`,
      data: {
        modifiedCount: result.modifiedCount,
        updatedEmployees: updatedEmployees.map(emp => ({
          id: emp._id,
          name: emp.name,
          email: emp.email,
          position: emp.position,
          status: emp.status,
          branchName: emp.branchId?.name
        }))
      }
    });
  } catch (error) {
    console.error('Bulk update employees error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
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

// @desc    Export employees data
// @route   GET /api/employees/export
// @access  Private (Admin/Manager only)
const exportEmployees = async (req, res) => {
  try {
    const { format = 'json', filters = '{}' } = req.query;
    
    // Parse filters
    let filter = {};
    try {
      filter = JSON.parse(filters);
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filters format'
      });
    }

    const employees = await Employee.find(filter)
      .populate('branchId', 'name location')
      .select('-__v');

    if (format === 'csv') {
      // Implement CSV export logic here
      // This would generate and return a CSV file
      res.status(200).json({
        success: true,
        message: 'CSV export would be implemented here',
        data: employees
      });
    } else {
      // JSON export
      res.status(200).json({
        success: true,
        message: 'Employees data exported successfully',
        data: employees,
        export: {
          format,
          total: employees.length,
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Export employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting employees data',
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

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesByBranch,
  searchEmployees,
  getEmployeeStats,
  bulkUpdateEmployees,
  exportEmployees
};