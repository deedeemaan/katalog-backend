class Posture {
  constructor({
    id = null,
    photoId,
    shoulderTilt,
    hipTilt,
    spineTilt,
    createdAt = new Date().toISOString()
  }) {
    if (typeof photoId !== 'number') throw new Error('photoId must be a number');
    [shoulderTilt, hipTilt, spineTilt].forEach(a => {
      if (typeof a !== 'number' || a < 0 || isNaN(a)) {
        throw new Error('angles must be non-negative numbers');
      }
    });

    this.id = id;
    this.photoId = photoId;
    this.shoulderTilt = shoulderTilt;
    this.hipTilt = hipTilt;
    this.spineTilt = spineTilt;
    this.createdAt = createdAt;
  }
}

module.exports = Posture;
