class Posture {
  constructor({
    id = null,
    photo_id,
    shoulder_tilt,
    hip_tilt,
    spine_tilt,
    created_at = new Date().toISOString()
  }) {
    if (typeof photo_id !== 'number') throw new Error('photo_id must be a number');
    [shoulder_tilt, hip_tilt, spine_tilt].forEach(a => {
      if (typeof a !== 'number' || a < 0 || isNaN(a)) {
        throw new Error('angles must be non-negative numbers');
      }
    });

    this.id = id;
    this.photo_id = photo_id;
    this.shoulder_tilt = shoulder_tilt;
    this.hip_tilt = hip_tilt;
    this.spine_tilt = spine_tilt;
    this.created_at = created_at;
  }
}

module.exports = Posture;
