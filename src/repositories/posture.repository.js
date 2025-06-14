const pool = require('../db/dbindex');

class PostureRepository {
  async create(data) {
    try {
      const { photo_id, shoulder_tilt, hip_tilt, spine_tilt, overlay_uri } = data;

      const { rows } = await pool.query(
        `INSERT INTO postures 
           (photo_id, shoulder_tilt, hip_tilt, spine_tilt, overlay_uri) 
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, photo_id, shoulder_tilt, hip_tilt, spine_tilt, created_at, overlay_uri`,
        [photo_id, shoulder_tilt, hip_tilt, spine_tilt, overlay_uri]
      );

      return rows[0];
    } catch (err) {
      console.error('[REPO] Error inserting data:', err);
      throw err;
    }
  }

  async findByPhoto(photo_id) {
    const { rows } = await pool.query(
      `SELECT id, photo_id, shoulder_tilt, hip_tilt, spine_tilt, overlay_uri, created_at
       FROM postures
       WHERE photo_id = $1
       ORDER BY created_at DESC`,
      [photo_id]
    );
    return rows;
  }

  async update(photo_id, data) {
    const { overlay_uri } = data;

    const { rows } = await pool.query(
      `UPDATE postures
       SET overlay_uri = $1
       WHERE photo_id = $2
       RETURNING id, photo_id, shoulder_tilt, hip_tilt, spine_tilt, overlay_uri, created_at`,
      [overlay_uri, photo_id]
    );
    console.log('Repository session_date:', data.session_date);
    return rows[0];
  }
}

module.exports = new PostureRepository();
