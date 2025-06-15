const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const postureSvc = require('../services/posture.service'); // Import instanța clasei service
const postureRepo = require('../repositories/posture.repository'); // Import instanța clasei repository
const ai = require('../ai/posture-ai'); // Import instanța clasei AI

class PostureController {
  constructor() {
    this.router = express.Router();
    this.upload = multer();
    this.initializeRoutes();
  }

  /**
   * Inițializează rutele pentru operațiile de analiză și istoric ale posturii.
   */
  initializeRoutes() {
    // Analizează postura dintr-o imagine
    this.router.post('/:id/analyze', this.upload.single('image'), this.analyzePosture.bind(this));

    // Obține istoricul posturii pentru o fotografie
    this.router.get('/:id/history', this.getPostureHistory.bind(this));
  }

  /**
   * Analizează postura corpului dintr-o imagine.
   * Utilizează AI pentru a detecta punctele cheie și a calcula unghiurile relevante.
   * Salvează rezultatele analizei și generează o imagine cu suprapuneri vizuale.
   * @param {Object} req - Obiectul cererii HTTP (conține ID-ul fotografiei și fișierul imagine).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru gestionarea erorilor.
   */
  async analyzePosture(req, res, next) {
    try {
      const photo_id = Number(req.params.id);
      if (!req.file) {
        return res.status(400).json({ error: 'No image file' });
      }

      // Analizează postura și salvează rezultatele
      const result = await postureSvc.analyzeAndSave(photo_id, req.file.buffer);

      // Generează imaginea cu suprapuneri vizuale
      const overlayBuf = await ai.annotateImage(req.file.buffer);
      const filename = `overlay_${photo_id}_${Date.now()}.jpg`;
      const outPath = path.join(__dirname, '..', 'uploads', filename);
      await fs.writeFile(outPath, overlayBuf);

      // Creează calea relativă pentru imaginea suprapusă
      const relativePath = `/uploads/${filename}`;

      // Actualizează baza de date cu URI-ul imaginii suprapuse
      const updatedPosture = await postureRepo.update(photo_id, { overlay_uri: relativePath });

      // Creează URL-ul complet pentru imaginea suprapusă
      const overlayUrl = `${req.protocol}://${req.get('host')}${relativePath}`;

      // Răspunsul final
      res.json({
        posture: updatedPosture,
        angles: result.angles,
        overlay_uri: overlayUrl
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * Obține istoricul posturii pentru o fotografie specifică.
   * @param {Object} req - Obiectul cererii HTTP (conține ID-ul fotografiei).
   * @param {Object} res - Obiectul răspunsului HTTP.
   * @param {Function} next - Funcția middleware pentru gestionarea erorilor.
   */
  async getPostureHistory(req, res, next) {
    try {
      const photo_id = Number(req.params.id);

      // Obține istoricul posturii din serviciu
      const history = await postureSvc.getHistory(photo_id);

      // Răspunsul final
      res.json({ history });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PostureController().router;
