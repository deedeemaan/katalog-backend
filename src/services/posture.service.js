const Posture = require('../domain/entities/posture');
const repo = require('../repositories/posture.repository');
const photoRepo = require('../repositories/photo.repository');
const ai = require('../ai/posture-ai');

module.exports = {
  async analyzeAndSave(photoId, fileBuffer) {
    console.log('[SERVICE] [step1] buffer length =', fileBuffer ? fileBuffer.length : 'undefined');

    // Apelează AI-ul și log raw output
    const { angles: rawAngles, message } = await ai.analyzePosture(fileBuffer);
    console.log('[SERVICE] [step2] rawAngles =', rawAngles, 'message =', message);

    // Convertim la numere și log după conversie
    const angles = rawAngles
      ? {
          shoulderTilt: Number(rawAngles.shoulderTilt),
          hipTilt: Number(rawAngles.hipTilt),
          spineTilt: Number(rawAngles.spineTilt),
        }
      : null;
    console.log('[SERVICE] [step3] converted angles =', angles);

    // Validare finală
    if (!angles || Object.values(angles).some(a => isNaN(a))) {
      console.log('[SERVICE] [step4] angles invalid, returning null');
      return { angles: null, message: message || 'No pose detected' };
    }

    // Mapping pentru baza de date
    const mappedAngles = {
      shoulder_tilt: Number(angles.shoulderTilt),
      hip_tilt: Number(angles.hipTilt),
      spine_tilt: Number(angles.spineTilt),
    };
    console.log('[SERVICE] [step4] mappedAngles =', mappedAngles);

    // Salvează în baza de date
    const posture = await repo.create({ photoId, ...mappedAngles });
    console.log('[SERVICE] [step5] posture saved:', posture);

    return { posture, angles };
  },

  async getHistory(photoId) {
    return await repo.findByPhoto(photoId);
  }
};
