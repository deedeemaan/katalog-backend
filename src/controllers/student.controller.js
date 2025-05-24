const express = require('express');
const router  = express.Router();
const svc     = require('../services/student.service');
const { validateCreateStudent, validateUpdateStudent } = require('../domain/validators/student.validator');
const measurementSvc = require('../services/measurement.service');
const sessionSvc = require('../services/session.service');
const photoSvc = require('../services/photo.service');

router.get('/', async (req, res, next) => {
  try { res.json(await svc.listStudents()); }
  catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try { res.json(await svc.getStudent(req.params.id)); }
  catch (e) { next(e); }
});

router.post('/', validateCreateStudent, async (req, res, next) => {
  try {
    const st = await svc.addStudent(req.body);
    res.status(201).json(st);
  } catch (e) { next(e); }
});

router.put('/:id', validateUpdateStudent, async (req, res, next) => {
  try {
    res.json(await svc.updateStudent(req.params.id, req.body));
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await svc.deleteStudent(req.params.id);
    res.json({ message: 'Student șters!' });
  } catch (e) { next(e); }
});

router.get('/:id/measurements', async (req, res, next) => {
  try {
    const rows = await measurementSvc.getMeasurementsByStudent(req.params.id);
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/:id/sessions', async (req, res, next) => {
  try {
    const rows = await sessionSvc.getSessionsByStudent(req.params.id);
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/:id/photos', async (req, res, next) => {
  try {
    const rows = await photoSvc.getPhotosByStudent(req.params.id);
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/test', (req, res) => res.json({ ok: true }));

module.exports = router;
