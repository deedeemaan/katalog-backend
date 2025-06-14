const express = require('express');
const measurementSvc = require('../services/measurement.service'); 
const measurementValidator = require('../domain/validators/measurement.validator');

class MeasurementController {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      '/',
      measurementValidator.validateCreateMeasurement.bind(measurementValidator), 
      this.createMeasurement.bind(this)
    );
    this.router.get('/student/:id', this.getMeasurementsByStudent.bind(this));
    this.router.put(
      '/:id',
      measurementValidator.validateUpdateMeasurement.bind(measurementValidator), 
      this.updateMeasurement.bind(this)
    );
    this.router.delete('/:id', this.deleteMeasurement.bind(this));
  }

  async createMeasurement(req, res, next) {
    try {
      const created = await measurementSvc.createMeasurement(req.body); 
      res.status(201).json(created);
    } catch (e) {
      next(e);
    }
  }

  async getMeasurementsByStudent(req, res, next) {
    try {
      const rows = await measurementSvc.getMeasurementsByStudent(req.params.id); 
      res.json(rows);
    } catch (e) {
      next(e);
    }
  }

  async updateMeasurement(req, res, next) {
    const student_id = Number(req.body.student_id);
    if (isNaN(student_id)) {
      throw new Error('Invalid student_id: must be a number');
    }
    try {
      const updated = await measurementSvc.updateMeasurement(req.params.id, req.body); // Folosește instanța service
      res.json(updated);
    } catch (e) {
      next(e);
    }
  }

  async deleteMeasurement(req, res, next) {
    try {
      await measurementSvc.deleteMeasurement(req.params.id); // Folosește instanța service
      res.json({ message: 'Măsurătoare ștearsă!' });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new MeasurementController().router;
