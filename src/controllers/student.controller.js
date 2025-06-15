const express = require('express');
const svc = require('../services/student.service');
const measurementSvc = require('../services/measurement.service');
const sessionSvc = require('../services/session.service');
const photoSvc = require('../services/photo.service');
const studentValidator = require('../domain/validators/student.validator'); 

class StudentController {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  /**
   * Inițializează rutele pentru operațiile CRUD ale studenților și alte operații asociate.
   * Include validarea datelor înainte de procesare.
   */
  initializeRoutes() {
    // Obține lista tuturor studenților
    this.router.get('/', this.listStudents.bind(this));

    // Obține detaliile unui student specific
    this.router.get('/:id', this.getStudent.bind(this));

    // Creează un student nou
    this.router.post(
      '/',
      studentValidator.validateCreateStudent.bind(studentValidator), 
      this.addStudent.bind(this)
    );

    // Actualizează un student existent
    this.router.put(
      '/:id',
      studentValidator.validateUpdateStudent.bind(studentValidator), 
      this.updateStudent.bind(this)
    );

    // Șterge un student
    this.router.delete('/:id', this.deleteStudent.bind(this));

    // Obține măsurătorile asociate unui student
    this.router.get('/:id/measurements', this.getMeasurements.bind(this));

    // Obține sesiunile asociate unui student
    this.router.get('/:id/sessions', this.getSessions.bind(this));

    // Obține fotografiile asociate unui student
    this.router.get('/:id/photos', this.getPhotos.bind(this));

    // Test route
    this.router.get('/test', this.testRoute.bind(this));
  }

  /**
   * Obține lista tuturor studenților.
   * @param {Object} req - Obiectul cererii HTTP.
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru gestionarea erorilor.
   */
  async listStudents(req, res, next) {
    try {
      res.json(await svc.listStudents());
    } catch (e) {
      next(e);
    }
  }

  /**
   * Obține detaliile unui student specific.
   * @param {Object} req - Obiectul cererii HTTP (conține ID-ul studentului).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru gestionarea erorilor.
   */
  async getStudent(req, res, next) {
    try {
      res.json(await svc.getStudent(req.params.id));
    } catch (e) {
      next(e);
    }
  }

  /**
   * Creează un student nou.
   * @param {Object} req - Obiectul cererii HTTP (conține datele studentului).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru gestionarea erorilor.
   */
  async addStudent(req, res, next) {
    try {
      const st = await svc.addStudent(req.body);
      res.status(201).json(st);
    } catch (e) {
      next(e);
    }
  }

  /**
   * Actualizează un student existent.
   * @param {Object} req - Obiectul cererii HTTP (conține ID-ul studentului și datele actualizate).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru gestionarea erorilor.
   */
  async updateStudent(req, res, next) {
    try {
      res.json(await svc.updateStudent(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  }

  /**
   * Șterge un student existent.
   * @param {Object} req - Obiectul cererii HTTP (conține ID-ul studentului).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru gestionarea erorilor.
   */
  async deleteStudent(req, res, next) {
    try {
      await svc.deleteStudent(req.params.id);
      res.json({ message: 'Student șters!' });
    } catch (e) {
      next(e);
    }
  }

  /**
   * Obține măsurătorile asociate unui student.
   * @param {Object} req - Obiectul cererii HTTP (conține ID-ul studentului).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru gestionarea erorilor.
   */
  async getMeasurements(req, res, next) {
    try {
      const rows = await measurementSvc.getMeasurementsByStudent(req.params.id);
      res.json(rows);
    } catch (e) {
      next(e);
    }
  }

  /**
   * Obține sesiunile asociate unui student.
   * @param {Object} req - Obiectul cererii HTTP (conține ID-ul studentului).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru gestionarea erorilor.
   */
  async getSessions(req, res, next) {
    try {
      const rows = await sessionSvc.getSessionsByStudent(req.params.id);
      res.json(rows);
    } catch (e) {
      next(e);
    }
  }

  /**
   * Obține fotografiile asociate unui student.
   * @param {Object} req - Obiectul cererii HTTP (conține ID-ul studentului).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru gestionarea erorilor.
   */
  async getPhotos(req, res, next) {
    try {
      const rows = await photoSvc.getPhotosByStudent(req.params.id);
      res.json(rows);
    } catch (e) {
      next(e);
    }
  }

  /**
   * Răspuns pentru ruta de test.
   * @param {Object} req - Obiectul cererii HTTP.
   * @param {Object} res - Obiectul răspunsului HTTP.
   */
  testRoute(req, res) {
    res.json({ ok: true });
  }
}

module.exports = new StudentController().router;
