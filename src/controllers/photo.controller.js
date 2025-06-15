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

  /**
   * Inițializează rutele pentru operațiile CRUD ale fotografiilor.
   * Include validarea datelor și configurarea pentru upload-ul fișierelor.
   */
  initializeRoutes() {
    this.router.use(express.json());
    this.router.use(express.urlencoded({ extended: true }));

    // Creează o fotografie nouă
    this.router.post(
      '/',
      photoValidator.validateCreatePhoto.bind(photoValidator), 
      this.createPhoto.bind(this)
    );

    // Obține fotografiile asociate unui student
    this.router.get('/student/:id', this.getPhotosByStudent.bind(this));

    // Șterge o fotografie
    this.router.delete('/:id', this.deletePhoto.bind(this));

    // Configurare pentru upload-ul fișierelor
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

    // Upload-ul unei fotografii
    this.router.post('/upload', upload.single('photo'), this.uploadPhoto.bind(this));
  }

  /**
   * Creează o fotografie nouă.
   * @param {Object} req - Obiectul cererii HTTP (conține datele fotografiei).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru gestionarea erorilor.
   */
  async createPhoto(req, res, next) {
    try {
      const created = await photoSvc.createPhoto(req.body); 
      res.status(201).json(created);
    } catch (e) {
      next(e);
    }
  }

  /**
   * Obține toate fotografiile asociate unui student.
   * @param {Object} req - Obiectul cererii HTTP (conține ID-ul studentului).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru gestionarea erorilor.
   */
  async getPhotosByStudent(req, res, next) {
    try {
      const rows = await photoSvc.getPhotosByStudent(req.params.id); 
      res.json(rows);
    } catch (e) {
      next(e);
    }
  }

  /**
   * Șterge o fotografie existentă.
   * @param {Object} req - Obiectul cererii HTTP (conține ID-ul fotografiei).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru gestionarea erorilor.
   */
  async deletePhoto(req, res, next) {
    try {
      await photoSvc.deletePhoto(req.params.id); 
      res.json({ message: 'Photo deleted.' });
    } catch (e) {
      next(e);
    }
  }

  /**
   * Upload-ul unei fotografii.
   * Validează `student_id` și verifică dacă fișierul a fost încărcat.
   * @param {Object} req - Obiectul cererii HTTP (conține fișierul și datele asociate).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru gestionarea erorilor.
   */
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
