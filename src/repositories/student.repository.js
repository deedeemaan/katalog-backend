const pool = require('../db/dbindex');

class StudentRepository {
  async findAll() {
    const { rows } = await pool.query('SELECT * FROM students ORDER BY id DESC');
    return rows;
  }

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM students WHERE id=$1', [id]);
    return rows[0];
  }

  async create({ name, age, condition, notes }) {
    const { rows } = await pool.query(
      `INSERT INTO students (name, age, condition, notes)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, age, condition, notes]
    );
    return rows[0];
  }

  async update(id, { name, age, condition, notes }) {
    const { rows } = await pool.query(
      `UPDATE students
         SET name=$1, age=$2, condition=$3, notes=$4
       WHERE id=$5
       RETURNING *`,
      [name, age, condition, notes, id]
    );
    return rows[0];
  }

  async delete(id) {
    await pool.query('DELETE FROM measurements WHERE student_id=$1', [id]);
    await pool.query('DELETE FROM sessions WHERE student_id=$1', [id]);
    await pool.query('DELETE FROM photos WHERE student_id=$1', [id]);
    await pool.query('DELETE FROM students WHERE id=$1', [id]);
  }
}

module.exports = new StudentRepository();
