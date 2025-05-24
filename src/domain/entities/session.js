class Session {
  constructor({
    id = null,
    studentId,
    sessionDate = new Date().toISOString().split('T')[0],
    notes = '',
    sessionType = 'evaluare'
  }) {
    if (typeof studentId !== 'number') throw new Error('studentId must be a number');
    this.id = id;
    this.studentId = studentId;
    this.sessionDate = sessionDate;
    this.notes = notes;
    this.sessionType = sessionType;
  }
}

module.exports = Session;
