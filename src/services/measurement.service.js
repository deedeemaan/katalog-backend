const Measurement = require('../domain/entities/measurement');
const repo = require('../repositories/measurement.repository');

class MeasurementService {
  /**
   * Creează o nouă măsurătoare.
   * Validează datele și creează o instanță a clasei `Measurement`.
   * Trimite măsurătoarea către repository pentru a fi salvată în baza de date.
   * @param {Object} data - Obiectul măsurătorii (conține student_id, height, weight, etc.).
   * @returns {Object} - Măsurătoarea creată.
   */
  async createMeasurement(data) {
    const m = new Measurement(data); // Creează o instanță validată a măsurătorii
    return await repo.create(m); // Salvează măsurătoarea în baza de date
  }

  /**
   * Obține toate măsurătorile asociate unui student.
   * Trimite ID-ul studentului către repository pentru a obține măsurătorile.
   * @param {number|string} student_id - ID-ul studentului.
   * @returns {Array} - Lista măsurătorilor asociate studentului.
   */
  async getMeasurementsByStudent(student_id) {
    return await repo.findByStudent(Number(student_id)); // Convertim ID-ul în număr și obținem măsurătorile
  }

  /**
   * Actualizează o măsurătoare existentă.
   * Validează datele și creează o instanță a clasei `Measurement` cu datele actualizate.
   * Trimite măsurătoarea către repository pentru a fi actualizată în baza de date.
   * @param {number|string} id - ID-ul măsurătorii.
   * @param {Object} data - Obiectul măsurătorii actualizate (conține height, weight, etc.).
   * @returns {Object} - Măsurătoarea actualizată.
   */
  async updateMeasurement(id, data) {
    const m = new Measurement({ id: Number(id), ...data }); // Creează o instanță validată cu datele actualizate
    return await repo.update(Number(id), m); // Actualizează măsurătoarea în baza de date
  }

  /**
   * Șterge o măsurătoare existentă.
   * Trimite ID-ul măsurătorii către repository pentru a fi ștearsă din baza de date.
   * @param {number|string} id - ID-ul măsurătorii.
   * @returns {void}
   */
  async deleteMeasurement(id) {
    return await repo.delete(Number(id)); // Convertim ID-ul în număr și ștergem măsurătoarea
  }
}

module.exports = new MeasurementService();
