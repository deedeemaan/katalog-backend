const express = require('express');
const measurementSvc = require('../services/measurement.service'); 
const measurementValidator = require('../domain/validators/measurement.validator');

class MeasurementController {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  /**
   * Inițializează rutele pentru operațiile CRUD ale măsurătorilor.
   * Rutele includ validarea datelor înainte de procesare.
   */
  initializeRoutes() {
    // Creează o măsurătoare nouă
    this.router.post(
      '/',
      measurementValidator.validateCreateMeasurement.bind(measurementValidator), 
      this.createMeasurement.bind(this)
    );

    // Obține măsurătorile unui student
    this.router.get('/student/:id', this.getMeasurementsByStudent.bind(this));

    // Actualizează o măsurătoare existentă
    this.router.put(
      '/:id',
      measurementValidator.validateUpdateMeasurement.bind(measurementValidator), 
      this.updateMeasurement.bind(this)
    );

    // Șterge o măsurătoare
    this.router.delete('/:id', this.deleteMeasurement.bind(this));
  }

  /**
   * Creează o măsurătoare nouă.
   * @param {Object} req - Obiectul cererii HTTP (conține datele măsurătorii).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru gestionarea erorilor.
   */
  async createMeasurement(req, res, next) {
    try {
      const created = await measurementSvc.createMeasurement(req.body); 
      res.status(201).json(created);
    } catch (e) {
      next(e);
    }
  }

  /**
   * Obține toate măsurătorile asociate unui student.
   * @param {Object} req - Obiectul cererii HTTP (conține ID-ul studentului).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru gestionarea erorilor.
   */
  async getMeasurementsByStudent(req, res, next) {
    try {
      const rows = await measurementSvc.getMeasurementsByStudent(req.params.id); 
      res.json(rows);
    } catch (e) {
      next(e);
    }
  }

  /**
   * Actualizează o măsurătoare existentă.
   * Validează `student_id` înainte de procesare.
   * @param {Object} req - Obiectul cererii HTTP (conține datele actualizate).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru gestionarea erorilor.
   */
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

  /**
   * Șterge o măsurătoare existentă.
   * @param {Object} req - Obiectul cererii HTTP (conține ID-ul măsurătorii).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru gestionarea erorilor.
   */
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
