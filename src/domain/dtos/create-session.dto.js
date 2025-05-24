module.exports = {
  type: 'object',
  properties: {
    studentId:   { type: 'integer' },
    sessionDate: { type: 'string', format: 'date' },
    notes:        { type: 'string' },
    sessionType: { type: 'string' }
  },
  required: ['studentId'],
  additionalProperties: false
};
