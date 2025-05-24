const pool = require('../db/dbindex');

module.exports = {
  async create(data) {
    const { rows } = await pool.query(
      'INSERT INTO postures (photo_id, shoulder_tilt, hip_tilt, spine_tilt) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.photoId, data.shoulder_tilt, data.hip_tilt, data.spine_tilt]
    );
    return rows[0];
  },

  async findByPhoto(photoId) {
    const { rows } = await pool.query(
      'SELECT * FROM postures WHERE photo_id=$1 ORDER BY created_at DESC',
      [photoId]
    );
    return rows;
  }
};
