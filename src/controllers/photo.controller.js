const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const svc = require('../services/photo.service');
const { validateCreatePhoto } = require('../domain/validators/photo.validator');

// Middleware pentru parsarea body-ului
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// POST /photos
router.post('/', validateCreatePhoto, async (req, res, next) => {
  try {
    const created = await svc.createPhoto(req.body);
    res.status(201).json(created);
  } catch (e) { next(e); }
});

// GET /photos/student/:id
router.get('/student/:id', async (req, res, next) => {
  try {
    const rows = await svc.getPhotosByStudent(req.params.id);
    res.json(rows);
  } catch (e) { next(e); }
});

// DELETE /photos/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await svc.deletePhoto(req.params.id);
    res.json({ message: 'Photo deleted.' });
  } catch (e) { next(e); }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `student${req.body.studentId}${Date.now()}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

router.post('/upload', upload.single('photo'), async (req, res, next) => {
  try {
    console.log('req.body:', req.body); // Log pentru debugging

    const studentId = Number(req.body.studentId); // Convertim la număr
    if (!req.file || isNaN(studentId)) {
      return res.status(400).json({ error: 'Missing or invalid studentId' });
    }

    const result = await svc.uploadPhoto(req);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
