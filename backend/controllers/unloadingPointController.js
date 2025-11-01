const { UnloadingPoint } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const unloadingPointController = {
  // Get all unloading points
  getAllUnloadingPoints: async (req, res) => {
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

      const { count, rows: unloadingPoints } = await UnloadingPoint.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: unloadingPoints,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(count / limit),
          count: count
        }
      });
    } catch (error) {
      console.error('Error fetching unloading points:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching unloading points',
        error: error.message
      });
    }
  },

  // Get unloading point by ID
  getUnloadingPointById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const unloadingPoint = await UnloadingPoint.findByPk(id);

      if (!unloadingPoint) {
        return res.status(404).json({
          success: false,
          message: 'Unloading point not found'
        });
      }

      res.json({
        success: true,
        data: unloadingPoint
      });
    } catch (error) {
      console.error('Error fetching unloading point:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching unloading point',
        error: error.message
      });
    }
  },

  // Create new unloading point
  createUnloadingPoint: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const unloadingPoint = await UnloadingPoint.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Unloading point created successfully',
        data: unloadingPoint
      });
    } catch (error) {
      console.error('Error creating unloading point:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while creating unloading point',
        error: error.message
      });
    }
  },

  // Update unloading point
  updateUnloadingPoint: async (req, res) => {
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

      const unloadingPoint = await UnloadingPoint.findByPk(id);
      
      if (!unloadingPoint) {
        return res.status(404).json({
          success: false,
          message: 'Unloading point not found'
        });
      }

      await unloadingPoint.update(req.body);

      res.json({
        success: true,
        message: 'Unloading point updated successfully',
        data: unloadingPoint
      });
    } catch (error) {
      console.error('Error updating unloading point:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while updating unloading point',
        error: error.message
      });
    }
  },

  // Delete unloading point
  deleteUnloadingPoint: async (req, res) => {
    try {
      const { id } = req.params;

      const unloadingPoint = await UnloadingPoint.findByPk(id);
      
      if (!unloadingPoint) {
        return res.status(404).json({
          success: false,
          message: 'Unloading point not found'
        });
      }

      await unloadingPoint.destroy();

      res.json({
        success: true,
        message: 'Unloading point deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting unloading point:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while deleting unloading point',
        error: error.message
      });
    }
  }
};

module.exports = unloadingPointController;