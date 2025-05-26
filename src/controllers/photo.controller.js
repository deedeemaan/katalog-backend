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
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const studentId = Number(req.body.student_id) || 'unknown';
    cb(null, `student${studentId}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

router.post('/upload', upload.single('photo'), async (req, res, next) => {
  try {
    console.log('req.body:', req.body);

    // 1) Convertește la număr
    const student_id = Number(req.body.student_id);
    // 2) Dacă e valid, suprascrie în req.body
    if (Number.isNaN(student_id)) {
      return res.status(400).json({ error: 'Missing or invalid student_id' });
    }
    req.body.student_id = student_id;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await svc.uploadPhoto(req);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
