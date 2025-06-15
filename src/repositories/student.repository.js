const pool = require('../db/dbindex');

class StudentRepository {
  /**
   * Obține lista tuturor studenților din baza de date.
   * @returns {Array} - Lista studenților.
   */
  async findAll() {
    const { rows } = await pool.query('SELECT * FROM students ORDER BY id DESC');
    return rows;
  }

  /**
   * Obține detaliile unui student specific pe baza ID-ului.
   * @param {number} id - ID-ul studentului.
   * @returns {Object|null} - Studentul găsit sau `null` dacă nu există.
   */
  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM students WHERE id=$1', [id]);
    return rows[0];
  }

  /**
   * Creează un nou student în baza de date.
   * @param {Object} data - Obiectul studentului (conține name, age, condition, notes).
   * @returns {Object} - Studentul creat.
   */
  async create({ name, age, condition, notes }) {
    const { rows } = await pool.query(
      `INSERT INTO students (name, age, condition, notes)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, age, condition, notes]
    );
    return rows[0];
  }

  /**
   * Actualizează un student existent în baza de date.
   * @param {number} id - ID-ul studentului.
   * @param {Object} data - Obiectul studentului actualizat (conține name, age, condition, notes).
   * @returns {Object} - Studentul actualizat.
   */
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

  /**
   * Șterge un student existent din baza de date.
   * Șterge toate măsurătorile, sesiunile și fotografiile asociate studentului înainte de a șterge studentul.
   * @param {number} id - ID-ul studentului.
   */
  async delete(id) {
    await pool.query('DELETE FROM measurements WHERE student_id=$1', [id]);
    await pool.query('DELETE FROM sessions WHERE student_id=$1', [id]);
    await pool.query('DELETE FROM photos WHERE student_id=$1', [id]);
    await pool.query('DELETE FROM students WHERE id=$1', [id]);
  }
}

module.exports = new StudentRepository();
