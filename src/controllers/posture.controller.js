// module.exports = router;
const express = require('express');
const multer = require('multer');
const path = require('path');            
const fs = require('fs').promises;
const router = express.Router();
const svc = require('../services/posture.service');
const ai = require('../ai/posture-ai');

const upload = multer();

//POST /posture/:id/analyze
router.post(
  '/:id/analyze',
  upload.single('image'),
  async (req, res, next) => {
    try {
      const photo_id = Number(req.params.id);
      if (!req.file) return res.status(400).json({ error: 'No image file' });

      // 1) Analizează și salvează în DB (angles + creație entitate Posture)
      const result = await svc.analyzeAndSave(photo_id, req.file.buffer);

      // 2) Generează overlay-ul
      const overlayBuf = await ai.annotateImage(req.file.buffer);
      const filename = `overlay_${photo_id}_${Date.now()}.jpg`;
      const outPath = path.join(__dirname, '..', 'uploads', filename);
      await fs.writeFile(outPath, overlayBuf);

      // 3) Creează URL-ul pentru overlay
      const overlayUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;

      // 4) Actualizează rândul din baza de date cu overlay_uri
      const updatedPosture = await require('../repositories/posture.repository').update(photo_id, {
        overlay_uri: overlayUrl
      });

      // 5) Răspunde cu datele salvate, inclusiv overlay_uri
      res.json({
        posture: updatedPosture, // Obiectul posture actualizat
        angles: result.angles,
        overlay_uri: overlayUrl
      });
    } catch (e) {
      next(e);
    }
  }
);


// GET /posture/:id/history
router.get('/:id/history', async (req, res, next) => {
  try {
    const photo_id = Number(req.params.id);
    console.log('[CTRL] Fetching history for photo_id:', photo_id);

    const history = await svc.getHistory(photo_id);
    console.log('[CTRL] History fetched:', history);

    res.json({ history });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
