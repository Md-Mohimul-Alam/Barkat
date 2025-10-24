// middleware/validation/employeeValidation.js
const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const validateEmployee = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Employee name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('position')
    .trim()
    .notEmpty()
    .withMessage('Position is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Position must be between 2 and 50 characters'),
  
  body('contact')
    .trim()
    .notEmpty()
    .withMessage('Contact number is required')
    .matches(/^[0-9]{10,15}$/)
    .withMessage('Contact must be 10-15 digits'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('nid')
    .trim()
    .notEmpty()
    .withMessage('NID number is required')
    .matches(/^[0-9]{10,17}$/)
    .withMessage('NID must be 10-17 digits'),
  
  body('dob')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isDate()
    .withMessage('Please enter a valid date'),
  
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters'),
  
  body('salary')
    .isFloat({ min: 0 })
    .withMessage('Salary must be a positive number'),
  
  body('joinedAt')
    .notEmpty()
    .withMessage('Join date is required')
    .isDate()
    .withMessage('Please enter a valid date'),
  
  body('branchId')
    .notEmpty()
    .withMessage('Branch is required')
    .isUUID()
    .withMessage('Invalid branch ID'), // Changed to isUUID()
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'on-leave'])
    .withMessage('Status must be active, inactive, or on-leave'),
  
  handleValidationErrors
];

const validateEmployeeUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('position')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Position must be between 2 and 50 characters'),
  
  body('contact')
    .optional()
    .trim()
    .matches(/^[0-9]{10,15}$/)
    .withMessage('Contact must be 10-15 digits'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('nid')
    .optional()
    .trim()
    .matches(/^[0-9]{10,17}$/)
    .withMessage('NID must be 10-17 digits'),
  
  body('dob')
    .optional()
    .isDate()
    .withMessage('Please enter a valid date'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters'),
  
  body('salary')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Salary must be a positive number'),
  
  body('joinedAt')
    .optional()
    .isDate()
    .withMessage('Please enter a valid date'),
  
  body('branchId')
    .optional()
    .isUUID()
    .withMessage('Invalid branch ID'), // Changed to isUUID()
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'on-leave'])
    .withMessage('Status must be active, inactive, or on-leave'),
  
  handleValidationErrors
];

const validateBulkUpdate = [
  body('employeeIds')
    .isArray({ min: 1 })
    .withMessage('Employee IDs must be a non-empty array'),
  
  body('employeeIds.*')
    .isUUID()
    .withMessage('Each employee ID must be a valid UUID'), // Changed to isUUID()
  
  body('updateData')
    .isObject()
    .withMessage('Update data must be an object'),
  
  handleValidationErrors
];

module.exports = { 
  validateEmployee, 
  validateEmployeeUpdate, 
  validateBulkUpdate 
};