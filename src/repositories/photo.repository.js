const pool = require('../db/dbindex');

module.exports = {
  async create(p) {
    const { student_id, uri } = p; 
    const { rows } = await pool.query(
      `INSERT INTO photos (student_id, uri) VALUES ($1, $2) RETURNING *`,
      [student_id, uri]
    );
    return rows[0];
  },

  async findByStudent(student_id) {
    const { rows } = await pool.query(
      `SELECT id, uri, created_at FROM photos WHERE student_id=$1 ORDER BY created_at DESC`,
      [student_id]
    );
    return rows;
  },

  async delete(id) {
    await pool.query(`DELETE FROM photos WHERE id=$1`, [id]);
  },

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT id, student_id, uri, created_at FROM photos WHERE id=$1',
      [id]
    );
    return rows[0] || null;
  }
};
