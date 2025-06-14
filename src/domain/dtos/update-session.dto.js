module.exports = {
  type: 'object',
  properties: {
    student_id:   { type: 'integer', minimum: 1 },
    session_date: { type: 'string', format: 'date' },
    notes:        { type: 'string' },
    session_type: { type: 'string' }
  },
  additionalProperties: false
};
