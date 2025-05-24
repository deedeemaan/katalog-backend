const pool = require('../db/dbindex');

module.exports = {
  async create(s) {
    const { rows } = await pool.query(
      `INSERT INTO sessions (student_id, session_date, notes, session_type)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [s.studentId, s.sessionDate, s.notes, s.sessionType]
    );
    return rows[0];
  },

  async findByStudent(studentId) {
    const { rows } = await pool.query(
      'SELECT * FROM sessions WHERE student_id=$1 ORDER BY session_date DESC',
      [studentId]
    );
    return rows;
  },

  async update(id, s) {
    const { rows } = await pool.query(
      `UPDATE sessions SET session_date=$1, notes=$2, session_type=$3
       WHERE id=$4 RETURNING *`,
      [s.sessionDate, s.notes, s.sessionType, id]
    );
    return rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM sessions WHERE id=$1', [id]);
  }
};
