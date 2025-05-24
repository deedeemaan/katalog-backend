const pool = require('../db/dbindex');

module.exports = {
  async create(p) {
    const { rows } = await pool.query(
      'INSERT INTO photos (student_id, uri) VALUES ($1,$2) RETURNING *',
      [p.studentId, p.uri] // Folosim camelCase în backend
    );
    return rows[0];
  },

  async findByStudent(studentId) {
    const { rows } = await pool.query(
      'SELECT id, uri, created_at FROM photos WHERE student_id=$1 ORDER BY created_at DESC',
      [studentId] // Folosim camelCase în backend
    );
    return rows;
  },

  async delete(id) {
    await pool.query('DELETE FROM photos WHERE id=$1', [id]);
  }
};
