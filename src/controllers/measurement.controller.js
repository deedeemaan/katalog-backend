const express = require('express');
const router = express.Router();
const svc = require('../services/measurement.service');
const { validateCreateMeasurement, validateUpdateMeasurement } = require('../domain/validators/measurement.validator');

// POST /measurements
router.post('/', validateCreateMeasurement, async (req, res, next) => {
  try {
    const created = await svc.createMeasurement(req.body);
    res.status(201).json(created);
  } catch (e) { next(e); }
});

// GET /measurements/student/:id
router.get('/student/:id', async (req, res, next) => {
  try {
    const rows = await svc.getMeasurementsByStudent(req.params.id);
    res.json(rows);
  } catch (e) { next(e); }
});

// PUT /measurements/:id
router.put('/:id', validateUpdateMeasurement, async (req, res, next) => {
  try {
    const updated = await svc.updateMeasurement(req.params.id, req.body);
    res.json(updated);
  } catch (e) { next(e); }
});

// DELETE /measurements/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await svc.deleteMeasurement(req.params.id);
    res.json({ message: 'Măsurătoare ștearsă!' });
  } catch (e) { next(e); }
});

module.exports = router;
