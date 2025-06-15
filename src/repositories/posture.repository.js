const pool = require('../db/dbindex');

class PostureRepository {
  /**
   * Creează o nouă postură în baza de date.
   * @param {Object} data - Obiectul posturii (conține photo_id, shoulder_tilt, hip_tilt, spine_tilt, overlay_uri).
   * @returns {Object} - Postura creată.
   */
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

  /**
   * Obține toate posturile asociate unei fotografii.
   * @param {number} photo_id - ID-ul fotografiei.
   * @returns {Array} - Lista posturilor asociate fotografiei.
   */
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

  /**
   * Actualizează o postură existentă în baza de date.
   * @param {number} photo_id - ID-ul fotografiei asociate posturii.
   * @param {Object} data - Obiectul posturii actualizate (conține overlay_uri).
   * @returns {Object} - Postura actualizată.
   */
  async update(photo_id, data) {
    const { overlay_uri } = data;

    const { rows } = await pool.query(
      `UPDATE postures
       SET overlay_uri = $1
       WHERE photo_id = $2
       RETURNING id, photo_id, shoulder_tilt, hip_tilt, spine_tilt, overlay_uri, created_at`,
      [overlay_uri, photo_id]
    );
    console.log('Repository overlay_uri:', overlay_uri);
    return rows[0];
  }
}

module.exports = new PostureRepository();
