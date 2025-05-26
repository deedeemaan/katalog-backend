class Session {
  constructor({
    id = null,
    student_id,
    session_date = new Date().toISOString().split('T')[0],
    notes = '',
    session_type = 'evaluare'
  }) {
    if (typeof student_id !== 'number') throw new Error('student_id must be a number');
    this.id = id;
    this.student_id = student_id;
    this.session_date = session_date;
    this.notes = notes;
    this.session_type = session_type;
  }
}

module.exports = Session;
