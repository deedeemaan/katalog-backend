// // routes/posture.controller.js
// const express = require('express');
// const multer  = require('multer');
// const router  = express.Router();
// const svc     = require('../services/posture.service');

// const upload = multer();

// // POST /posture/:id/analyze
// router.post(
//   '/:id/analyze',
//   upload.single('image'),
//   async (req, res, next) => {
//     try {
//       const photo_id = Number(req.params.id);
//       if (!req.file) {
//         return res.status(400).json({ error: 'No image file' });
//       }
//       console.log('[CTRL] incoming buffer length =', req.file.buffer.length);

//       // Apelează serviciul
//       const result = await svc.analyzeAndSave(photo_id, req.file.buffer);
//       console.log('[CTRL] result from service =', result);

//       // Dacă service decide să semnaleze eroare, poți răspunde cu 200 + { angles: null, message }
//       if (result.message && !result.angles) {
//         return res.status(200).json({
//           message: result.message,
//           angles: null
//         });
//       }

//       // Pentru caz normal, trimitem entitatea + unghiurile în snake_case
//       const { posture, angles } = result;
//       const { shoulderTilt, hipTilt, spineTilt } = angles;

//       return res.status(200).json({
//         posture,
//         angles: {
//           shoulderTilt,
//           hipTilt,
//           spineTilt
//         }
//       });
//     } catch (e) {
//       next(e);
//     }
//   }
// );

// // GET /posture/:id/history
// router.get(
//   '/:id/history',
//   async (req, res, next) => {
//     try {
//       const photo_id = Number(req.params.id);
//       const history  = await svc.getHistory(photo_id);
//       res.status(200).json({ history });
//     } catch (e) {
//       next(e);
//     }
//   }
// );

// module.exports = router;

const express = require('express');
const multer  = require('multer');
const router  = express.Router();
const svc     = require('../services/posture.service');
const ai      = require('../ai/posture-ai'); // pentru funcția annotateImage

const upload = multer();

// POST /posture/:id/analyze - returnează angles și imagine overlay (base64)
router.post(
  '/:id/analyze',
  upload.single('image'),
  async (req, res, next) => {
    try {
      const photoId = Number(req.params.id);
      console.log('[CTRL] photoId:', photoId); // Log photoId

      if (!req.file) {
        console.log('[CTRL] No image file provided');
        return res.status(400).json({ error: 'No image file' });
      }

      console.log('[CTRL] incoming buffer length =', req.file.buffer.length); // Log buffer length

      // Apelează serviciul
      const result = await svc.analyzeAndSave(photoId, req.file.buffer);
      console.log('[CTRL] result from service =', result); // Log rezultat service

      if (!result.angles) {
        console.log('[CTRL] No angles detected, message:', result.message);
        return res.status(200).json({ message: result.message, angles: null });
      }

      const { shoulderTilt, hipTilt, spineTilt } = result.angles;

      // Generare overlay image
      const overlayBuffer = await ai.annotateImage(req.file.buffer);
      console.log('[CTRL] overlayBuffer length =', overlayBuffer.length); // Log overlay buffer

      const overlayBase64 = overlayBuffer.toString('base64');

      return res.status(200).json({
        posture: result.posture,
        angles: {
          shoulderTilt,
          hipTilt,
          spineTilt
        },
        overlay: overlayBase64 // imagine JPEG codificată base64
      });
    } catch (e) {
      console.error('[CTRL] Error:', e); // Log eroare
      next(e);
    }
  }
);

// GET /posture/:id/history
router.get(
  '/:id/history',
  async (req, res, next) => {
    try {
      const photoId = Number(req.params.id);
      const history  = await svc.getHistory(photoId);
      res.status(200).json({ history });
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;