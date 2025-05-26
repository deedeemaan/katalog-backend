class Photo {
  constructor({ id = null, student_id, uri, created_at = new Date().toISOString() }) {
    if (typeof student_id !== 'number') throw new Error('student_id must be a number');
    if (!uri || typeof uri !== 'string') throw new Error('uri is required');
    this.id = id;
    this.student_id = student_id;
    this.uri = uri;
    this.created_at = created_at;
  }
}

module.exports = Photo;
