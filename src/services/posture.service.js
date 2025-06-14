const Posture = require('../domain/entities/posture');
const repo = require('../repositories/posture.repository');
const photoRepo = require('../repositories/photo.repository');
const ai = require('../ai/posture-ai');

class PostureService {
  async analyzeAndSave(photo_id, fileBuffer) {

    const { angles, message } = await ai.analyzePosture(fileBuffer);

    if (!angles || Object.values(angles).some(a => isNaN(a))) {
      return { angles: null, message: message || 'No pose detected' };
    }

    const postureData = {
      photo_id,
      shoulder_tilt: angles.shoulderTilt,
      hip_tilt: angles.hipTilt,
      spine_tilt: angles.spineTilt,
      overlay_uri: null 
    };


    const posture = await repo.create(postureData);

    return { posture, angles };
  }

  async getHistory(photo_id) {
    const history = await repo.findByPhoto(photo_id);
    return history;
  }
}

module.exports = new PostureService();
