const express = require('express');
const sessionSvc = require('../services/session.service'); 
const sessionValidator = require('../domain/validators/session.validator'); 

class SessionController {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      '/',
      sessionValidator.validateCreateSession.bind(sessionValidator), 
      this.createSession.bind(this)
    );
    this.router.get('/student/:id', this.getSessionsByStudent.bind(this));
    this.router.put(
      '/:id',
      sessionValidator.validateUpdateSession.bind(sessionValidator), 
      this.updateSession.bind(this)
    );
    this.router.delete('/:id', this.deleteSession.bind(this));
  }

  async createSession(req, res, next) {
    try {
      const created = await sessionSvc.createSession(req.body); 
      res.status(201).json(created);
    } catch (e) {
      next(e);
    }
  }

  async getSessionsByStudent(req, res, next) {
    try {
      const rows = await sessionSvc.getSessionsByStudent(req.params.id); 
      res.json(rows);
    } catch (e) {
      next(e);
    }
  }

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
