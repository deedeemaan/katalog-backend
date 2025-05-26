const Posture = require('../domain/entities/posture');
const repo = require('../repositories/posture.repository');
const photoRepo = require('../repositories/photo.repository');
const ai = require('../ai/posture-ai');

module.exports = {
  async analyzeAndSave(photo_id, fileBuffer) {
    console.log('[SERVICE] Analyzing and saving posture for photo_id:', photo_id);

    const { angles, message } = await ai.analyzePosture(fileBuffer);
    console.log('[SERVICE] Angles calculated:', angles);

    if (!angles || Object.values(angles).some(a => isNaN(a))) {
      console.log('[SERVICE] Invalid angles, returning null');
      return { angles: null, message: message || 'No pose detected' };
    }

    const postureData = {
      photo_id,
      shoulder_tilt: angles.shoulderTilt ?? 0,
      hip_tilt: angles.hipTilt ?? 0,
      spine_tilt: angles.spineTilt ?? 0,
      overlay_uri: null // Inițial null, va fi actualizat ulterior
    };

    console.log('[SERVICE] Data to save:', postureData);

    const posture = await repo.create(postureData);
    console.log('[SERVICE] Posture saved:', posture);

    return { posture, angles };
  },

  async getHistory(photo_id) {
    console.log('[SERVICE] Fetching history for photo_id:', photo_id);
    const history = await repo.findByPhoto(photo_id);
    console.log('[SERVICE] History fetched from repo:', history);
    return history;
  }
};
