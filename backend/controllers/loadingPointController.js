const { LoadingPoint } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const loadingPointController = {
  // Get all loading points
  getAllLoadingPoints: async (req, res) => {
    try {
      const { page = 1, limit = 10, search, type, status } = req.query;
      const offset = (page - 1) * limit;
      
      const whereClause = {};
      
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { location: { [Op.iLike]: `%${search}%` } },
          { city: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      if (type) whereClause.type = type;
      if (status) whereClause.status = status;

      const { count, rows: loadingPoints } = await LoadingPoint.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: loadingPoints,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(count / limit),
          count: count
        }
      });
    } catch (error) {
      console.error('Error fetching loading points:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching loading points',
        error: error.message
      });
    }
  },

  // Get loading point by ID
  getLoadingPointById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const loadingPoint = await LoadingPoint.findByPk(id);

      if (!loadingPoint) {
        return res.status(404).json({
          success: false,
          message: 'Loading point not found'
        });
      }

      res.json({
        success: true,
        data: loadingPoint
      });
    } catch (error) {
      console.error('Error fetching loading point:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching loading point',
        error: error.message
      });
    }
  },

  // Create new loading point
  createLoadingPoint: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const loadingPoint = await LoadingPoint.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Loading point created successfully',
        data: loadingPoint
      });
    } catch (error) {
      console.error('Error creating loading point:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while creating loading point',
        error: error.message
      });
    }
  },

  // Update loading point
  updateLoadingPoint: async (req, res) => {
    try {
      const { id } = req.params;
      const errors = validationResult(req);
      
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const loadingPoint = await LoadingPoint.findByPk(id);
      
      if (!loadingPoint) {
        return res.status(404).json({
          success: false,
          message: 'Loading point not found'
        });
      }

      await loadingPoint.update(req.body);

      res.json({
        success: true,
        message: 'Loading point updated successfully',
        data: loadingPoint
      });
    } catch (error) {
      console.error('Error updating loading point:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while updating loading point',
        error: error.message
      });
    }
  },

  // Delete loading point
  deleteLoadingPoint: async (req, res) => {
    try {
      const { id } = req.params;

      const loadingPoint = await LoadingPoint.findByPk(id);
      
      if (!loadingPoint) {
        return res.status(404).json({
          success: false,
          message: 'Loading point not found'
        });
      }

      await loadingPoint.destroy();

      res.json({
        success: true,
        message: 'Loading point deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting loading point:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while deleting loading point',
        error: error.message
      });
    }
  }
};

module.exports = loadingPointController;