const Posture = require('../domain/entities/posture');
const repo = require('../repositories/posture.repository');
const photoRepo = require('../repositories/photo.repository');
const ai = require('../ai/posture-ai');

class PostureService {
  /**
   * Analizează postura corpului dintr-o imagine și salvează rezultatele.
   * Utilizează AI pentru a detecta punctele cheie și a calcula unghiurile relevante.
   * Creează o nouă postură în baza de date.
   * @param {number} photo_id - ID-ul fotografiei asociate.
   * @param {Buffer} fileBuffer - Buffer-ul imaginii.
   * @returns {Object} - Postura creată și unghiurile calculate.
   */
  async analyzeAndSave(photo_id, fileBuffer) {
    // Analizează postura folosind AI
    const { angles, message } = await ai.analyzePosture(fileBuffer);

    // Verifică dacă unghiurile sunt valide
    if (!angles || Object.values(angles).some(a => isNaN(a))) {
      return { angles: null, message: message || 'No pose detected' };
    }

    // Pregătește datele pentru postura
    const postureData = {
      photo_id,
      shoulder_tilt: angles.shoulderTilt,
      hip_tilt: angles.hipTilt,
      spine_tilt: angles.spineTilt,
      overlay_uri: null // Overlay-ul va fi adăugat ulterior
    };

    // Creează postura în baza de date
    const posture = await repo.create(postureData);

    return { posture, angles };
  }

  /**
   * Obține istoricul posturilor asociate unei fotografii.
   * Trimite ID-ul fotografiei către repository pentru a obține posturile.
   * @param {number} photo_id - ID-ul fotografiei.
   * @returns {Array} - Lista posturilor asociate fotografiei.
   */
  async getHistory(photo_id) {
    const history = await repo.findByPhoto(photo_id);
    return history;
  }
}

module.exports = new PostureService();
