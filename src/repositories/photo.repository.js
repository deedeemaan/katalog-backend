const pool = require('../db/dbindex');

class PhotoRepository {
  /**
   * Creează o nouă fotografie în baza de date.
   * @param {Object} p - Obiectul fotografiei (conține student_id și uri).
   * @returns {Object} - Fotografia creată.
   */
  async create(p) {
    const { student_id, uri } = p;
    const { rows } = await pool.query(
      `INSERT INTO photos (student_id, uri) VALUES ($1, $2) RETURNING *`,
      [student_id, uri]
    );
    return rows[0];
  }

  /**
   * Obține toate fotografiile asociate unui student.
   * @param {number} student_id - ID-ul studentului.
   * @returns {Array} - Lista fotografiilor asociate studentului.
   */
  async findByStudent(student_id) {
    const { rows } = await pool.query(
      `SELECT id, uri, created_at FROM photos WHERE student_id=$1 ORDER BY created_at DESC`,
      [student_id]
    );
    return rows;
  }

  /**
   * Șterge o fotografie existentă din baza de date.
   * @param {number} id - ID-ul fotografiei.
   */
  async delete(id) {
    await pool.query(`DELETE FROM photos WHERE id=$1`, [id]);
  }

  /**
   * Obține detaliile unei fotografii specifice pe baza ID-ului.
   * @param {number} id - ID-ul fotografiei.
   * @returns {Object|null} - Fotografia găsită sau `null` dacă nu există.
   */
  async findById(id) {
    const { rows } = await pool.query(
      'SELECT id, student_id, uri, created_at FROM photos WHERE id=$1',
      [id]
    );
    return rows[0] || null;
  }
}

module.exports = new PhotoRepository();
