const express = require('express');
const router = express.Router();
const svc = require('../services/session.service');
const { validateCreateSession, validateUpdateSession } = require('../domain/validators/session.validator');

// POST /sessions
router.post('/', validateCreateSession, async (req, res, next) => {
  try {
    const created = await svc.createSession(req.body);
    res.status(201).json(created);
  } catch (e) { next(e); }
});

// GET /sessions/student/:id
router.get('/student/:id', async (req, res, next) => {
  try {
    const rows = await svc.getSessionsByStudent(req.params.id);
    res.json(rows);
  } catch (e) { next(e); }
});

// PUT /sessions/:id
router.put('/:id', validateUpdateSession, async (req, res, next) => {
  try {
    const updated = await svc.updateSession(req.params.id, req.body);
    res.json(updated);
  } catch (e) { next(e); }
});

// DELETE /sessions/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await svc.deleteSession(req.params.id);
    res.json({ message: 'Sesiune ștearsă!' });
  } catch (e) { next(e); }
});

module.exports = router;
