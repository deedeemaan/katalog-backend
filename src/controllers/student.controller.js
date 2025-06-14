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

  initializeRoutes() {
    this.router.get('/', this.listStudents.bind(this));
    this.router.get('/:id', this.getStudent.bind(this));
    this.router.post('/', studentValidator.validateCreateStudent.bind(studentValidator), this.addStudent.bind(this)); 
    this.router.put('/:id', studentValidator.validateUpdateStudent.bind(studentValidator), this.updateStudent.bind(this)); 
    this.router.delete('/:id', this.deleteStudent.bind(this));
    this.router.get('/:id/measurements', this.getMeasurements.bind(this));
    this.router.get('/:id/sessions', this.getSessions.bind(this));
    this.router.get('/:id/photos', this.getPhotos.bind(this));
    this.router.get('/test', this.testRoute.bind(this));
  }

  async listStudents(req, res, next) {
    try {
      res.json(await svc.listStudents());
    } catch (e) {
      next(e);
    }
  }

  async getStudent(req, res, next) {
    try {
      res.json(await svc.getStudent(req.params.id));
    } catch (e) {
      next(e);
    }
  }

  async addStudent(req, res, next) {
    try {
      const st = await svc.addStudent(req.body);
      res.status(201).json(st);
    } catch (e) {
      next(e);
    }
  }

  async updateStudent(req, res, next) {
    try {
      res.json(await svc.updateStudent(req.params.id, req.body));
    } catch (e) {
      next(e);
    }
  }

  async deleteStudent(req, res, next) {
    try {
      await svc.deleteStudent(req.params.id);
      res.json({ message: 'Student șters!' });
    } catch (e) {
      next(e);
    }
  }

  async getMeasurements(req, res, next) {
    try {
      const rows = await measurementSvc.getMeasurementsByStudent(req.params.id);
      res.json(rows);
    } catch (e) {
      next(e);
    }
  }

  async getSessions(req, res, next) {
    try {
      const rows = await sessionSvc.getSessionsByStudent(req.params.id);
      res.json(rows);
    } catch (e) {
      next(e);
    }
  }

  async getPhotos(req, res, next) {
    try {
      const rows = await photoSvc.getPhotosByStudent(req.params.id);
      res.json(rows);
    } catch (e) {
      next(e);
    }
  }

  testRoute(req, res) {
    res.json({ ok: true });
  }
}

module.exports = new StudentController().router;
