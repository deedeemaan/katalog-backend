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

  initializeRoutes() {
    this.router.post('/:id/analyze', this.upload.single('image'), this.analyzePosture.bind(this));
    this.router.get('/:id/history', this.getPostureHistory.bind(this));
  }

  async analyzePosture(req, res, next) {
    try {
      const photo_id = Number(req.params.id);
      if (!req.file) return res.status(400).json({ error: 'No image file' });

      const result = await postureSvc.analyzeAndSave(photo_id, req.file.buffer); 
      const overlayBuf = await ai.annotateImage(req.file.buffer); 
      const filename = `overlay_${photo_id}_${Date.now()}.jpg`;
      const outPath = path.join(__dirname, '..', 'uploads', filename);
      await fs.writeFile(outPath, overlayBuf);

      const relativePath = `/uploads/${filename}`;

      const updatedPosture = await postureRepo.update(photo_id, { overlay_uri: relativePath }); 

      const overlayUrl = `${req.protocol}://${req.get('host')}${relativePath}`;
      res.json({
        posture: updatedPosture,
        angles: result.angles,
        overlay_uri: overlayUrl
      });
    } catch (e) {
      next(e);
    }
  }

  async getPostureHistory(req, res, next) {
    try {
      const photo_id = Number(req.params.id);

      const history = await postureSvc.getHistory(photo_id); 

      res.json({ history });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PostureController().router;
