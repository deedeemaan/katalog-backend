// src/repositories/posture.repository.js
const pool = require('../db/dbindex');

module.exports = {
  async create(data) {
    try {
      const { photo_id, shoulder_tilt, hip_tilt, spine_tilt, overlay_uri } = data;
      console.log('[REPO] Data to insert:', data);

      const { rows } = await pool.query(
        `INSERT INTO postures 
           (photo_id, shoulder_tilt, hip_tilt, spine_tilt, overlay_uri) 
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, photo_id, shoulder_tilt, hip_tilt, spine_tilt, created_at, overlay_uri`,
        [photo_id, shoulder_tilt, hip_tilt, spine_tilt, overlay_uri]
      );

      console.log('[REPO] Insert result:', rows[0]);
      return rows[0];
    } catch (err) {
      console.error('[REPO] Error inserting data:', err);
      throw err;
    }
  },

  async findByPhoto(photo_id) {
    console.log('[REPO] Querying history for photo_id:', photo_id);
    const { rows } = await pool.query(
      `SELECT id, photo_id, shoulder_tilt, hip_tilt, spine_tilt, overlay_uri, created_at
       FROM postures
       WHERE photo_id = $1
       ORDER BY created_at DESC`,
      [photo_id]
    );
    console.log('[REPO] Query result:', rows);
    return rows;
  },

  async update(photo_id, data) {
    const { overlay_uri } = data;
    console.log('[REPO] Updating overlay_uri for photo_id:', photo_id);

    const { rows } = await pool.query(
      `UPDATE postures
     SET overlay_uri = $1
     WHERE photo_id = $2
     RETURNING id, photo_id, shoulder_tilt, hip_tilt, spine_tilt, overlay_uri, created_at`,
      [overlay_uri, photo_id]
    );

    console.log('[REPO] Update result:', rows[0]);
    return rows[0];
  }
};
