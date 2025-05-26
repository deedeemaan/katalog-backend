module.exports = {
  type: 'object',
  properties: {
    student_id:   { type: 'integer' },
    session_date: { type: 'string', format: 'date' },
    notes:         { type: 'string' },
    session_type: { type: 'string' }
  },
  required: ['student_id'],
  additionalProperties: false
};
