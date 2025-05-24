module.exports = {
  type: 'object',
  properties: {
    studentId: { type: 'integer' },
    uri:        { type: 'string', format: 'uri' }
  },
  required: ['studentId','uri'],
  additionalProperties: false
};
