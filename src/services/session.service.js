const Session = require('../domain/entities/session');
const repo = require('../repositories/session.repository');

class SessionService {
  /**
   * Creează o nouă sesiune.
   * Validează datele și creează o instanță a clasei `Session`.
   * Trimite sesiunea către repository pentru a fi salvată în baza de date.
   * @param {Object} data - Obiectul sesiunii (conține student_id, session_date, notes, session_type).
   * @returns {Object} - Sesiunea creată.
   */
  async createSession(data) {
    const s = new Session(data); // Creează o instanță validată a sesiunii
    return await repo.create(s); // Salvează sesiunea în baza de date
  }

  /**
   * Obține toate sesiunile asociate unui student.
   * Trimite ID-ul studentului către repository pentru a obține sesiunile.
   * @param {number|string} student_id - ID-ul studentului.
   * @returns {Array} - Lista sesiunilor asociate studentului.
   */
  async getSessionsByStudent(student_id) {
    return await repo.findByStudent(Number(student_id)); // Convertim ID-ul în număr și obținem sesiunile
  }

  /**
   * Actualizează o sesiune existentă.
   * Validează datele și creează o instanță a clasei `Session` cu datele actualizate.
   * Trimite sesiunea către repository pentru a fi actualizată în baza de date.
   * @param {number|string} id - ID-ul sesiunii.
   * @param {Object} data - Obiectul sesiunii actualizate (conține session_date, notes, session_type).
   * @returns {Object} - Sesiunea actualizată.
   */
  async updateSession(id, data) {
    const s = new Session({ id: Number(id), ...data }); // Creează o instanță validată cu datele actualizate
    if (isNaN(s.student_id)) {
      throw new Error('Invalid student_id: must be a number'); // Verifică validitatea `student_id`
    }
    console.log('Service data:', data); // Log pentru debugging
    return await repo.update(Number(id), s); // Actualizează sesiunea în baza de date
  }

  /**
   * Șterge o sesiune existentă.
   * Trimite ID-ul sesiunii către repository pentru a fi ștearsă din baza de date.
   * @param {number|string} id - ID-ul sesiunii.
   * @returns {void}
   */
  async deleteSession(id) {
    return await repo.delete(Number(id)); // Convertim ID-ul în număr și ștergem sesiunea
  }
}

module.exports = new SessionService();
