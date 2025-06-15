const pool = require('../db/dbindex');

class SessionRepository {
  /**
   * Creează o nouă sesiune în baza de date.
   * @param {Object} s - Obiectul sesiunii (conține student_id, session_date, notes, session_type).
   * @returns {Object} - Sesiunea creată.
   */
  async create(s) {
    const dbSession = {
      student_id: s.student_id,
      session_date: s.session_date,
      notes: s.notes,
      session_type: s.session_type
    };

    const { rows } = await pool.query(
      `INSERT INTO sessions (student_id, session_date, notes, session_type)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [dbSession.student_id, dbSession.session_date, dbSession.notes, dbSession.session_type]
    );
    return rows[0];
  }

  /**
   * Obține toate sesiunile asociate unui student.
   * @param {number} student_id - ID-ul studentului.
   * @returns {Array} - Lista sesiunilor asociate studentului.
   */
  async findByStudent(student_id) {
    const { rows } = await pool.query(
      'SELECT * FROM sessions WHERE student_id=$1 ORDER BY session_date DESC',
      [student_id]
    );
    return rows;
  }

  /**
   * Actualizează o sesiune existentă în baza de date.
   * @param {number} id - ID-ul sesiunii.
   * @param {Object} s - Obiectul sesiunii actualizate (conține session_date, notes, session_type).
   * @returns {Object} - Sesiunea actualizată.
   */
  async update(id, s) {
    const dbSession = {
      session_date: s.session_date,
      notes: s.notes,
      session_type: s.session_type
    };

    const { rows } = await pool.query(
      `UPDATE sessions SET session_date=$1, notes=$2, session_type=$3
       WHERE id=$4 RETURNING *`,
      [dbSession.session_date, dbSession.notes, dbSession.session_type, id]
    );
    return rows[0];
  }

  /**
   * Șterge o sesiune existentă din baza de date.
   * @param {number} id - ID-ul sesiunii.
   */
  async delete(id) {
    await pool.query('DELETE FROM sessions WHERE id=$1', [id]);
  }
}

module.exports = new SessionRepository();
