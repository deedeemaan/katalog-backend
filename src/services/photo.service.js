const Photo = require('../domain/entities/photo');
const repo = require('../repositories/photo.repository');
const path = require('path');
const fs = require('fs').promises;

class PhotoService {
  /**
   * Creează o fotografie nouă.
   * Validează datele și creează o instanță a clasei `Photo`.
   * Trimite fotografia către repository pentru a fi salvată în baza de date.
   * @param {Object} data - Obiectul fotografiei (conține student_id și uri).
   * @returns {Object} - Fotografia creată.
   */
  async createPhoto(data) {
    const p = new Photo(data); // Creează o instanță validată a fotografiei
    return await repo.create(p); // Salvează fotografia în baza de date
  }

  /**
   * Obține toate fotografiile asociate unui student.
   * Trimite ID-ul studentului către repository pentru a obține fotografiile.
   * @param {number|string} student_id - ID-ul studentului.
   * @returns {Array} - Lista fotografiilor asociate studentului.
   */
  async getPhotosByStudent(student_id) {
    return await repo.findByStudent(Number(student_id)); // Convertim ID-ul în număr și obținem fotografiile
  }

  /**
   * Șterge o fotografie existentă.
   * Trimite ID-ul fotografiei către repository pentru a fi ștearsă din baza de date.
   * @param {number|string} id - ID-ul fotografiei.
   * @returns {void}
   */
  async deletePhoto(id) {
    return await repo.delete(Number(id)); // Convertim ID-ul în număr și ștergem fotografia
  }

  /**
   * Gestionează upload-ul unei fotografii.
   * Validează `student_id` și generează URL-ul complet pentru fișierul încărcat.
   * Creează o instanță a clasei `Photo` și salvează fotografia în baza de date.
   * @param {Object} req - Obiectul cererii HTTP (conține fișierul și datele asociate).
   * @returns {Object} - Fotografia creată, inclusiv URL-ul complet.
   */
  async uploadPhoto(req) {
    const file = req.file; // Fișierul încărcat
    const student_id = Number(req.body.student_id); // ID-ul studentului
    const filename = file.filename; // Numele fișierului
    const fullUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`; // URL-ul complet al fișierului

    // Validare `student_id`
    if (isNaN(student_id)) {
      throw new Error('Invalid student_id: must be a number');
    }

    // Creează o instanță validată a fotografiei
    const p = new Photo({ student_id, uri: fullUrl });
    const saved = await repo.create(p); // Salvează fotografia în baza de date

    // Returnează fotografia creată, inclusiv URL-ul complet
    return { ...saved, uri: fullUrl };
  }
}

module.exports = new PhotoService();
