module.exports = {
  type: 'object',
  properties: {
    session_date: { type: 'string', format: 'date' },
    notes:        { type: 'string' },
    session_type: { type: 'string' }
  },
  additionalProperties: false
};
