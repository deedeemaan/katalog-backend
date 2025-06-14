const express = require('express');
const multer = require('multer');
const path = require('path');
const photoSvc = require('../services/photo.service'); 
const photoValidator = require('../domain/validators/photo.validator'); 

class PhotoController {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.use(express.json());
    this.router.use(express.urlencoded({ extended: true }));

    this.router.post(
      '/',
      photoValidator.validateCreatePhoto.bind(photoValidator), 
      this.createPhoto.bind(this)
    );
    this.router.get('/student/:id', this.getPhotosByStudent.bind(this));
    this.router.delete('/:id', this.deletePhoto.bind(this));

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

    this.router.post('/upload', upload.single('photo'), this.uploadPhoto.bind(this));
  }

  async createPhoto(req, res, next) {
    try {
      const created = await photoSvc.createPhoto(req.body); 
      res.status(201).json(created);
    } catch (e) {
      next(e);
    }
  }

  async getPhotosByStudent(req, res, next) {
    try {
      const rows = await photoSvc.getPhotosByStudent(req.params.id); 
      res.json(rows);
    } catch (e) {
      next(e);
    }
  }

  async deletePhoto(req, res, next) {
    try {
      await photoSvc.deletePhoto(req.params.id); 
      res.json({ message: 'Photo deleted.' });
    } catch (e) {
      next(e);
    }
  }

  async uploadPhoto(req, res, next) {
    try {
      const student_id = Number(req.body.student_id);
      if (Number.isNaN(student_id)) {
        return res.status(400).json({ error: 'Missing or invalid student_id' });
      }
      req.body.student_id = student_id;

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const result = await photoSvc.uploadPhoto(req); 
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new PhotoController().router;
