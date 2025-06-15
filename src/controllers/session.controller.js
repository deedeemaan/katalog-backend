const express = require('express');
const sessionSvc = require('../services/session.service'); 
const sessionValidator = require('../domain/validators/session.validator'); 

class SessionController {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  /**
   * Inițializează rutele pentru operațiile CRUD ale sesiunilor.
   * Include validarea datelor înainte de procesare.
   */
  initializeRoutes() {
    // Creează o sesiune nouă
    this.router.post(
      '/',
      sessionValidator.validateCreateSession.bind(sessionValidator), 
      this.createSession.bind(this)
    );

    // Obține sesiunile asociate unui student
    this.router.get('/student/:id', this.getSessionsByStudent.bind(this));

    // Actualizează o sesiune existentă
    this.router.put(
      '/:id',
      sessionValidator.validateUpdateSession.bind(sessionValidator), 
      this.updateSession.bind(this)
    );

    // Șterge o sesiune
    this.router.delete('/:id', this.deleteSession.bind(this));
  }

  /**
   * Creează o sesiune nouă.
   * @param {Object} req - Obiectul cererii HTTP (conține datele sesiunii).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru gestionarea erorilor.
   */
  async createSession(req, res, next) {
    try {
      const created = await sessionSvc.createSession(req.body); 
      res.status(201).json(created);
    } catch (e) {
      next(e);
    }
  }

  /**
   * Obține toate sesiunile asociate unui student.
   * @param {Object} req - Obiectul cererii HTTP (conține ID-ul studentului).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru gestionarea erorilor.
   */
  async getSessionsByStudent(req, res, next) {
    try {
      const rows = await sessionSvc.getSessionsByStudent(req.params.id); 
      res.json(rows);
    } catch (e) {
      next(e);
    }
  }

  /**
   * Actualizează o sesiune existentă.
   * Validează `student_id`, `session_date` și `session_type` înainte de procesare.
   * @param {Object} req - Obiectul cererii HTTP (conține datele actualizate).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru gestionarea erorilor.
   */
  async updateSession(req, res, next) {
    const student_id = Number(req.body.student_id);
    if (isNaN(student_id)) {
      throw new Error('Invalid student_id: must be a number');
    }
    console.log('Controller req.body:', req.body);
    if (!req.body.session_date || !req.body.session_type) {
      return res
        .status(400)
        .json({ error: 'Missing required fields: session_date or session_type' });
    }
    const parsedDate = new Date(req.body.session_date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid session_date: must be a valid date' });
    }
    req.body.session_date = parsedDate.toISOString().split('T')[0]; 
    try {
      const updated = await sessionSvc.updateSession(req.params.id, req.body);
      res.json(updated);
    } catch (e) {
      next(e);
    }
  }

  /**
   * Șterge o sesiune existentă.
   * @param {Object} req - Obiectul cererii HTTP (conține ID-ul sesiunii).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru gestionarea erorilor.
   */
  async deleteSession(req, res, next) {
    try {
      await sessionSvc.deleteSession(req.params.id); 
      res.json({ message: 'Sesiune ștearsă!' });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new SessionController().router;
