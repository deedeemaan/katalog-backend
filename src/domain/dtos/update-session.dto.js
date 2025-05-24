module.exports = {
  type: 'object',
  properties: {
    sessionDate: { type: 'string', format: 'date' },
    notes:        { type: 'string' },
    sessionType: { type: 'string' }
  },
  additionalProperties: false
};
