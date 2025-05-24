class Photo {
  constructor({ id = null, studentId, uri, createdAt = new Date().toISOString() }) {
    if (typeof studentId !== 'number') throw new Error('studentId must be a number');
    if (!uri || typeof uri !== 'string') throw new Error('uri is required');
    this.id = id;
    this.studentId = studentId;
    this.uri = uri;
    this.createdAt = createdAt;
  }
}

module.exports = Photo;
