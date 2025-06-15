const pool = require('../db/dbindex');

class MeasurementRepository {
  /**
   * Creează o nouă măsurătoare în baza de date.
   * @param {Object} m - Obiectul măsurătorii (conține student_id, height, weight, etc.).
   * @returns {Object} - Măsurătoarea creată.
   */
  async create(m) {
    console.log('[MEASUREMENT REPO] primit:', m);
    const { student_id, height, weight, head_circumference, chest_circumference, abdominal_circumference, physical_disability } = m;

    const { rows } = await pool.query(
      `INSERT INTO measurements 
         (student_id, height, weight, head_circumference, chest_circumference, abdominal_circumference, physical_disability)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        student_id,
        height,
        weight,
        head_circumference,
        chest_circumference,
        abdominal_circumference,
        physical_disability
      ]
    );
    console.log('[MEASUREMENT REPO] rezultat:', rows[0]);
    return rows[0];
  }

  /**
   * Obține toate măsurătorile asociate unui student.
   * @param {number} student_id - ID-ul studentului.
   * @returns {Array} - Lista măsurătorilor asociate studentului.
   */
  async findByStudent(student_id) {
    const { rows } = await pool.query(
      'SELECT * FROM measurements WHERE student_id=$1 ORDER BY created_at DESC',
      [student_id]
    );
    return rows;
  }

  /**
   * Actualizează o măsurătoare existentă în baza de date.
   * @param {number} id - ID-ul măsurătorii.
   * @param {Object} m - Obiectul măsurătorii actualizate (conține height, weight, etc.).
   * @returns {Object} - Măsurătoarea actualizată.
   */
  async update(id, m) {
    const { height, weight, head_circumference, chest_circumference, abdominal_circumference, physical_disability } = m;

    const { rows } = await pool.query(
      `UPDATE measurements SET
         height=$1, weight=$2,
         head_circumference=$3, chest_circumference=$4,
         abdominal_circumference=$5, physical_disability=$6
       WHERE id=$7
       RETURNING *`,
      [
        height,
        weight,
        head_circumference,
        chest_circumference,
        abdominal_circumference,
        physical_disability,
        id
      ]
    );
    console.log('[MEASUREMENT REPO] rezultat:', rows[0]);
    return rows[0];
  }

  /**
   * Șterge o măsurătoare existentă din baza de date.
   * @param {number} id - ID-ul măsurătorii.
   */
  async delete(id) {
    await pool.query('DELETE FROM measurements WHERE id=$1', [id]);
  }
}

module.exports = new MeasurementRepository();
